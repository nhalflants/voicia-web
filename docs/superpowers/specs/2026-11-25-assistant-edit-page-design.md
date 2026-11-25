# Assistant edit page — redesign

Status: proposal · 2026-11-25

## Recommendation

Move editing out of the side sheet and onto a dedicated page:
`/dashboard/settings/assistants/[id]`.

### Why now

| | Today (sheet) | With known-caller greetings |
| --- | --- | --- |
| Inputs | name, first message, 3 SMS textareas | + default language, + 3 greeting textareas |
| Multi-line fields | 4 | 7 |
| Width | 448px (`sm:max-w-md`) | same, and a preview has no room |

The API already accepts `defaultLanguage` and `knownCallerGreetings`
(`nestjs/voicia/src/assistants/assistants.schemas.ts`), so the form is
about to roughly double.

What Mobbin shows: every voice or AI-agent product edits the agent on a full
page — [ElevenLabs][elevenlabs], [Vapi][vapi], [Hume][hume], [Zendesk bots][zendesk],
[Lindy][lindy], [Gorgias][gorgias], [Intercom Fin][intercom]. Modals and sheets
are kept for *creating* one ([Fireflies][fireflies]) or for single settings.

A page also gives us:
- a URL to link to (e.g. later from a call: "answered by Front desk")
- room for a live preview next to the fields
- browser back, and a place for an unsaved-changes guard

### Problems with the current sheet (fix in the redesign either way)

1. **Edits are lost silently.** Esc, clicking the overlay or Cancel closes the
   sheet, and the next open remounts the form (`formKey`). No warning.
2. **Three SMS textareas stacked**, each with its own helper line, push the
   Save button far from the field being edited.
3. **Variables are documented, not offered.** The list of `{{customerFirstName}}`…
   sits in a sentence below all three textareas; you have to type the braces.
4. **No preview.** The admin can't see what a caller will hear or read,
   especially when variables are filled in or missing.
5. `SheetDescription` is imported but unused.

## Page layout

```
← Assistants
Front desk                                          [FR default] [SMS on]
───────────────────────────────────────────────────────────────────────────
┌ General ──────────────────────────────┐   ┌ Preview ─────────────────┐
│ Name            [Front desk        ]  │   │ Caller: (•) Unknown      │
│ Default language [Français ▾]         │   │         ( ) Known contact│
│ Used when we don't know the caller's  │   │ [FR] NL  EN              │
│ language.                             │   │                          │
└───────────────────────────────────────┘   │  🔊 "Bonjour Madame      │
┌ Greeting ─────────────────────────────┐   │     Dupont, …"           │
│ Everyone                               │   │                          │
│ [Hello, you've reached the Dupont …]  │   │  💬 "Cabinet Dupont: …"  │
│                                        │   │                          │
│ Known contacts           [FR] NL  EN  │   └──────────────────────────┘
│ [Bonjour {{customerSalutation}} …   ] │        (sticky on lg+)
│ + First name + Last name + Salutation │
│ + Company                              │
│ If a contact lacks a value you use,    │
│ they hear the greeting above.          │
└───────────────────────────────────────┘
┌ Text message ──────────── [FR] NL  EN ┐
│ [Cabinet Dupont: book at https://…  ] │
│ + First name …                 84/160 │
└───────────────────────────────────────┘
          ┌───────────────────────────────────────┐
          │ ● Unsaved changes   [Discard] [Save]  │   ← only when dirty
          └───────────────────────────────────────┘
```

Two columns at `lg`, one column below with the preview folded into each
section. Content width stays close to today's `max-w-3xl` for the form column.

### 1. Sections as stacked cards, not tabs

With 3–4 sections, a single scroll keeps everything visible
([Clerk][clerk], [Gorgias][gorgias], [Klaviyo][klaviyo-consent]). ElevenLabs and Vapi
use tabs because they have 10+ areas (prompt, voice, tools, analysis…). When
we add more areas, switch to a left sub-nav or tabs then — the card sections
map onto them one-to-one.

### 2. Language tabs instead of three stacked textareas

Greeting and SMS each show **one** textarea with an `FR | NL | EN` segmented
control (pattern: [Ditto variants][ditto], [Arcade translations][arcade]).

- Tabs with content get a small dot; empty ones stay plain, so "which
  languages are missing" is visible at a glance.
- One shared "editing language" state for the page: switching to NL in the
  greeting also switches SMS and the preview. Opens on the default language.
- The general first message stays a single field (the API stores one).

### 3. Variable chips under the textarea

Replace the variables sentence with buttons that insert at the cursor:
`+ First name  + Last name  + Salutation  + Company`
([Juicebox][juicebox], [Relevance AI][relevance], [Klaviyo SMS][klaviyo-sms]).
The textarea stays plain text with `{{…}}` — no rich token editor (keep it
simple); the preview is where variables are shown filled in.

### 4. Live preview

Right column, sticky:
- Caller toggle: **Unknown caller** / **Known contact** (sample: Madame Marie
  Dupont, Dupont SRL).
- Call bubble: what the assistant says first. For a known contact it renders
  the greeting template; if the template uses a value the sample lacks, it
  shows the general first message with a note — mirroring `render()` in
  `nestjs/voicia/src/vapi/caller-greeting.ts`, which falls back rather than
  play a half-filled greeting.
- SMS bubble: the text with variables filled, plus the `84/160` counter
  (pattern: [Klaviyo SMS phone preview][klaviyo-sms], [Zendesk bot preview][zendesk]).

### 5. Sticky unsaved-changes bar

A floating bar appears only when something changed: `Unsaved changes ·
Discard · Save` ([Klaviyo][klaviyo-consent], [Laravel Cloud][laravel],
[Clerk][clerk], [Base44][base44]). One Save for the whole page — the API is a
single PATCH, and the existing "send only changed fields" logic carries over.

- Leaving the page while dirty asks for confirmation (in-app links and
  `beforeunload`).
- Server errors: field errors stay on their field, and the page scrolls to the
  first one; errors without a field show in the bar.
- After save: toast, stay on the page (no auto-navigate back).

### 6. List page

- Each row becomes a link to its page (keep the stretched-row hit area and the
  Edit cue).
- Show small badges: default language, "Personal greeting" when known-caller
  greetings exist, "SMS".

## Decisions (2026-11-25)

1. **SMS when not enabled** — a muted "Off" card explaining the feature, with
   a "Contact us" button for admins.
2. **Non-admins** — open the page read-only (fields read-only, lock note, no
   save bar).
3. **Preview** — not now; phases 1 and 2 ship without it.

## Suggested phasing

1. **Page with parity.** New route, form moved out of the sheet, sections as
   cards, unsaved-changes bar + leave guard, list rows as links. Delete
   `assistant-sheet.tsx`.
2. **Known-caller greetings.** Add `defaultLanguage` and `knownCallerGreetings`
   to `Assistant` / `AssistantUpdate`, the repository and the action's error
   fields (`greetings.fr`…). Language tabs and variable chips, reused by SMS.
3. **Preview column.**

## Files (expected)

- `app/[locale]/(app)/dashboard/settings/assistants/[id]/page.tsx` — new
- `features/assistants/components/assistant-form.tsx` — from the sheet, split into sections
- `features/assistants/components/language-tabs.tsx`, `variable-chips.tsx`,
  `assistant-preview.tsx`, `unsaved-changes-bar.tsx` — new
- `features/assistants/components/sms-templates-fields.tsx` — one textarea + tabs
- `features/assistants/components/assistants-settings.tsx` — rows as links
- `features/assistants/types.ts`, `repository.ts`, `actions.ts`
- `i18n/messages/en.json`, `fr.json`

Before building: read the route and navigation guides in
`node_modules/next/dist/docs/` (per `AGENTS.md`) for dynamic params and
leave-page interception in this Next version.

## Mobbin references

[elevenlabs]: https://mobbin.com/screens/cefd7b8a-df77-4216-9475-8a8b0fab8264
[vapi]: https://mobbin.com/screens/02cdea9d-e14a-45b2-a23c-71f0c669d4f5
[hume]: https://mobbin.com/screens/f4e18c6b-e945-4cef-a1e1-3948ab8bf125
[zendesk]: https://mobbin.com/screens/bc675395-d507-40de-aef0-ec3d9b6cd92e
[lindy]: https://mobbin.com/screens/63903313-62e7-42a8-9201-69b090465ea3
[gorgias]: https://mobbin.com/screens/1d9a5773-65d7-46d9-a7e4-19230b377141
[intercom]: https://mobbin.com/screens/e363a917-2245-4e84-b90f-02f4653e05a5
[fireflies]: https://mobbin.com/screens/c3a2aea9-49b9-45fc-979d-3cbb9ac66e31
[clerk]: https://mobbin.com/screens/bceecfc6-3efc-4ef5-a682-54f7ede1dae5
[klaviyo-consent]: https://mobbin.com/screens/e06a4b15-a937-4f72-8096-9d4261b31972
[klaviyo-sms]: https://mobbin.com/screens/0d5d7caa-7415-4102-be43-eead36f5795c
[laravel]: https://mobbin.com/screens/2cd40f0c-1231-44eb-80ce-4dc0ecb28284
[base44]: https://mobbin.com/screens/ad725e67-d303-470c-9cde-86a9d636b8c6
[ditto]: https://mobbin.com/screens/18334d2e-d05c-4bd5-a1f1-1948ae833b98
[arcade]: https://mobbin.com/screens/35876cc2-3566-486f-b26a-98877bfc3d19
[juicebox]: https://mobbin.com/screens/82ef9abc-a8e2-42dd-9a72-ba5b30918527
[relevance]: https://mobbin.com/screens/855b7b42-8b27-4192-8ce0-6142a8e63960

- Agent editors on a full page: ElevenLabs, Vapi, Hume, Lindy, Zendesk, Gorgias, Intercom
- Preview next to the form: Zendesk, Gorgias, Klaviyo SMS, Juicebox
- Variable insert buttons: Juicebox, Relevance AI, Klaviyo SMS
- Per-language variants: Ditto, Arcade
- Unsaved-changes bar: Klaviyo, Laravel Cloud, Clerk, Base44
