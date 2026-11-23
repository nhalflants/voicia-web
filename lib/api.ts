import "server-only"

import { auth } from "@clerk/nextjs/server"

// A non-2xx answer from the NestJS API, carrying Nest's `message`
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    // The parsed JSON body, for fields beyond `message`; null when there is none
    readonly body: unknown = null
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Calls the NestJS API as the signed-in user. The API owns all writes; this app
// only reads the database directly (see lib/db/index.ts).
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) throw new Error("API_URL is not set")

  // Tokens live 60 seconds, so get one per request; Clerk caches and refreshes it
  const { getToken } = await auth()
  const token = await getToken()
  if (!token) throw new ApiError(401, "Not signed in")

  const res = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = Array.isArray(body?.message)
      ? body.message.join("; ")
      : typeof body?.message === "string"
        ? body.message
        : res.statusText
    throw new ApiError(res.status, message, body)
  }
  // 204 No Content has no body to parse
  return (res.status === 204 ? undefined : await res.json()) as T
}
