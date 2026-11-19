"use client"

import { useRef, useState, useTransition } from "react"
import { isClerkAPIResponseError } from "@clerk/nextjs/errors"
import { CameraIcon, Trash2Icon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import type { ClerkUser } from "@/features/account/types"

// Clerk rejects larger profile images
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function ProfileSection({ user }: { user: ClerkUser }) {
  const t = useTranslations("Account.profile")
  const tCommon = useTranslations("Common")
  const [firstName, setFirstName] = useState(user.firstName ?? "")
  const [lastName, setLastName] = useState(user.lastName ?? "")
  const [saving, startSaving] = useTransition()
  const [imagePending, startImage] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)

  const changed =
    firstName.trim() !== (user.firstName ?? "") ||
    lastName.trim() !== (user.lastName ?? "")
  const displayName =
    user.fullName || user.primaryEmailAddress?.emailAddress || ""

  const fail = (title: string, error: unknown) => {
    toast.add({
      type: "error",
      title,
      description: isClerkAPIResponseError(error)
        ? (error.errors[0]?.longMessage ?? error.errors[0]?.message)
        : tCommon("somethingWentWrong"),
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!changed) return
    startSaving(async () => {
      try {
        await user.update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
        toast.add({ type: "success", title: t("saved") })
      } catch (error) {
        fail(t("errors.save"), error)
      }
    })
  }

  const setImage = (file: File | null) => {
    startImage(async () => {
      try {
        await user.setProfileImage({ file })
        toast.add({
          type: "success",
          title: file ? t("photoSaved") : t("photoRemoved"),
        })
      } catch (error) {
        fail(t("errors.photo"), error)
      }
    })
  }

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Lets the same file be picked again after an error
    event.target.value = ""
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      toast.add({
        type: "error",
        title: t("errors.photo"),
        description: t("errors.photoTooLarge"),
      })
      return
    }
    setImage(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={user.imageUrl} alt={displayName} />
              <AvatarFallback className="text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleFile}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={imagePending}
                onClick={() => fileInput.current?.click()}
              >
                {imagePending ? <Spinner /> : <CameraIcon />}
                {t("changePhoto")}
              </Button>
              {user.hasImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={imagePending}
                  onClick={() => setImage(null)}
                >
                  <Trash2Icon />
                  {t("removePhoto")}
                </Button>
              )}
            </div>
          </div>

          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="account-first-name">
                {t("firstName")}
              </FieldLabel>
              <Input
                id="account-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                maxLength={256}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="account-last-name">
                {t("lastName")}
              </FieldLabel>
              <Input
                id="account-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                maxLength={256}
              />
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end border-t">
          <Button type="submit" disabled={!changed || saving}>
            {saving && <Spinner />}
            {tCommon("saveChanges")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export { ProfileSection }
