import { HeadsetIcon, PhoneIcon, TagsIcon } from "lucide-react"

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

export { mainNavItems, settingsNavItems }
