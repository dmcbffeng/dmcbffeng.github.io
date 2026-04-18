# Fan Feng — Personal Website (v2)

A modern, data-driven personal site covering **Research × Tech × Travel**.
Built with plain HTML + CSS + vanilla JavaScript (no build step), so it deploys
to any static host (GitHub Pages, Netlify, etc.).

## Features

- **Dark + light themes**, with a one-click toggle in the header.
  The site remembers your choice in `localStorage` and respects
  `prefers-color-scheme` on first visit.
- **Bilingual** (English / 中文). Toggle in the header. Saved to
  `localStorage` and reflected in the URL (`?lang=en` / `?lang=zh`).
- **Responsive / mobile-friendly** layout with a hamburger menu.
- **Data-driven** content: all text lives in JSON files under `data/`, so
  you can update CV / news / research / travel without touching HTML.
- **Animated starfield + subtle grid** in dark mode for a tech feel.
- **CV page** with a sticky section index (TOC).

## Local preview

```bash
cd website_new_version
python3 -m http.server 8080
```

Visit `http://localhost:8080`. Do not open `index.html` directly from the
filesystem — some browsers block `fetch()` on the `file://` protocol, which
breaks content loading. The small built-in fallback will still render a
minimal page but it won't show your JSON data.

## Project layout

```
website_new_version/
├── index.html            # Home
├── cv.html               # CV (with section TOC)
├── news.html             # News timeline
├── works.html            # Research list
├── work.html             # Research detail (driven by ?id=…)
├── world.html            # Travel map
├── assets/
│   ├── css/style.css     # Themes + all styles
│   ├── js/i18n.js        # UI strings (en + zh)
│   ├── js/app.js         # Rendering + theme/lang/nav toggles
│   ├── images/
│   │   ├── portrait/     # Your headshot
│   │   ├── work/         # Figures for research cards / detail
│   │   ├── travel/       # Travel photos
│   │   └── placeholders/ # SVG placeholders (safe defaults)
│   ├── maps/             # World map SVGs
│   └── docs/             # CV PDFs (Fan_Feng_CV_EN.pdf, _ZH.pdf)
├── data/
│   ├── site.json         # Profile + about + highlights (home page)
│   ├── cv.json           # Full CV (sections + items)
│   ├── news.json         # News timeline
│   ├── works.json        # Research projects
│   └── world.json        # Travel map pins
└── templates/            # Copy-paste starter JSON for new entries
```

## How to update content quickly

> All JSON is bilingual. Provide both `en` and `zh` strings; UI picks the
> one matching the selected language. For **publications and talks**, use
> the same English string for both `en` and `zh` (no Chinese translation
> of paper / venue titles) — that's the pattern used in `data/cv.json`.

### Add a news item

Edit `data/news.json`. Copy the shape from `templates/news-template.json`:

```json
{
  "date": "2026-04-18",
  "text": {
    "en": "Plain-text news in English.",
    "zh": "中文简讯。"
  },
  "url": "https://optional.example.com"
}
```

Items are sorted newest-first automatically; `url` is optional.
News text is rendered as plain text (no HTML).

### Add a research project

Edit `data/works.json` using `templates/work-template.json` as a guide.

- `id` becomes the detail URL: `work.html?id=<id>`.
- `tag` is a short category label shown above the title on cards.
- `cover` / `gallery[].src` should point at files you placed in
  `assets/images/work/`.
- Section text is rendered as plain text (no HTML) for safety.
- `links` rendered as an external link list on the detail page.

### Featured works on the home page

The home page shows a curated subset of projects rather than the N most recent.
To change which projects appear there, edit the `HOME_FEATURED_WORK_IDS`
array near the top of `renderHomeFeaturedWorks` in
`assets/js/app.js` — list the `id` values in the order you want them shown.
The Research page (`works.html`) always lists every project in
`data/works.json`, sorted newest-first.

### Update the CV

Edit `data/cv.json`. Sections are rendered in order; each has:

```json
{
  "id": "section-id",
  "title": { "en": "Section Title", "zh": "章节标题" },
  "items": [
    { "en": "Item text — HTML allowed", "zh": "条目文本 —— 支持 HTML" }
  ]
}
```

Items **allow HTML** so you can use `<b>`, `<i>` for journals, and
`<a href="…" target="_blank" rel="noopener">` for external links.
The section IDs are also used as TOC anchors (`cv.html#section-id`).

To swap the CV PDF: drop new files into `assets/docs/` and update
`links.en.pdf` / `links.zh.pdf` in `data/cv.json`.

### Add a travel pin

Edit `data/world.json`. Template: `templates/world-template.json`.

- `xPercent` / `yPercent` — horizontal / vertical position on the map
  (0–100). The **tip** of the pin lands at this point; the photo sits
  just above it.
- `lat` / `lng` (optional) — included for your own reference; they are
  not used for rendering because the map SVG is not a perfect
  equirectangular projection. Use the calibration trick below to get
  accurate `xPercent` / `yPercent`.
- `thumbnail` shows on the map; `fullImage` appears in the popup.
- `link` (optional) — a vlog / blog URL shown in the popup.

**How to find the coordinates of a new location:**

1. Start the site locally (`python3 -m http.server 8080`) and open
   `http://localhost:8080/world.html?calibrate=1`.
2. A small overlay appears in the top-right of the map. Click the exact
   spot where you want the pin's tip to land (e.g. Nashville).
3. The overlay shows something like `"xPercent": 25.89, "yPercent": 27.40`.
   Those values are also copied to your clipboard.
4. Paste them straight into the new entry in `data/world.json`.
5. Remove `?calibrate=1` from the URL to see the rendered pin.

Tip: if you only know lat/lng (e.g. Nashville is 36.16°N, −86.78°W from
Google Maps — right-click any spot and the first number is the lat/lng),
you can start with a rough estimate, then calibrate on the real map to
nudge it.

### Update the home "about me" / highlights

Edit `data/site.json`:

- `profile.portrait` — path to your headshot.
- `about.en` / `about.zh` — array of paragraphs for the "About me" block.
- `highlights` — bullets for the "Currently" panel in the hero.

### Update the three focus cards on the home page (Research / Tech / Travel)

These are declared in `assets/js/i18n.js` under `home.focus`. Edit the
`title`, `desc`, and `bullets` arrays there in both `en` and `zh`.

## Switching language & theme

- Language toggle and theme toggle both live in the top-right of every page.
- Both persist via `localStorage` and apply instantly without a reload
  (theme) or with a reload (language, for data re-render).

## Adding images when downloads fail (WSL2 + VPN)

If fetching an image inside WSL is unreliable:

1. Download the file using a browser outside WSL.
2. Copy the file into `assets/images/<folder>/` via File Explorer
   (`\\wsl$\...` on Windows).
3. Reference the local path in the corresponding JSON file.

Placeholders under `assets/images/placeholders/` are safe fallbacks — the
site will still look clean if some images are missing.

## Replacing the world map

`assets/maps/World_map_blank_without_borders.svg` is the current map. To
swap in a different one:

1. Drop the new SVG / PNG into `assets/maps/` and update the `<img src>`
   in `world.html`.
2. Update the `aspect-ratio` on `.world-map-wrap` in
   `assets/css/style.css` to match the new image (currently
   `4378 / 2435`, i.e. the pixel dimensions of the SVG).
3. Re-calibrate each pin with `world.html?calibrate=1` — projection
   differences mean the old `xPercent` / `yPercent` values will not
   match a new map exactly.

## Deployment

Any static host works. For GitHub Pages, simply copy the contents of this
folder to the repo root of your `username.github.io` project (or a
`gh-pages` branch).
