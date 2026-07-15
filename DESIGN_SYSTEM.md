# PagerLook Design System — "Quiet Infrastructure"

Calm, precise, high-trust. The register of Linear / Stripe / Vercel. HR staff live in this
tool for hours: favor **legibility, density, and calm over decoration**.

**Tailwind v4.** All tokens live in the `@theme` block in `src/index.css`. There is no
`tailwind.config.js`. Adding a token there automatically generates the utility.

> **Rule zero:** never type a raw hex in a `.jsx` file. If you did, a token is missing —
> add it to `@theme`.

---

## Tokens

### Neutrals

| Token | Value | Use for |
| --- | --- | --- |
| `canvas` | `#FAFAFA` | Content area background, page body |
| `surface` | `#FFFFFF` | Cards, panels, dropdowns, inputs |
| `sidebar` | `#FCFCFD` | Sidebar/chrome only — reads cooler than canvas |
| `hairline` | `#ECECEF` | Default 1px border. **This is your border.** |
| `line` | `#E1E1E6` | Stronger border: inputs, dashed empty states |

`bg-canvas` `bg-surface` `bg-sidebar` `border-hairline` `border-line`

### Ink

| Token | Value | Use for |
| --- | --- | --- |
| `ink-strong` | `#09090B` | Headings, metric values, primary text |
| `ink-body` | `#3F3F46` | Body copy, nav labels |
| `ink-muted` | `#71717A` | Labels, captions, subtitles |
| `ink-faint` | `#A1A1AA` | Placeholders, disabled, eyebrows |

`text-ink-strong` `text-ink-body` `text-ink-muted` `text-ink-faint`

Also used as a tint: `bg-ink-strong/[0.04]` is the **standard neutral hover wash**.

### Brand navy

`brand-50` `#EFF3FC` · `brand-100` `#DCE4F8` · `brand-500` `#2747B2` ·
`brand-600` `#1A3A8F` (primary anchor) · `brand-700` `#152B6E` · `brand-900` `#0E1D4A`

Navy is an **accent, not a surface**. Use `brand-600` for primary buttons, active nav text,
links. Use `brand-50` for active/selected backgrounds and subtle washes. Never fill a large
region with `brand-600`.

### Semantic

| Token | Fg | Bg |
| --- | --- | --- |
| success | `text-success` `#059669` | `bg-success-bg` `#ECFDF5` |
| warning | `text-warning` `#D97706` | `bg-warning-bg` `#FFFBEB` |
| danger | `text-danger` `#DC2626` | `bg-danger-bg` `#FEF2F2` |
| info | `text-info` `#2747B2` | `bg-info-bg` `#EFF3FC` |

### Back-compat (do not remove)

`vw-primary` `vw-primary-dark` `vw-primary-light` `vw-accent` — referenced by pages not yet
swept. **Don't use them in new code.** `vw-accent` (orange) must not appear in new chrome.

### Shadows

`shadow-xs` (rest/flat) · `shadow-sm` (cards) · `shadow-md` (card hover) · `shadow-lg`
(dropdowns, popovers). Soft, wide, low-opacity — ambient + key. Never a hard `0 1px 3px` line.

### Radii

- Cards / panels / dropdowns → `rounded-xl` (12px)
- Buttons / inputs / nav items → `rounded-ctl` (10px)
- Pills / avatars → `rounded-full`

`rounded-2xl` (16px) is **too bubbly — do not use.**

### Motion

`duration-150 ease-swift` for hover/color. `duration-200` for sidebar width only.
No bounce, nothing over 250ms. `ease-swift` = `cubic-bezier(0.16, 1, 0.3, 1)`.

`prefers-reduced-motion` is handled globally in `index.css`. For hover *transforms*, still add
`motion-reduce:hover:translate-y-0`.

---

## Typography

| Role | Recipe |
| --- | --- |
| Page title | `text-2xl md:text-[28px] font-bold tracking-tight text-ink-strong` |
| Card title | `text-[15px] font-semibold tracking-tight text-ink-strong` |
| Body | `text-sm text-ink-body` (line-height 1.5) |
| Label / caption | `text-xs font-medium text-ink-muted` |
| Eyebrow | `text-[11px] font-semibold uppercase tracking-wider text-ink-faint` — sparingly |
| **Metric value** | `tabular text-2xl font-bold tracking-tight text-ink-strong` |

**`font-extrabold` / `font-black` are banned.** 700 max for titles, 600 for card headers.

**Any number that ticks gets `.tabular`** (`font-variant-numeric: tabular-nums`) so it doesn't
jitter. Stat values, timestamps, counts.

---

## Recipes

### Card — use `<Card>`, don't hand-roll

```jsx
import Card from '../../components/common/Card'

<Card title="Department Split" subtitle="Headcount across your teams" action={<Link…/>}>
  {children}
</Card>
```

Props: `{ title, subtitle, action, padding, className, children }`.
`padding`: `none` | `sm` | `md` | `lg` (default).

Raw shell, if you truly need it:

```
rounded-xl border border-hairline bg-surface shadow-sm p-5 xl:p-6
```

### Button

```jsx
<Button variant="primary" size="md" fullWidth={false}>Save</Button>
```

- `variant`: `primary` | `secondary` | `ghost` | `danger`
- `size`: `sm` (32px) | `md` (40px, default) | `lg` (48px)
- `fullWidth` **defaults to `true`** — existing callers rely on it. Pass `fullWidth={false}` inline.

### Input

```jsx
<Input id="email" label="Work email" required hint="Use your company domain" leftIcon={<MailIcon/>} />
```

Props: `{ label, id, leftIcon, rightSlot, hint, error, errorText, required, className }`.
40px tall, `rounded-ctl`, `border-line`, focus → `border-brand-500 ring-2 ring-brand-500/25`.

### StatCard

```jsx
<StatCard icon={<PeopleIcon/>} label="Total Candidates" value={String(n)} accent="blue" trend="Pending" />
```

`accent`: `blue` | `green` | `orange` | `red` (drives the icon tile only).
Icon tile + tabular metric + label. **No left-border stripe.**

### Focus ring (every interactive element)

```
outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40
```

### Neutral hover

```
transition-colors duration-150 ease-swift hover:bg-ink-strong/[0.04] hover:text-ink-strong
```

### Card hover lift

```
transition duration-150 ease-swift hover:-translate-y-px hover:shadow-md motion-reduce:hover:translate-y-0
```

### Empty state

Dashed `border-line`, centered icon in a `bg-canvas` circle, `text-sm font-semibold
text-ink-strong` headline, `text-xs text-ink-muted` explainer, one brand-600 text action.
Say what *will* appear here — not just "no data".

### Icons

Hand-rolled inline SVG, **no icon package**. 20×20 viewBox, `stroke="currentColor"`,
`strokeWidth="1.5"`, round caps/joins. Color via `text-*` on a wrapping span.

---

## Layout

- Page gutters: `px-4 md:px-6`
- Grid gaps: `gap-4` / `gap-5`
- Card padding: `p-4 md:p-5` (dense) or `p-5 xl:p-6` (roomy)
- Content is capped at `max-w-[1600px]` by `EnterpriseLayout` — pages don't repeat this
- Breakpoints to check: **375 / 768 / 1280 / 1600**
- Grid children holding text need `min-w-0` — `min-width:auto` is what causes mobile overflow

---

## Do / Don't

| Don't | Do |
| --- | --- |
| `bg-[#1a3a8f]` | `bg-brand-600` |
| `text-slate-500` | `text-ink-muted` |
| `border-slate-100` | `border-hairline` |
| `rounded-2xl` | `rounded-xl` (cards) / `rounded-ctl` (controls) |
| `font-extrabold` | `font-bold` (700 max) |
| Navy gradient slab | `bg-brand-50` + `border-brand-100` wash |
| Left-border accent stripes | Icon tile + subtle shadow |
| Border **and** heavy shadow | Hairline + `shadow-sm` |
| Raw metric digits | `.tabular` |
| `hover:` only | `hover:` **and** `focus-visible:` |
| Icon button with no label | `aria-label="…"` |

---

## Accessibility floor

- Visible focus ring on every interactive element
- `aria-label` on all icon-only buttons
- Dropdowns: `aria-haspopup`, `aria-expanded`, click-outside **and** Escape to close
- Body text contrast ≥ 4.5:1 — `ink-muted` on `surface`/`canvas` is the lightest text allowed.
  **`ink-faint` is for placeholders and non-essential eyebrows only, never body copy.**
