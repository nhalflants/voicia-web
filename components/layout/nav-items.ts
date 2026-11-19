import {
  CreditCardIcon,
  HeadsetIcon,
  PhoneIcon,
  TagsIcon,
  UserCogIcon,
} from "lucide-react"

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

// Reached from the user menu, not the sidebar
const accountNavItem = {
  key: "account",
  url: "/dashboard/account",
  icon: UserCogIcon,
} as const

export { accountNavItem, mainNavItems, plansNavItem, settingsNavItems }
