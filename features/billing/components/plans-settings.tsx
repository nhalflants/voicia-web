"use client"

import { useState, useTransition } from "react"
import { CheckIcon, LockIcon } from "lucide-react"

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
  canManage,
}: {
  subscription: SubscriptionState
  canManage: boolean
}) {
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
          <AlertTitle>This organization has an active subscription.</AlertTitle>
          <AlertDescription>
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact us</a> to change plan.
          </AlertDescription>
          {canManage && (
            <AlertAction>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  run(
                    "portal",
                    openPortalAction,
                    "Couldn't open subscription management"
                  )
                }
              >
                {pending && target === "portal" && <Spinner />}
                Manage subscription
              </Button>
            </AlertAction>
          )}
        </Alert>
      )}
      {subscription === "activating" && (
        <Alert>
          <AlertTitle>Payment received.</AlertTitle>
          <AlertDescription>
            Your subscription will appear here in a few moments.
          </AlertDescription>
        </Alert>
      )}
      {subscription === "none" && !canManage && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LockIcon className="size-4 shrink-0" />
          Only organization admins can subscribe.
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
                  {plan.monthlyPrice}
                </span>{" "}
                <span className="text-muted-foreground">/month excl. VAT</span>
              </p>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
                  {plan.includedMinutes} minutes included
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-4 shrink-0 text-muted-foreground" />
                  Then {plan.extraMinutePrice}/min excl. VAT
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
                    () => startCheckoutAction(plan.id),
                    "Couldn't open checkout"
                  )
                }
              >
                {pending && target === plan.id && <Spinner />}
                Choose {plan.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}

export { PlansSettings }
