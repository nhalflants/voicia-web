"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CallCategory } from "@/features/call-categories/types"
import { STATUS_FILTERS } from "@/features/calls/constants"
import type { CallFilters } from "@/features/calls/types"
import type { OrganizationMember } from "@/features/org/types"

// Select values can't be null, so "no filter" gets a key of its own
const ANY = "any"

function CallsToolbar({
  filters,
  categories,
  members,
  currentUserId,
}: {
  filters: CallFilters
  categories: CallCategory[]
  members: OrganizationMember[]
  currentUserId: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  const navigate = (next: Partial<CallFilters>) => {
    const { status, assignee, categoryId } = { ...filters, ...next }
    const params = new URLSearchParams()
    // "open" is the default view, so it stays out of the URL
    if (status !== "open") params.set("status", status)
    if (assignee) params.set("assignee", assignee)
    if (categoryId) params.set("category", categoryId)
    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  const assigneeItems = [
    { value: ANY, label: "Anyone" },
    { value: "me", label: "Assigned to me" },
    { value: "unassigned", label: "Unassigned" },
    ...members
      .filter((m) => m.userId !== currentUserId)
      .map((m) => ({ value: m.userId, label: m.name })),
  ]
  const categoryItems = [
    { value: ANY, label: "All categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]
  const categoryColors = new Map(categories.map((c) => [c.id, c.color]))

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs
        value={filters.status}
        onValueChange={(status) => navigate({ status })}
      >
        <TabsList variant="line">
          {STATUS_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        {pending && <Spinner className="text-muted-foreground" />}
        <Select
          items={assigneeItems}
          value={filters.assignee ?? ANY}
          onValueChange={(value) =>
            navigate({ assignee: value === ANY ? null : value })
          }
        >
          <SelectTrigger size="sm" aria-label="Assignee">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assigneeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categories.length > 0 && (
          <Select
            items={categoryItems}
            value={filters.categoryId ?? ANY}
            onValueChange={(value) =>
              navigate({ categoryId: value === ANY ? null : value })
            }
          >
            <SelectTrigger size="sm" aria-label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {categoryColors.has(item.value) && (
                    <span
                      className="size-2 shrink-0 self-center rounded-full"
                      style={{
                        backgroundColor: categoryColors.get(item.value),
                      }}
                    />
                  )}
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

export { CallsToolbar }
