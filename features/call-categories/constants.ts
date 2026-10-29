// Mirrors the NestJS API's per-organization limit
export const MAX_CALL_CATEGORIES = 15

// A fixed palette keeps category colors readable and always passes the
// database's #RRGGBB check
export const CATEGORY_COLORS = [
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Green", value: "#22C55E" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
]

export const CATEGORY_SUGGESTIONS = [
  {
    name: "Appointment",
    color: "#3B82F6",
    description: "The caller wants to book, move or cancel an appointment.",
  },
  {
    name: "Quote request",
    color: "#22C55E",
    description: "The caller asks for a price, an estimate or a quote.",
  },
  {
    name: "Urgent",
    color: "#EF4444",
    description:
      "The caller needs help today, such as an emergency or a problem that can't wait.",
  },
  {
    name: "Complaint",
    color: "#F97316",
    description:
      "The caller is unhappy with a product, a service or a past visit.",
  },
]
