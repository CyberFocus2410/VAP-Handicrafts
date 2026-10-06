# DESIGN.md — Design System

Implements PRD §4 (visual system), §6 (homepage), §7.3 (cards), §16 (3D/animation), §20 (a11y/responsive).
**Direction:** soft luxury · romantic editorial · beach-inspired jewellery photography · personalized scrapbook · tactile paper/fabric · *refined, subtle* 3D.
**Never:** generic marketplace template, neon/gaming 3D, childish cartoon store (PRD §4.1).

---

## 1. Colour Tokens

### 1.1 PRD palette (§4.2) — with computed WCAG contrast

Ratios below were **calculated** (WCAG 2.x relative luminance), not estimated.

| Token | Hex | Role | Contrast finding |
|---|---|---|---|
| `background` | `#FAF5EF` | Page bg | — |
| `ivory` | `#FFFDF9` | Cards/surfaces | — |
| `blush` | `#E8C1BC` | Accents, selected | Cocoa on blush **7.53:1** ✅ |
| `dusty-rose` | `#C9857B` | PRD "primary buttons" | ⚠️ **White/ivory text on it = 2.9:1 → FAILS AA.** Cocoa on it = 4.20:1 → also **fails** 4.5:1. Rose as *text on bg* = 2.72:1 ❌ |
| `cocoa` | `#4A2D28` | Text/headings | on bg **11.41:1** ✅, on ivory **12.18:1** ✅ |
| `beige` | `#E7D8C7` | Decorative surfaces | — |
| `lavender` | `#C7B5D9` | Purple collection | Cocoa on it **6.50:1** ✅ |
| `sage` | `#B8C0A6` | Optional accent | Cocoa on it **6.56:1** ✅ |
| `champagne` | `#B69A67` | Small decorative accents | ⚠️ On bg = **2.48:1** → **decorative only; never text, never sole indicator** |

### 1.2 Accessible variants (proposed — ADR-006; owner may refine)

The PRD allows refinement (§4.2: "can be refined after the brand name and logo are finalized") and requires accessible contrast. Where the PRD's literal value fails, use a **-deep** variant for text/interactive fills and keep the PRD value for decoration.

| Token | Hex | Use | Verified |
|---|---|---|---|
| `rose-deep` | `#A15B52` | **Primary button fill**, links, active states | Ivory text on it **5.00:1** ✅; as text on bg **4.69:1** ✅ |
| `rose-deeper` | `#9A554D` | Button hover/pressed | Ivory text **5.47:1** ✅ |
| `cocoa-muted` | `#6B4F49` | Secondary text, metadata | on bg **6.82:1** ✅ |
| `gold-deep` | `#7A6232` | Any gold that must be *readable* (e.g. small label) | on bg **5.35:1** ✅ |
| `success` | `#2F6B3F` | Paid/confirmed | on bg **5.88:1** ✅ |
| `error` | `#A32B2B` | Validation/payment errors | on bg **6.59:1** ✅ |

`dusty-rose #C9857B` stays as **decorative fill / illustration / hover tint / large graphical areas** (3:1 non-text rule applies only if it conveys meaning).

### 1.3 Usage proportions (PRD §4.2)
Ivory/warm neutrals **dominate (~80%)**. Blush + rose = supporting. Gold = tiny accents. Lavender only inside the purple-collection context. Do not use all colours equally.

### 1.4 CSS variables (drop-in for `globals.css`)

```css
:root {
  --bg: #FAF5EF;
  --surface: #FFFDF9;
  --blush: #E8C1BC;
  --rose: #C9857B;          /* decorative only */
  --rose-deep: #A15B52;     /* buttons, links */
  --rose-deeper: #9A554D;   /* hover/pressed */
  --cocoa: #4A2D28;         /* text */
  --cocoa-muted: #6B4F49;   /* secondary text */
  --beige: #E7D8C7;
  --lavender: #C7B5D9;
  --sage: #B8C0A6;
  --gold: #B69A67;          /* decorative only */
  --gold-deep: #7A6232;     /* readable gold */
  --success: #2F6B3F;
  --error: #A32B2B;
  --border: color-mix(in srgb, var(--cocoa) 14%, transparent);
  --ring: #6E3F38;          /* focus ring, ≥3:1 on bg & surface — verify in Phase 1 test */
}
```
> Verify `--border` and `--ring` contrast in Phase 1 (UI components need ≥ 3:1 for meaningful boundaries/focus). **Do not assume.**

### 1.5 Dark mode
Not in scope for launch (PRD: "elegant, light-toned visual identity" §25). Do not build; architecture (CSS variables) keeps it possible later.

---

## 2. Typography

PRD §4.3 requires a refined serif for headlines/product titles + clean sans for body/UI/prices/admin. Final fonts are an **owner decision**; below are proposals available via `next/font/google` (self-hosted at build, no CLS).

| Role | Proposal | Fallback stack |
|---|---|---|
| Display / headings / product titles | **Cormorant Garamond** *(alt: Fraunces, Playfair Display)* | `Georgia, 'Times New Roman', serif` |
| Body / UI / prices / admin | **Inter** *(alt: DM Sans, Manrope)* | `system-ui, -apple-system, 'Segoe UI', sans-serif` |

> Cormorant has a small x-height — **do not use below ~20px**; product titles at card size should be ≥ 20px or use the alt serif. Evaluate in Phase 2 on a real mobile device.

### Type scale (fluid, `clamp`)

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `display` | clamp(2.75rem, 6vw, 5rem) | 500 | 1.05 | Hero headline |
| `h1` | clamp(2.25rem, 4vw, 3.25rem) | 500 | 1.1 | Page titles |
| `h2` | clamp(1.75rem, 3vw, 2.5rem) | 500 | 1.15 | Section headings |
| `h3` | clamp(1.375rem, 2vw, 1.75rem) | 500 | 1.25 | Product titles |
| `body-lg` | 1.125rem | 400 | 1.6 | Lead text |
| `body` | 1rem (min 16px) | 400 | 1.6 | Default |
| `small` | 0.875rem | 400 | 1.5 | Metadata |
| `eyebrow` | 0.75rem | 600 | 1.2 | uppercase, +0.14em tracking, **short labels only** |
| `price` | 1.125rem | 600 | 1 | Sans, tabular-nums |

Rules: no all-caps paragraphs; eyebrow caps for ≤ 4 words; body ≥ 16px; line length 60–75ch; **form inputs ≥ 16px** (prevents iOS zoom).

---

## 3. Spacing, Radius, Elevation, Layout

- **Spacing scale:** Tailwind default 4px base. Section vertical rhythm: `py-16 md:py-24 lg:py-32`.
- **Container:** max-width 1280px; gutters `px-4 sm:px-6 lg:px-8`.
- **Radius:** `sm 8px` (inputs), `md 14px` (cards), `lg 24px` (feature panels), `full` (pills/badges). "Rounded or softly edged" (§4.4).
- **Borders:** 1px `--border`.
- **Shadows (soft, warm-tinted, low opacity):**
  - `sm`: `0 1px 2px rgb(74 45 40 / .06)`
  - `md`: `0 8px 24px -8px rgb(74 45 40 / .14)`
  - `lg`: `0 24px 48px -16px rgb(74 45 40 / .18)`
- **Textures:** subtle paper/linen grain overlay (SVG noise or tiny tiled PNG ≤ 20KB), `opacity ≤ .06`, `pointer-events:none`, never over text-critical areas at high opacity.
- **Whitespace:** generous; marketing content visually separated from transactional controls (cart/checkout use calmer, flatter surfaces — **no 3D/parallax on `/cart`, `/checkout`, `/payment/*`**).

### Breakpoints (PRD §20.3)

| Name | Min width | Target |
|---|---|---|
| `xs` | 360px | Small mobile (design baseline; test at 360) |
| `sm` | 480px | Standard mobile |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1440px | Wide desktop |

Test widths: **360, 390, 768, 1024, 1440**. No horizontal overflow at any width. Mobile = **recomposed** layouts (stack, simplify layers), not scaled-down desktop.

---

## 4. Components

All built accessible-first (Radix primitives or equivalent), tokens only, 44×44px minimum touch target.

| Component | Notes |
|---|---|
| **Button** | Variants: `primary` (rose-deep fill, ivory text), `secondary` (outline cocoa), `ghost`, `link`. Sizes sm/md/lg. States: hover, focus-visible ring, active, disabled, **loading (aria-busy, prevents double-submit)** |
| **Input / Textarea / Select / Checkbox / Radio** | Visible `<label>`, helper text, error text linked via `aria-describedby`, `aria-invalid`, ≥16px |
| **FormField** | Label + control + hint + error composition |
| **Price** | Integer paise → `₹1,299`; optional compare-at (strikethrough with `<s>` + sr-only "was"); dev-placeholder badge when flagged |
| **ProductCard** | Fixed aspect ratio (4:5), hover lift + subtle image scale (desktop only), always-visible Add to Cart / "Choose options", availability badge, **no hover-only info** |
| **Badge** | New / Bestseller / Featured / Sold out / Made to order — only when *true* (data-driven) |
| **Gallery** | Thumbs, main image, zoom dialog, arrow keys, swipe on touch |
| **QuantityStepper** | `−` / `+` buttons with labels, numeric input, min/max from server |
| **VariantSelector** | Radio-group semantics; swatches have text labels, not colour alone |
| **Drawer / Dialog** | Focus trap, Esc to close, scroll lock, restores focus |
| **AnnouncementBar** | Config-driven; dismiss optional; hidden when disabled |
| **Header** | Logo, Shop, Jewellery, Keepsakes, Gift collections, Our Story, Search, Cart (live count with `aria-live` polite) |
| **Footer** | PRD §6.9 content |
| **Toast / LiveRegion** | Screen-reader announcements for cart add/remove/errors |
| **Skeletons / EmptyState / ErrorState** | Required for every async surface |
| **PolaroidFrame** | Reusable scrapbook frame (CSS only): white border, bottom caption area, slight rotation (≤ 3°; 0° under reduced motion), soft shadow |
| **PersonalizationField** | Renders from product field schema (text, textarea, date, select, template picker, photo upload) |
| **StatusPill** | Payment/fulfilment states — colour + icon + text (never colour alone) |

---

## 5. Imagery

- **Source of truth for products = the owner's real photographs** (PRD §4.5). No stock substitution. No AI-generated product lookalikes.
- The four reference looks: (1) brown-cream shell beads + pink translucent beads; (2) white shells + pink beads + gold-tone hooks; (3) purple floral beads + pearl accents; (4) ocean-style shell charm chain.
- **Pipeline:** keep untouched originals; generate AVIF/WebP at 320/640/960/1280/1920; `next/image` with `sizes`; explicit width/height (no CLS); blur placeholder; `alt` describes the actual item (e.g. "Pink shell charm bracelet with cream and brown shell beads" — **only after owner confirms accuracy**).
- **Crop safety:** use `object-fit: contain` or per-image focal point where cropping would cut off charms/hooks; main gallery preserves aspect ratio (§8.1).
- Lifestyle/texture assets (linen, dried flowers) may be added later if consistent with brand — flag if AI-generated or stock and get owner approval.

---

## 6. Motion Principles (PRD §16)

- **Purposeful, subtle, interruptible.** Never lock scroll, hijack navigation, or make users wait. (§16.4)
- **Stack:** Framer Motion for UI/scroll reveals; CSS transforms/transitions for trivial effects; R3F for the single hero scene. **No GSAP** without ADR (§16.1).
- **Durations/easing:** UI 150–250ms; reveals 400–600ms; easing `cubic-bezier(.22,1,.36,1)`.
- **Product cards:** translateY(-4px) + image scale 1.03; **no** aggressive perspective, **no** continuous spin (§16.3). Optional tilt only on `(hover:hover) and (pointer:fine)` and ≤ 4°.
- **Scroll storytelling:** hero → collections → scrapbook keepsakes → featured → story, using opacity/translate reveals (`once: true`, `amount ≈ .2`).
- **Reduced motion** (`prefers-reduced-motion: reduce`): disable parallax & continuous motion; replace with simple fade or none; **all content visible, all functions intact** (§16.5).
- **Safety:** reveal states must default to *visible* if JS/animation fails (progressive enhancement). Buttons stay clickable during any transition (§16.7).

---

## 7. 3D Specification (PRD §16.2, §16.6)

### Hero scene — "Gift Box" (restrained)
| Element | Spec |
|---|---|
| Subject | Floating, slowly bobbing gift box with soft fabric ribbon |
| Accents | 3–5 low-poly shells/pearls orbiting loosely; 2–3 layered Polaroid planes (textured with owner photos once supplied) |
| Lighting | Warm ambient + one soft directional key; **no** harsh specular, **no** neon |
| Materials | Matte paper/fabric (`MeshStandardMaterial`, high roughness); subtle pearl sheen only |
| Interaction | Gentle pointer parallax (≤ 6° rotation) on `pointer:fine`; **no drag requirement** |
| Layout | Positioned beside/behind headline; `pointer-events: none` on canvas wrapper except decorative hit areas; **never overlaps headline, nav, or CTA** |
| Performance | `dpr={[1, 1.5]}`; `frameloop="demand"` when idle/offscreen; pause when tab hidden or out of viewport; geometry ≤ ~20k tris total; textures ≤ 1024px, compressed; assets lazy-loaded |
| Loading | `next/dynamic` (`ssr:false`) + `Suspense`; **static poster image occupies identical space** (no CLS) |
| Fallbacks | Static image when: no WebGL, `prefers-reduced-motion`, `navigator.connection.saveData`, low-memory/low-core device, mobile (default simplified or static), or runtime error (error boundary) |
| Mobile | Simplified scene (fewer objects, no post-processing) *or* static; below-fold scenes mount only when in view; unmount after leaving |

### Rules
- No post-processing (bloom, DOF) in v1.
- No 3D on cart/checkout/payment/admin.
- Product appearance is communicated by **photographs**, not 3D models (§16.3).
- Budget: 3D chunk **not** in initial JS for non-home routes; track gzip size in CI (**target to set after first measurement — do not invent a number now**).

---

## 8. Homepage Composition (PRD §6)

| # | Section | Layout notes (desktop → mobile) |
|---|---|---|
| 1 | AnnouncementBar | Thin; config/admin-driven |
| 2 | Header | Sticky, ivory translucent; mobile = logo + search + cart + menu button |
| 3 | **Hero** | Eyebrow *GIFTS THAT FEEL LIKE YOU* · H1 *Little treasures, made to be loved.* · body *Shell jewellery and thoughtful keepsakes for your favourite people.* · CTA **Explore the Collection → `/shop`**. Desktop: asymmetric 2-col, 3D/photo cluster right. Mobile: headline first, then static/simplified visual, CTA above fold |
| 4 | Trust highlights | 4 items; **only owner-verified claims** (PRD §6.4). Candidate set from PRD: Thoughtful Gifts · Unique Designs · Secure Checkout · Made with Love. ⚠️ "Secure Checkout" only once Paytm is live; avoid implying "handmade" |
| 5 | Featured collections | Cards → real collection pages: Shell Bracelets · Bracelet & Earring Sets · Polaroids · Personalized Magazines · Couple Cards · Bestie & Bestfriend Cards · Sisterhood & Brotherhood Cards. Mobile: 2-col grid or horizontal snap list |
| 4b | Scrapbook keepsakes | Layered PolaroidFrames, subtle scroll drift; mobile: simplified stack |
| 6 | Featured products | Grid 4→2 columns; real data |
| 7 | Personalized gifts | Explanation + CTA to personalized products |
| 8 | Brand story | Concise, **owner-approved copy** (placeholder clearly marked until then) |
| 9 | Footer | PRD §6.9 |

---

## 9. Accessibility Checklist (WCAG 2.2 AA — PRD §20.2)

- [ ] Landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page; logical heading order
- [ ] Skip-to-content link, first in tab order
- [ ] Visible focus on **every** interactive element (≥ 3:1, 2px+ ring, not removed)
- [ ] Focus not obscured by sticky header (WCAG 2.2 *Focus Not Obscured*) → use `scroll-padding-top`
- [ ] Target size ≥ 24×24 CSS px minimum (we use 44×44 for primary touch controls)
- [ ] Form labels visible; errors in text + `aria-describedby`; error summary focusable on submit; no colour-only errors
- [ ] `autocomplete` attributes on checkout fields (name, email, tel, address-line1/2, postal-code…)
- [ ] Cart add/remove/quantity changes announced via polite live region
- [ ] Modals/drawers: focus trap, Esc, return focus
- [ ] Alt text meaningful (decorative = `alt=""`)
- [ ] No hover-only affordances; no autoplay motion without `prefers-reduced-motion` handling
- [ ] Status pills: icon + text, not colour only
- [ ] Contrast per §1.2 table
- [ ] Zoom to 200% / reflow at 320px without loss
- [ ] axe: 0 serious/critical on every route (CI)

---

## 10. Design Review Checklist (use at end of Phase 2 and Phase 7)

- [ ] Reads as *soft luxury / romantic editorial*, not marketplace/gaming/cartoon
- [ ] Ivory/warm neutrals dominate; accents restrained
- [ ] Only AA-compliant colour pairs used for text and controls
- [ ] Real product photos, uncropped in key details
- [ ] 3D is subtle, lazy, optional, and never covers headline/CTA
- [ ] Mobile layouts recomposed; nothing overflows at 360px
- [ ] Reduced-motion and no-WebGL verified
- [ ] No fabricated claims/badges/reviews/urgency
- [ ] Every control actually does something
