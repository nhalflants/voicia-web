"use client"

import { useState, useTransition } from "react"
import { CheckIcon, CircleAlertIcon, Trash2Icon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { saveCallCategoryAction } from "@/features/call-categories/actions"
import { CATEGORY_COLORS } from "@/features/call-categories/constants"
import type {
  CallCategory,
  CategoryDraft,
} from "@/features/call-categories/types"
import { MemberAvatar } from "@/features/org/components/member-avatar"
import type { OrganizationMember } from "@/features/org/types"

type Routing = "everyone" | "specific"
type FormError = { field?: "name" | "recipients"; message: string }

interface CategoryFormProps {
  // null creates a new category, optionally prefilled from `draft`
  category: CallCategory | null
  draft?: CategoryDraft
  usedColors: string[]
  members: OrganizationMember[]
  currentUserId: string
  onDone: () => void
  onDelete: (category: CallCategory) => void
}

function CategorySheet({
  open,
  onOpenChange,
  formKey,
  ...formProps
}: Omit<CategoryFormProps, "onDone"> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Changes on every open, so the form starts from the category's saved values
  formKey: number
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
        <CategoryForm
          key={formKey}
          {...formProps}
          onDone={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

function CategoryForm({
  category,
  draft,
  usedColors,
  members,
  currentUserId,
  onDone,
  onDelete,
}: CategoryFormProps) {
  const t = useTranslations("CallCategories.form")
  const tColors = useTranslations("CallCategories.colors")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const initial = category ?? draft
  // Recipients who left the organization are dropped: a Clerk webhook removes
  // them shortly, and the API rejects them on save
  const [initialRecipients] = useState(() => {
    const memberIds = new Set(members.map((m) => m.userId))
    return (category?.recipientUserIds ?? []).filter((id) => memberIds.has(id))
  })
  // A color saved outside this palette stays available as the first swatch
  const [colors] = useState(() => {
    const palette = CATEGORY_COLORS.map((c) => ({
      name: tColors(c.key),
      value: c.value,
    }))
    const color = initial?.color
    const known = CATEGORY_COLORS.some((c) => sameColor(c.value, color))
    return color && !known
      ? [{ name: tColors("current"), value: color }, ...palette]
      : palette
  })

  const [name, setName] = useState(initial?.name ?? "")
  const [color, setColor] = useState(
    () =>
      initial?.color ??
      (
        CATEGORY_COLORS.find(
          (c) => !usedColors.some((used) => sameColor(used, c.value))
        ) ?? CATEGORY_COLORS[0]
      ).value
  )
  const [description, setDescription] = useState(initial?.description ?? "")
  const [routing, setRouting] = useState<Routing>(
    initialRecipients.length > 0 ? "specific" : "everyone"
  )
  const [selected, setSelected] = useState(() => new Set(initialRecipients))
  const [error, setError] = useState<FormError | null>(null)
  const [pending, startTransition] = useTransition()

  const toggleRecipient = (userId: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(userId)
      else next.delete(userId)
      return next
    })
    if (error?.field === "recipients") setError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) {
      setError({ field: "name", message: t("errors.nameRequired") })
      return
    }
    const recipientUserIds = routing === "specific" ? [...selected] : []
    if (routing === "specific" && recipientUserIds.length === 0) {
      setError({
        field: "recipients",
        message: t("errors.recipientsRequired"),
      })
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await saveCallCategoryAction(
        category?.id ?? null,
        {
          name: name.trim(),
          color,
          description: description.trim(),
          recipientUserIds,
        },
        locale
      )
      if (!result.ok) {
        setError({ field: result.field, message: result.message })
        return
      }
      toast.add({
        type: "success",
        title: category ? t("saved") : t("created"),
      })
      onDone()
    })
  }

  const nameInvalid = error?.field === "name"
  const recipientsInvalid = error?.field === "recipients"

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="pr-12">
        <SheetTitle>{category ? t("editTitle") : t("newTitle")}</SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-4">
        <FieldGroup className="gap-6">
          {error && !error.field && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={nameInvalid || undefined}>
            <FieldLabel htmlFor="category-name">{t("name")}</FieldLabel>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (nameInvalid) setError(null)
              }}
              placeholder={t("namePlaceholder")}
              maxLength={50}
              required
              aria-invalid={nameInvalid || undefined}
            />
            {nameInvalid && <FieldError>{error.message}</FieldError>}
          </Field>

          <FieldSet>
            <FieldLegend variant="label">{t("color")}</FieldLegend>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((swatch) => (
                <label key={swatch.value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={swatch.value}
                    checked={sameColor(color, swatch.value)}
                    onChange={() => setColor(swatch.value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="flex size-7 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-popover peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
                    style={{ backgroundColor: swatch.value }}
                  >
                    <CheckIcon className="size-4" />
                  </span>
                  <span className="sr-only">{swatch.name}</span>
                </label>
              ))}
            </div>
          </FieldSet>

          <Field>
            <FieldLabel htmlFor="category-description">
              {t("description")}
              <span className="font-normal text-muted-foreground">
                {tCommon("optional")}
              </span>
            </FieldLabel>
            {/* <FieldDescription>
              When does a call belong here? Voicia uses this to sort calls.
            </FieldDescription> */}
            <Textarea
              id="category-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              maxLength={500}
            />
            <FieldDescription className="flex flex-col">
              <span className="shrink-0 tabular-nums">
                {description.length}/500
              </span>
            </FieldDescription>
          </Field>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend variant="label">{t("recapLegend")}</FieldLegend>
            <RadioGroup
              value={routing}
              onValueChange={(value) => {
                setRouting(value as Routing)
                if (recipientsInvalid) setError(null)
              }}
            >
              <FieldLabel htmlFor="routing-everyone">
                <Field orientation="horizontal">
                  <RadioGroupItem value="everyone" id="routing-everyone" />
                  <FieldContent>
                    <FieldTitle>{t("everyone.title")}</FieldTitle>
                    <FieldDescription>
                      {t("everyone.description", { count: members.length })}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="routing-specific">
                <Field orientation="horizontal">
                  <RadioGroupItem value="specific" id="routing-specific" />
                  <FieldContent>
                    <FieldTitle>{t("specific.title")}</FieldTitle>
                    <FieldDescription>
                      {members.length > 1
                        ? t("specific.description")
                        : t("specific.invite")}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>

            {routing === "specific" && (
              <div className="flex flex-col gap-2">
                <div
                  aria-label={t("recipients")}
                  role="group"
                  aria-describedby="recipients-hint"
                  data-invalid={recipientsInvalid || undefined}
                  className="flex max-h-72 flex-col divide-y overflow-y-auto rounded-md border data-invalid:border-destructive"
                >
                  {members.map((member) => {
                    const checked = selected.has(member.userId)
                    return (
                      <label
                        key={member.userId}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/50 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-60 has-data-disabled:hover:bg-transparent"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleRecipient(member.userId, value)
                          }
                          // Already-selected members stay removable
                          disabled={!member.email && !checked}
                        />
                        <MemberAvatar member={member} size="sm" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium">
                            {member.name}
                            {member.userId === currentUserId && (
                              <span className="font-normal text-muted-foreground">
                                {" "}
                                {tCommon("you")}
                              </span>
                            )}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {member.email ?? t("cantReceive")}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                {recipientsInvalid ? (
                  <FieldError id="recipients-hint">{error.message}</FieldError>
                ) : (
                  <FieldDescription id="recipients-hint">
                    {t("recipientsHint")}
                  </FieldDescription>
                )}
              </div>
            )}
          </FieldSet>
        </FieldGroup>
      </div>

      <SheetFooter className="flex-row items-center border-t">
        {category && (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(category)}
            disabled={pending}
          >
            <Trash2Icon />
            {tCommon("delete")}
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <SheetClose render={<Button type="button" variant="outline" />}>
            {tCommon("cancel")}
          </SheetClose>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner />}
            {category ? tCommon("saveChanges") : t("create")}
          </Button>
        </div>
      </SheetFooter>
    </form>
  )
}

function sameColor(a: string, b?: string) {
  return a.toLowerCase() === b?.toLowerCase()
}

export { CategorySheet }
