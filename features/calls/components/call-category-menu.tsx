"use client"

import { ChevronDownIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CallCategory } from "@/features/call-categories/types"

// Radio values can't be null, so "no category" gets a key of its own
const UNCATEGORIZED = "uncategorized"

function CategoryLabel({ category }: { category: CallCategory | undefined }) {
  const t = useTranslations("Calls")
  if (!category) {
    return <span className="text-muted-foreground">{t("uncategorized")}</span>
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      <span className="truncate">{category.name}</span>
    </span>
  )
}

function CallCategoryMenu({
  categoryId,
  categories,
  onChange,
}: {
  categoryId: string | null
  categories: CallCategory[]
  onChange: (categoryId: string | null) => void
}) {
  const category = categories.find((c) => c.id === categoryId)
  const value = categoryId ?? UNCATEGORIZED

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5 max-w-48 font-normal"
          />
        }
      >
        <CategoryLabel category={category} />
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => {
              if (next === value) return
              onChange(next === UNCATEGORIZED ? null : (next as string))
            }}
          >
            <DropdownMenuRadioItem value={UNCATEGORIZED}>
              <CategoryLabel category={undefined} />
            </DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            {categories.map((c) => (
              <DropdownMenuRadioItem key={c.id} value={c.id}>
                <CategoryLabel category={c} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { CallCategoryMenu }
