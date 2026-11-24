"use client"

import { useEffect, useRef, useTransition } from "react"
import { SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { usePathname, useRouter } from "@/i18n/navigation"

const DEBOUNCE_MS = 300

// Searches as you type. The query stays in the URL, and without JS the form
// still submits as a plain GET.
function ContactsSearch({ query }: { query: string }) {
  const t = useTranslations("Contacts")
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Picks up a query changed from elsewhere (e.g. the Contacts nav link
  // dropping ?q=), but never overwrites what is being typed
  useEffect(() => {
    const input = inputRef.current
    if (input && document.activeElement !== input) input.value = query
  }, [query])

  useEffect(() => () => clearTimeout(timer.current), [])

  const search = (value: string) => {
    clearTimeout(timer.current)
    const next = value.trim()
    if (next === query) return
    // A new search starts again from the first page
    const href = next
      ? `${pathname}?${new URLSearchParams({ q: next })}`
      : pathname
    startTransition(() => {
      router.replace(href, { scroll: false })
    })
  }

  return (
    <form
      role="search"
      className="w-full sm:max-w-sm"
      onSubmit={(event) => {
        event.preventDefault()
        search(inputRef.current?.value ?? "")
      }}
    >
      <InputGroup>
        <InputGroupAddon>
          {pending ? <Spinner /> : <SearchIcon />}
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={query}
          maxLength={100}
          placeholder={t("search")}
          aria-label={t("search")}
          onChange={(event) => {
            const { value } = event.target
            clearTimeout(timer.current)
            // Clearing (the ✕ button or Escape) resets the list right away
            if (!value) search("")
            else timer.current = setTimeout(() => search(value), DEBOUNCE_MS)
          }}
        />
      </InputGroup>
    </form>
  )
}

export { ContactsSearch }
