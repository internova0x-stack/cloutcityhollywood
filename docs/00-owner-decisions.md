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

## Map

**Same map style as Clout City NYC** (owner, Oct 17), not the hand-illustrated board in the Concept Note,
Clarifications §3 and Design C46 to C49: real streets on MapLibre, 3D landmark models for places, day and
night themes, moving traffic, and locked districts shaded over.

- **Echo Flats** sits on the real streets of Echo Park and Silver Lake, Los Angeles. Every place name stays invented.
- **The Halo Dome**: an original dome on its own lot in the Elysian Park hills, always lit, locked. It doesn't copy the real stadium there.
- **The CLOUTWOOD letters**: on an Elysian Park hillside facing the town. Never Mount Lee or the real sign's lettering.
- **Locked districts**: Starline Boulevard (Hollywood Boulevard), Neon Row (the Sunset Strip), Canyon Heights
  (the Hollywood Hills), the Studio Lot (Burbank), the Pier District (the beach towns).

## Songs

**Placeholder tunes for now** (owner, Oct 17): every song, including the story song "Page Fourteen", starts as a
synth placeholder made in code, with a backing and a lead stem, at the song's BPM. Real AI or commissioned
tracks replace them later as content, never code.

## Repository

This repository (`cloutcityhollywood`) is the game; Clout City NYC is `project-clout-city`. The Clout City
documents are in `docs/clout-city/` for reference.

## Still missing

- **The Story Quality Brief** (pilot blueprint for "Who Cancelled the Midnight Saints?", its side arcs, the cast
  member "Kiki Moon"). Needed before v0.4.
- **Numbers the documents leave to config:** each venue's ticket price and base fame, rehearsal room fees, day-job
  rates. Proposed when each version is built, for owner approval.
