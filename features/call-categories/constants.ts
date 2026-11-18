// Mirrors the NestJS API's per-organization limit
export const MAX_CALL_CATEGORIES = 15

// A fixed palette keeps category colors readable and always passes the
// database's #RRGGBB check. Names are in the CallCategories.colors messages
export const CATEGORY_COLORS = [
  { key: "gray", value: "#6B7280" },
  { key: "red", value: "#EF4444" },
  { key: "orange", value: "#F97316" },
  { key: "amber", value: "#F59E0B" },
  { key: "green", value: "#22C55E" },
  { key: "teal", value: "#14B8A6" },
  { key: "blue", value: "#3B82F6" },
  { key: "indigo", value: "#6366F1" },
  { key: "purple", value: "#A855F7" },
  { key: "pink", value: "#EC4899" },
] as const

// Names and descriptions are in the CallCategories.suggestions messages, so a
// category created from one is saved in the user's language
export const CATEGORY_SUGGESTIONS = [
  { key: "appointment", color: "#3B82F6" },
  { key: "quote", color: "#22C55E" },
  { key: "urgent", color: "#EF4444" },
  { key: "complaint", color: "#F97316" },
] as const
