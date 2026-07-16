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

| Era | Status | Figures | Events |
|-----|--------|---------|--------|
| Three Kingdoms (184–280 CE) | Active | 40+ | 40+ |
| Pre-Qin (—221 BCE) | Planned | — | — |
| Qin–Han (221 BCE – 220 CE) | Planned | — | — |
| Tang–Song (618–1279) | Planned | — | — |
| Ming–Qing (1368–1912) | Planned | — | — |
| World History | Planned | — | — |

## Tech Stack

- **Leaflet** — lightweight, performant interactive maps
- **Vanilla JavaScript** — no framework, no build step, just open `index.html` and go
- **Custom data layer** — structured historical data designed to scale across eras and civilizations

## Getting Started

```bash
git clone git@github.com:chengrufeng/civilization-atlas.git
cd civilization-atlas
# Uses ES Modules — serve over HTTP (opening index.html directly will hit CORS)
npx serve .          # or: python3 -m http.server 8080
# Then open http://localhost:8080 in your browser
```

No build step, but a local HTTP server is required (ES Modules don't work over `file://`).

## Contributing

History is vast, and no single person knows it all. If you have expertise in a particular era — whether it's the Warring States, the Roman Empire, or the Meiji Restoration — your knowledge can help shape this atlas.

- **Data contributions** — figures, events, coordinates, relationships
- **Correction requests** — spotted an error in a date, location, or attribution? Open an issue.
- **Feature ideas** — what would make this map more useful for students, educators, or history enthusiasts?

## Roadmap

- [x] Three Kingdoms interactive map with timeline
- [x] Figure relationship visualization
- [x] Event trajectory tracking
- [ ] Expand to pre-Qin (Spring & Autumn, Warring States)
- [ ] Expand to Qin–Han dynasty
- [ ] Add world history layers
- [ ] Cross-era figure connections (lineage, influence)
- [ ] Multi-language support (Chinese / English)
- [ ] Mobile-optimized experience
- [ ] API for programmatic access to historical data

## License

MIT

---

*This is not a finished product. It is the first chapter of a much longer story. Every era added is a new chapter written on the same map — because history, like civilization itself, is continuous.*
