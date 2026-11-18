"use client"

import { CopyIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Message,
  MessageContent,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"
import { toast } from "@/components/ui/toast"
import type { TranscriptTurn } from "@/features/calls/types"

function CallTranscript({
  turns,
  assistantName,
  callerName,
}: {
  turns: TranscriptTurn[]
  assistantName: string
  callerName: string
}) {
  const t = useTranslations("Calls.transcript")
  const speaker = (turn: TranscriptTurn) =>
    turn.role === "assistant" ? assistantName : callerName

  // Plain "Name: text" lines paste cleanly into an email or a CRM note
  const copy = () => {
    const text = turns
      .map((turn) => `${speaker(turn)}: ${turn.content}`)
      .join("\n\n")
    navigator.clipboard
      .writeText(text)
      .then(() => toast.add({ type: "success", title: t("copied") }))
      .catch(() => {})
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{t("title")}</h3>
        <Button variant="ghost" size="sm" className="-mr-2.5" onClick={copy}>
          <CopyIcon />
          {t("copy")}
        </Button>
      </div>
      <MessageGroup className="gap-3">
        {turns.map((turn, index) => {
          const align = turn.role === "user" ? "end" : "start"
          // Consecutive turns from one speaker read as a single block
          const newSpeaker = turns[index - 1]?.role !== turn.role
          return (
            <Message key={index} align={align}>
              <MessageContent className="gap-1">
                {newSpeaker && <MessageHeader>{speaker(turn)}</MessageHeader>}
                <Bubble
                  variant={turn.role === "user" ? "tinted" : "muted"}
                  align={align}
                >
                  <BubbleContent>{turn.content}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          )
        })}
      </MessageGroup>
    </section>
  )
}

export { CallTranscript }
