# Genius Lens — Launch Readiness Checklist

## Status: Pre-Launch

### Critical — Must Complete Before Launch

- [x] Core features implemented (map, filtering, clustering, heatmap, drawing tools)
- [x] Export functionality (CSV and summary reports)
- [x] Shareable URLs with filter state preservation
- [x] Authentication system (Supabase + demo mode fallback)
- [x] Onboarding flow (welcome modal + 7-step guided tour)
- [x] Responsive design / mobile support
- [x] ESLint configuration and linting passes
- [ ] **Build verification** — run `npm run build` and confirm zero errors
- [ ] **Set up Supabase project** — create project, run migration (`supabase/migrations/001_create_permits.sql`), configure RLS policies
- [ ] **Configure production environment variables** on Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SHOVELS_API_KEY` (if using Shovels.ai data source)
- [ ] **Load initial permit data** — run `npm run load-data` or configure ArcGIS proxy for live data
- [ ] **Deploy to Vercel** — connect repo and deploy

### Important — Should Complete Before Launch

- [ ] **Add test framework** (Vitest recommended) and write tests for:
  - Utility functions (`lib/utils.ts`, `lib/permits.ts`, `lib/export.ts`, `lib/shareUrl.ts`)
  - Filter hook (`useFilters`)
  - Component rendering (FilterPanel, PermitMap)
- [ ] **Set up CI/CD** — GitHub Actions workflow for lint, typecheck, test, and build
- [ ] **Custom domain** — configure on Vercel
- [ ] **Error monitoring** — add Sentry or similar for production error tracking
- [ ] **Analytics** — add usage tracking (Vercel Analytics, PostHog, etc.)
- [ ] **Performance audit** — run Lighthouse and address any issues

### Nice to Have — Post-Launch Enhancements

- [ ] Prettier / code formatter configuration
- [ ] Pre-commit hooks (husky + lint-staged)
- [ ] Rate limiting on API endpoints
- [ ] Additional data sources beyond Miami-Dade
- [ ] User saved views / bookmarks
- [ ] Email notifications for new permits in drawn areas
- [ ] PWA support for offline access

## Architecture Overview

| Layer       | Technology                    | Status |
|-------------|-------------------------------|--------|
| Frontend    | React 18 + TypeScript + Vite  | Ready  |
| Styling     | Tailwind CSS 3.3              | Ready  |
| Maps        | MapLibre GL + react-map-gl    | Ready  |
| Database    | Supabase (PostgreSQL/PostGIS) | Schema ready, needs provisioning |
| Hosting     | Vercel (Edge Functions)       | Config ready, needs deployment |
| Data Source | Miami-Dade ArcGIS + Shovels.ai| Proxy ready, needs API keys |

## Quick Start for Production Deployment

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.example .env

# 3. Verify build
npm run build

# 4. Deploy
vercel --prod
```
