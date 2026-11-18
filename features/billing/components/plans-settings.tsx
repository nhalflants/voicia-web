"use client"

import { useState, useTransition } from "react"
import { CalendarXIcon, CheckIcon, LockIcon } from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { CONTACT_EMAIL } from "@/features/assistants/constants"
import {
  openPortalAction,
  startCheckoutAction,
  type ActionResult,
} from "@/features/billing/actions"
import { PLANS } from "@/features/billing/constants"
import type { PlanId, SubscriptionState } from "@/features/billing/types"

function PlansSettings({
  subscription,
  cancelAt,
  canManage,
}: {
  subscription: SubscriptionState
  // When the active subscription was cancelled and stops
  cancelAt: string | null
  canManage: boolean
}) {
  const t = useTranslations("Billing")
  const format = useFormatter()
  const locale = useLocale()
  const [pending, startTransition] = useTransition()
  // Which button the spinner belongs to
  const [target, setTarget] = useState<PlanId | "portal" | null>(null)

  const run = (
    next: PlanId | "portal",
    action: () => Promise<ActionResult>,
    errorTitle: string
  ) => {
    setTarget(next)
    startTransition(async () => {
      // On success the action redirects to Stripe and nothing comes back
      const result = await action()
      if (result && !result.ok) {
        toast.add({
          type: "error",
          title: errorTitle,
          description: result.message,
        })
      }
    })
  }

  const canSubscribe = canManage && subscription === "none"

  return (
    <>
      {subscription === "active" && (
        <Alert>
          {cancelAt ? (
            <>
              <CalendarXIcon />
              <AlertTitle>
                {t("endsOn", { date: new Date(cancelAt) })}
              </AlertTitle>
              <AlertDescription>{t("cancelled")}</AlertDescription>
            </>
          ) : (
            <>
              <AlertTitle>{t("active")}</AlertTitle>
              <AlertDescription>
                {t.rich("changePlan", {
                  contact: (chunks) => (
                    <a href={`mailto:${CONTACT_EMAIL}`}>{chunks}</a>
                  ),
                })}
              </AlertDescription>
            </>
          )}
          {canManage && (
            <AlertAction>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  run(
                    "portal",
                    () => openPortalAction(locale),
                    t("portalFailed")
                  )
                }
              >
                {pending && target === "portal" && <Spinner />}
                {/* The Stripe portal offers to renew a cancelled subscription */}
                {cancelAt ? t("renew") : t("manage")}
              </Button>
            </AlertAction>
          )}
        </Alert>
      )}
      {subscription === "activating" && (
        <Alert>
          <AlertTitle>{t("activating.title")}</AlertTitle>
          <AlertDescription>{t("activating.description")}</AlertDescription>
        </Alert>
      )}
      {subscription === "none" && !canManage && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LockIcon className="size-4 shrink-0" />
          {t("adminsOnly")}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <p>
                <span className="font-heading text-3xl font-semibold">
                  {format.number(plan.monthlyPrice, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </span>{" "}
                <span className="text-muted-foreground">{t("perMonth")}</span>
              </p>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
                  {t("includedMinutes", { minutes: plan.includedMinutes })}
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
                  {t("extraMinute", {
                    price: format.number(plan.extraMinutePrice, {
                      style: "currency",
                      currency: "EUR",
                    }),
                  })}
                </li>
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                className="w-full"
                disabled={!canSubscribe || pending}
                onClick={() =>
                  run(
                    plan.id,
                    () => startCheckoutAction(plan.id, locale),
                    t("checkoutFailed")
                  )
                }
              >
                {pending && target === plan.id && <Spinner />}
                {t("choose", { plan: plan.name })}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}

export { PlansSettings }
