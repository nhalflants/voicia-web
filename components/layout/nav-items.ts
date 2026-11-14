import { CreditCardIcon, HeadsetIcon, PhoneIcon, TagsIcon } from "lucide-react"

const mainNavItems = [
  {
    title: "Calls",
    url: "/dashboard/calls",
    icon: PhoneIcon,
  },
]

const settingsNavItems = [
  {
    title: "Assistants",
    url: "/dashboard/settings/assistants",
    icon: HeadsetIcon,
  },
  {
    title: "Call categories",
    url: "/dashboard/settings/call-categories",
    icon: TagsIcon,
  },
]

// Reached from the organization menu, not the sidebar
const plansNavItem = {
  title: "Plans",
  url: "/dashboard/plans",
  icon: CreditCardIcon,
}

export { mainNavItems, plansNavItem, settingsNavItems }
