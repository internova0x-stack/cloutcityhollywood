# Clout City: Hollywood Music

Mobile-first browser life game: arrive in a fictional Hollywood as a nobody with an instrument and play your way
from a café open mic to a sold-out stadium. Sims-style living, a rhythm game at its heart, and a satirical daily
music tabloid. Sister game to Clout City NYC (`internova0x-stack/project-clout-city`).

**Current version: v0.1 "Tap In"** (see `docs/07-milestones-and-versions.md`).

## Read first
- `docs/00-owner-decisions.md`: decisions made after the documents. **Wins over every other document.**
- `docs/01-game-concept-note.md`: the big picture.
- `docs/02-clarifications-and-updates-v1.md`: game rules and P1 scope. **Wins on rules.**
- `docs/03-world-state-layer-brief-v1.md`: story engine. **Wins on the World State layer.**
- `docs/05-design-system-guide-v1.md`: UI (C46 to C65 are new).
- `docs/07-milestones-and-versions.md`: what ships when. Build only the current version's scope; anything else
  gets a "Coming soon" card.
- `docs/08-new-features-spec.md`: hunts, Story Studio, News, cast, the song pipeline.
- `docs/clout-city/`: the Clout City NYC documents. Every Hollywood document is a delta on these.
- `docs/pdf/`: the original PDFs.

## How we build
- Port Clout City's modules (from `project-clout-city`) and change only what the Hollywood documents and the
  owner's decisions change. Renames: clout → fame, Queens → Echo Flats, boroughs → districts, club events → club
  nights, gigs → brand deals, Gigs app → Deals app. C$ and Crew keep their names.
- One step per pull request, with its Vercel preview and what to test on a phone. Show a preview or mockup
  before building anything visual.
- Player data is permanent from day one: change the schema only with a new migration file.
- Gold is only for real money. No real artists, songs, labels, venues or brands. Copy uses they/them.
- The performance game is the only pure-skill system: nothing (items, purchases, stories) changes timing or
  scoring, and the audio clock is the master.

- Writes to `players`/`invites` go through security-definer SQL functions; RLS blocks direct writes. Every new
  function is revoked from `public, anon, authenticated` and granted back only where the browser needs it.

## Commands
- `npm run dev`: local server. Without Supabase env vars the front page works and sign-up says accounts aren't on
  yet. `/preview/guest`, `/preview/create?age=1` and `/preview/home?crew=0-6` show screens with sample data
  (development only, 404 in production).
- `npm run typecheck`, `npm test` (Node's test runner, `tests/*.test.ts`), `npm run build`.
- `npm run test:db`: every migration plus the SQL tests in `supabase/tests/` on a throwaway local Postgres.

## Stack
Next.js, React, Supabase (auth + Postgres), Stripe, Vercel, MapLibre (real streets, as in Clout City NYC),
three.js for avatars and landmarks, the Web Audio API for shows.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
