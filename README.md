## Push Scheduler

Employee labour-hours dashboard built with Next.js 16 (app router) and Tailwind CSS 4.

### Quick start

```bash
cd "/push-scheduler"
npm install
npm run generate:labour   # builds data/labour_hours.json from ../data/apertureLabsClocks.json
npm run dev
```

Open http://localhost:3000 to see the UI. The layout matches the provided desktop and tablet mockups; the left nav collapses on smaller viewports, and the header keeps the user chip visible.

### Data pipeline

- `scripts/generateLabourHours.js` splits each shift across the four time periods (Morning 5–12, Afternoon 12–18, Evening 18–23, Late Night 23–5) and across calendar days, rounding to 2 decimals.
- It writes `data/labour_hours.json`, which the UI imports directly. Re-run the script if `data/apertureLabsClocks.json` changes.

### UI behavior

- Cards show the sum of hours per employee across all dates in `labour_hours.json`.
- The filter input matches substrings in names case-insensitively; empty state text appears when nothing matches.
- Responsive grid: 1 column on mobile, 2 on small screens, 3–4 on larger displays.

### Notes

- Palette and spacing follow the mockups; typography uses the bundled Geist font.
- Metadata in `app/layout.tsx` updated to reflect the dashboard.
