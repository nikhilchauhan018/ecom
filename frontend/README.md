# Store Admin — Frontend (React + Vite)

Single-vendor clothing store admin dashboard. Built from `Admin_Dashboard-html` design.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Optional `.env`: `VITE_STORE_URL=https://yourstore.com` (target of "View website"; only http/https accepted).

## Structure
```
src/
  config/        site.js (store name, owner), navigation.js (sidebar)
  data/          dashboard.mock.js  ← temporary; replaced by API calls later
  hooks/         useTheme, useHotkey (Ctrl/Cmd+K)
  layouts/       AdminLayout (topbar + sidebar + page outlet)
  components/
    layout/      Topbar, Sidebar
    ui/          Icon, Card, Pill, Button (Bootstrap engine + design colours)
    common/      ErrorBoundary
  features/
    dashboard/   DashboardPage + components/ (one file per widget)
    placeholder/ ComingSoonPage (all sections not built yet)
  routes/        AppRoutes
  styles/        index.css (Bootstrap → Tailwind order, theme variables)
  utils/         formatMoney
```
New feature = new folder in `features/` + one route in `routes/AppRoutes.jsx`.

## Tailwind + Bootstrap together
- Bootstrap: components/behaviour (Table, Badge, Button, Form.Control via react-bootstrap) and its Reboot reset.
- Tailwind: layout, spacing, colours. Config uses `prefix: 'tw-'` and `preflight: false`, so the two never clash
  (`.container`, `.collapse`, `.table`, `.visible`… exist in both).
- Breakpoints match the design: 520 / 820 / 1100 px.
