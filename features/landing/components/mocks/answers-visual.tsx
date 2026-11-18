import { useTranslations } from "next-intl"

import { BriefCard } from "@/features/landing/components/brief-card"
import { ANSWERS_IMAGE } from "@/features/landing/constants"
import { cn } from "@/lib/utils"

// A professional busy at work, and the summary Voicia sends once it has
// answered and qualified the call
function AnswersVisual() {
  const t = useTranslations("Landing.product.mocks")

  return (
    <div
      className={cn(
        "relative flex aspect-[4/5] w-full items-end justify-end overflow-hidden rounded-3xl p-4 sm:aspect-[4/3] sm:p-6",
        !ANSWERS_IMAGE && "landing-glow"
      )}
    >
      {ANSWERS_IMAGE ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ANSWERS_IMAGE}
          alt={t("answers.imageAlt")}
          // Portrait on phones: keep the left side, where the hands and phone are
          className="absolute inset-0 size-full object-cover object-[25%_50%] sm:object-center"
        />
      ) : (
        <div className="landing-dots pointer-events-none absolute inset-0" />
      )}
      <BriefCard
        compact
        className="relative w-full max-w-[320px] shadow-2xl shadow-black/15"
        content={{
          callerName: t("answers.callerName"),
          callerNumber: t("answers.callerNumber"),
          time: t("answers.time"),
          category: t("answers.category"),
          priority: t("answers.priority"),
          summary: t("answers.summary"),
          facts: {
            place: t("answers.place"),
            when: t("answers.when"),
            topic: t("answers.topic"),
          },
          duration: t("answers.duration"),
          replay: t("answers.replay"),
          callBack: t("answers.callBack"),
          sentTo: t("answers.sentTo"),
        }}
      />
    </div>
  )
}

export { AnswersVisual }
