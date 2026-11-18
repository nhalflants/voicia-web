# Landing page — design

Date: 2026-11-18 · Status: approved · Replaces: the placeholder at `app/[locale]/page.tsx` and the current voicia.be

## Why

The rebuilt app is almost ready to replace the old one, but it has no public
page: `/` still shows the create-next-app placeholder. The new page has to
sell Voicia to a broader audience than voicia.be does today. That site speaks
only to real-estate agencies. The new one speaks to any busy professional or
small business that loses money when nobody picks up.

It should keep what voicia.be does best and borrow the look, layout and motion
of beside.com, studied through Mobbin.

The target is to deploy today. The app will grow towards more integrations,
possibly iMessage, so the page should make room for that without promising it.

## Audience

Owners and small teams whose income depends on calls they can't take while
they're working: trades, clinics and practices, agencies, legal and
accounting, hospitality, real estate. They are on a job, with a client or
driving, and check their phone in short gaps.

## What the page must say

The ideas to carry over from voicia.be, as chosen by the owner:

1. **Turn missed calls into qualified leads.**
2. **Capture inbound leads before they go cold.**
3. **The brief:** every call becomes a short written summary the team can act on.
4. **Time saved:** the team doesn't spend its day on the phone.

Not carried over as selling points: "next action" and "answers in several
languages". The assistant may still do both. The page doesn't lead with them.

## Goals

- A visitor understands within one screen what Voicia does and books a setup call.
- Every claim is backed by real numbers or by the product itself.
- The page looks and moves at the level of beside.com, in Voicia's own brand.
- English and French, like the rest of the app.
- Fast: mostly server-rendered, client JavaScript only where something moves.

## Non-goals

- Self-serve onboarding. Setup is done by the Voicia team.
- Industry-specific pages, a blog, a customer stories page, comparison pages.
- Dutch (the app has `en` and `fr` only).
- Live numbers pulled from the database.
- A contact form with a backend.

## Anti-goals (a failure even if it works)

- Reusing Beside's copy, illustrations, photos, logo or brand colours. Borrow
  structure, layout and motion only.
- Invented testimonials, logos of customers we don't have, or inflated numbers.
- Promising integrations as available when they aren't.
- Motion that gets in the way of reading, or ignores reduced-motion settings.

## Decisions made with the owner

- **Primary action: "Book a setup call"**, opening an external scheduling link
  (Cal.com or Calendly) in a new tab.
- **Secondary action: "Sign up"**, for people whose setup is done. "Sign in"
  sits in the nav.
- **Numbers come from real call data**, rounded down and labelled "since
  September 2025", kept in one constant and updated by hand.
- **A live demo section** with a real Belgian phone number to call.
- **No testimonials section** until a customer gives a real quote.
- **No partner logos** (the Whise logo is dropped).
- **Build approach: inside this Next.js app, with the Motion library** (see
  Approaches).
- Stripe will be migrated before go-live, so the page can link to sign-up freely.
- **This page replaces voicia.be.** Canonical URLs, `hreflang` and Open Graph
  use `https://www.voicia.be`.
- **Build from the existing shadcn primitives and styles wherever possible**
  (`Button`, `Badge`, `Card`, `Item`, `Tabs`, `Accordion`, `Separator`,
  `Sheet` for the phone menu, the theme tokens in `globals.css`). Custom CSS
  only where no primitive fits (gradient fields, phone frame).
- **Privacy and Terms pages are out of scope for now.** The footer leaves those
  links out until the pages exist. Data hosting (Frankfurt, EU) will be
  covered there, not in the FAQ.

## Approaches considered

| Approach | Trade-off | Outcome |
|---|---|---|
| A. In the app, CSS animations only | No new dependency, smallest bundle; tab changes are plain fades | Not chosen |
| B. In the app, with `motion` | ≈35 kB more JS on the landing page; orchestrated sequences, shared-layout tab indicator, springs | **Chosen by the owner** for polish closer to beside.com |
| C. Separate marketing site (Framer/Webflow/second app) | Edits without deploys; two codebases, duplicated brand, no reuse of app components | Ruled out: the goal is to ship this app today |

## Real numbers (from the old app's `calls` table, read 2026-11-18)

| Figure | Value | Shown as |
|---|---|---|
| Calls answered | 12,040 | 12,000+ calls answered |
| Conversations where the caller spoke | 7,217 | 7,000+ briefs written |
| Time on the phone | 159 h | 150+ hours of calls handled |
| Conversations on weekdays 9:00–18:00 | 86% | 86% of calls come in while you're working |
| Conversations outside those hours | 1,011 | 1,000+ calls answered after hours |

Kept in `features/landing/constants.ts` as `STATS`, with the "since"
date. Formatting goes through `next-intl` so French shows "12 000+".

## Page structure

Top to bottom. Copy below is direction, not final wording; final copy is
written in both languages in `i18n/messages/{en,fr}.json` under `Landing`.

1. **Nav** (sticky, blurs on scroll). Voicia logo · How it works · Pricing ·
   FAQ · Sign in · [Book a setup call]. Signed-in visitors see "Open
   dashboard" instead of Sign in. Collapses to a menu on phones.
2. **Hero.** Headline on missed calls becoming qualified leads before they go
   cold. One-line subhead on the brief and time saved. Buttons: [Book a setup
   call] [Sign up]. Visual: a phone mock where a call rings, Voicia answers
   (two or three chat bubbles appear in turn), then a brief card slides out
   beside the phone, built from the real call-detail layout (caller, summary,
   "Call back" / "Assign to me"). Loops while in view.
3. **The problem.** Large stat "86% of calls come in while you're working",
   with three short pain points (on a job, with a client, after hours).
4. **How it works / product tabs.** A row of tabs, each switching a framed
   mock of the real app, with sample data:
   - *Answers every call*: an incoming call card with a live timer.
   - *Writes the brief*: the detail panel summary.
   - *Sorts your calls*: the calls list with day sections, status, category,
     missed-call badge.
   - *Alerts the right person*: a category with its recipients, and an
     email notification card.
   The active tab indicator slides between tabs (shared layout). Tabs
   auto-advance every few seconds until the visitor clicks one.
5. **Numbers band.** 12,000+ calls answered · 150+ hours handled · 1,000+
   after hours, with "since September 2025". Numbers count up once on scroll.
6. **Who it's for.** Six cards: trades, clinics & practices, agencies, legal &
   accounting, hospitality, real estate. Each has a title and one line about
   the call it catches for them. Icons for now; a photo slot can be filled
   later from the image prompts.
7. **Live demo.** "Call our demo line" with the number in large type, a copy
   button, and a sample conversation that plays bubble by bubble and ends with
   its brief. The demo assistant plays a Voicia salesperson: it asks about the
   caller's business and how they handle calls today, then explains how
   Voicia would help, and the brief records that need. For now the number is a
   fake Belgian mobile number, to be replaced with the real line.
8. **Integrations, coming soon.** One row of names with generic icons:
   Google Calendar, Outlook, HubSpot, WhatsApp, iMessage, marked "Coming soon".
   Email alerts are marked "Available".
9. **Pricing.** The two plans from `features/billing/constants.ts` (Voicia 150,
   €60/month, 150 minutes; Voicia 500, €120/month, 500 minutes), extra-minute
   price, "excl. VAT", "Setup included". Each card's button books a setup call.
10. **FAQ.** Accordion, answers from the owner:
    - *Can I keep my number?* Yes: forward your existing number to Voicia, or
      use the number assigned to your assistant.
    - *How long does setup take?* Typically the same day. The Voicia team sets
      it up with you.
    - *Does it replace my team?* No. Voicia can transfer a call to a person, and
      writes a brief for every other call so your team follows up.
    - *What does it cost after the included minutes?* The extra-minute price of
      each plan, excl. VAT.
    No question on caller reactions (no customer feedback yet) and none on data
    (that goes in the Terms page).
11. **Final call to action + footer.** Repeat [Book a setup call]. Footer:
    contact@voicia.be, language switch, © 2026.

## Visual direction

- Beside's structure: white page, generous spacing, centred section headings
  under a small line icon, pill buttons in ink, rounded framed app mocks
  floating on a soft gradient field, hairline borders, subtle shadows.
- Voicia's brand: the coral waveform logo (`#FF5A5F`) as the one accent, used
  for the ringing state, live dots and highlights. Gradient fields lean warm
  (coral to peach) rather than Beside's yellow.
- Type: Inter for text (already loaded). Headings in Familjen Grotesk, as on
  voicia.be. *Builder's call:* scoped to the landing page (a `--font-display`
  variable used by landing headings only). The global `--font-heading` and the
  dashboard stay unchanged today, and the app mocks keep the dashboard's type
  so they look like the product.
- Mocks are built from the app's own components (`Item`, `Badge`, `Button`)
  with sample data, so they match the product.
- Light first; dark mode follows the existing theme tokens, and gradient
  fields get dark variants.

## Motion

- Library: `motion`. Server components import `motion/react-client` for
  simple reveals; interactive pieces (hero sequence, tabs, demo conversation,
  count-up) are client components importing `motion/react`.
- Sections fade and rise once when they enter the viewport (`whileInView`,
  `viewport={{ once: true }}`).
- Loops (hero call, demo conversation, auto-advancing tabs) run only while in
  view.
- `MotionConfig reducedMotion="user"` wraps the page; with reduced motion,
  loops show their final state and tabs don't auto-advance.

## Constants and placeholders

In `features/landing/constants.ts`:

- `BOOKING_URL`: the scheduling link. The owner supplies it. *Builder's
  call:* while it's empty, every "Book a setup call" button falls back to
  `mailto:contact@voicia.be`, so the page can ship before the link exists.
- `DEMO_PHONE_NUMBER`: the demo line. The owner supplies it. *Builder's
  call:* while it's empty, the live demo section is hidden.
- `STATS`: the numbers above.

## Routing and auth

- The page stays at `app/[locale]/page.tsx`, rendered on the server.
- Sign in goes to the local `/sign-in` page and Sign up to `/sign-up`, both
  existing Clerk routes, with the dashboard as the redirect.
- Metadata: localized title and description, Open Graph image (static, from
  the hero), canonical and `hreflang` alternates for `en` and `fr`.

## Files

- `app/[locale]/page.tsx`: composes the sections.
- `features/landing/components/*`: one file per section, plus the mocks.
- `features/landing/constants.ts`: links, phone number, stats.
- `i18n/messages/{en,fr}.json`: `Landing` namespace; the old `Home` keys are
  removed.
- `app/[locale]/layout.tsx`: adds Familjen Grotesk.
- `package.json`: adds `motion`.

## Image prompts

Written after this design is approved, for the six "Who it's for" cards and
the Open Graph image. The page ships with icons until the images exist.

## Left to the builder

- Exact copy within the direction above, in both languages.
- Section spacing, breakpoints, and mock sample data (realistic, fictional names).
- Timing and easing of animations.
- Icon choices (lucide).
