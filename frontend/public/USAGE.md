# Bihar Skill Hub — Logo Kit (Cap + Path)

Education-themed logo: navy graduation cap with an orange tassel that curves
forward into an arrow, suggesting where students' skills are heading.
"BIHAR SKILL HUB" wordmark below with orange "SKILL", divider, and the tagline
**LEARN · GROW · ACHIEVE**.

## Files

### Master vector files (edit these to change the design)
- `bsh-logo.svg` — Primary logo with wordmark + tagline (use everywhere on site).
- `bsh-icon.svg` — Icon-only (cap + arrow), for favicons / app icons.

### Raster outputs (auto-generated from the SVGs)
- `bsh-logo.png` — 800px wide, transparent background.
- `bsh-logo@2x.png` — Retina (~1200px wide).
- `bsh-logo-white-bg.png` — Solid white bg, for email signatures / docs.
- `bsh-logo.webp` — Modern compressed format.
- `bsh-logo.pdf` — Print-ready.

### Favicons
- `favicon.ico` — Multi-resolution (16/32/48/64).
- `favicon-{16,32,48,64,180,192,512}x{...}.png` — Standalone PNGs at each size.
- `apple-touch-icon.png` — 180×180 with solid white background for iOS.

## In your site

Drop everything into `frontend/public/`, then add to `frontend/index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/bsh-icon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

Use in React:
```jsx
<img src="/bsh-logo.svg" alt="Bihar Skill Hub" width={220} />
```

For just the icon (e.g. navbar collapsed view, sidebar):
```jsx
<img src="/bsh-icon.svg" alt="Bihar Skill Hub" width={48} />
```

## Colors used

- Navy: `#1E3A8A` (cap, "BIHAR" / "HUB" text)
- Orange: `#F59E0B` (tassel arrow, "SKILL" text)
- Gold: `#FBBF24` (cap button, path dots)
- Tagline gray: `#94A3B8`

Both SVGs are tiny plain-text files. Open in any editor (or Figma /
Inkscape / Illustrator) to tweak colors, swap the tagline, or adjust the
cap angle. Re-export rasters from the updated SVG when you do.
