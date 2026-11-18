"use client"

import { motion } from "motion/react"
import { MailIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Logo } from "@/features/landing/components/landing-nav"

// A call category with its recipients, and the email it sends them
function AlertsMock() {
  const t = useTranslations("Landing.product.mocks")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2 rounded-full bg-amber-500" />
          {t("categoryName")}
        </span>
        <span className="flex items-center gap-2 text-sm">
          <span className="flex -space-x-1.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-background">
              MV
            </span>
            <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-[10px] font-medium text-brand ring-2 ring-background">
              JD
            </span>
          </span>
          {t("recipients")}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MailIcon className="size-3.5" />
            {t("byEmail")}
          </span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col gap-2 rounded-xl border bg-background p-4 shadow-lg shadow-black/5"
      >
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="origin-left scale-90">
            <Logo />
          </span>
          <span>{t("now")}</span>
        </div>
        <p className="text-sm font-medium">{t("emailSubject")}</p>
        <p className="text-sm text-muted-foreground">{t("emailBody")}</p>
        <Button size="sm" className="mt-1 w-fit" tabIndex={-1}>
          {t("emailAction")}
        </Button>
      </motion.div>
    </div>
  )
}

export { AlertsMock }
