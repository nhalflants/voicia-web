"use client"

import { useState } from "react"
import { HeadsetIcon, LockIcon, MailIcon, PencilIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
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
import { AssistantSheet } from "@/features/assistants/components/assistant-sheet"
import { CONTACT_EMAIL } from "@/features/assistants/constants"
import type { Assistant } from "@/features/assistants/types"

function AssistantsSettings({
  assistants,
  canManage,
}: {
  assistants: Assistant[]
  canManage: boolean
}) {
  const t = useTranslations("Assistants")
  const [sheetOpen, setSheetOpen] = useState(false)
  // Kept after closing so the sheet doesn't empty while it animates out
  const [editing, setEditing] = useState<{
    key: number
    assistant: Assistant | null
  }>({ key: 0, assistant: null })

  const openSheet = (assistant: Assistant) => {
    setEditing((current) => ({ key: current.key + 1, assistant }))
    setSheetOpen(true)
  }

  return (
    <>
      {assistants.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HeadsetIcon />
            </EmptyMedia>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              nativeButton={false}
              render={<a href={`mailto:${CONTACT_EMAIL}`} />}
            >
              <MailIcon />
              {t("empty.contact")}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {!canManage && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LockIcon className="size-4 shrink-0" />
              {t("adminsOnly")}
            </p>
          )}
          <div className="flex flex-col divide-y overflow-hidden rounded-lg border">
            {assistants.map((assistant) => (
              <AssistantRow
                key={assistant.id}
                assistant={assistant}
                canManage={canManage}
                onEdit={() => openSheet(assistant)}
              />
            ))}
          </div>
        </>
      )}

      {canManage && (
        <AssistantSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          formKey={editing.key}
          assistant={editing.assistant}
        />
      )}
    </>
  )
}

function AssistantRow({
  assistant,
  canManage,
  onEdit,
}: {
  assistant: Assistant
  canManage: boolean
  onEdit: () => void
}) {
  const t = useTranslations("Assistants")
  const tCommon = useTranslations("Common")
  return (
    <Item
      size="sm"
      className="relative rounded-none has-[[data-row-edit]:hover]:bg-muted/50"
    >
      <ItemMedia variant="icon">
        <HeadsetIcon />
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
              {assistant.name}
            </button>
          ) : (
            <span className="truncate">{assistant.name}</span>
          )}
        </ItemTitle>
        <ItemDescription className="line-clamp-1">
          {assistant.firstMessage ? (
            t("quoted", { message: assistant.firstMessage })
          ) : (
            <span className="italic">{t("noFirstMessage")}</span>
          )}
        </ItemDescription>
      </ItemContent>
      {canManage && (
        <ItemActions>
          {/* The row already opens the editor; this is the visible cue */}
          <Button
            variant="ghost"
            size="sm"
            className="relative z-10"
            tabIndex={-1}
            onClick={onEdit}
          >
            <PencilIcon />
            {tCommon("edit")}
          </Button>
        </ItemActions>
      )}
    </Item>
  )
}

export { AssistantsSettings }
