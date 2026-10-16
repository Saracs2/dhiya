# DHIYA (ضياء) — Smart Solar Intelligence Dashboard

An interactive dashboard for **DHIYA**, a smart solar energy management concept proposed for the Expo 2030 Riyadh sustainability innovation challenge. It models dust-related soiling on a 100 W reference panel, runs a threshold-based cleaning cycle, compares conventional operation with DHIYA, shows an illustrative pavilion leaderboard, and can talk to an ESP32-based solar tracker/cleaner on the local network.

> **About the data.** Apart from the **Solar Hardware** panel (live ESP32 readings, see [Connecting the ESP32](#connecting-the-esp32)), every value is **simulated** (computed in the browser), **illustrative** (fictional example data) or **reference** (reported by earlier project simulations). The simulated cleaning cycle does not operate any physical mechanism, and no MATLAB/Simulink model is connected.

## Features

- **Live solar simulation**: clean-panel vs. modeled output over a simulated day, with pause/resume, speed control and reset.
- **Soiling & cleaning state machine**: Monitor → Trigger → Clean → Verify, with auto-clean, a "simulate dust event" button and an event log.
- **Conventional vs DHIYA comparison**: modeled daily energy and peak power under the same assumptions.
- **Pavilion leaderboard (illustrative)**: weighted, normalised scoring with a per-pavilion breakdown.
- **ESP32 hardware panel**: panel voltage, tracker angles, four LDR light sensors, tracking on/off and a "start cleaning" command.
- **English / Arabic** with a full right-to-left layout.
- **Accessible charts**: every chart has a table view, and colours were checked for colour-vision deficiency.
- **Offline-ready**: the production build makes no external requests (no fonts, CDNs or analytics).

## Technologies

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vite.dev/) (dev server, ESP32 proxy, production build)
- [Recharts](https://recharts.org/) for charts (lazy-loaded)
- [Vitest](https://vitest.dev/) for unit tests
- [ESLint 9](https://eslint.org/) with `typescript-eslint` and React Hooks rules
- ESP32 firmware exposing a small JSON HTTP API (firmware is not part of this repository)

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (developed on Node 24), which includes npm
- [Git](https://git-scm.com/)
- Optional: an ESP32 running the DHIYA firmware on the same Wi-Fi network as your computer

## Getting started

```bash
git clone https://github.com/Saracs2/dhiya.git
cd dhiya
npm install
npm run dev          # http://localhost:5173
```

The dashboard works without any hardware. The Solar Hardware panel shows "Waiting for ESP32" until a board is reachable.

Useful links while presenting:

- `http://localhost:5173/?lang=ar` opens the dashboard in Arabic (right-to-left layout)
- `#overview`, `#monitoring`, `#cleaning`, `#pavilions`, `#insights` and `#system` jump to a section

## Development commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload and the ESP32 proxy |
| `npm run build` | Type-check and build static files into `dist/` |
| `npm run preview` | Serve `dist/` at http://localhost:4173 (the ESP32 proxy is active here too) |
| `npm run typecheck` | TypeScript check only |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (simulation and scoring) |
| `npm run test:watch` | Vitest in watch mode |

### Offline / booth build

```bash
npm run build        # outputs static files to dist/
npm run preview      # serves dist/ at http://localhost:4173
```

`dist/` can be served from any static host or local web server. Live ESP32 data needs the proxy described below, which a plain static host doesn't provide.

### GitHub Pages

The dashboard is published at **https://saracs2.github.io/dhiya/**. [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) lints, tests, builds and deploys every push to `main`. The relative Vite `base` (`./`) lets the same build work under the `/dhiya/` sub-path.

> **The ESP32 hardware controls don't work on the published site.** GitHub Pages only serves static files: it has no `/esp32` proxy, and an HTTPS page can't call a plain-HTTP device on your local network. On the public site, the Solar Hardware panel shows "Cannot connect to ESP32", while everything else (the simulation, charts, leaderboard and Arabic layout) works normally. To control the hardware, run the dashboard locally with `npm run dev` on the same Wi-Fi network as the ESP32. Reaching the board from the internet would need a separate secure architecture, which this project deliberately doesn't include.

## Connecting the ESP32

The browser never calls the ESP32 directly. It requests `/esp32/...`, and the Vite dev/preview server forwards those requests to the board. This avoids CORS issues and keeps the board's address out of the front-end code.

1. **Put the ESP32 and your computer on the same Wi-Fi network.** Wi-Fi credentials belong in the ESP32 firmware, which is not part of this repository. Never commit them here.
2. **Find the board's IP address**, for example from the serial monitor at boot or your router's client list.
3. **Tell DHIYA where the board is.** Copy `.env.example` to `.env.local`, then set the address:

   ```bash
   cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
   ```

   ```ini
   ESP32_URL=http://192.168.1.50
   ```

   `.env.local` is git-ignored. If `ESP32_URL` isn't set, the project's original development address is used.
4. **Restart `npm run dev`** (the proxy target is read at startup), then open the **Soiling & Cleaning** section. The panel polls the board every 2 seconds.

### Expected ESP32 HTTP API

The firmware should serve these `GET` endpoints with JSON responses (see [`src/services/esp32.ts`](src/services/esp32.ts)):

| Endpoint | Response |
|---|---|
| `/api/status` | `{ connected, solarVoltage, ldr: { tl, tr, bl, br }, angleH, angleV, angleClean, trackingEnabled, cleaning }` |
| `/api/clean` | `{ message }`, which starts a cleaning cycle |
| `/api/tracking?enabled=1` (or `0`) | `{ trackingEnabled }` |

Requests time out after 5 seconds. The client never sends overlapping requests, because the ESP32 web server handles one client at a time.

**Troubleshooting:** "Cannot connect to ESP32" usually means the IP address is wrong, the board is on a different network, or the dev server wasn't restarted after you changed `.env.local`. Open `http://<board-ip>/api/status` in a browser to confirm that the board responds.

## What the dashboard does

| Section | Contents |
|---|---|
| Overview | KPIs (power, energy, soiling, cleaning status), today's performance chart, quick actions, modeled comparison, leaderboard, system status, project summary |
| Solar Monitoring | Performance chart with table view and model readout |
| Soiling & Cleaning | Cleaning state machine (Monitor → Trigger → Clean → Verify), soiling chart with threshold, event log, live ESP32 hardware panel |
| Pavilion Comparison | Illustrative leaderboard and per-pavilion score breakdown |
| Sustainability Insights | Conventional vs DHIYA modeled day, assumptions, earlier reference values, illustrative CO₂ equivalent |
| System Information | Subsystem integration status, data-source labels, model assumptions, MATLAB example comparison |

**Controls:** pause/resume, simulation speed (1/5/15 simulated minutes per second), reset to the example state, simulate dust event (+5 pp), run cleaning cycle, auto-clean on/off, chart/table toggle, English/Arabic.

## Model

All assumptions live in [`src/domain/constants.ts`](src/domain/constants.ts).

- Clean-panel output = 100 W × half-sine irradiance between 06:00 and 18:00.
- Modeled output = clean-panel output × (1 − soiling).
- Dust accumulates at 2 percentage points per simulated daylight hour (demonstration rate).
- At 20 % estimated soiling, a cleaning cycle runs (automatically if auto-clean is on): a 6 s cleaning ramp to 2 % residual, then 2 s of verification.
- The session starts at 12:00 from the existing MATLAB example (95.0 W, 5 %, Standby). The 06:00–12:00 history is a **reconstructed** morning from the same model, which gives 337.1 Wh (the MATLAB example shows 343.2 Wh; the System Information page documents the difference).

**Comparison scenario.** Same irradiance and dust rate, with only the cleaning strategy changed. Conventional starts at 12 % carried-over soiling and never cleans. DHIYA starts at 5 % and cleans at the threshold. Under these assumptions the modeled daily energy is 580.7 Wh vs 676.6 Wh (+16.5 %), with peaks of 76.4 W vs 90.5 W. This is a result of the assumptions, **not** a measured or guaranteed improvement. The project's earlier simulated peaks (~76 W / ~95 W) are shown separately as reference values.

## Pavilion leaderboard (illustrative)

```
Total = 0.50 × Solar performance + 0.30 × Solar contribution + 0.20 × Maintenance
```

Each component is normalised to 0–100 against fixed bounds:

| Component | Raw input | 0 points | 100 points |
|---|---|---|---|
| Solar performance | performance ratio | 0.60 | 0.90 |
| Solar contribution | share of demand met by solar | 0 % | 50 % |
| Maintenance | average soiling loss | 20 % | 0 % |

The pavilion entries in [`src/data/pavilions.ts`](src/data/pavilions.ts) are **fictional** inputs chosen to reproduce the example scores (Saudi Arabia 89.4, Japan 85.8, Germany 81.1). They are not measurements and not an official Expo 2030 ranking.

## Project structure

```
src/
  domain/       constants (assumptions), types, number/unit formatting
  simulation/   solar model, soiling model, day profiles, live engine (pure reducer) + tests
  scoring/      leaderboard normalisation and weighting + tests
  data/         illustrative pavilion data
  services/     ESP32 HTTP client
  state/        React providers/hooks for the simulation; cached comparison scenario
  i18n/         English/Arabic strings and language provider
  components/   cards, KPIs, actions, leaderboard, status, hardware panel, charts (lazy-loaded Recharts)
  sections/     the six dashboard views
  styles/       global theme
```

Chart colours were checked with a colour-vision-deficiency palette validator against the dark chart surface (`#111a2b`).

## MATLAB / Simulink

The original MATLAB scripts, the Phase 3 Simulink model (`DHIYA_Phase3.slx`) and the exported result figures are in [`matlab/`](matlab/). See [`matlab/README.md`](matlab/README.md) for how to open and run them (MATLAB R2026a + Simulink). They are separate from the web dashboard and aren't needed to build or run it.

## Security notes

- Never commit `.env`, `.env.local`, Wi-Fi credentials, API keys or private keys. Don't put secrets in `VITE_*` variables either, because they are compiled into the public site. `.gitignore` excludes `.env*` (except `.env.example`), `*.pem`, `*.key` and `secrets/`.
- The ESP32 API has no authentication, so only run it on a trusted local network.
