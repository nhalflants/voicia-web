# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder at `app/[locale]/page.tsx` with the Voicia marketing page that will replace voicia.be.

**Architecture:** One server-rendered page composed of section components in `features/landing/components/`. Copy lives in the `Landing` namespace of `i18n/messages/{en,fr}.json`. Client components exist only where something moves (hero call, product tabs, counters, demo conversation, nav). Every mock is built from the app's own shadcn primitives with fictional sample data.

**Tech Stack:** Next.js 16 (read `node_modules/next/dist/docs/` before using an API), next-intl 4, Clerk 7, shadcn on Base UI, Tailwind 4, lucide-react, `motion` (new).

**Spec:** `docs/superpowers/specs/2026-11-18-landing-page-design.md`

## Global Constraints

- No test runner exists, and none is added. Each task is verified with `npm run typecheck`, `npm run lint` and a browser check at `http://localhost:3001/en` and `/fr`. `npm run build` runs in the last task.
- Use existing primitives first: `Button`, `Badge`, `Card`, `Item`, `Tabs`, `Accordion`, `Separator`, `Sheet`. Custom CSS only for gradient fields and the phone frame.
- Brand accent `#FF5A5F` (from `public/voicia-logo.svg`), the only accent. Gradient fields go coral to peach, with dark variants.
- Headings use Familjen Grotesk through a new `--font-display` variable, on the landing page only. Don't change `--font-heading` or any dashboard component.
- Motion: server components import `motion/react-client`; client components import `motion/react`. Wrap the page in `MotionConfig reducedMotion="user"`. Loops run only while in view.
- No Beside copy, images, logos or colours. No testimonials, no customer logos, no partner logos.
- Every visible string exists in both `en.json` and `fr.json`. Numbers go through next-intl formatting (French shows "12 000+").
- Stats are fixed: 12,000+ calls answered · 7,000+ briefs written · 150+ hours handled · 86% of calls during working hours · 1,000+ after hours · "since September 2025".
- Plans come from `PLANS` in `features/billing/constants.ts`. Never repeat prices in copy.
- Canonical origin `https://www.voicia.be`.

## Review Focus

1. `BOOKING_URL` is empty → every "Book a setup call" (nav, hero, pricing cards, final call to action) opens `mailto:contact@voicia.be`. Owned by Task 1, re-checked in Task 6.
2. Reduced motion is on → loops show their final frame, tabs don't auto-advance, no counting up. Checked in Tasks 1, 2, 3 and 5.
3. 375 px phone width → no horizontal scroll, the nav collapses into a `Sheet`, and the mocks scale down without clipping text. Checked in every task.
4. French copy is longer → buttons, tab labels and plan cards wrap instead of overflowing. Checked on `/fr` in every task.
5. A signed-in visitor → the nav shows "Open dashboard" instead of Sign in. Sign up and Sign in links keep the locale prefix. Owned by Task 1.

---

### Task 1: Foundation, nav and hero (checkpoint: owner reviews before Task 2)

**Files:**
- Modify: `package.json` (add `motion`)
- Modify: `app/[locale]/layout.tsx` (add Familjen Grotesk as `--font-display`)
- Modify: `app/[locale]/globals.css` (`--font-display` in `@theme inline`, `.landing-glow` gradient field light/dark, `.phone-frame`)
- Modify: `app/[locale]/page.tsx`
- Modify: `i18n/messages/en.json`, `i18n/messages/fr.json` (replace `Home` with `Landing.nav`, `Landing.hero`)
- Create: `features/landing/constants.ts`
- Create: `features/landing/components/book-call-button.tsx`
- Create: `features/landing/components/landing-motion.tsx`
- Create: `features/landing/components/reveal.tsx`
- Create: `features/landing/components/section-heading.tsx`
- Create: `features/landing/components/landing-nav.tsx`
- Create: `features/landing/components/hero.tsx`
- Create: `features/landing/components/hero-call.tsx`
- Create: `features/landing/components/phone-frame.tsx`

**Interfaces:**
- Produces:
  - `BOOKING_URL: string` (empty), `CONTACT_EMAIL` re-exported from `features/assistants/constants`, `DEMO_PHONE_NUMBER: string` (fake Belgian mobile, e.g. `"+32 470 12 34 56"`), `STATS: { since: string; callsAnswered: number; briefsWritten: number; hoursHandled: number; workingHoursShare: number; afterHours: number }` with values 12000, 7000, 150, 0.86, 1000 and `since: "2025-09"`.
  - `bookingHref(): string`: `BOOKING_URL` or `mailto:${CONTACT_EMAIL}`.
  - `<BookCallButton size? variant? className? />`: server component, a `Button` rendered as `<a>` to `bookingHref()` (`target="_blank"` only for http links), label `Landing.cta.book`.
  - `<LandingMotion>`: client wrapper with `MotionConfig reducedMotion="user"`.
  - `<Reveal delay? className?>`: fades and rises 16 px once in view (`motion/react-client`, `viewport={{ once: true, margin: "-80px" }}`).
  - `<SectionHeading icon title subtitle? id?>`: centred lucide icon, `font-display` h2, muted subtitle.
  - `<PhoneFrame>`: rounded device frame for mocks, scales with its container.

- [ ] **Step 1:** `npm install motion`. Confirm `import { motion } from "motion/react"` typechecks.
- [ ] **Step 2:** Load `Familjen_Grotesk` from `next/font/google` with `variable: "--font-display"` in the layout, and map `--font-display` in `@theme inline` so `font-display` works as a utility.
- [ ] **Step 3:** Add the constants and `bookingHref()`. Add `Landing.nav` (howItWorks, pricing, faq, signIn, openDashboard, menu), `Landing.cta` (book, signUp) and `Landing.hero` (eyebrow, title, subtitle, plus sample-call strings: callerName, greeting, callerLine, assistantLine, briefTitle, briefSummary, callBack, assignToMe) in both languages. Remove `Home`.
- [ ] **Step 4:** Build `LandingNav`, a client component: sticky, transparent at the top, `backdrop-blur` and a border after 8 px of scroll. Logo links home, anchor links go to `#how`, `#pricing` and `#faq`. Clerk `<Show when="signed-out">` shows a Sign in `Link` to `/sign-in`; `<Show when="signed-in">` shows "Open dashboard" linking to `/dashboard`. Both use the next-intl `Link`. Below `md`, the links move into a `Sheet`.
- [ ] **Step 5:** Build `Hero` (server): eyebrow, `font-display` title, subtitle, `BookCallButton` plus a Sign up `Link` to `/sign-up` (outline `Button`), and `<HeroCall />` on a `.landing-glow` field.
- [ ] **Step 6:** Build `HeroCall`, a client component looping through 4 stages while in view (`useInView`): (1) the phone rings with a coral pulse and "Incoming call" with the caller number; (2) the greeting bubble; (3) the caller bubble, then the assistant bubble; (4) a brief card slides out beside the phone. The card is built from `Item`/`Badge`/`Button` like `call-detail-sheet.tsx`: caller name, number, "Answered by Voicia", summary, and "Call back" and "Assign to me" buttons. Restart after ~3 s. With `useReducedMotion()`, render stage 4 statically. On phones, the card stacks under the phone.
- [ ] **Step 7:** `page.tsx` renders `<LandingMotion><LandingNav /><main><Hero /></main></LandingMotion>`.
- [ ] **Step 8: Verify.** `npm run typecheck && npm run lint` pass. In the browser on `/en` and `/fr` at desktop and 375 px:
  - the hero sequence loops;
  - no horizontal scroll;
  - "Book a setup call" has an `href` starting with `mailto:contact@voicia.be`;
  - signed in, the nav shows "Open dashboard";
  - with reduced motion emulated, the brief card is shown at rest.
- [ ] **Step 9:** Commit `feat: landing page nav and hero`.
- [ ] **Step 10: Checkpoint.** Show the owner screenshots (desktop and phone, light and dark). Apply their feedback before starting Task 2.

### Task 2: Problem and numbers

**Files:**
- Create: `features/landing/components/problem.tsx`, `features/landing/components/numbers.tsx`, `features/landing/components/count-up.tsx`
- Modify: `app/[locale]/page.tsx`, both message files (`Landing.problem`, `Landing.numbers`)

**Interfaces:**
- Consumes: `STATS`, `Reveal`, `SectionHeading`.
- Produces: `<CountUp value: number format: "integer" | "percent" suffix?: string />`, a client component. It animates from 0 once in view (`animate` from `motion/react`, ~1.2 s), formats with `useFormatter().number`, and renders the final value immediately with reduced motion.

- [ ] **Step 1:** `Problem`: a large `CountUp` of `workingHoursShare` ("86%") with the line "of calls come in while you're working", plus three short pain cards (on a job, with a client, after hours) using `Card`.
- [ ] **Step 2:** `Numbers`: a band of three `CountUp`s (callsAnswered "+", hoursHandled "+", afterHours "+") with labels and a "since September 2025" note formatted from `STATS.since`.
- [ ] **Step 3: Verify.** Typecheck and lint pass. `/fr` shows "12 000+" and "86 %". With reduced motion, the final numbers show at once. No overflow at 375 px.
- [ ] **Step 4:** Commit `feat: landing problem and numbers sections`.

### Task 3: Product tabs

**Files:**
- Create: `features/landing/components/product-tabs.tsx`
- Create: `features/landing/components/mocks/incoming-call-mock.tsx`, `brief-mock.tsx`, `calls-list-mock.tsx`, `alerts-mock.tsx`, `app-frame.tsx`
- Modify: `app/[locale]/page.tsx`, both message files (`Landing.product` with 4 tabs: answers, brief, sorts, alerts, each with a label, title, text and its mock's sample strings)

**Interfaces:**
- Consumes: `SectionHeading` (id `how`), `Reveal`.
- Produces: `<AppFrame>`, a browser-style window frame (three dots, `Card` body) around a mock.

- [ ] **Step 1:** Build the four mocks from primitives, matching the live dashboard:
  - **Calls list:** day section label, rows with caller, number, time, duration, "Missed call" badge, category badge, status dot and assignee.
  - **Brief:** detail panel header with "Call back" / "Assign to me", status, assignee and category, summary, other calls from this number.
  - **Incoming call:** live timer and waveform bars.
  - **Alerts:** a category with recipients, plus an email notification card.
- [ ] **Step 2:** `ProductTabs`, a client component built on `Tabs`/`TabsList`/`TabsTrigger` with the `line` variant. The active indicator is a `motion.span` with a shared `layoutId`, and the panels cross-fade with `AnimatePresence mode="wait"`. Tabs auto-advance every 6 s while in view, stop for good after the first click, and never auto-advance with reduced motion. Text sits left and the mock in an `AppFrame` on a `.landing-glow` field sits right, stacking on phones. The tab list scrolls horizontally inside its own container at 375 px.
- [ ] **Step 3: Verify.** Typecheck and lint pass. Auto-advance runs and stops after a click. Keyboard arrows switch tabs (Base UI). French labels fit or scroll inside the list. No page overflow at 375 px.
- [ ] **Step 4:** Commit `feat: landing product tabs`.

### Task 4: Who it's for and integrations

**Files:**
- Create: `features/landing/components/audiences.tsx`, `features/landing/components/integrations.tsx`
- Modify: `app/[locale]/page.tsx`, both message files (`Landing.audiences`, six items: trades, clinics, agencies, legal, hospitality, realEstate; `Landing.integrations`)

- [ ] **Step 1:** `Audiences`: six `Card`s in a 3/2/1-column grid, each with a lucide icon (Wrench, Stethoscope, Briefcase, Scale, UtensilsCrossed, Home), title and one line naming the call it catches. Leave an optional `image?: string` slot that renders above the text when set (unset for now).
- [ ] **Step 2:** `Integrations`: a wrapping row of pill `Badge`s with generic lucide icons. Email alerts is marked "Available"; Google Calendar, Outlook, HubSpot, WhatsApp and iMessage are marked "Coming soon". No brand logos.
- [ ] **Step 3: Verify.** Typecheck and lint pass. Grid columns collapse correctly. No overflow on `/fr` at 375 px.
- [ ] **Step 4:** Commit `feat: landing audiences and integrations`.

### Task 5: Live demo

**Files:**
- Create: `features/landing/components/demo-line.tsx`, `features/landing/components/demo-conversation.tsx`
- Modify: `app/[locale]/page.tsx`, both message files (`Landing.demo`: title, text, copy, copied, plus a 6-turn script where Voicia's sales assistant asks about the caller's business and how they handle calls today, then explains how Voicia helps, followed by brief title and summary)

**Interfaces:**
- Consumes: `DEMO_PHONE_NUMBER`.

- [ ] **Step 1:** `DemoLine` (server): returns `null` when `DEMO_PHONE_NUMBER` is empty. Otherwise it shows the title, text, the number in large `font-display`, a "Call" `Button` linking to `tel:` with spaces stripped, and a copy button (client; `navigator.clipboard.writeText`, toast "Copied" via the existing `Toaster`).
- [ ] **Step 2:** `DemoConversation`, a client component: bubbles appear one by one while in view, then the brief card appears (reuse the brief card piece from `HeroCall` if it's extracted as `<BriefCard />`; extract it in this step if not). Loops. Reduced motion shows the whole conversation at once.
- [ ] **Step 3: Verify.** Typecheck and lint pass. The `tel:` href has no spaces. Copy shows the toast. Emptying the constant hides the section.
- [ ] **Step 4:** Commit `feat: landing live demo`.

### Task 6: Pricing, FAQ, final call to action and footer

**Files:**
- Create: `features/landing/components/pricing.tsx`, `faq.tsx`, `final-cta.tsx`, `landing-footer.tsx`
- Modify: `app/[locale]/page.tsx`, both message files (`Landing.pricing`, `Landing.faq` with 4 items, `Landing.finalCta`, `Landing.footer`)

**Interfaces:**
- Consumes: `PLANS`, `BookCallButton`, and `Billing.perMonth` / `Billing.includedMinutes` / `Billing.extraMinute` messages where they fit.

- [ ] **Step 1:** `Pricing` (id `pricing`): one `Card` per entry in `PLANS`, showing name, `monthlyPrice` as currency EUR, "/month excl. VAT", included minutes, extra-minute price, "Setup included", and a `BookCallButton`. No "most popular" badge.
- [ ] **Step 2:** `Faq` (id `faq`): `Accordion` with the four Q&As from the spec. The extra-minutes answer is generated from `PLANS`, not hard-coded.
- [ ] **Step 3:** `FinalCta` on a `.landing-glow` field with `BookCallButton`. `LandingFooter`: logo, `contact@voicia.be`, an en/fr language switch (next-intl `Link` with `locale`), and © 2026. No Privacy or Terms links.
- [ ] **Step 4: Verify.** Typecheck and lint pass. Every "Book a setup call" `href` on the page is `mailto:contact@voicia.be` while `BOOKING_URL` is empty (check with `document.querySelectorAll` in the browser). The language switch keeps you on `/` in the other locale.
- [ ] **Step 5:** Commit `feat: landing pricing, FAQ and footer`.

### Task 7: Metadata, social image, full check

**Files:**
- Modify: `app/[locale]/page.tsx` (add `generateMetadata`)
- Create: `app/[locale]/opengraph-image.tsx`
- Modify: both message files (`Landing.meta`: title, description)

- [ ] **Step 1:** `generateMetadata`: localized title and description, `metadataBase: new URL("https://www.voicia.be")`, `alternates.canonical` set to `/${locale}`, and `alternates.languages` set to `{ en: "/en", fr: "/fr" }`. Read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` first.
- [ ] **Step 2:** `opengraph-image.tsx` using `ImageResponse` from `next/og`: 1200×630, white with a coral glow, the logo waveform, and the localized hero title. Read `opengraph-image.md` first.
- [ ] **Step 3: Verify.** `npm run build` succeeds. Then check the whole page on `/en` and `/fr`:
  - desktop, 375 px, light, dark and reduced motion, with Review Focus 1–5 each checked;
  - console has no errors;
  - the `<head>` has canonical, `hreflang` and `og:image`.
- [ ] **Step 4:** Commit `feat: landing metadata and social image`.

### Task 8: Image prompts

**Files:**
- Create: `docs/landing-image-prompts.md`

- [ ] **Step 1:** Write one prompt per audience card (six) and one for the social image. Each prompt specifies style (warm natural light, candid, a professional mid-task with a phone face-down or buzzing nearby, no visible screen text, no logos), 4:3 aspect, a palette leaning towards coral and peach, and an output size. Add a note on where each file goes (`public/landing/<audience>.jpg`) and the `image` prop that turns it on.
- [ ] **Step 2:** Commit `docs: landing image prompts`.
