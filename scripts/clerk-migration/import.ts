// One-off migration of qualifyer's Better Auth users and organizations into Clerk,
// and of qualifyer's app data into voicia.
//
//   npm run clerk:migrate -- probe
//   npm run clerk:migrate -- import [--user <legacy-user-id>] [--include-phone] [--apply]
//   npm run clerk:migrate -- assistants [--user <legacy-user-id>] [--apply]
//
// Reads SOURCE_DATABASE_URL (qualifyer), TARGET_DATABASE_URL (voicia, falls back to
// DATABASE_URL_UNPOOLED) and CLERK_SECRET_KEY from .env.local. Every command is a
// dry run unless --apply is passed, and is safe to re-run: users are matched by
// external_id, organizations by private_metadata.legacyId, assistants by id.
import { randomBytes, scryptSync } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { parseArgs } from "node:util"

import { createClerkClient } from "@clerk/backend"
import pg from "pg"

// Better Auth's scrypt parameters (@better-auth/utils/password).
const SCRYPT = { N: 16384, r: 16, p: 1, dkLen: 64 }
const ROLES: Record<string, string> = {
  owner: "org:admin",
  admin: "org:admin",
  member: "org:member",
}
const ID_MAP_PATH = "scripts/clerk-migration/output/id-map.json"

const { positionals, values: flags } = parseArgs({
  allowPositionals: true,
  options: {
    user: { type: "string" },
    "include-phone": { type: "boolean", default: false },
    apply: { type: "boolean", default: false },
  },
})

if (!process.env.CLERK_SECRET_KEY)
  throw new Error("CLERK_SECRET_KEY is not set")
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

// qualifyer writes UTC into `timestamp without time zone` columns.
pg.types.setTypeParser(1114, (value) => new Date(`${value}Z`))

async function connect(name: string, url: string | undefined) {
  if (!url) throw new Error(`${name} is not set`)
  const client = new pg.Client({ connectionString: url })
  await client.connect()
  return client
}

const connectSource = () =>
  connect("SOURCE_DATABASE_URL", process.env.SOURCE_DATABASE_URL)
const connectTarget = () =>
  connect(
    "TARGET_DATABASE_URL",
    process.env.TARGET_DATABASE_URL ?? process.env.DATABASE_URL_UNPOOLED
  )

// Better Auth stores `<hex salt>:<hex key>` and feeds the salt string to scrypt
// as-is, which is exactly what Werkzeug's `scrypt:N:r:p$<salt>$<hex key>` does.
function toClerkDigest(betterAuthHash: string) {
  const [salt, key] = betterAuthHash.split(":")
  if (
    !/^[0-9a-f]{32}$/.test(salt ?? "") ||
    !/^[0-9a-f]{128}$/.test(key ?? "")
  ) {
    throw new Error("Unexpected Better Auth password hash format")
  }
  return `scrypt:${SCRYPT.N}:${SCRYPT.r}:${SCRYPT.p}$${salt}$${key}`
}

function describe(error: unknown) {
  const errors = (
    error as {
      errors?: { code: string; longMessage?: string; message: string }[]
    }
  ).errors
  return errors?.length
    ? errors.map((e) => `${e.code}: ${e.longMessage ?? e.message}`).join("; ")
    : String(error)
}

function errorCode(error: unknown) {
  return (error as { errors?: { code: string }[] }).errors?.[0]?.code
}

function mask(email: string) {
  const [local, domain] = email.split("@")
  return `${local[0]}***@${domain}`
}

// Proves Clerk verifies a Better Auth hash, using a throwaway user and a random password.
async function probe() {
  const password = randomBytes(18).toString("base64url")
  const salt = randomBytes(16).toString("hex")
  const key = scryptSync(password.normalize("NFKC"), salt, SCRYPT.dkLen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: 128 * SCRYPT.N * SCRYPT.r * 2,
  })
  const args = `scrypt:${SCRYPT.N}:${SCRYPT.r}:${SCRYPT.p}`
  const candidates: [string, string][] = [
    [
      "toClerkDigest (hex key)",
      toClerkDigest(`${salt}:${key.toString("hex")}`),
    ],
    ["leading $ (hex key)", `$${args}$${salt}$${key.toString("hex")}`],
    ["base64 key", `${args}$${salt}$${key.toString("base64")}`],
  ]

  for (const [label, passwordDigest] of candidates) {
    let userId: string | undefined
    try {
      const user = await clerk.users.createUser({
        emailAddress: [`migration-probe-${Date.now()}+clerk_test@example.com`],
        firstName: "Migration",
        lastName: "Probe",
        passwordDigest,
        passwordHasher: "scrypt_werkzeug",
        skipLegalChecks: true,
      })
      userId = user.id
      await clerk.users.verifyPassword({ userId, password })
      console.log(
        `✓ ${label}: Clerk accepted the digest and verified the password`
      )
      return
    } catch (error) {
      console.log(`✗ ${label}: ${describe(error)}`)
    } finally {
      if (userId) await clerk.users.deleteUser(userId)
    }
  }
  process.exitCode = 1
}

type SourceUser = {
  id: string
  name: string | null
  email: string
  email_verified: boolean
  phone_number: string | null
  created_at: Date
  password: string | null
}
type SourceOrg = { id: string; name: string; slug: string }
type SourceMember = { organization_id: string; user_id: string; role: string }
type IdMap = {
  users: Record<string, string>
  organizations: Record<string, string>
}

async function loadSource(userId: string | undefined) {
  const client = await connectSource()
  try {
    const filter = userId ? "where u.id = $1" : ""
    const params = userId ? [userId] : []
    const users = await client.query<SourceUser>(
      `select u.id, u.name, u.email, u.email_verified, u.phone_number, u.created_at, a.password
       from "user" u
       left join account a on a.user_id = u.id and a.provider_id = 'credential'
       ${filter} order by u.created_at`,
      params
    )
    const members = await client.query<SourceMember>(
      `select organization_id, user_id, role from member ${userId ? "where user_id = $1" : ""}
       order by created_at`,
      params
    )
    const orgs = await client.query<SourceOrg>(
      userId
        ? "select id, name, slug from organization where id = any($1) order by created_at"
        : "select id, name, slug from organization order by created_at",
      userId ? [members.rows.map((m) => m.organization_id)] : []
    )
    if (userId && users.rows.length === 0)
      throw new Error(`No source user ${userId}`)
    return { users: users.rows, orgs: orgs.rows, members: members.rows }
  } finally {
    await client.end()
  }
}

async function migrateUser(user: SourceUser, apply: boolean) {
  const label = `user ${user.id} (${mask(user.email)})`
  const { data: byExternalId } = await clerk.users.getUserList({
    externalId: [user.id],
  })
  if (byExternalId[0]) {
    console.log(`= ${label} already migrated → ${byExternalId[0].id}`)
    return byExternalId[0].id
  }
  const { data: byEmail } = await clerk.users.getUserList({
    emailAddress: [user.email],
  })
  if (byEmail[0]) {
    console.log(
      `! ${label} skipped: email already used by Clerk user ${byEmail[0].id}`
    )
    return undefined
  }

  const [firstName, ...rest] = (user.name ?? "").trim().split(/\s+/)
  const phone = user.phone_number?.replace(/[\s().-]/g, "")
  const includePhone =
    flags["include-phone"] && phone && /^\+[1-9]\d{6,14}$/.test(phone)
  if (flags["include-phone"] && phone && !includePhone) {
    console.log(`  ${label}: phone number is not E.164, leaving it out`)
  }
  const passwordParams = user.password
    ? {
        passwordDigest: toClerkDigest(user.password),
        passwordHasher: "scrypt_werkzeug" as const,
      }
    : { skipPasswordRequirement: true }

  if (!apply) {
    console.log(
      `+ ${label} would be created (password: ${user.password ? "imported" : "none"}, phone: ${includePhone ? "yes" : "no"})`
    )
    return undefined
  }
  const created = await clerk.users.createUser({
    externalId: user.id,
    emailAddress: [user.email],
    emailAddressIdentificationStatus: [
      user.email_verified ? "verified" : "reserved",
    ],
    ...(includePhone ? { phoneNumber: [phone] } : {}),
    firstName: firstName || undefined,
    lastName: rest.join(" ") || undefined,
    createdAt: user.created_at,
    skipLegalChecks: true,
    ...passwordParams,
  })
  console.log(`+ ${label} created → ${created.id}`)
  return created.id
}

// Clerk can't filter organizations by metadata, so index them all by legacyId.
async function loadMigratedOrgs() {
  const migrated = new Map<string, string>()
  for (let offset = 0; ; offset += 100) {
    const { data } = await clerk.organizations.getOrganizationList({
      limit: 100,
      offset,
    })
    for (const org of data) {
      const legacyId = org.privateMetadata.legacyId
      if (typeof legacyId === "string") migrated.set(legacyId, org.id)
    }
    if (data.length < 100) return migrated
  }
}

// Slugs stay out of Clerk (the feature is off); legacySlug keeps them recoverable.
async function migrateOrg(
  org: SourceOrg,
  migrated: Map<string, string>,
  apply: boolean
) {
  const label = `organization ${org.id} (${org.slug})`
  const existingId = migrated.get(org.id)
  if (existingId) {
    console.log(`= ${label} already migrated → ${existingId}`)
    return existingId
  }
  if (!apply) {
    console.log(`+ ${label} would be created`)
    return undefined
  }
  const created = await clerk.organizations.createOrganization({
    name: org.name,
    privateMetadata: { legacyId: org.id, legacySlug: org.slug },
  })
  console.log(`+ ${label} created → ${created.id}`)
  return created.id
}

async function migrateMember(member: SourceMember, ids: IdMap, apply: boolean) {
  const label = `membership ${member.user_id} in ${member.organization_id} (${member.role})`
  const role = ROLES[member.role]
  if (!role) throw new Error(`${label}: no Clerk role for "${member.role}"`)
  const userId = ids.users[member.user_id]
  const organizationId = ids.organizations[member.organization_id]
  if (!userId || !organizationId) {
    console.log(
      `${apply ? "!" : "+"} ${label} ${apply ? "skipped: user or organization missing" : "would be created"}`
    )
    return
  }
  if (!apply) {
    console.log(`+ ${label} would be created as ${role}`)
    return
  }
  try {
    await clerk.organizations.createOrganizationMembership({
      organizationId,
      userId,
      role,
    })
    console.log(`+ ${label} created as ${role}`)
  } catch (error) {
    if (errorCode(error) !== "already_a_member_in_organization") throw error
    console.log(`= ${label} already exists`)
  }
}

async function runImport() {
  const apply = flags.apply
  const source = await loadSource(flags.user)
  console.log(
    `${apply ? "Applying" : "Dry run"}: ${source.users.length} users, ${source.orgs.length} organizations, ${source.members.length} memberships\n`
  )

  const ids: IdMap = existsSync(ID_MAP_PATH)
    ? JSON.parse(readFileSync(ID_MAP_PATH, "utf8"))
    : { users: {}, organizations: {} }
  const failures: string[] = []
  const attempt = async (label: string, run: () => Promise<void>) => {
    try {
      await run()
    } catch (error) {
      failures.push(`${label}: ${describe(error)}`)
      console.log(`✗ ${label}: ${describe(error)}`)
    }
  }

  for (const user of source.users) {
    await attempt(`user ${user.id}`, async () => {
      const clerkId = await migrateUser(user, apply)
      if (clerkId) ids.users[user.id] = clerkId
    })
  }
  const migratedOrgs = await loadMigratedOrgs()
  for (const org of source.orgs) {
    await attempt(`organization ${org.id}`, async () => {
      const clerkId = await migrateOrg(org, migratedOrgs, apply)
      if (clerkId) ids.organizations[org.id] = clerkId
    })
  }
  for (const member of source.members) {
    await attempt(
      `membership ${member.user_id}/${member.organization_id}`,
      () => migrateMember(member, ids, apply)
    )
  }

  if (apply) {
    mkdirSync("scripts/clerk-migration/output", { recursive: true })
    writeFileSync(ID_MAP_PATH, `${JSON.stringify(ids, null, 2)}\n`)
    console.log(`\nID map written to ${ID_MAP_PATH}`)
  }
  if (failures.length) {
    console.log(`\n${failures.length} failure(s)`)
    process.exitCode = 1
  }
}

type SourceAssistant = {
  id: string
  organization_id: string
  name: string
  first_message: string
  system_prompt: string
  vapi_assistant_id: string
  created_at: Date
  updated_at: Date
}

// Keeps qualifyer's assistant ids (uuids) so its calls can be migrated without remapping.
async function migrateAssistants() {
  const apply = flags.apply
  const source = await connectSource()
  const assistants = await source
    .query<SourceAssistant>(
      `select id, organization_id, name, first_message, system_prompt, vapi_assistant_id,
              created_at, updated_at
       from assistant
       ${flags.user ? "where organization_id in (select organization_id from member where user_id = $1)" : ""}
       order by created_at`,
      flags.user ? [flags.user] : []
    )
    .finally(() => source.end())
  const migratedOrgs = await loadMigratedOrgs()

  const target = await connectTarget()
  try {
    const { rows: columns } = await target.query<{ data_type: string }>(
      `select data_type from information_schema.columns
       where table_schema = 'public' and table_name = 'assistants' and column_name = 'organization_id'`
    )
    const blocker =
      columns[0]?.data_type === "uuid"
        ? "voicia assistants.organization_id is still uuid (Neon Auth); the NestJS migration must make it text for Clerk ids"
        : undefined

    const { rows: existing } = await target.query<{
      id: string
      external_assistant_id: string
    }>(
      `select id, external_assistant_id from assistants
       where id::text = any($1) or external_assistant_id = any($2)`,
      [
        assistants.rows.map((a) => a.id),
        assistants.rows.map((a) => a.vapi_assistant_id),
      ]
    )
    const byId = new Map(existing.map((row) => [row.id, row]))
    const byExternalId = new Map(
      existing.map((row) => [row.external_assistant_id, row])
    )

    const rows: (SourceAssistant & { clerkOrgId: string })[] = []
    let skipped = 0
    for (const assistant of assistants.rows) {
      const label = `assistant ${assistant.id} (${assistant.name})`
      const clerkOrgId = migratedOrgs.get(assistant.organization_id)
      const sameExternalId = byExternalId.get(assistant.vapi_assistant_id)
      const sameId = byId.get(assistant.id)
      let problem: string | undefined
      if (!clerkOrgId) {
        problem = `organization ${assistant.organization_id} is not in Clerk yet`
      } else if (sameExternalId && sameExternalId.id !== assistant.id) {
        problem = `vapi id already used by voicia assistant ${sameExternalId.id}`
      } else if (
        sameId &&
        sameId.external_assistant_id !== assistant.vapi_assistant_id
      ) {
        problem = `id already used by a voicia assistant with another vapi id`
      }
      if (problem || !clerkOrgId) {
        skipped++
        console.log(`! ${label} skipped: ${problem}`)
        continue
      }
      rows.push({ ...assistant, clerkOrgId })
      console.log(
        `${sameId ? "~" : "+"} ${label} ${apply ? "" : "would be "}${sameId ? "updated" : "inserted"} → ${clerkOrgId}`
      )
    }

    console.log(
      `\n${rows.length} to write, ${skipped} skipped, of ${assistants.rows.length} source assistants`
    )
    if (blocker) {
      console.log(`! ${blocker}`)
      if (apply) process.exitCode = 1
      return
    }
    if (!apply || rows.length === 0) return

    await target.query("begin")
    try {
      for (const row of rows) {
        await target.query(
          `insert into assistants (id, organization_id, external_assistant_id, name,
                                   first_message, system_prompt, created_at, updated_at)
           values ($1, $2, $3, $4, $5, $6, $7, $8)
           on conflict (id) do update set
             organization_id = excluded.organization_id,
             name = excluded.name,
             first_message = excluded.first_message,
             system_prompt = excluded.system_prompt,
             created_at = excluded.created_at,
             updated_at = excluded.updated_at`,
          [
            row.id,
            row.clerkOrgId,
            row.vapi_assistant_id,
            row.name,
            row.first_message,
            row.system_prompt,
            row.created_at,
            row.updated_at,
          ]
        )
      }
      await target.query("commit")
      console.log(`Wrote ${rows.length} assistants to voicia`)
    } catch (error) {
      await target.query("rollback")
      throw error
    }
  } finally {
    await target.end()
  }
}

const command = positionals[0]
if (command === "probe") await probe()
else if (command === "import") await runImport()
else if (command === "assistants") await migrateAssistants()
else
  throw new Error(
    "Usage: import.ts <probe | import | assistants> [--user <id>] [--include-phone] [--apply]"
  )
