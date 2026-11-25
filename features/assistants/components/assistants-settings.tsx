import { ChevronRightIcon, HeadsetIcon, LockIcon, MailIcon } from "lucide-react"
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
import { CONTACT_EMAIL } from "@/features/assistants/constants"
import type { Assistant } from "@/features/assistants/types"
import { Link } from "@/i18n/navigation"

function AssistantsSettings({
  assistants,
  canManage,
}: {
  assistants: Assistant[]
  canManage: boolean
}) {
  const t = useTranslations("Assistants")

  if (assistants.length === 0) {
    return (
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
    )
  }

  return (
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
          />
        ))}
      </div>
    </>
  )
}

function AssistantRow({
  assistant,
  canManage,
}: {
  assistant: Assistant
  canManage: boolean
}) {
  const t = useTranslations("Assistants")
  const tCommon = useTranslations("Common")
  return (
    <Item
      size="sm"
      className="relative rounded-none has-[[data-row-link]:hover]:bg-muted/50"
    >
      <ItemMedia variant="icon">
        <HeadsetIcon />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="max-w-full">
          {/* Stretched over the whole row, so clicking anywhere opens the page */}
          <Link
            href={`/dashboard/settings/assistants/${assistant.id}`}
            data-row-link
            className="truncate outline-none after:absolute after:inset-0 focus-visible:underline"
          >
            {assistant.name}
          </Link>
        </ItemTitle>
        <ItemDescription className="line-clamp-1">
          {assistant.firstMessage ? (
            t("quoted", { message: assistant.firstMessage })
          ) : (
            <span className="italic">{t("noFirstMessage")}</span>
          )}
        </ItemDescription>
      </ItemContent>
      {/* The row is the link; this is only the visible cue */}
      <ItemActions aria-hidden className="text-muted-foreground">
        {canManage ? (
          <span className="flex items-center gap-1.5 text-sm font-medium">
            {tCommon("edit")}
            <ChevronRightIcon className="size-4" />
          </span>
        ) : (
          <ChevronRightIcon className="size-4" />
        )}
      </ItemActions>
    </Item>
  )
}

export { AssistantsSettings }
