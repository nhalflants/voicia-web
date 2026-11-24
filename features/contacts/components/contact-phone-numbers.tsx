"use client"

import { useRef, useState, useTransition } from "react"
import {
  EllipsisIcon,
  PhoneIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FieldDescription, FieldError } from "@/components/ui/field"
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
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const [adding, setAdding] = useState(false)
  const [number, setNumber] = useState("")
  const [error, setError] = useState<Failure | null>(null)
  const [pending, startTransition] = useTransition()
  // Which number a pending primary or delete change is about
  const [busyId, setBusyId] = useState<string | null>(null)
  const addButton = useRef<HTMLButtonElement>(null)
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

  const closeForm = () => {
    setAdding(false)
    setNumber("")
    setError(null)
    // Back to the button that opened the form, once it is rendered again
    requestAnimationFrame(() => addButton.current?.focus())
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
      closeForm()
    })
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{t("detail.numbers")}</h2>
        {!adding && (
          <Button
            ref={addButton}
            variant="ghost"
            size="sm"
            className="-mr-2"
            onClick={() => setAdding(true)}
          >
            <PlusIcon />
            {t("detail.addNumber")}
          </Button>
        )}
      </div>

      <ul className="flex flex-col divide-y rounded-lg border">
        {contact.phoneNumbers.map((phone) => {
          const formatted = formatPhoneNumber(phone.number)
          const busy = busyId === phone.id
          return (
            <li
              key={phone.id}
              aria-busy={busy}
              className="flex min-h-12 items-center gap-3 py-1.5 pr-1.5 pl-3 aria-busy:opacity-70 sm:pl-4"
            >
              <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={`tel:${phone.number}`}
                className="min-w-0 truncate text-sm whitespace-nowrap tabular-nums underline-offset-4 hover:underline"
              >
                {formatted}
              </a>
              {phone.isPrimary && (
                <Badge variant="secondary" className="shrink-0">
                  {t("detail.primary")}
                </Badge>
              )}
              {/* A single number can be neither demoted nor deleted */}
              {!isLast && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    disabled={pending}
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="ml-auto"
                        aria-label={t("detail.numberActions", {
                          number: formatted,
                        })}
                      />
                    }
                  >
                    {busy ? <Spinner /> : <EllipsisIcon />}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-auto">
                    {!phone.isPrimary && (
                      <DropdownMenuItem
                        onClick={() =>
                          change(phone.id, () =>
                            setPrimaryPhoneNumberAction(
                              contact.id,
                              phone.id,
                              locale
                            )
                          )
                        }
                      >
                        <StarIcon />
                        {t("detail.makePrimary")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        change(
                          phone.id,
                          () =>
                            removePhoneNumberAction(
                              contact.id,
                              phone.id,
                              locale
                            ),
                          t("detail.numberDeleted")
                        )
                      }
                    >
                      <Trash2Icon />
                      {tCommon("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          )
        })}

        {adding && (
          <li className="py-2.5 pr-1.5 pl-3 sm:pl-4">
            <form onSubmit={handleAdd} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  autoFocus
                  aria-label={t("detail.addNumber")}
                  placeholder="0470 12 34 56"
                  value={number}
                  maxLength={40}
                  onChange={(event) => {
                    setNumber(event.target.value)
                    setError(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") closeForm()
                  }}
                  aria-invalid={error ? true : undefined}
                  className="h-9 flex-1 text-[15px] tabular-nums"
                />
                <Button type="submit" disabled={pending || !number.trim()}>
                  {pending && !busyId && <Spinner />}
                  {t("detail.saveNumber")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={tCommon("cancel")}
                  onClick={closeForm}
                >
                  <XIcon />
                </Button>
              </div>
              <div className="pl-6">
                {error ? (
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
                ) : (
                  <FieldDescription>{t("form.numberHint")}</FieldDescription>
                )}
              </div>
            </form>
          </li>
        )}
      </ul>
    </section>
  )
}

export { ContactPhoneNumbers }
