# TrustDNA — Continuous Identity Trust

TrustDNA replaces password-only security with real-time identity verification. Every login is scored across 5 behavioral signals — device, location, time, typing rhythm, and travel patterns — to decide trust in milliseconds.

This demo showcases the full flow: login evaluation, live trust monitoring, SOC alerting, and session hijack detection. No backend required — everything runs client-side.

## Quick Start

```bash
npm install
npm run dev
```

Opens at **http://localhost:3000**.

## Scenarios

| # | Scenario | Outcome |
|---|----------|---------|
| 1 | Normal Login | Trust approved — full access |
| 2 | Unusual Location | Step-up authentication required |
| 3 | Obvious Attack | Access blocked |
| 4 | Session Hijack | Trust degrades in real-time, session terminated |

## Build

```bash
npm run build
```

Output in `dist/` — deploy to any static host.

## Stack

React 19, Vite 8, Tailwind CSS 4, React Router 7. Trust scoring and session logic are client-side in this demo — the same algorithms power the production API.
