export interface CallCategory {
  id: string
  name: string
  color: string
  description: string | null
  // Empty means every member receives the category's recaps
  recipientUserIds: string[]
  callCount: number
}

// What the NestJS API accepts to create or fully replace a category
export interface CallCategoryInput {
  name: string
  color: string
  description: string
  recipientUserIds: string[]
}

// Prefills the create form, e.g. from a suggestion
export type CategoryDraft = Pick<CallCategory, "name" | "color" | "description">
