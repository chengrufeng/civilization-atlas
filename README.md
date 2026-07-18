# Civilization Atlas

> An interactive map that traces historical figures and events across time and space — from the Three Kingdoms to five millennia of civilization, and beyond.

## Vision

History is not a list of dates. It is a tapestry of people, places, and the events that connected them. **Civilization Atlas** exists to make that tapestry visible — to let you see, at a glance, where history happened, who was there, and how one life rippled into the next.

This project begins with the **Three Kingdoms period (184–280 CE)** — an era of legendary strategists, warring states, and pivotal battles that shaped Chinese civilization. But it is only the beginning.

The roadmap ahead:

- **All 5,000 years of Chinese history** — from the Yellow Emperor and the Xia dynasty, through Qin unification, Tang golden age, Song innovation, Ming voyages, to the modern era
- **World history** — empires rising and falling on every continent, from Mesopotamia to Rome, from the Mongol expansion to the World Wars
- **Cross-civilization connections** — the Silk Road, the spice trade, the spread of ideas along pathways that defied borders

Every figure who ever lived, every event that ever shaped the world, has a place on this map. We are building toward that.

## Features

- **Interactive timeline** — scrub through years and watch the map reorganize in real time. History is not static; neither should its presentation be.
- **Geolocated figures & events** — every person and event is pinned to where it actually happened. Zoom in to see a single battle; zoom out to see an entire era.
- **Relationship networks** — visualized connections between historical figures. Allies, rivals, mentors, family — the human web behind the history.
- **Event trajectories** — trace the journeys of key figures across the map. Cao Cao's march to the north, Zhuge Liang's northern expeditions — follow them step by step.
- **Faction-based styling** — Wei, Shu, Wu, and beyond, each with distinct visual identity.
- **Smart label de-cluttering** — labels adapt to zoom level and spatial density, so even the most eventful locations remain readable.

## Current Coverage

**17 datasets live, grouped by civilization.** Cross-era and cross-civilization browsing supported through the atlas switcher.

**中华文明（10）**

| Era | Period | Figures | Events |
|-----|--------|---------|--------|
| 夏商周 | ~前2100–前771 | 14 | 14 |
| 春秋战国 | 前770–前221 | 20 | 17 |
| 秦汉 | 前221–220 | 20 | 20 |
| 三国 | 184–280 | 40+ | 40+ |
| 两晋南北朝 | 265–589 | 19 | 19 |
| 唐宋 | 618–1279 | 45+ | 45+ |
| 元 | 1206–1368 | 18 | 20 |
| 明 | 1368–1644 | 20 | 21 |
| 清 | 1616–1912 | 22 | 20 |
| 近现代 | 1840–1949 | 18 | 20 |

**World Civilizations（7）**

| Era | Period | Figures | Events |
|-----|--------|---------|--------|
| Mesopotamia | ~前3500–前539 | 14 | 15 |
| Ancient Egypt | ~前3100–前30 | 14 | 15 |
| Ancient Greece | ~前800–前146 | 15 | 14 |
| Ancient Rome | 前753–476 | 18 | 23 |
| Medieval Europe | 476–1453 | 17 | 18 |
| Renaissance & Age of Discovery | 1400–1600 | 17 | 18 |
| Modern (Enlightenment) | 1600–1900 | 18 | 21 |

URL parameter `?atlas=<id>` jumps directly to a dataset, e.g. `?atlas=egypt`.

## Tech Stack

- **Leaflet** — lightweight, performant interactive maps
- **Vanilla JavaScript (ES Modules)** — no framework, no build step
- **Data-driven architecture** — all historical content lives in `js/data/*.js`; the 8 view modules in `js/core/` are completely generic and never need to change when datasets are added

## Getting Started

```bash
cd civilization-atlas
# Uses ES Modules — serve over HTTP (opening index.html directly will hit CORS)
python3 -m http.server 8092   # or: npx serve .
# Then open http://localhost:8092 in your browser
```

URL parameter `?atlas=<id>` selects the initial dataset (e.g. `http://localhost:8092/?atlas=egypt`).

## Project Layout

```
civilization-atlas/
├── index.html               # page skeleton
├── css/style.css            # all styles
├── js/
│   ├── app.js               # entry/orchestration
│   ├── core/                # view layer (generic, dataset-agnostic)
│   │   ├── state.js         # global state + domain constants + year formatting (BCE-aware)
│   │   ├── atlas.js         # dataset manager (lazy load + switch)
│   │   ├── map.js           # Leaflet init
│   │   ├── render.js        # main render pipeline
│   │   ├── controls.js      # control bindings
│   │   ├── timeline.js      # timeline (play, event dots, ticks)
│   │   ├── event-list.js    # chronicle panel
│   │   └── detail.js        # person/event detail panel
│   └── data/                # data layer (historical content)
│       ├── index.js         # ATLAS_MANIFEST registry + helpers
│       ├── _template.js     # template for new datasets
│       └── sanguo.js  tangsong.js  sandai.js  ... (17 datasets)
└── tools/
    ├── validate.mjs         # static dataset validator
    └── smoke.mjs            # headless Chrome smoke test
```

## Dataset Schema

Each dataset is a plain JS object (see `js/data/_template.js`):

```js
export const xxxAtlas = {
  id: 'xxx',
  name: 'Name',
  subtitle: 'Era description (with years)',
  startYear: -2070,              // integer; BCE = negative
  endYear: -771,
  mapView: { center: [lng, lat], zoom: 5, baseLayer: 'satellite' },
  domains: [{ name: '军事', color: '#b23a2e' }, ...],
  factions: [...],               // dynasties / states
  places: [...],                 // locations [lng, lat]
  persons: [...],                // figures (with life-event trajectories)
  relations: [...],              // figure relationships
  events: [...],                 // historical events
  importance: makeImportance({ personRank: {...}, eventRank: {...} }),
  timelineTicks: [...],
};
```

Conventions:
- **Coordinates are `[lng, lat]`** (the `ll()` helper converts to Leaflet's `[lat, lng]`)
- **Years are integers; BCE is negative** (e.g. `-221` = 221 BCE)
- **Every place/birthplace/event.location/participant must resolve** — otherwise it warns and won't show on the map

## Adding a Dataset

1. Copy `js/data/_template.js` → `js/data/<id>.js`, fill in content
2. Register in `js/data/index.js`'s `ATLAS_MANIFEST`:
   ```js
   { id, name, subtitle, group: '中华文明' | '世界文明',
     load: () => import('./<id>.js').then(m => m.<id>Atlas) }
   ```
3. Validate: `node tools/validate.mjs <id>` (must be 0 error)
4. Smoke test: `node tools/smoke.mjs <id>` (must PASS)

Datasets are lazy-loaded on first switch via dynamic `import()`; only the default dataset loads on first paint.

## Tools

```bash
node tools/validate.mjs           # validate all datasets
node tools/validate.mjs sanguo    # validate one
node tools/smoke.mjs              # headless smoke (auto-spawns port 8199)
```

`smoke.mjs` loads each dataset via headless Chrome and asserts: loading overlay hides, persons > 0, no JS errors. Default Chrome path is `Google Chrome.app`; override with the `CHROME=...` env var.

## Design Pillars

- **View/data decoupled** — 8 view modules are generic; new datasets need zero view-layer changes
- **Differences via fields, not code** — era, geography, domains, zoom thresholds, default base layer are all data-driven
- **Lazy loading** — `ATLAS_MANIFEST` holds only lightweight metadata; dataset files load on demand and are cached

## Contributing

History is vast, and no single person knows it all. If you have expertise in a particular era — whether it's the Warring States, the Roman Empire, or the Meiji Restoration — your knowledge can help shape this atlas.

- **Data contributions** — figures, events, coordinates, relationships
- **Correction requests** — spotted an error in a date, location, or attribution? Open an issue.
- **Feature ideas** — what would make this map more useful for students, educators, or history enthusiasts?

## Roadmap

- [x] Three Kingdoms interactive map with timeline
- [x] Figure relationship visualization
- [x] Event trajectory tracking
- [x] Tang–Song dataset with atlas switcher
- [x] **Expand to pre-Qin / Spring & Autumn / Warring States**
- [x] **Expand to Qin–Han dynasty**
- [x] **5,000 years of Chinese history (10 datasets)**
- [x] **World history (7 datasets: Mesopotamia → Modern)**
- [x] **BCE support** (negative years, era-aware formatting)
- [x] **Lazy-loaded manifest with grouped switcher**
- [x] **Dataset validators & headless smoke tests**
- [ ] Cross-era figure connections (lineage, influence)
- [ ] Cross-civilization search (find any figure across all datasets)
- [ ] Multi-language support (Chinese / English)
- [ ] Mobile-optimized experience
- [ ] API for programmatic access to historical data

## License

MIT

---

*This is not a finished product. It is the first chapter of a much longer story. Every era added is a new chapter written on the same map — because history, like civilization itself, is continuous.*
