# University of Auckland Rocketry Club Website

Official website for the University of Auckland Rocketry Club, live at https://www.uoarocketry.com.

A Next.js site with Payload CMS built into it, so committee members edit the content themselves at `/admin`. Backed by Postgres and image storage on Supabase, deployed on Vercel.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Payload CMS 3 · Vitest

## Start here

**Developers:** read [docs/onboarding.md](docs/onboarding.md). It covers getting it running locally, how the code is laid out, how to make a change safely, how deployment works, and the traps that will otherwise cost you an afternoon.

**Committee members editing content:** your guide is at `/admin/guide` once you're logged in, mirrored at [docs/exec-guide.md](docs/exec-guide.md).

## Commands

```bash
npm run dev                        # dev server
npm run build                      # production build
npm run start                      # serve the production build
npm run lint                       # eslint
npm test                           # vitest

npm run payload:migrate            # apply database migrations
npm run payload:generate:types     # regenerate payload-types.ts
npm run payload:generate:importmap # regenerate the admin importMap
npm run guide:docs                 # regenerate docs/exec-guide.md
```

Full check before pushing:

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build
```

## Environment

See [.env.example](.env.example) for the full list. The app needs a database connection string and `PAYLOAD_SECRET` to boot. [docs/onboarding.md](docs/onboarding.md) explains where each value comes from and what breaks without it.

## Contact

uoarocketryclub@gmail.com
