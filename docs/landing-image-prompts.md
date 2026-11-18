# Landing page image prompts

Prompts for the six "Who it's for" cards on the landing page. The page ships
with icons; each photo is optional and can be added on its own.

## How to add a photo

1. Generate the image with the prompt below (4:3, at least 1600 × 1200).
2. Export it as WebP or JPEG under 250 KB and save it as
   `public/landing/<key>.webp` (keys below).
3. In `features/landing/components/audiences.tsx`, set `image` on that
   audience, for example `{ key: "trades", icon: WrenchIcon, image: "/landing/trades.webp" }`.

The card shows the photo above its text. Images are decorative (`alt=""`),
so the text below still carries the meaning.

## Shared style (add to every prompt)

> Candid editorial photograph, natural warm daylight, shallow depth of
> field, soft film grain, muted palette with warm peach and coral accents,
> calm and real rather than staged, no visible text, no logos, no brand
> names, no screens with readable content. Set in Belgium. 4:3 landscape.

Avoid: stock-photo smiles at the camera, headsets, call-centre desks, robots
or "AI" visuals, glowing blue light, hands pointing at holograms.

## The six cards

### `trades`: Trades and home services

> A plumber in work clothes kneeling under a kitchen sink in a bright
> Brussels apartment, both hands busy with a wrench, a smartphone lying
> face-down on the tiled floor beside a toolbox. Focus on the hands and
> the tools; the person's face partly out of frame.

### `clinics`: Clinics and practices

> The reception of a small physiotherapy practice: a practitioner in a
> light uniform walking a patient towards a treatment room, the reception
> desk with a ringing desk phone in the soft-focus foreground, plants and
> wooden furniture.

### `agencies`: Agencies and consultants

> A consultant in a meeting with a client at a café table, laptop open but
> turned away from the camera, notebook and coffee cups, the consultant's
> phone face-down on the table. Warm afternoon light through a large window.

### `legal`: Legal and accounting

> An accountant in a calm office reviewing paper files with a client across
> a desk, glasses on, a fountain pen in hand, shelves of binders behind
> them, a phone on the desk out of focus.

### `hospitality`: Restaurants and hospitality

> A chef plating dishes in a small restaurant kitchen during service, steam
> and warm lamps, a busy pass with order tickets (no readable text), a
> phone on a shelf in the background.

### `realEstate`: Real estate

> An estate agent showing a sunlit, empty townhouse living room to a young
> couple, seen from behind, the agent gesturing towards tall windows and
> parquet floors. Brussels townhouse architecture.

## Answers tab: Voicia picks up while you work

The photo fills the Answers tab panel in the "How it works" section. The
Voicia summary card floats over its lower right corner, so that area must
stay calm.

- File: `public/landing/answers.webp`, 4:3, at least 1600 × 1200, under 300 KB.
- Turn it on: set `ANSWERS_IMAGE = "/landing/answers.webp"` in
  `features/landing/constants.ts`.

> Candid editorial photograph, warm natural daylight from a window on the
> left, inside a small, tidy Belgian woodworking workshop. In the left two
> thirds of the frame, a craftsperson's hands and forearms sand a wooden
> board on a workbench, slightly out of focus, sleeves rolled up, no face
> visible. In the sharp lower-left foreground, a smartphone lies face-up on
> the bench, its screen softly lit by an incoming call, nothing readable on
> it. Wood shavings, a pencil, a folding ruler and a ceramic coffee cup. The
> lower-right third is a calm, uncluttered stretch of light wood and soft
> shadow. Muted palette of warm whites, honey wood and peach, with a subtle
> coral accent; soft contrast, gentle highlights, fine film grain, shallow
> depth of field, 35 mm lens look. Quiet and real, not staged. 4:3
> landscape. No faces, no text, no logos, no brand names, no watermark.

Negative prompt, for tools that take one: *face, people looking at camera,
smiling, headset, call centre, office desk, computer screen, readable text,
UI, logo, watermark, neon, blue light, harsh flash, cluttered background,
extra fingers, distorted hands.*

Variations worth trying with the same style block:
- *A physiotherapist's hands adjusting a treatment table, the phone lit on a
  side shelf.*
- *A chef's hands plating a dish at the pass, the phone lit beside a stack of
  order tickets.*

## Social image (optional)

The social sharing image is generated in code
(`app/[locale]/opengraph-image.tsx`) and needs no photo. To use a photo
instead, generate:

> Close-up of a smartphone lying face-down on a wooden workbench next to a
> pair of work gloves and a coffee cup, warm morning light, lots of empty
> space on the left for a headline, peach and coral tones. 1200 × 630.

Then replace the generated image with a static `opengraph-image.png` in
`app/[locale]/`.
