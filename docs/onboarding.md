# Developer onboarding

You've just taken over the UARC website. This gets you from a fresh clone to a running local site, then tells you what will bite you.

Read it once, top to bottom. It's about twenty minutes. Everything here has been run on a real machine.

If you're a committee member wanting to edit content, this is the wrong document. Yours is at `/admin/guide` on the live site, mirrored at [exec-guide.md](exec-guide.md).

## 1. What this is

The website for the University of Auckland Rocketry Club, at https://www.uoarocketry.com. It's a Next.js site with a CMS built into it, so committee members edit the content themselves and nobody needs a developer to change an event date.

Two halves, and it's worth getting the split clear before you touch anything.

**The public site.** Home, About, Events, Rockets, Sponsors, plus a detail page per rocket and per event. Server-rendered, read-only, cached. This is what a visitor sees.

**The admin.** Payload CMS at `/admin`. Committee members log in and edit content there. Same Next.js app, same database, same deployment. It isn't a separate service.

The stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Payload CMS 3, Postgres. Hosted on Vercel, with the database and image storage on Supabase.

Content is one of twelve collections (Events, EventTags, Rockets, Executives, Sponsors, SponsorTiers, WhatWeDo, JourneyItems, TeamRoles, Stats, Media, Users) plus one global, SiteSettings. Most of them have a draft/publish workflow, so a document is only visible to the public once it's published.

## 2. Getting it running

You need Node 20.9 or newer. CI uses Node 24, so anything in that range is fine. You also need Docker, and Git.

### Use a throwaway database, not production

Run against a local Postgres in Docker. Not the Supabase production database. This isn't just tidiness. There are two ways a local dev server silently corrupts live content, both covered in section 6. A throwaway database removes the whole class of problem, and you lose nothing, because the site works fine with no content in it.

```bash
docker run --name uarc-dev \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=uarc \
  -p 5434:5432 \
  -d postgres:17
```

Port 5434 keeps it out of the way of any other Postgres you have. A plain `postgres:17` image is enough. You don't need Supabase's image, even though production runs on Supabase.

To start it again later: `docker start uarc-dev`.

### Environment

Create `.env.local` in the repo root. Next.js loads it automatically, and so does the Payload CLI, so you don't need any wrapper command.

```bash
# Database. Both point at your local container.
DATABASE_URL="postgresql://postgres:devpassword@127.0.0.1:5434/uarc"
DIRECT_URL="postgresql://postgres:devpassword@127.0.0.1:5434/uarc"

# Signs admin login sessions. Any random string locally.
PAYLOAD_SECRET="local-dev-secret-not-for-production"

# Must match the URL you actually open the admin on. See section 6.
SERVER_URL="http://localhost:3000"

# Deliberately fake. They only need to be non-empty. See section 6.
SUPABASE_STORAGE_BUCKET="images"
SUPABASE_STORAGE_S3_ENDPOINT="https://placeholder.supabase.co/storage/v1/s3"
SUPABASE_STORAGE_S3_REGION="ap-southeast-2"
SUPABASE_STORAGE_S3_ACCESS_KEY_ID="placeholder"
SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY="placeholder"
SUPABASE_STORAGE_PUBLIC_URL="https://placeholder.supabase.co/storage/v1/object/public/images"
```

What each one does, and what breaks without it:

| Variable | What it's for | If it's missing |
| --- | --- | --- |
| `DATABASE_URL` | The connection the app uses at runtime | App won't boot. `npm run build` fails too |
| `DIRECT_URL` | Fallback if `DATABASE_URL` is unset, and what you'd use for migrations | Nothing, as long as `DATABASE_URL` is set |
| `PAYLOAD_SECRET` | Signs admin sessions | Locally you get a dev fallback. In production the app refuses to boot, on purpose |
| `SERVER_URL` | Goes into the CORS and CSRF allowlist | Admin form submissions get rejected and array rows hang. Section 6 |
| `SUPABASE_STORAGE_*` | Registers the S3 upload plugin. All five must be non-empty | The plugin is skipped, and two silent failure modes open up. Section 6 |

`.env.example` in the repo root is the full list including the production-only ones. For production values, the database strings and storage keys come from the Supabase dashboard, under Project Settings. `RESEND_API_KEY` is only needed for admin password-reset email.

Note the production `DATABASE_URL` should be Supabase's transaction pooler on port 6543, not the session pooler on 5432. The session pooler caps concurrent clients low and ran out in production once already.

### Start it

```bash
npm install
npm run payload:migrate
npm run dev
```

Then open http://localhost:3000. The site will render with no content, which is correct. Every page degrades to an empty state rather than erroring.

To get into the admin, go to http://localhost:3000/admin and it'll walk you through creating the first user, because your database is empty.

## 3. How the code is shaped

### Two route groups

`app/` splits into two groups. The bracketed folder names are Next.js route groups, so they don't appear in URLs.

- `app/(site)/` is the public website. Server components. Each route has its own `loading.tsx` and `error.tsx` beside it.
- `app/(payload)/` is the admin UI and the API Payload generates. These files are thin re-exports of Payload's own handlers. Don't hand-edit the route logic in there.

### How a page gets its data

Pages never talk to Payload directly. The chain is:

```
page.tsx  →  lib/site-data.ts  →  lib/payload.ts  →  Payload Local API  →  Postgres
```

`lib/site-data.ts` is the only place the public site reads content. It does three things: gets a cached Payload client, wraps each query in Next's `unstable_cache` with a 300 second window and a set of cache tags, and maps raw Payload documents into trimmed view models defined in `lib/site-data.types.ts`.

That mapping matters. Pages consume the view models, never raw Payload types. So if you add a field, you have to thread it through `site-data.ts` before a page can see it.

It uses the Local API, which is in-process database access, not HTTP. There's no network hop between the site and the CMS.

### How content gets edited

Schema lives in `payload/`. One file per collection in `payload/collections/`, the single global in `payload/globals/`, and they're registered in `payload.config.ts`.

Read access is set per collection in `payload/access/policies.ts`, and picking the wrong policy leaks unpublished drafts to anyone who asks the public API. Collections with drafts use `isPublicReadPublished`, which returns a query constraint rather than plain `true`. Collections without drafts use `isPublicRead`. If you add a collection with drafts and give it `isPublicRead`, `GET /api/your-collection` will serve unpublished documents in full.

### Caching and revalidation

The two halves are wired together by hooks. When an editor saves, `afterChange` and `afterDelete` hooks on the collection call the helpers in `payload/hooks/revalidation.ts`, which bust the exact cache tags `site-data.ts` reads under.

**If you add a query with a new tag in `site-data.ts`, add the matching revalidation to the collection hook.** Otherwise an editor saves, nothing visibly changes, and they assume the CMS is broken. It'll fix itself after 300 seconds, which somehow makes it more confusing, not less.

Those revalidation helpers swallow their errors deliberately. Payload runs `afterChange` inside the write's transaction, so throwing there doesn't just skip the cache bust, it rolls the editor's save back. Don't "fix" that by removing the guard.

## 4. Making a change safely

Run all four before you push. They take a couple of minutes.

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Run `tsc` explicitly. ESLint doesn't typecheck, and Payload config mistakes, like a field option that doesn't exist, only show up there.

Be aware that **CI does not run the tests.** It runs lint, then checks the database env is present, then builds. So the test suite is only a gate if you run it yourself.

### When you need a migration

Any time you change a collection's fields. The schema is not auto-synced, because `push: false` is set. Migrations in `migrations/` are the source of truth.

Write them by hand. `payload migrate:create` doesn't work in this repo, and section 6 explains why. Take column types from a real database rather than guessing. Dates here are `timestamp(3) with time zone`.

Apply with `npm run payload:migrate`.

### When you need to regenerate things

**`payload-types.ts`**, after any collection or global field change:

```bash
npm run payload:generate:types
```

It's committed, and `lib/` imports from it throughout. If you skip it, `tsc` will disagree with your schema.

**The admin importMap**, only when you add or remove a custom admin component:

```bash
npm run payload:generate:importmap
```

Read section 6 before you run that one. It has a trap that breaks production uploads.

## 5. Deployment

Push to `main` and Vercel builds and deploys automatically. In practice it takes about ninety seconds from push to live.

CI runs on pull requests and on pushes to `main`: `npm ci`, then `npm run lint`, then a check that the database env is configured, then `npm run build`. Pull requests from forks fail on purpose, because GitHub doesn't expose repository secrets to fork PRs and the build needs a database URL.

There's no staging environment. `main` is production.

If a deploy goes wrong, don't try to patch it live. Vercel keeps previous deployments, and you can roll back instantly from the Vercel dashboard. Roll back first, fix on a branch after.

### The keep-alive cron

`.github/workflows/keep-alive.yaml` pings the Supabase REST API at 12:00 UTC every Monday and Thursday.

Supabase pauses free-tier projects that get no activity for a week. If this workflow stops running, and the site is quiet enough, the project pauses and the whole site goes down until somebody logs into Supabase and resumes it. GitHub also disables scheduled workflows in repositories with no activity for 60 days, which is a realistic way for this to fail quietly over a summer break.

If the site is down and nothing has changed, check Supabase first.

## 6. The traps

These are all real. Each one has cost somebody time.

### Never point a local dev server at the production database without the storage variables

If the five `SUPABASE_STORAGE_*` values aren't all set, the S3 plugin is skipped, and two things go wrong at once.

First, image URLs. Every image field is a pair: an upload relation, plus a plain text field holding the public URL that the site actually reads. With the plugin skipped, Payload reports a media file's URL as a relative `/api/media/file/...` path. Saving any document with an image would then write that path into the flat field, and it resolves nowhere on the live site. There's now a guard that rejects non-absolute URLs and keeps the existing value, but don't rely on it. Use a local database.

Second, the importMap, below.

This is why the placeholder values in section 2 exist. They're fake, so nothing can reach the real bucket, but they're non-empty, so the plugin registers and local behaviour matches production.

### The importMap must keep `S3ClientUploadHandler`

Running `npm run payload:generate:importmap` without the storage variables set silently drops `S3ClientUploadHandler` from `app/(payload)/admin/importMap.js`. Commit that and uploads break in production.

This is easy to reproduce and easy to miss, because the command succeeds either way. After regenerating, always check:

```bash
grep -c "S3ClientUploadHandler" "app/(payload)/admin/importMap.js"
```

You want `2`. If you get `0`, your environment was wrong. Restore the file with `git checkout -- "app/(payload)/admin/importMap.js"` and try again with the storage variables set.

A dev server left running can also rewrite that file underneath you. If it shows up modified when you didn't touch it, that's why. On Windows `pkill -f "next dev"` won't match it. Find the process holding the port and use `taskkill //PID <pid> //F`.

### The admin origin has to match, including the port

Payload rejects a form-state request whose origin isn't in its allowlist, and answers with a 401. The admin renders that as a loading skeleton that never resolves. So "Add Link", and every other array row button, appears to hang with no error anywhere on screen. It looks like a frontend bug. It isn't.

In development the allowlist includes both `http://localhost:3000` and `http://127.0.0.1:3000`, so either hostname is fine. **The port is what catches people now.** If port 3000 is already busy, Next quietly starts on 3001 instead, and neither allowlisted origin matches any more.

Two ways out. Either free up port 3000, or set `SERVER_URL` in `.env.local` to the port you're actually on, since whatever `SERVER_URL` holds gets added to the allowlist.

Watch the startup output. If it says `Port 3000 is in use, using available port 3001 instead`, that's your warning.

### `payload migrate:create` is not usable here

Don't reach for it. Drizzle diffs against `.json` snapshots, and only the first two migrations have one. Every migration since has been hand-written without updating the snapshot. So the command proposes recreating months of schema that already exists, and it blocks on an interactive prompt asking whether each enum is new or renamed. It will sit there forever in a non-interactive shell.

Write migrations by hand, modelled on the existing ones in `migrations/`.

### Keep the `_*_v.parent_id` foreign keys as `ON DELETE CASCADE`

Payload keeps version history in `_<collection>_v` tables. Those tables' `parent_id` foreign keys must be `ON DELETE CASCADE`, which is set by `migrations/20260901_120000_fix_version_orphans.ts`.

Payload's own schema builder emits `SET NULL`, so any regenerated migration will try to revert this. Keep CASCADE. With `SET NULL`, a failed version cleanup leaves orphaned version rows with a null parent, and the draft-aware admin list renders those as a phantom document whose id is null.

### Row Level Security

`migrations/20260401_010000_enable_payload_rls.ts` enables Postgres RLS on all Payload tables, which Supabase requires. If you add a collection, make sure its tables are covered too.

## 7. Getting help, and handing over

The architecture notes that go deeper than this document aren't in the repository. Ask Jerry for them at handover.

For anything you can't work out from the code, the contact details are in the committee guide, under "Who to ask" in [exec-guide.md](exec-guide.md). They're defined once as `GUIDE_CONTACT` in `payload/views/guide-content.ts` and rendered into both the admin guide and that file, so change them there and run `npm run guide:docs` rather than editing the markdown.

That guide is worth reading even though it's written for committee members, because it tells you how the site is actually used day to day.

One last thing. This site outlives whoever is running it. Committees turn over every year and the next person will have even less context than you do now. Two habits make that survivable: keep at least two admin accounts so nobody gets locked out, and when you learn something the hard way, write it down here. This document only exists because somebody did.
