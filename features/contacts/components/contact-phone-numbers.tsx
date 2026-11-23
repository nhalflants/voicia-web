"use client"

import { useState, useTransition } from "react"
import { PhoneIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import {
  type ActionResult,
  addPhoneNumberAction,
  removePhoneNumberAction,
  setPrimaryPhoneNumberAction,
} from "@/features/contacts/actions"
import { formatPhoneNumber } from "@/features/contacts/format"
import type { ContactDetail } from "@/features/contacts/types"
import { Link } from "@/i18n/navigation"

type Failure = Extract<ActionResult, { ok: false }>

function ContactPhoneNumbers({ contact }: { contact: ContactDetail }) {
  const t = useTranslations("Contacts")
  const locale = useLocale()
  const [adding, setAdding] = useState(false)
  const [number, setNumber] = useState("")
  const [error, setError] = useState<Failure | null>(null)
  const [pending, startTransition] = useTransition()
  // Which number a pending primary or delete change is about
  const [busyId, setBusyId] = useState<string | null>(null)
  const isLast = contact.phoneNumbers.length === 1

  const change = (
    numberId: string,
    write: () => Promise<ActionResult>,
    done?: string
  ) => {
    setBusyId(numberId)
    startTransition(async () => {
      const result = await write()
      setBusyId(null)
      if (!result.ok) {
        toast.add({ type: "error", title: result.message })
        return
      }
      if (done) toast.add({ type: "success", title: done })
    })
  }

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!number.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await addPhoneNumberAction(
        contact.id,
        number.trim(),
        locale
      )
      if (!result.ok) {
        setError(result)
        return
      }
      toast.add({ type: "success", title: t("detail.numberAdded") })
      setNumber("")
      setAdding(false)
    })
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">{t("detail.numbers")}</h2>
      <ul className="flex flex-col divide-y rounded-lg border">
        {contact.phoneNumbers.map((phone) => (
          <li key={phone.id} className="flex items-center gap-3 px-4 py-2">
            <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
            <a
              href={`tel:${phone.number}`}
              className="flex-1 tabular-nums underline-offset-4 hover:underline"
            >
              {formatPhoneNumber(phone.number)}
            </a>
            {phone.isPrimary ? (
              <Badge variant="secondary">{t("detail.primary")}</Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  change(phone.id, () =>
                    setPrimaryPhoneNumberAction(contact.id, phone.id, locale)
                  )
                }
              >
                {busyId === phone.id ? <Spinner /> : <StarIcon />}
                {t("detail.makePrimary")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              disabled={pending || isLast}
              title={isLast ? t("detail.lastNumberHint") : undefined}
              aria-label={t("detail.deleteNumber", {
                number: formatPhoneNumber(phone.number),
              })}
              onClick={() =>
                change(
                  phone.id,
                  () => removePhoneNumberAction(contact.id, phone.id, locale),
                  t("detail.numberDeleted")
                )
              }
            >
              <Trash2Icon />
            </Button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Input
              type="tel"
              inputMode="tel"
              autoFocus
              aria-label={t("detail.addNumber")}
              placeholder="0470 12 34 56"
              value={number}
              maxLength={40}
              onChange={(event) => {
                setNumber(event.target.value)
                setError(null)
              }}
              aria-invalid={error ? true : undefined}
              className="sm:max-w-xs"
            />
            <Button type="submit" disabled={pending || !number.trim()}>
              {pending && !busyId && <Spinner />}
              {t("detail.addNumber")}
            </Button>
          </div>
          {error && (
            <FieldError>
              {error.message}
              {error.conflict && (
                <>
                  {" "}
                  <Link
                    href={`/dashboard/contacts/${error.conflict.contactId}`}
                    className="underline underline-offset-4"
                  >
                    {t("errors.openContact")}
                  </Link>
                </>
              )}
            </FieldError>
          )}
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setAdding(true)}
        >
          <PlusIcon />
          {t("detail.addNumber")}
        </Button>
      )}
    </section>
  )
}

export { ContactPhoneNumbers }
