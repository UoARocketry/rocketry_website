# University of Auckland Rocketry Club Website

Official website for the University of Auckland Rocketry Club, built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Overview

This project is a content-driven site with server-rendered pages backed by Supabase. It includes:

- Home landing page with featured rockets and upcoming events
- About page with team information and exec-year browsing
- Events list and event detail pages
- Rockets list and rocket detail pages
- Sponsors page
- API routes for site content

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL)

## Project Structure

```
app/
	page.tsx
	layout.tsx
	about/
	events/
	rockets/
	sponsors/
	api/
components/
	ui/
lib/
	site-data.ts
	supabase.ts
scripts/
public/
```

## Data Model (High Level)

- `Event`
- `Rocket`
- `Exec` (includes `year` for historical team browsing)
- `Sponsor`
- `WhatWeDo`
- `JourneyItem`
- `TeamRole`
- `Stat`
- `SiteSettings`

## Local Development

### Prerequisites

- Node.js (latest LTS or latest current)
- npm
- Supabase project credentials in environment variables

### Commands

- `npm run dev` - start development server
- `npm run build` - create production build
- `npm run start` - run production build locally
- `npm run lint` - run ESLint
- `npm run db:grant` - apply DB grants
- `npm run seed` - run seed + schema sync script

## Environment Variables

Required server variables are validated in `lib/supabase.ts`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`

For scripts and media URLs, you may also need:

- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_STORAGE_URL`

## Notes

- Data-fetching is centralized in `lib/site-data.ts` with Next cache revalidation.
- API routes are in `app/api/**/route.ts`.
- Images use `next/image` where appropriate with host allowlists in `next.config.ts`.

## Regression Checklist

Run these checks before merging significant UI/data changes:

1. `npm run lint`
2. `npm run build`
3. Manual smoke test:
   - Home page loads featured rockets and upcoming events
   - About page loads and exec year switching works
   - Events and Rockets detail pages render images and content correctly
   - Sponsors page renders external logos without `next/image` host errors
4. API spot checks:
   - `/api/exec?year=2026` returns data
   - `/api/exec?year=abcd` returns `400`
   - `/api/test` returns `{ ok: true, now: ... }`

## Contact

- uoarocketryclub@auckland.ac.nz
