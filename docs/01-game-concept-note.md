# Clout City: Hollywood Music — Game Concept Note

> Converted from the PDF in `docs/pdf/01-game-concept-note.pdf` (the original). Owner decisions that change this document are in `docs/00-owner-decisions.md` and win over it.

```text
Clout City: Hollywood Music — Game
Concept Note
  ​Oct 17, 2026       · ​@Internovatechnologies

This note explains what Clout City: Hollywood Music is, who it's for and how it plays. It is a
sister game to Clout City: NYC and reuses most of its systems, screens and rules; this
note says what carries over, what changes and what is new. Where it and a spec differ in
detail, the spec wins (section 14).

1. The game
Clout City: Hollywood Music is a mobile-first, browser-based life game where you arrive
in a fictional Hollywood as a nobody with an instrument and chase fame, from a café
open mic to a sold-out stadium. It's Sims-style living crossed with a rhythm game and a
serialized music tabloid. You rent a room, build a band, play shows as a tap-the-notes
performance game, take brand deals, and climb the fame ladder, while a satirical daily
story about the scene unfolds that the whole town follows together.

The fantasy: become the headliner. The welcome screen sets it up: "Welcome to
Hollywood. Every waiter here is in a band. Yours just has to be the one that makes it."

The goal: reach Stadium Status. In P1 that means climbing from open mics to the
neighborhood's biggest theater, growing a fanbase, and calling the twists in the scene's
stories before everyone else. The stadium sits on the edge of the map from day one, lit up
and locked, as the promise of where this ends.

Tagline: "PLAY LOUD. BLOW UP."

2. Who it's for
Core player: university students and early-career young adults who live online, follow
music and celebrity drama, and have at least once believed they could be famous. They
play casual life sims and rhythm games on their phones in short sessions, and binge
serialized stories.

What they want from it: a playful rise-to-fame fantasy, a skill game that feels great under
the thumbs, a reason to come back every day (tomorrow's beat, tonight's show),
something to argue about with friends, and a world that's funny about chasing fame
rather than earnest about it.

Where they are: the setting is Hollywood, but the game is built for players anywhere. As in
Clout City: NYC, a fast city clock cycles day and night every couple of hours so nightlife
and show times work in every time zone, while the real New York calendar keeps everyone
on the same story beat on the same day.

Age: 18+, confirmed at sign-up, because of chat, real-money purchases and the scene's
adult drama.

3. Design pillars
The six Clout City pillars carry over, with fame in place of clout and one new pillar for the
performance game.

 1. The town follows the story together. Everyone sees the same beat on the same day
    and finds out together.
 2. Satire with real mechanics. A gossip narrator and petty music-industry stakes on top
    of real choices about rent, bandmates and which shows to take.
 3. Fame is the scoreboard, and the key. Every system feeds fame. Unlike clout in NYC,
     fame also unlocks bigger venues: it's how you climb.
 4. Shows must feel great. The performance game is the heart of the loop. Tight timing,
    readable notes and a crowd that reacts come before any other feature.
 5. Short sessions, daily return. A song is about 2 minutes, a beat is a 10-second read, and
     something new waits every day.
 6. Real money is always marked, never a shortcut. Real money is written $ with a gold
     border and the            ✨
                       REAL CASH tag; virtual cash is C$ and can never be bought. Money
     never buys a better score, an easier song, a venue unlock or a guessing edge.

What it is not
     Not a real map. The town is one compact, hand-illustrated 2D map, not real streets.
     Not a music library. Every song is original or royalty-free. No real songs, artists, labels
     or venues.
     Not pay-to-win. No score boosts, no continues, no song skips, no buying fans.
     Not a stranger-chat app. Chat keeps Clout City's 10-a-day cap, filter, block, report and
     review queue.
     Not grim. The scene's drama (breakups, shady lawyers, an obsessive fan) stays
     satirical and off-screen where it's serious.

4. How it plays
The game works at three timescales: a first session that ends with your first show, a short
daily session, and the long climb up the fame ladder.

First session (about 10 minutes)
 1. Open a link and land on the Echo Flats map as a guest; pan around and see the stadium
     glowing, locked, on the edge of town.
 2. Tap anything and sign up.
 3. Create your artist in four steps: Look (name and avatar, as in Clout City), Sound (pick
    an instrument, one of eight starting scenes such as Garage Rocker or Bedroom Pop,
     and a band name), Birth lottery (roll starting cash), Home (choose a room in Echo Flats
     and move in).
 4. A satirical welcome and a five-tooltip tour of fame, money, the map, the phone and
     shows.
 5. First task: open mic night. The café's open mic is "happening now." You play one short
    song in the performance game, with a built-in tutorial. Whatever your score, you earn
     your first fans, fame and tips, and land on the leaderboard.
 6. Invite friends, add the game to your home screen, and meet the scene's current story.

Daily session (5 to 15 minutes)
     Read today's story beat in the News app and vote in any open prediction.
     Play today's shows: each venue you've unlocked offers one paid show per day.
     Work through five daily tasks: shows, visits, practice, story tasks.
     Work a day job or take a brand deal for cash, eat to refill Energy, rehearse with your
     band, shop for gear and outfits.
     Pay rent and your band, check the leaderboard, message friends.

Long term: the fame ladder
Fame unlocks venues. Each tier is a bigger room, a harder version of the songs and a
bigger payday.

 Tier                 Fame             Venue (Echo Flats)        Capacity Difficulty            In P1
                      needed

 Nobody               0                The Grind café open mic   40        Open Mic: 3 lanes,   Yes
                                                                           taps and holds

 Local Act            500              The Rusty Amp dive bar    120       Bar: 4 lanes         Yes

 Tier                 Fame             Venue (Echo Flats)           Capacity Difficulty          In P1
                      needed

 Buzzing              2,500            The Basement club            400       Club: chords and   Yes
                                                                              power strums

 Headliner            10,000           The Marquee theater          1,500     Theater: faster,   Yes
                                                                              crowd calls

 Star                 40,000           The Echo Bowl amphitheater   12,000    Arena              Later
                                       (another district)

 Stadium              150,000          The Halo Dome stadium        60,000    Stadium            Later (visible,
 Status                                                                                          locked)

Thresholds, capacities and pay live in config. Along the way players grow a fanbase, hire
and keep bandmates, upgrade their room and gear, follow each weekly story to its finale,
and collect hunt cards, postcards and badges.

5. The world
P1 is one neighborhood, Echo Flats, on a compact hand-illustrated map of a fictional
Hollywood, in the style of Lagos Life rather than Clout City's real-street map of Queens.

     One contained map, not real geography. The whole town is a single illustrated board
     you can see almost entirely at one zoom: chunky buildings drawn as illustrated sprites,
     palm-lined roads, hills, and day and night versions. It's a stylized Hollywood that players
     recognize by its signs and silhouettes, not its street grid.
     Echo Flats first. A scrappy, artsy neighborhood of rented rooms, cafés, dive bars and
     one great old theater, about 16 places close together so trips are short and cheap.
     The rest of town is locked. Around Echo Flats sit districts shown under drifting clouds
     with "Locked: Coming soon": Starline Boulevard (walk of stars and theaters), Neon Row
     (the club strip), Canyon Heights (mansions), the Studio Lot (labels and studios) and
     the Pier District. The Halo Dome stadium sits on its own lot at the far edge, always lit,
     always visible: the goal.
     The hillside sign. Above the town, giant white letters on the hill spell CLOUTWOOD. It's
     the game's own landmark (never the real sign or its lettering), a monument players can
     visit, pose at and collect as a postcard.
     Places follow Clout City's rules: each has a card with an illustration, lore and actions, a
     price and a reward, a once-a-day fame cooldown, and can be changed by stories.
     Performance venues add show slots; dining restores Energy in three tiers.
     People: a recurring cast of invented music-scene characters (a shady entertainment
     lawyer, a club booker, a band that keeps almost breaking up) and NPCs who gossip
     about the current story. The narrator is Lola Lowdown, who has moved west:

     "Hollywood's most reliable unreliable source."
     Two clocks, unchanged from Clout City: a fast city clock (a day every 2 hours) for day,
     night and show times, and the real New York calendar for stories, resets, bills and
     anything that pays out.
     Look and feel: Hollywood after dark: dark glass over a sunset-to-night map, marquee
     lights, neon, red main buttons, spotlight-yellow accents and gold kept for marking real
     money (Design System Guide).

6. Shows: the performance game
Every show is a short rhythm game played on a note highway, built from the mechanics in
the reference videos and redesigned for thumbs on a phone. Full rules are in Clarifications
section 5; the screen is in the Design System Guide.

What we take from each reference (mechanics only, never their look, names or songs)

  Reference                                       Mechanic we use                 How it adapts to mobile

  Guitar Hero (fret                               Notes scroll down lanes to a    4 thumb lanes (3 at open mics)
  highway)                                        hit line; sustains, chords,     instead of 5 frets; tap, hold and
                                                  streak multiplier, a power      two-lane chords
                                                  meter you trigger, a crowd
                                                  meter that can boo you off

  DJ Hero (3-lane                                 Few, wide lanes; scratch        Scratches become swipe
  turntable)                                      notes; hit-streak callouts      notes ("power strums"); the DJ
                                                                                  instrument and crossfades
                                                                                  come later

  PaRappa the Rapper                              A teacher plays a phrase, you   "Crowd call" sections in harder
  (call and response)                             repeat it; a live rating that   songs, and the bandmate
                                                  rises and falls                 rehearsal mini-game at the
                                                                                  studio

How a show plays

 1. Pick a song from your setlist at a venue you've unlocked; the venue sets the difficulty.
 2. Notes slide down the lanes; tap, hold or swipe as each crosses the hit line. Timing
     grades are Perfect, Great, Good or Miss.
 3. Hit streaks raise your multiplier (up to ×4). Glowing Hype phrases fill the Hype meter;
     trigger it to double the multiplier while the stage lights go wild.
 4. The Crowd meter reads the room live (Losing It, Into It, Restless, Booing). Empty it and
    you're booed off: the show ends early with partial pay and a Lola roast.

 5. At the end: a star rating (1 to 5), accuracy, best streak, fans gained, fame and cash.

Songs. P1 ships 6 original songs (about 2 minutes each), each charted at the four P1
difficulties: for example "Rent's Due (Again)," "Opening Act Forever" and "My Ex Started a
Podcast." Story beats can add a limited-time song (a diss track, a breakup ballad).

Fair by design. Practice is free and unlimited at home. Gear and outfits never change
timing or scoring. Real money can never buy a continue, a skip, an easier chart or extra
Hype.

7. Band, fame and fans
     Fame is the score (a star in the HUD, where NYC had the clout flame). It feeds the
     leaderboard and unlocks venue tiers.
     Fans are your audience, shown on your profile. Shows add fans by venue size and star
     rating; fans raise your door share and qualify you for brand deals.
     The band. You start solo. From Local Act on, you can hire up to three NPC bandmates
     (drums, bass, keys) from the Musicians Wanted board. Each has a one-line personality,
     a weekly fee and Chemistry (0 to 100). Rehearsals and good shows raise it; missed pay
     and bad shows lower it. Below 20, a bandmate may quit, which becomes news. The
     Basement and up need at least two bandmates.
     Stats: Energy, Mood and Confidence, as in Clout City. Shows, visits and work spend
     Energy; meals restore it; Mood and Confidence scale fame gains.

8. Systems at a glance
Every P1 system, where it comes from, and which spec owns it.

  System                              What it does           From Clout City       Owning spec

  Fame and                            Score in the HUD;      Reused (clout         Clarifications
  leaderboard                         unlocks venue tiers    renamed); now gates
                                                             venues

  Shows                               Rhythm game at         New                   Clarifications,
  (performance                        venues; pays fans,                           Design Guide
  game)                               fame, cash

  Fans                                Audience size; door    New                   Clarifications
                                      share and brand-deal
                                      gate

  System                              What it does                From Clout City      Owning spec

  Band and                            Hire, pay, rehearse and     New                  Clarifications
  Chemistry                           keep up to 3
                                      bandmates

  Bank balance (C$)                   Virtual cash; never         Reused               Clarifications
                                      bought

  Net worth and Net                   Cash plus items; sell at    Reused               Clarifications
  Worth screen                        60%

  Stats                               Energy, Mood,               Reused               Clarifications
                                      Confidence

  Daily tasks, goals,                 Five tasks a day;           Reused, re-themed    Clarifications, New
  hunts                               weekly hunt per                                  Features Spec
                                      starting scene

  Places                              Cards, lore, actions,       Reused, Echo Flats   Clarifications
                                      cooldowns, dining tiers     set

  Day jobs and brand                  Shifts for cash; deals in   Reused (gigs re-     Clarifications
  deals                               three tiers gated by        themed)
                                      fans

  Events                              Club nights (C$), free      Reused               Clarifications
                                      story events, exclusive
                                      events (real money)

  Shop                                Fashion, Instruments,       Reused plus music    Clarifications
                                      Gear, Rides, Homes,         categories
                                      Luxury

  Bills                               Weekly rent, phone,         Reused plus band     Clarifications
                                      band pay                    pay

  Stories                             Daily beats,                Reused               World State, Story
                                      predictions, world                               Quality briefs
                                      effects, side arcs

  Crew, chat,                         Invites, 10-a-day chat,     Reused               Clarifications
  crushes                             date nights

  UI                                  Every screen and            Reused plus          Design Guide
                                      component                   performance
                                                                  components

9. Money
The same four real-money products as Clout City, one-time Stripe Checkout payments, no
premium currency.

  Product                              Hollywood version                               Fame

  Exclusive events                     Listening parties, award-show afterparties, a   Yes, diminishing
                                       superstar's secret show                         returns

  Story side arcs                      $2.99 each: perspective, evidence or insider    None
                                       takes

  Collector items                      A few rare instruments and stage outfits,       Yes, diminishing
                                       found in the Shop, never promoted               returns

  Monument                             $0.99 each, after visiting (the CLOUTWOOD       None
  postcards                            sign, the Wall of Almost)

Rules that don't bend: C$ can never be bought; real money is always marked; money
never affects the performance game, venue unlocks, fans or predictions; a refund revokes
the purchase and its fame. Songs are never sold in P1.

10. Stories
Stories work exactly as in Clout City: serialized, satirical, shared by the whole town,
delivered through the World State layer. What changes is the drama, which follows the life
of a rising music star.

     Format: 6 to 10 beats, one per real day, read in the News app, each ending on a
     cliffhanger, narrated by Lola Lowdown.
     Play, not just read: 2 to 3 predictions per story, story tasks (go to a venue, play the
     story song, open an evidence card), NPC gossip, and visible changes to the town: a
     show cancelled, a club packed with fans, a diss track added to every setlist for a week.
     The drama: early-career struggle, band breakups, dating drama, shady lawyers and
     predatory contracts, cancelled shows, an obsessive superfan, sudden viral fame and
     its backlash. Serious subjects stay off-screen and satirical (Story Quality Brief).
     Fair to free players: every mystery is solvable for free; $2.99 side arcs add perspective,
     evidence and insider color but never help anyone guess.
     First story: "Who Cancelled the Midnight Saints?", a 10-day Echo Flats mystery: the
     neighborhood's hottest band has its Marquee headline show cancelled the night
     before a label exec comes to sign them. A lighter dating comedy follows, and Lola
     writes a weekly dating column. After the pilot, a new story starts every Sunday.

11. Social and growth
Reused from Clout City almost unchanged.

     The crew: each friend who signs up pays fame to the inviter; a crew of five earns a big
     bonus. A friend can be brought to your first open mic as your "plus-one in the crowd."
     Shared talk: live poll results, the reveal card, and a shareable show result card ("4 stars
     at The Rusty Amp. 37 new fans.").
     Leaderboard: fame for Echo Flats and your crew; profiles show fame, rank, fans and net
     worth publicly.
     Chat, crushes and date nights: as in Clout City, with one addition: a date night can be
     "come to my show," where your date attends a venue the same day you play it.
     Return triggers: the daily beat, the daily task reset, today's show slots, prediction
     close times, and rent and band pay coming due.

12. Success metrics
Headline: first show completed; crew invite sent; day-1 return of 35 to 40% (stretch goal:
50%).

Performance health: shows per player per day, songs finished versus booed off, average
stars by difficulty, practice sessions, and drop-off at each venue tier.

Story and money: beat opens, prediction participation, side-arc and exclusive-event
purchases, return rate during an arc.

13. Roadmap and decisions
Everything below is after P1 and must not be built now.

  Area                      Later ideas

  Districts                 Starline Boulevard, Neon Row, Canyon Heights, the
                            Studio Lot, the Pier District; the Echo Bowl
                            amphitheater and the Halo Dome stadium

  Instruments               DJ (turntable lanes, scratches, crossfades), Vocals
                            (call-and-response), Drums

  Music career              Record and release singles, daily streaming
                            royalties, music videos, tours, a record label deal,
                            an agent

  Area                      Later ideas

  Social                    Player bands (friends as bandmates), battle of the
                            bands, co-op shows, players in the same crowd

  Content                   New song packs (earned, never sold), seasonal
                            events (award season, festival weekend)

  Money                     A seasonal pass, purchases at venues (merch
                            tables)

Decided for P1: 18+; one neighborhood (Echo Flats) with about 16 places; four
performance venues and six original songs, the first four made with an AI music tool; fame
gates venues; fans gate brand deals; Guitar and Keys are the P1 instruments, sharing one
chart format; NPC bandmates only; stack Next.js, Supabase, Stripe and Vercel, as in Clout
City, with the Web Audio API for the performance game.

14. Document map and precedence
Read this note first, then the document that owns the area you're working on. Each
Hollywood Music document is a delta on its Clout City counterpart, so keep the Clout
City docs in the repo for reference. When two documents disagree, the owner below
wins; flag the disagreement rather than choosing silently.

  Document                                  Owns                  Read it for

  Game Concept Note                         The why and the big   Orientation, the fame ladder, roadmap,
  (this)                                    picture               decisions

  Clarifications &                          Game rules and P1     Onboarding, HUD, places, the
  Updates                                   scope                 performance game, band, economy,
                                                                  events

  World State Layer                         Engine behavior       Arcs, effects (including show slots and
  Brief                                                           story songs), predictions, entitlements

  Design System Guide                       UI                    Token changes, the illustrated map, the
                                                                  show screen, components C46 to C65

  Story Quality Brief                       Content rules         Writing and checking every story; the
                                                                  pilot blueprint

  Milestones and                            What ships when       Versions v0.1 to v1.0, song and place
  Versions                                                        rollout

  Document                                  Owns                  Read it for

  New Features Spec                         Supporting features   Hunts, Story Studio, News, cast and
                                                                  NPCs, the AI song pipeline, later
                                                                  features
```
