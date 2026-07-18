# Civilization Atlas

> An interactive map that traces historical figures and events across time and space — 5,000 years of Chinese history, every major world civilization, and the threads that connect them.

## Vision

History is not a list of dates. It is a tapestry of people, places, and the events that connected them. **Civilization Atlas** exists to make that tapestry visible — to let you see, at a glance, where history happened, who was there, and how one life rippled into the next.

From the Three Kingdoms to the Roman Empire, from the pharaohs of Egypt to the philosophers of Athens, from the samurai of Japan to the empires of Mali — every figure who shaped the world has a place on this map.

## Features

- **Interactive timeline** — scrub through years and watch the map reorganize in real time. History is not static; neither should its presentation be. Hovering the slider shows a year preview bubble.
- **Geolocated figures & events** — every person and event is pinned to where it actually happened. Zoom in to see a single battle; zoom out to see an entire era.
- **Relationship networks** — visualized connections between historical figures. Allies, rivals, mentors, family — the human web behind the history. Relation types are normalized into 7 canonical categories (亲属 / 君臣 / 师承 / 敌对 / 结义 / 同时代 / 其他) with distinct colors and line styles, bilingual labels.
- **Event trajectories** — trace the journeys of key figures across the map. Cao Cao's march to the north, Zhuge Liang's northern expeditions, Alexander's eastward campaign — follow them step by step.
- **Life Journey replay** — click ▶ 人生回放 / Life Replay on a person's detail panel; the camera auto-flies through each life event in chronological order, with contemporaneous relations highlighted at each stop and a top progress bar (pause / resume / exit). For cross-era figures (e.g. 朱元璋 in 元/明, 孙中山 in 清/近现代), replays stitch events from multiple atlases automatically.
- **Faction-based styling** — Wei, Shu, Wu, and beyond, each with distinct visual identity.
- **Smart label de-cluttering** — labels adapt to zoom level and spatial density, so even the most eventful locations remain readable.
- **Era comparison overlay** — all 28 datasets drawn on a single proportional axis, so you can see which civilizations overlapped in time. Click any year to view contemporaries worldwide.
- **Cross-dataset domain browser** — filter all events across all atlases by domain (军事 / 政治 / 文化 / 科技 / 宗教 …), grouped by civilization.
- **Event heatmap** — toggle 🔥 in the layers panel to see event density as a canvas radial gradient (blue → cyan → yellow → red), respects domain and year filters.
- **Figure compare** — open the roster overlay, select 2-3 figures (+/✓ on each card), and compare them side-by-side (lifespan, age, events, relations, bio). Max values are highlighted.
- **Cross-dataset figure links** — 30+ registered links: same person in multiple atlases (朱元璋/努尔哈赤/秦始皇/林则徐/孙中山 …) + documented cross-civilization interactions (马可波罗, 利玛窦徐光启, 亚历山大与大流士). Use `tools/detect-cross-links.mjs` to mine more candidates.
- **Cross-civilization search** — find any figure across all 28 datasets with relevance ranking (exact > name > courtesy > alias) and keyword highlighting. Supports `domain:军事 刘` syntax to filter by domain.
- **URL deep-linking** — share any exact view via `?atlas=<id>&year=<y>&person=<id>`.
- **i18n (中文 / English)** — toggle the language button (中/EN) in the topbar. All UI strings, dataset metadata (name / subtitle / group), and relation-type labels are bilingual.
- **Keyboard shortcuts** — `Space` play/pause, `←/→` ±1 year, `Shift+←/→` ±10 years, `Home/End` jump to era bounds, `/` focus search, `L` atlas switcher, `C` era comparison, `?` shortcuts help, `Esc` close any overlay.
- **Favorites & recent** — star any figure (☆/★ in detail panel); recently opened figures appear as chips at the top of the atlas switcher. Both persist in localStorage.
- **Settings panel** — ⚙ in topbar. Play speed (auto / slow / normal / fast), default layers, preload toggle, reset prefs.
- **Today in History** — first-load widget shows events that happened on today's date across all datasets.
- **Print / Export PDF** — 🖨 button triggers `window.print()` with a dedicated print stylesheet (A4 landscape, hides all chrome, includes title banner with current atlas/year/stats).
- **Mobile responsive** — touch-friendly layout for narrow screens.
- **Dark mode** — respects `prefers-color-scheme`.
- **PWA / offline** — installable + service worker caches all static assets and dataset JS for offline use after first visit.
- **Lazy + preload** — datasets load on demand via dynamic `import()`; browser idle time preloads the rest so atlas switches are instant (toggleable in settings).

## Current Coverage

**28 datasets live (~488 figures, ~510 events), grouped by civilization.** Time span: 3500 BCE – 2025 CE.

**中华文明 / Chinese Civilization（12）**

| Era | Period | Figures | Events |
|-----|--------|---------|--------|
| 夏商周 | ~前2100–前771 | 14 | 14 |
| 春秋战国 | 前770–前221 | 21 | 17 |
| 秦汉 | 前221–220 | 21 | 20 |
| 隋 | 581–618 | 14 | 12 |
| 三国 | 184–280 | 44 | 39 |
| 两晋南北朝 | 265–589 | 20 | 19 |
| 唐宋 | 618–1279 | 47 | 45 |
| 五代十国 | 907–979 | 11 | 13 |
| 元 | 1206–1368 | 18 | 20 |
| 明 | 1368–1644 | 21 | 21 |
| 清 | 1616–1912 | 22 | 20 |
| 近现代 | 1840–1949 | 18 | 20 |

**世界文明 / World Civilizations（16）**

| Era | Period | Figures | Events |
|-----|--------|---------|--------|
| 两河文明 Mesopotamia | ~前3500–前539 | 14 | 15 |
| 古埃及 Ancient Egypt | ~前3100–前30 | 14 | 15 |
| 波斯 Persia | 前559–1736 | 15 | 15 |
| 印度文明 India | 前1500–1857 | 14 | 15 |
| 古希腊 Ancient Greece | ~前800–前146 | 16 | 14 |
| 古罗马 Ancient Rome | 前753–476 | 19 | 23 |
| 中世纪欧洲 Medieval Europe | 476–1453 | 18 | 18 |
| 前哥伦布美洲 Pre-Columbian Americas | 前2000–1532 | 14 | 15 |
| 文艺复兴与大航海 Renaissance & Exploration | 1400–1600 | 17 | 18 |
| 日本文明 Japan | 前660–1868 | 18 | 19 |
| 近代 Modern (Enlightenment) | 1600–1900 | 19 | 21 |
| 俄罗斯 Russia | 862–1917 | 13 | 16 |
| 朝鲜半岛 Korea | 前2333–1897 | 14 | 13 |
| 东南亚 Southeast Asia | 100–1900 | 11 | 13 |
| 非洲文明 Africa | 300–1900 | 10 | 12 |
| 现代世界 Modern World | 1900–2025 | 14 | 22 |

URL parameter `?atlas=<id>` selects the initial dataset, e.g. `?atlas=egypt`.

## Tech Stack

- **Leaflet 1.9.4** — lightweight, performant interactive maps (CDN-loaded)
- **Vanilla JavaScript (ES Modules)** — no framework, no build step
- **Data-driven architecture** — all historical content lives in `js/data/*.js`; the 11 view modules in `js/core/` are completely generic and never need to change when datasets are added
- **Lazy loading** — `ATLAS_MANIFEST` holds only lightweight metadata; dataset files load on demand via dynamic `import()` and are cached

## Getting Started

```bash
cd civilization-atlas
# Uses ES Modules — serve over HTTP (opening index.html directly will hit CORS)
python3 -m http.server 8092   # or: npx serve .
# Then open http://localhost:8092 in your browser
```

URL parameters:
- `?atlas=<id>` — initial dataset (e.g. `?atlas=egypt`)
- `&year=<y>` — initial year (negative = BCE; e.g. `&year=-221`)
- `&person=<id>` — open a person's detail panel on load

Example: `http://localhost:8092/?atlas=qinhan&year=-121&person=wei_qing`

## Project Layout

```
civilization-atlas/
├── index.html               # page skeleton
├── css/style.css            # all styles
├── js/
│   ├── app.js               # entry / orchestration
│   ├── core/                # view layer (generic, dataset-agnostic)
│   │   ├── state.js         # global state + domains + year formatting + relation types + ts-check
│   │   ├── atlas.js         # dataset manager (lazy load + switch + global index + preload)
│   │   ├── map.js           # Leaflet init + per-atlas mapView
│   │   ├── render.js        # main render pipeline (persons/events/relations/trajectories/heat)
│   │   ├── controls.js      # control bindings + search + shortcuts + slider hover + domain syntax
│   │   ├── timeline.js      # timeline (play, event dots, ticks, toast) — speed pref-aware
│   │   ├── event-list.js    # chronicle panel + figure roster overlay (multi-select for compare)
│   │   ├── detail.js        # person/event detail panel + cross-links + life-journey trigger + favorite
│   │   ├── compare.js       # era comparison overlay + contemporaries
│   │   ├── domain-browser.js # cross-dataset domain browser overlay
│   │   ├── url-state.js     # ?atlas=&year=&person= deep-link
│   │   ├── i18n.js          # bilingual UI + dataset metadata + relation labels + tf() template
│   │   ├── life-journey.js  # life replay mode (single + cross-atlas same-person stitching)
│   │   ├── favorites.js     # localStorage favorites + recent (LRU)
│   │   ├── today-in-history.js # first-load widget matching today's date
│   │   ├── heat-layer.js    # canvas-based event density heatmap (no deps)
│   │   ├── compare-figures.js # 2-3 figures side-by-side compare overlay
│   │   └── settings.js      # prefs: play speed / default layers / preload / reset
│   └── data/                # data layer (historical content)
│       ├── index.js         # ATLAS_MANIFEST registry + helpers
│       ├── _template.js     # template for new datasets
│       ├── cross-links.js   # cross-dataset figure links registry (30+ entries)
│       └── sandai.js  chunqiu.js  qinhan.js  ... (28 datasets)
├── tools/
│   ├── validate.mjs         # static dataset validator (version-aware)
│   ├── smoke.mjs            # headless Chrome smoke (with retry)
│   ├── state.test.mjs       # unit tests (node:test)
│   ├── refresh-stats.mjs    # auto-update manifest stats from data files
│   ├── export-stats.mjs     # export Markdown stats table
│   ├── check-images.mjs     # HEAD-check personImages URLs
│   ├── fetch-wikimedia.mjs  # batch-fetch portrait images from Wikipedia REST API
│   ├── detect-cross-links.mjs # scan for cross-dataset same-person / interaction candidates
│   └── check-factions.mjs   # faction color / id conflict detector
├── manifest.json            # PWA manifest
├── sw.js                    # service worker (offline cache)
├── .eslintrc.json           # ESLint config
├── .prettierrc.json         # Prettier config
├── .github/workflows/ci.yml # CI: state.test + validate + check-factions + optional lint + smoke
└── package.json
```

## Dataset Schema

Each dataset is a plain JS object (see `js/data/_template.js`):

```js
export const xxxAtlas = {
  id: 'xxx',
  name: '名称',
  subtitle: '副标题（含年代）',
  version: '1.0.0',                // optional, for schema compatibility checks
  startYear: -2070,                // integer; BCE = negative
  endYear: -771,
  mapView: {
    center: [lng, lat], zoom: 5,
    minZoom: 3, maxZoom: 12,
    labelZoom: 4,                  // labels appear above this zoom
    importanceZoom: 5,             // importance filters kick in
    cityZoom: 6,                   // cities show above this zoom
    baseLayer: 'satellite' | 'streets' | 'terrain',
  },
  domains: [{ name: '军事', color: '#b23a2e' }, ...],   // per-atlas domain set
  factions: [...],                 // dynasties / states
  places: [...],                   // { id, name, modern, coord:[lng,lat], note }
  persons: [...],                  // figures (with life-event trajectories)
  relations: [...],                // figure relationships (type can be alias, auto-normalized)
  events: [...],                   // historical events
  importance: makeImportance({ personRank: {...}, eventRank: {...} }),
  birthplaceModern: { '洛阳': '河南洛阳', ... },   // optional
  birthplaceCoords: { '洛阳': [112.45, 34.62], ... },  // optional
  personImages:    { 'liubei': 'https://...', ... },    // optional Wikimedia URL
  timelineTicks: [...],
};
```

Conventions:
- **Coordinates are `[lng, lat]`** (the `ll()` helper converts to Leaflet's `[lat, lng]`)
- **Years are integers; BCE is negative** (e.g. `-221` = 221 BCE)
- **Every place / birthplace / event.location / participant must resolve** — otherwise validator warns and the map skips rendering
- **Relation `type` accepts aliases** — `父子`/`母女`/`兄弟` → 亲属; `师徒` → 师承; `政敌`/`宿敌` → 敌对 (see `RELATION_ALIASES` in `state.js`)

## Adding a Dataset

1. Copy `js/data/_template.js` → `js/data/<id>.js`, fill in content
2. Register in `js/data/index.js`'s `ATLAS_MANIFEST`:
   ```js
   {
     id, name, nameEn,
     subtitle, subtitleEn,
     group: '中华文明' | '世界文明',
     groupEn: 'Chinese Civilization' | 'World Civilizations',
     startYear, endYear,
     load: () => import('./<id>.js').then(m => m.<id>Atlas),
     stats: { persons, events, factions, places },   // optional; auto-filled by refresh-stats.mjs
   }
   ```
3. If your dataset references figures that appear in other atlases (same person) or has documented interactions with another civilization, add entries to `js/data/cross-links.js`.
4. Validate: `node tools/validate.mjs <id>` (must be 0 error)
5. Smoke test: `node tools/smoke.mjs` (must PASS on all)
6. (Optional) Auto-sync stats in the manifest: `node tools/refresh-stats.mjs`

Datasets are lazy-loaded on first switch via dynamic `import()`; only the default dataset loads on first paint.

## Tools

```bash
# Validation & tests
node tools/validate.mjs              # validate all datasets
node tools/validate.mjs sanguo       # validate one
node --test tools/state.test.mjs     # unit tests (state.js helpers)
node tools/smoke.mjs                 # headless smoke (auto-spawns port 8199, retries on slow loads)
node tools/smoke.mjs sanguo          # smoke one dataset
node tools/check-factions.mjs        # faction color/id conflict detector

# Maintenance
node tools/refresh-stats.mjs         # refresh manifest stats from data files
node tools/export-stats.mjs          # export Markdown stats table
node tools/check-images.mjs          # HEAD-check personImages URLs
node tools/fetch-wikimedia.mjs       # batch-fetch portraits (requires network)
node tools/detect-cross-links.mjs    # scan for cross-dataset figure-link candidates

# Linting (optional)
npm install                          # installs eslint
npm run lint                         # checks js/ and tools/
npm run lint:fix                     # auto-fixes
```

`smoke.mjs` loads each dataset via headless Chrome and asserts: loading overlay hides, persons > 0, no JS errors. Default Chrome path is `Google Chrome.app`; override with `CHROME=...`. Includes a retry mechanism: if the first attempt (20s budget) looks empty but has no JS errors, it retries with a 35s budget to accommodate slow lazy-loads.

## Design Pillars

- **View/data decoupled** — 13 view modules are generic; new datasets need zero view-layer changes
- **Differences via fields, not code** — era span, geography, domains, zoom thresholds, default base layer, importance, tick marks are all data-driven
- **Cross-dataset first** — search, era comparison, domain browser, contemporaries, figure links, and life replay all treat the 28 atlases as one knowledge graph
- **Shareable URLs** — every view state is encoded in `?atlas=&year=&person=`

## Contributing

History is vast, and no single person knows it all. If you have expertise in a particular era — whether it's the Warring States, the Roman Empire, or the Meiji Restoration — your knowledge can help shape this atlas.

- **Data contributions** — figures, events, coordinates, relationships, cross-links
- **Correction requests** — spotted an error in a date, location, or attribution? Open an issue.
- **Feature ideas** — what would make this map more useful for students, educators, or history enthusiasts?

## Roadmap

- [x] Three Kingdoms interactive map with timeline
- [x] Figure relationship visualization (with 7 canonical types, bilingual labels)
- [x] Event trajectory tracking
- [x] Tang–Song dataset with atlas switcher
- [x] 5,000 years of Chinese history (12 datasets)
- [x] World civilizations (16 datasets: Mesopotamia → Modern World)
- [x] BCE support (negative years, era-aware formatting)
- [x] Lazy-loaded manifest with grouped switcher
- [x] Dataset validators & headless smoke tests + unit tests + CI
- [x] Cross-era figure connections (cross-links registry + auto-detector)
- [x] Cross-civilization search (global person index, relevance-ranked, keyword-highlighted, domain-syntax)
- [x] Era comparison overlay + contemporaries view
- [x] Cross-dataset domain browser
- [x] Multi-language support (Chinese / English, full UI + dataset metadata + relation labels)
- [x] Mobile-optimized experience
- [x] Dark mode
- [x] URL deep-linking (`?atlas=&year=&person=`)
- [x] Atlas preload on browser idle (instant switching, toggleable)
- [x] Life Journey replay mode (per-person chronological auto-flythrough, cross-atlas stitching)
- [x] Timeline hover year preview
- [x] Event heatmap layer (canvas-based, no dependency)
- [x] Figure side-by-side compare (2-3 figures with max/min highlight)
- [x] Favorites & recent (localStorage, with chips in atlas switcher)
- [x] Settings panel (play speed / default layers / preload / reset)
- [x] Today in History first-load widget
- [x] Print / Export PDF (window.print + dedicated stylesheet)
- [x] PWA / offline support (manifest + service worker)
- [x] Faction color/id conflict detector + CI
- [x] ESLint + Prettier config
- [x] JSDoc + ts-check on core state module
- [x] Schema version field validation
- [ ] Wikimedia portrait batch injection (`tools/fetch-wikimedia.mjs` ready; needs network environment)
- [ ] Optional: render diff updates for smoother scrubbing on dense atlases (perf acceptable, deferred)
- [ ] Optional: split large datasets (sanguo / tangsong) by theme for faster switching
- [ ] Optional: headless snapshot pixel-diff tests (E4)
- [ ] Optional: data-level bilingual names (low ROI for 488 figures)

## License

MIT

---

*This is not a finished product. It is the first chapter of a much longer story. Every era added is a new chapter written on the same map — because history, like civilization itself, is continuous.*
