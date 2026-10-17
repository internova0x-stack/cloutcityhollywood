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

## Stack
Next.js, React, Supabase (auth + Postgres), Stripe, Vercel, MapLibre (real streets, as in Clout City NYC),
three.js for avatars and landmarks, the Web Audio API for shows.
