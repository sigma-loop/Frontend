# SigmaLoop Design System & Color Reference

> Brand: **SigmaLoop** — *"Master the Logic behind the Code"*
> Previously: Lambda L.A.P. — "Compile Your Logic."

## Fonts

| Role | Family | Weights |
|------|--------|---------|
| Body | Inter | 300–700 |
| Display / Headings | Outfit | 500–700 |

## Light Theme (Current — Default)

### Brand Colors

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Primary | `indigo-600` | `#4F46E5` | Buttons, links, focus rings, active states |
| Primary Hover | `indigo-700` | `#4338CA` | Button hover, link hover |
| Brand Accent | `violet-600` | `#7C3AED` | Gradient endpoint, secondary accents |
| Gradient Text | `from-indigo-600 to-violet-600` | `#4F46E5 → #7C3AED` | Hero titles, `.text-gradient` class |
| Feature Accent 1 | `purple-500` / `purple-600` | `#A855F7` / `#9333EA` | Feature card borders, icon backgrounds |
| Feature Accent 2 | `pink-500` / `pink-600` | `#EC4899` / `#DB2777` | Feature card accents, tertiary highlights |

### Surfaces & Backgrounds

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Page Background | `bg-gray-50` | `#F9FAFB` | Main content area |
| Card Surface | `bg-white/70` + `backdrop-blur-md` | `rgba(255,255,255,0.7)` | `.glass-panel` |
| Card Surface (interactive) | `bg-white/60` + `backdrop-blur-sm` | `rgba(255,255,255,0.6)` | `.glass-card` |
| Elevated Surface | `bg-white` | `#FFFFFF` | Navbar, footer, modals |
| Navbar | `bg-white/80` + `backdrop-blur-md` | `rgba(255,255,255,0.8)` | Top navigation |
| Footer | `bg-white` | `#FFFFFF` | Bottom footer |
| Card Footer | `bg-gray-50/50` | `rgba(249,250,251,0.5)` | Card footer sections |

### Borders

| Role | Token | Hex |
|------|-------|-----|
| Default | `border-gray-200` | `#E5E7EB` |
| Subtle | `border-gray-100` | `#F3F4F6` |
| Glass | `border-white/20` | `rgba(255,255,255,0.2)` |
| Input | `border-gray-200` | `#E5E7EB` |
| Input Error | `border-red-300` | `#FCA5A5` |
| Dividers | `border-gray-100` | `#F3F4F6` |

### Text

| Role | Token | Hex |
|------|-------|-----|
| Primary | `text-gray-900` | `#111827` |
| Secondary | `text-gray-700` | `#374151` |
| Tertiary / Helper | `text-gray-600` | `#4B5563` |
| Muted / Placeholder | `text-gray-500` | `#6B7280` |
| Disabled | `text-gray-400` | `#9CA3AF` |
| Links | `text-indigo-600` | `#4F46E5` |
| Link Hover | `text-indigo-500` | `#6366F1` |

### Semantic Colors (Badges, Alerts, Status)

| Semantic | Background | Text | Border |
|----------|-----------|------|--------|
| Success | `bg-green-50` `#F0FDF4` | `text-green-800` `#166534` | `border-green-200` `#BBF7D0` |
| Warning | `bg-amber-50` `#FFFBEB` | `text-amber-800` `#92400E` | `border-amber-200` `#FDE68A` |
| Error | `bg-red-50` `#FEF2F2` | `text-red-800` `#991B1B` | `border-red-200` `#FECACA` |
| Info | `bg-blue-50` `#EFF6FF` | `text-blue-800` `#1E40AF` | `border-blue-200` `#BFDBFE` |

### Shadows

| Role | Class | Description |
|------|-------|-------------|
| Light | `shadow-sm` | Inputs, secondary elements |
| Medium | `shadow-lg` | Cards, elevated content |
| Heavy | `shadow-xl` | Panels, modal-like elements |
| Primary colored | `shadow-lg shadow-indigo-200` | Primary action buttons |
| Danger colored | `shadow-lg shadow-red-200` | Danger action buttons |

### Button Variants

| Variant | Background | Text | Border | Shadow | Focus Ring |
|---------|-----------|------|--------|--------|------------|
| Primary | `bg-indigo-600` → hover `bg-indigo-700` | `text-white` | — | `shadow-lg shadow-indigo-200` | `ring-indigo-500` |
| Secondary | `bg-white` → hover `bg-gray-50` | `text-gray-700` | `border-gray-200` | — | `ring-indigo-500` |
| Ghost | transparent → hover `bg-gray-100` | `text-gray-600` → hover `text-gray-900` | — | — | `ring-gray-500` |
| Danger | `bg-red-600` → hover `bg-red-700` | `text-white` | — | `shadow-lg shadow-red-200` | `ring-red-500` |
| Outline | `bg-white` → hover `bg-gray-50` | `text-gray-700` | `border-gray-300` | — | `ring-indigo-500` |

### Input States

| State | Background | Border | Ring |
|-------|-----------|--------|------|
| Default | `bg-white/50` + blur | `border-gray-200` | — |
| Focus | — | — | `ring-2 ring-indigo-500` |
| Error | — | `border-red-300` | `ring-red-500` |
| Disabled | `bg-gray-50` | — | — `text-gray-500` |

### Loading & Animation

| Element | Token |
|---------|-------|
| Spinner border | `border-b-2 border-indigo-600` |
| Skeleton pulse | `animate-pulse` on `bg-gray-200` |

---

## Dark Theme (Proposed)

Base: `#0d1117` (dark navy, matches existing Navbar dark mode prop).

### Surfaces & Backgrounds

| Role | Light Token | Dark Token | Dark Hex |
|------|------------|------------|----------|
| Page Background | `bg-gray-50` | `bg-[#0d1117]` | `#0d1117` |
| Card Surface | `bg-white/70` | `bg-white/5` or `bg-[#161b22]` | `#161b22` |
| Elevated Surface | `bg-white` | `bg-[#1c2128]` | `#1c2128` |
| Navbar | `bg-white/80` | `bg-[#0d1117]/80` or `bg-gray-900/80` | `#0d1117` |
| Footer | `bg-white` | `bg-[#0d1117]` | `#0d1117` |
| Card Footer | `bg-gray-50/50` | `bg-gray-800/50` | `rgba(31,41,55,0.5)` |

### Borders

| Role | Light | Dark |
|------|-------|------|
| Default | `border-gray-200` | `border-gray-800` `#1F2937` |
| Subtle | `border-gray-100` | `border-gray-800` `#1F2937` |
| Glass | `border-white/20` | `border-white/10` |
| Input | `border-gray-200` | `border-gray-700` `#374151` |
| Input Error | `border-red-300` | `border-red-500` `#EF4444` |

### Text

| Role | Light | Dark |
|------|-------|------|
| Primary | `text-gray-900` | `text-gray-100` `#F3F4F6` |
| Secondary | `text-gray-700` | `text-gray-300` `#D1D5DB` |
| Tertiary | `text-gray-600` | `text-gray-400` `#9CA3AF` |
| Muted | `text-gray-500` | `text-gray-500` `#6B7280` |
| Links | `text-indigo-600` | `text-indigo-400` `#818CF8` |

### Brand Colors (brighter on dark backgrounds)

| Role | Light | Dark |
|------|-------|------|
| Primary | `indigo-600` | `indigo-400` `#818CF8` |
| Primary Hover | `indigo-700` | `indigo-300` `#A5B4FC` |
| Gradient Text | `indigo-600 → violet-600` | `indigo-400 → violet-400` |
| Focus Ring | `ring-indigo-500` | `ring-indigo-400` |

### Semantic Colors (softer on dark backgrounds)

| Semantic | Dark Background | Dark Text |
|----------|----------------|-----------|
| Success | `bg-green-900/30` | `text-green-400` `#4ADE80` |
| Warning | `bg-amber-900/30` | `text-amber-400` `#FBBF24` |
| Error | `bg-red-900/30` | `text-red-400` `#F87171` |
| Info | `bg-blue-900/30` | `text-blue-400` `#60A5FA` |

### Buttons

| Variant | Dark Background | Dark Text | Dark Border |
|---------|----------------|-----------|-------------|
| Primary | `bg-indigo-500` → hover `bg-indigo-400` | `text-white` | — |
| Secondary | `bg-gray-800` → hover `bg-gray-700` | `text-gray-200` | `border-gray-700` |
| Ghost | hover `bg-gray-800` | `text-gray-300` → hover `text-gray-100` | — |
| Danger | `bg-red-500` → hover `bg-red-400` | `text-white` | — |
| Outline | `bg-transparent` → hover `bg-gray-800` | `text-gray-200` | `border-gray-600` |

### Inputs

| State | Dark Background | Dark Border | Dark Ring |
|-------|----------------|-------------|-----------|
| Default | `bg-gray-800/50` | `border-gray-700` | — |
| Focus | — | — | `ring-indigo-400` |
| Error | — | `border-red-500` | `ring-red-400` |
| Disabled | `bg-gray-900` | — | `text-gray-500` |

### Shadows & Glass

| Element | Light | Dark |
|---------|-------|------|
| Glass panel | `bg-white/70 border-white/20` | `bg-white/5 border-white/10` |
| Glass card | `bg-white/60 border-white/20` | `bg-white/5 border-white/8` |
| Colored shadow | `shadow-indigo-200` | `shadow-black/30` or `shadow-indigo-500/10` |

---

## Custom CSS Utilities (index.css)

```css
.glass-panel {
  @apply bg-white/70 backdrop-blur-md border border-white/20 shadow-xl;
  /* Dark: bg-white/5 backdrop-blur-md border border-white/10 shadow-xl shadow-black/30 */
}

.glass-card {
  @apply bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg
         hover:shadow-xl transition-all duration-300;
  /* Dark: bg-white/5 backdrop-blur-sm border border-white/8 */
}

.text-gradient {
  @apply bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-violet-600;
  /* Dark: from-indigo-400 to-violet-400 */
}
```

---

## Implementation Notes

- **Tailwind v4** uses CSS-based `@theme` config — dark mode should use CSS variables or the `dark:` variant with a `.dark` class on `<html>`.
- Navbar already has a `darkMode?: boolean` prop — wire it to a context/localStorage toggle.
- Toggle adds/removes `.dark` on `<html>`, persisted via `useLocalStorage` hook.

---

## Current Logo Description (LambdaLAP — for reference)

- **Background**: Dark navy `#0d1117` with circuit-board line traces
- **Central Symbol**: Pixel-art lambda (λ) in vibrant purple/violet `~#8B5CF6`, styled as if walking/striding
- **Terminal Prompt**: Pixel-art `>_` in cyan/teal `~#2DD4BF`, upper-left of lambda
- **Cursor**: Small cyan/teal `_` at bottom-right foot
- **Brand Text**: "Lambda L.A.P." in white pixel/monospace font
- **Tagline**: "Compile Your Logic." in lighter weight
- **Aesthetic**: Retro pixel-art, hacker/tech, terminal + circuit motifs
