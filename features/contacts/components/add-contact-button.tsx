"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ContactFormSheet } from "@/features/contacts/components/contact-form-sheet"

function AddContactButton() {
  const t = useTranslations("Contacts")
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  return (
    <>
      <Button
        onClick={() => {
          setFormKey((key) => key + 1)
          setOpen(true)
        }}
      >
        <PlusIcon />
        {t("add")}
      </Button>
      <ContactFormSheet
        open={open}
        onOpenChange={setOpen}
        formKey={formKey}
        contact={null}
      />
    </>
  )
}

export { AddContactButton }
