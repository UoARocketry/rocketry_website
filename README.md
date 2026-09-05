# University of Auckland Rocketry Club Website

Official website for the University of Auckland Rocketry Club: a server-rendered Next.js site with an embedded Payload CMS backend, so committee members edit the site themselves at `/admin`.

Live at https://www.uoarocketry.com.

## Overview

- Home landing page with featured rockets and upcoming events
- About page with the exec team and historical exec-year browsing
- Events list and event detail pages, including multi-session series
- Rockets list and rocket detail pages
- Sponsors page, grouped by tier
- Payload admin at `/admin`, with a committee guide at `/admin/guide`

## Tech stack

- Next.js 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- Payload CMS 3, with the Postgres adapter
- Postgres and S3-compatible media storage, both hosted on Supabase
- Vitest for unit tests
- Deployed on Vercel

## Project structure

```
app/
  (site)/          public website: home, about, events, rockets, sponsors
  (payload)/       Payload admin UI and its generated REST/GraphQL API
components/        shared React components
  ui/
lib/
  site-data.ts     every read the public site makes, cached and mapped
  payload.ts       cached Payload Local API client
payload/
  collections/     one CollectionConfig per content type
  globals/         SiteSettings
  access/          read/write access policies
  fields/          shared field builders and validators
  hooks/           cache revalidation, media URL sync, integrity guards
  views/           the committee guide rendered inside the admin
migrations/        source of truth for the database schema
scripts/           generate-exec-guide.ts
docs/
  exec-guide.md    generated mirror of the in-admin guide
```

Pages never call Payload directly. They import typed view models from `lib/site-data.ts`, which queries Payload's Local API, caches with `unstable_cache` and cache tags, and maps raw documents into trimmed types from `lib/site-data.types.ts`.

## Content model

Collections: `Events`, `EventTags`, `Rockets`, `Executives`, `Sponsors`, `SponsorTiers`, `WhatWeDo`, `JourneyItems`, `TeamRoles`, `Stats`, `Media`, `Users`. One global: `SiteSettings`.

Most content collections have drafts enabled, so a document is only public once published.

## Local development

### Prerequisites

- Node.js 20.9 or newer (Next 16's own minimum), and npm
- A Postgres database (a local container is fine)
- Copy `.env.example` to `.env` and fill it in

The app needs a connection string (`DATABASE_URL` or `DIRECT_URL`) and `PAYLOAD_SECRET` to boot. The `SUPABASE_STORAGE_*` group is optional locally: without all five values the S3 storage plugin is skipped and uploads have no remote URL.

Do not point a local dev server at the production database without the storage env set. See `CLAUDE.md` for why, and for the placeholder values that make `payload generate:importmap` produce a complete map.

### Commands

```bash
npm run dev                        # dev server
npm run dev:turbo                  # dev server with Turbopack
npm run build                      # production build
npm run start                      # serve the production build
npm run lint                       # eslint
npm test                           # vitest
npm run test:watch

npm run payload                    # Payload CLI passthrough
npm run payload:migrate            # apply database migrations
npm run payload:generate:types     # regenerate payload-types.ts
npm run payload:generate:importmap # regenerate the admin importMap
npm run guide:docs                 # regenerate docs/exec-guide.md
```

### Database migrations

`push: false` — the schema is not auto-synced. Migrations in `migrations/` are the source of truth. After changing a collection, write a migration by hand, apply it with `npm run payload:migrate`, and run `npm run payload:generate:types`. `payload migrate:create` is not usable in this repo; `CLAUDE.md` explains why.

## Environment variables

See `.env.example` for the full list with descriptions. In short:

| Variable | Needed for |
| --- | --- |
| `DATABASE_URL` | runtime database access (Supabase transaction pooler, port 6543) |
| `DIRECT_URL` | fallback, and local migrations (port 5432) |
| `PAYLOAD_SECRET` | signing admin sessions; required in production |
| `SERVER_URL` | the deployed base URL, used for the CORS/CSRF allowlist |
| `SUPABASE_STORAGE_*` | media uploads to Supabase S3 storage |
| `NEXT_PUBLIC_SUPABASE_STORAGE_URL` | the `next/image` remote host allowlist |
| `RESEND_API_KEY`, `PAYLOAD_EMAIL_FROM_*` | admin password-reset email |

## Verification

Full check before merging:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Run `tsc` explicitly. ESLint does not typecheck, and Payload config mistakes surface only there.

Manual smoke test for UI or data changes:

1. Home page loads featured rockets and upcoming events
2. About page loads and exec-year switching works
3. Event and rocket detail pages render images and content
4. Sponsors page renders external logos without `next/image` host errors
5. `/admin` loads, and saving a document with an image keeps an absolute media URL

## Further reading

- `CLAUDE.md` — architecture, conventions, and the traps worth knowing before changing anything
- `docs/exec-guide.md` — the committee-facing guide, generated from `payload/views/guide-content.ts`

## Contact

- uoarocketryclub@auckland.ac.nz
