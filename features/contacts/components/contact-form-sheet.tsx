"use client"

import { useState, useTransition } from "react"
import { CircleAlertIcon, PlusIcon, XIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import {
  type ActionResult,
  createContactAction,
  updateContactAction,
} from "@/features/contacts/actions"
import { LANGUAGES, SALUTATIONS } from "@/features/contacts/constants"
import type {
  ContactDetail,
  ContactFields,
  ContactLanguage,
  Salutation,
} from "@/features/contacts/types"
import { Link, useRouter } from "@/i18n/navigation"

type FormError = Extract<ActionResult, { ok: false }>

// null adds a contact; a contact edits its details (numbers are managed on the
// contact page)
type Mode = { contact: ContactDetail | null }

function ContactFormSheet({
  open,
  onOpenChange,
  formKey,
  contact,
}: Mode & {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Changes on every open, so the form starts from the saved values
  formKey: number
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
        <ContactForm
          key={formKey}
          contact={contact}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

function ContactForm({
  contact,
  onDone,
}: Mode & {
  onDone: () => void
}) {
  const t = useTranslations("Contacts")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const router = useRouter()

  const [firstName, setFirstName] = useState(contact?.firstName ?? "")
  const [lastName, setLastName] = useState(contact?.lastName ?? "")
  const [companyName, setCompanyName] = useState(contact?.companyName ?? "")
  const [salutation, setSalutation] = useState<Salutation | "">(
    contact?.salutation ?? ""
  )
  const [email, setEmail] = useState(contact?.email ?? "")
  const [language, setLanguage] = useState<ContactLanguage | "">(
    contact?.language ?? ""
  )
  const [numbers, setNumbers] = useState<string[]>([""])
  const [error, setError] = useState<FormError | null>(null)
  const [pending, startTransition] = useTransition()

  const clearFieldError = (field: FormError["field"]) => {
    if (error?.field === field) setError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const typedNumbers = numbers.map((n) => n.trim()).filter(Boolean)
    if (!contact && typedNumbers.length === 0) {
      setError({
        ok: false,
        field: "phoneNumbers",
        message: t("errors.numberRequired"),
      })
      return
    }

    const fields: ContactFields = {
      firstName: firstName.trim() || null,
      lastName: lastName.trim() || null,
      companyName: companyName.trim() || null,
      salutation: salutation || null,
      email: email.trim() || null,
      language: language || null,
    }
    setError(null)
    startTransition(async () => {
      const result = contact
        ? await updateContactAction(contact.id, fields, locale)
        : await createContactAction(
            { ...fields, phoneNumbers: typedNumbers },
            locale
          )
      if (!result.ok) {
        setError(result)
        return
      }
      toast.add({
        type: "success",
        title: contact ? t("form.saved") : t("form.created"),
      })
      onDone()
      if (!contact && result.contactId) {
        router.push(`/dashboard/contacts/${result.contactId}`)
      }
    })
  }

  const numbersInvalid = error?.field === "phoneNumbers"
  const emailInvalid = error?.field === "email"

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="pr-12">
        <SheetTitle>
          {contact ? t("form.editTitle") : t("form.newTitle")}
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-4">
        <FieldGroup className="gap-4">
          {error && !error.field && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <FieldSet>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="contact-first-name">
                  {t("form.firstName")}
                </FieldLabel>
                <Input
                  id="contact-first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  maxLength={100}
                  autoComplete="off"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-last-name">
                  {t("form.lastName")}
                </FieldLabel>
                <Input
                  id="contact-last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  maxLength={100}
                  autoComplete="off"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="contact-company">
                {t("form.company")}
              </FieldLabel>
              <Input
                id="contact-company"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                maxLength={100}
                autoComplete="off"
              />
            </Field>
          </FieldSet>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="contact-salutation">
                {t("form.salutation")}
              </FieldLabel>
              <NativeSelect
                id="contact-salutation"
                className="w-full"
                value={salutation}
                onChange={(event) =>
                  setSalutation(event.target.value as Salutation | "")
                }
              >
                <NativeSelectOption value="">
                  {t("form.notSet")}
                </NativeSelectOption>
                {SALUTATIONS.map((value) => (
                  <NativeSelectOption key={value} value={value}>
                    {t(`salutations.${value}`)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-language">
                {t("form.language")}
              </FieldLabel>
              <NativeSelect
                id="contact-language"
                className="w-full"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as ContactLanguage | "")
                }
              >
                <NativeSelectOption value="">
                  {t("form.notSet")}
                </NativeSelectOption>
                {LANGUAGES.map((value) => (
                  <NativeSelectOption key={value} value={value}>
                    {t(`languages.${value}`)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>

          <Field data-invalid={emailInvalid || undefined}>
            <FieldLabel htmlFor="contact-email">
              {t("form.email")}
              <span className="font-normal text-muted-foreground">
                {tCommon("optional")}
              </span>
            </FieldLabel>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                clearFieldError("email")
              }}
              maxLength={254}
              aria-invalid={emailInvalid || undefined}
            />
            {emailInvalid && <FieldError>{error.message}</FieldError>}
          </Field>

          {!contact && (
            <FieldSet
              className="gap-3"
              data-invalid={numbersInvalid || undefined}
            >
              <FieldLegend variant="label">
                {t("form.phoneNumbers")}
              </FieldLegend>
              <FieldDescription>{t("form.numberHint")}</FieldDescription>
              <div className="flex flex-col gap-2">
                {numbers.map((number, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="tel"
                      inputMode="tel"
                      aria-label={t("form.phoneNumber", { index: index + 1 })}
                      value={number}
                      onChange={(event) => {
                        const next = [...numbers]
                        next[index] = event.target.value
                        setNumbers(next)
                        clearFieldError("phoneNumbers")
                      }}
                      placeholder="0470 12 34 56"
                      maxLength={40}
                      aria-invalid={numbersInvalid || undefined}
                    />
                    {numbers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("form.removeNumber")}
                        onClick={() =>
                          setNumbers(numbers.filter((_, i) => i !== index))
                        }
                      >
                        <XIcon />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {numbers.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => setNumbers([...numbers, ""])}
                >
                  <PlusIcon />
                  {t("form.addNumber")}
                </Button>
              )}
              {numbersInvalid && (
                <FieldError>
                  {error.message}
                  {error.conflict && (
                    <>
                      {" "}
                      <Link
                        href={`/dashboard/contacts/${error.conflict.contactId}`}
                        className="underline underline-offset-4"
                        onClick={onDone}
                      >
                        {t("errors.openContact")}
                      </Link>
                    </>
                  )}
                </FieldError>
              )}
            </FieldSet>
          )}
        </FieldGroup>
      </div>

      <SheetFooter className="flex-row items-center border-t">
        <div className="ml-auto flex gap-2">
          <SheetClose render={<Button type="button" variant="outline" />}>
            {tCommon("cancel")}
          </SheetClose>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner />}
            {contact ? tCommon("saveChanges") : t("form.create")}
          </Button>
        </div>
      </SheetFooter>
    </form>
  )
}

export { ContactFormSheet }
