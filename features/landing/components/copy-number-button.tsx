"use client"

import { CopyIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

function CopyNumberButton({ number }: { number: string }) {
  const t = useTranslations("Landing.demo")

  return (
    <Button
      variant="outline"
      className="h-[46px] rounded-full px-6 text-[15px] has-data-[icon=inline-start]:pl-5"
      onClick={() =>
        navigator.clipboard
          .writeText(number)
          .then(() => toast.add({ type: "success", title: t("copied") }))
          // Clipboard access can be refused; the number stays visible to copy
          .catch(() => {})
      }
    >
      <CopyIcon data-icon="inline-start" />
      {t("copy")}
    </Button>
  )
}

export { CopyNumberButton }
