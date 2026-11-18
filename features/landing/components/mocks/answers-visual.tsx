import Image from "next/image"
import { useTranslations } from "next-intl"

import { CallCard } from "@/features/landing/components/mocks/call-card"
import answerImage from "@/public/landing/answer.png"

// A professional busy at work while Voicia takes and qualifies the call.
// next/image serves the PNG as WebP or AVIF at the size each screen needs
function AnswersVisual() {
  const t = useTranslations("Landing.product.mocks")

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
        <Image
          src={answerImage}
          alt={t("answers.imageAlt")}
          placeholder="blur"
          sizes="(min-width: 1024px) 680px, 100vw"
          className="size-full object-cover"
        />
      </div>
      {/* Over the plain wall on the right on wider screens; just below the
          photo on phones so the ringing phone stays in view */}
      <CallCard className="relative z-10 mx-4 -mt-4 sm:absolute sm:top-1/2 sm:right-6 sm:mx-0 sm:mt-0 sm:w-[290px] sm:-translate-y-1/2" />
    </div>
  )
}

export { AnswersVisual }
