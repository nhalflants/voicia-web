import { CreditCardIcon, HeadsetIcon, PhoneIcon, TagsIcon } from "lucide-react"

// `key` names the label in the Nav messages
const mainNavItems = [
  {
    key: "calls",
    url: "/dashboard/calls",
    icon: PhoneIcon,
  },
] as const

const settingsNavItems = [
  {
    key: "assistants",
    url: "/dashboard/settings/assistants",
    icon: HeadsetIcon,
  },
  {
    key: "callCategories",
    url: "/dashboard/settings/call-categories",
    icon: TagsIcon,
  },
] as const

// Reached from the organization menu, not the sidebar
const plansNavItem = {
  key: "plans",
  url: "/dashboard/plans",
  icon: CreditCardIcon,
} as const

export { mainNavItems, plansNavItem, settingsNavItems }
