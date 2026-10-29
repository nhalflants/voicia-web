export interface Assistant {
  id: string
  name: string
  firstMessage: string | null
}

// What the NestJS API accepts: only the changed fields, at least one
export type AssistantUpdate = Partial<{ name: string; firstMessage: string }>
