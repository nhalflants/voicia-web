import { SparklesIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { ProductTabs } from "@/features/landing/components/product-tabs"
import { SectionHeading } from "@/features/landing/components/section-heading"

function Product() {
  const t = useTranslations("Landing.product")

  return (
    <section id="how" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <SectionHeading
          icon={SparklesIcon}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <ProductTabs />
      </div>
    </section>
  )
}

export { Product }
