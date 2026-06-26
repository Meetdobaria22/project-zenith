# Project Zenith: The Celestial Eye

A real-time celestial tracking platform. Select any location on Earth and see exactly what is above you right now — planets, the ISS, satellites, and stars — rendered on a live interactive sky dome.

**Live Demo:** [your-vercel-url-here]

---

## Features

- Live ISS tracking — updates every 5 seconds via OpenNotify API
- Real-time planet, Moon, and Sun positions for any location on Earth
- Bright star positions (16 named stars)
- Visible satellites computed from CelesTrak TLE data
- Interactive sky dome with azimuth/altitude projection
- Click-to-select any location on the world map
- GPS geolocation support
- Live UTC and local time display
- Fully responsive — works on mobile and desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Map | Leaflet.js |
| Sky Dome | HTML5 Canvas (custom azimuthal projection) |
| Planetary Math | astronomy-engine (VSOP87) |
| Satellite Math | satellite.js (SGP4 propagation) |
| ISS Data | OpenNotify API |
| Satellite TLE | CelesTrak visual satellites |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Data Sources

- **OpenNotify** — `api.open-notify.org/iss-now.json` — ISS live position
- **CelesTrak** — `celestrak.org/TLE/visual.txt` — Bright satellite TLE data
- **astronomy-engine** — Client-side VSOP87 planetary theory
- **satellite.js** — Client-side SGP4 orbital propagation

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

## Deploying to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts — it auto-detects Vite
```

## Project Structure

```
src/
  components/
    Header.jsx       — Top navigation bar with live clock
    WorldMap.jsx     — Leaflet map with ISS marker and location picker
    SkyDome.jsx      — Canvas sky dome with all celestial objects
    DataPanel.jsx    — Live data cards for each object category
  utils/
    astronomy.js     — Planet/star position calculations
    satellites.js    — CelesTrak TLE fetch + satellite.js propagation
    useISS.js        — React hook for live ISS polling
  App.jsx            — Main layout and state management
  main.jsx           — React entry point
  index.css          — Tailwind base styles
```
