# Owner decisions

Decisions the owner made after the Hollywood Music documents were written (Oct 17, 2026). Where a decision
here disagrees with a document, **the decision wins**; the documents will be edited to match as each area
is built (Milestones rule 3: "if a version needs a rule to change, the document changes first").

## Conflicts between the Hollywood documents

| # | Conflict | Decision |
|---|---|---|
| 1 | Clarifications §5 lets story moments raise or lower bandmate Chemistry; World State Brief §7 protects bandmates from shared stories | **World State Brief wins.** Stories never change Chemistry, hiring or quitting. Drop the "story moments" rows from Clarifications §5 |
| 2 | Clarifications §4.9 / §9 and Design C16 let stories raise a venue's ticket price, which would raise the player's door share; World State Brief says price effects only change what a player pays and has no ticket-price effect | **A story "ticket price" is what watchers pay** (`price_multiplier` on `visit_price` for "Watch a show"). Door share always uses the venue's **base** ticket price |
| 3 | Concept Note: "about 16 places"; Clarifications, Milestones and New Features: 19 | **19 places** (Clarifications §3) |
| 4 | Chart validation needs 2 to 4 Hype phrases per chart, but Hype notes start at Bar | **The Hype-phrase rule applies from Bar up.** Open Mic charts have none |
| 5 | §4.4 puts crowd calls at Theater ("Club in later songs"); the chart validator allows Club and Theater | **Theater only in P1.** The validator still accepts Club for later songs |
| 6 | Concept lists bandmate roles as drums, bass, keys | **Clarifications wins:** drums, bass, and keys or guitar (whichever the player doesn't play) |
| 7 | World State Brief example data uses plain-string prediction options, `reward.fame` and a tag-based `place_state` with a `state` | **Keep the ported Clout City data format** (options `{id, label}`), with `fame` in place of `clout`, and **add** a tag-based `place_state` |
| 8 | Hunts name the Wall of Almost as a cheap step, but it ships in v0.5 | Hunts use Lookout Park as the free step until the Wall ships |

## Where Clout City NYC has moved on since its v2 documents

Hollywood ports **today's** Clout City, not its v2 documents (owner, Oct 17):

- **Chat:** 20 messages a day, plus VIP (unlimited chat: $4.99 a month, $39.99 a year; "chat forever" $119.99), as in NYC.
- **Missed rent:** 2-day grace, moved out after 6 days, as in NYC.
- **Logo:** the neon "Clout City" wordmark (not gold), with a "HOLLYWOOD MUSIC" badge. Gold stays for real money only.
- **Onboarding:** Lola's tour (her head in the corner, a chat bubble per step) in place of the welcome pop-up and five plain tooltips; the five steps keep the Hollywood copy (fame, money, map, phone, Shows).
- **Sign-in:** the in-app email code (it keeps the home-screen app full screen on iOS), plus Google.

## Invited friends are your band

**"Create your band"** (owner, Oct 17) replaces "Invite your Crew": the friends a player invites are their band,
everywhere players see it (the HUD pill, the invite sheet, the home screen, the profile). The side column's Band
button opens the same sheet. Code, types and tables keep the word `crew` (as Clout City NYC kept `clique`).

This takes the word "band" from the hired bandmates of Clarifications §5 and Design C61 to C63 (drums, bass, keys,
Chemistry, from v0.3). They need a new player-facing name before v0.3 (for example "session players"); proposed
for owner approval when v0.3 is built.

## Map

**The contained, illustrated board** (owner, Oct 17, later the same day), as the Concept Note, Clarifications §3
and Design C46 to C49 describe it (Lagos Life style). This reverses the earlier "same map style as Clout City NYC"
decision: no real streets, no MapLibre.

- **A city grid** (owner, Oct 17): Echo Flats is twelve equal blocks on a regular street grid, one building per
  block set back from the street, with Echo Boulevard through the middle. Every name stays invented.
- **The art** is a v0.1 placeholder generated in code (`lib/map/board.ts`, written to `public/map/` by
  `npm run gen:board`); real illustrated art replaces the two files later without code changes.
- **Around the town**: the CLOUTWOOD hill above (original lettering, never the real sign; owner, Oct 19: styled as a
  hillside sign, separate white block letters standing on legs in a row across a tree-covered hill), the Halo Dome on the far
  edge (always lit, locked), and the locked districts under clouds: Starline Boulevard, Neon Row, Canyon Heights,
  the Studio Lot and the Pier District.
- **Later**: decorative vehicles on the roads and the player's marker (C47).

## Songs

**Placeholder tunes for now** (owner, Oct 17): every song, including the story song "Page Fourteen", starts as a
synth placeholder made in code, with a backing and a lead stem, at the song's BPM. Real AI or commissioned
tracks replace them later as content, never code.

## v0.1 includes practice

**v0.1 has at least one place to play the music game** (owner, Oct 17): a free practice stage (the practice amp
at home and an open-mic practice at The Grind) at Open Mic difficulty with a placeholder tune. It follows the
practice rules (Clarifications §4.10): free, unlimited, no Energy, pays nothing. The paid open mic, the
protected tutorial show, fame and the leaderboard stay in v0.2.

## Palette

Never purple (owner rule from Clout City). The sunset sky (`--g-sunset`) starts at deep navy `#16233F`
instead of the Design System Guide's plum `#2B1A4A`; the rest of the gradient is as written.

## Repository

This repository (`cloutcityhollywood`) is the game; Clout City NYC is `project-clout-city`. The Clout City
documents are in `docs/clout-city/` for reference.

## Still missing

- **The Story Quality Brief** (pilot blueprint for "Who Cancelled the Midnight Saints?", its side arcs, the cast
  member "Kiki Moon"). Needed before v0.4.
- **Numbers the documents leave to config:** each venue's ticket price and base fame, rehearsal room fees, day-job
  rates. Proposed when each version is built, for owner approval.
