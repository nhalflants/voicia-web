// A list item is plain text, or a bold lead-in followed by text
export type LegalListItem = string | { term: string; text: string }

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: LegalListItem[] }

export type LegalSection = { title: string; blocks: LegalBlock[] }

export type LegalDocument = {
  title: string
  intro?: string
  sections: LegalSection[]
  // Closing lines under the last section
  footnote?: string
}
