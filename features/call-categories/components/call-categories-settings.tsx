"use client"

import { useState } from "react"
import {
  EllipsisIcon,
  LockIcon,
  PencilIcon,
  PlusIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { CategorySheet } from "@/features/call-categories/components/category-sheet"
import { DeleteCategoryDialog } from "@/features/call-categories/components/delete-category-dialog"
import { RecipientSummary } from "@/features/call-categories/components/recipient-summary"
import {
  CATEGORY_SUGGESTIONS,
  MAX_CALL_CATEGORIES,
} from "@/features/call-categories/constants"
import type {
  CallCategory,
  CategoryDraft,
} from "@/features/call-categories/types"
import type { OrganizationMember } from "@/features/org/types"

type MembersById = Map<string, OrganizationMember>

function CallCategoriesSettings({
  title,
  categories,
  members,
  currentUserId,
  canManage,
}: {
  title: string
  categories: CallCategory[]
  members: OrganizationMember[]
  currentUserId: string
  canManage: boolean
}) {
  const t = useTranslations("CallCategories")
  const [sheetOpen, setSheetOpen] = useState(false)
  // Kept after closing so the sheet doesn't empty while it animates out
  const [editing, setEditing] = useState<{
    key: number
    category: CallCategory | null
    draft?: CategoryDraft
  }>({ key: 0, category: null })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<CallCategory | null>(null)

  const membersById: MembersById = new Map(members.map((m) => [m.userId, m]))
  const atLimit = categories.length >= MAX_CALL_CATEGORIES

  const openSheet = (category: CallCategory | null, draft?: CategoryDraft) => {
    setEditing((current) => ({ key: current.key + 1, category, draft }))
    setSheetOpen(true)
  }

  const confirmDelete = (category: CallCategory) => {
    setDeleting(category)
    setDeleteOpen(true)
  }

  return (
    <>
      <DashboardHeader
        title={title}
        description={t("intro")}
        action={
          // The empty state has its own CTA, so only show this once categories exist
          canManage &&
          categories.length > 0 && (
            <Button onClick={() => openSheet(null)} disabled={atLimit}>
              <PlusIcon />
              {t("new")}
            </Button>
          )
        }
      />

      {!canManage && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LockIcon className="size-4 shrink-0" />
          {t("adminsOnly")}
        </p>
      )}

      {categories.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TagsIcon />
            </EmptyMedia>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
          {canManage && (
            <EmptyContent className="gap-5">
              <Button onClick={() => openSheet(null)}>
                <PlusIcon />
                {t("new")}
              </Button>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {t("empty.suggestion")}
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {CATEGORY_SUGGESTIONS.map(({ key, color }) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openSheet(null, {
                          name: t(`suggestions.${key}.name`),
                          color,
                          description: t(`suggestions.${key}.description`),
                        })
                      }
                      className="flex items-center gap-2 px-3 font-normal text-foreground"
                    >
                      <ColorDot color={color} />
                      {t(`suggestions.${key}.name`)}
                    </Button>
                  ))}
                </div>
              </div>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col divide-y overflow-hidden rounded-lg border">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                membersById={membersById}
                canManage={canManage}
                onEdit={() => openSheet(category)}
                onDelete={() => confirmDelete(category)}
              />
            ))}
            <Item size="sm" className="rounded-none bg-muted/40">
              <ItemMedia>
                <span
                  aria-hidden
                  className="size-3 rounded-full border border-dashed border-muted-foreground"
                />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="text-muted-foreground">
                  {t("uncategorized.title")}
                </ItemTitle>
                <ItemDescription>
                  {t("uncategorized.description")}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <RecipientSummary userIds={[]} membersById={membersById} />
                {/* Lines up with the menu button on category rows */}
                {canManage && <span aria-hidden className="size-8" />}
              </ItemActions>
            </Item>
          </div>
          {canManage && atLimit && (
            <p className="text-sm text-muted-foreground">
              {t("limitReached", { max: MAX_CALL_CATEGORIES })}
            </p>
          )}
        </div>
      )}

      {canManage && (
        <>
          <CategorySheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            formKey={editing.key}
            category={editing.category}
            draft={editing.draft}
            usedColors={categories.map((c) => c.color)}
            members={members}
            currentUserId={currentUserId}
            onDelete={confirmDelete}
          />
          <DeleteCategoryDialog
            category={deleting}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            onDeleted={() => setSheetOpen(false)}
          />
        </>
      )}
    </>
  )
}

function CategoryRow({
  category,
  membersById,
  canManage,
  onEdit,
  onDelete,
}: {
  category: CallCategory
  membersById: MembersById
  canManage: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const t = useTranslations("CallCategories")
  const tCommon = useTranslations("Common")
  return (
    <Item
      size="sm"
      className="relative rounded-none has-[[data-row-edit]:hover]:bg-muted/50"
    >
      <ItemMedia>
        <ColorDot color={category.color} />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="max-w-full">
          {canManage ? (
            // Stretched over the whole row, so clicking anywhere opens the editor
            <button
              type="button"
              data-row-edit
              onClick={onEdit}
              className="truncate text-left outline-none after:absolute after:inset-0 focus-visible:underline"
            >
              {category.name}
            </button>
          ) : (
            <span className="truncate">{category.name}</span>
          )}
        </ItemTitle>
        {category.description && (
          <ItemDescription className="line-clamp-1">
            {category.description}
          </ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <RecipientSummary
          userIds={category.recipientUserIds}
          membersById={membersById}
        />
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="relative z-10"
                  aria-label={t("actionsFor", { name: category.name })}
                />
              }
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <PencilIcon />
                {tCommon("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2Icon />
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </ItemActions>
    </Item>
  )
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

export { CallCategoriesSettings }
