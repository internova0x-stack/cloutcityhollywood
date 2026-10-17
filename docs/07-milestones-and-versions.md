# Clout City: Hollywood Music — Milestones and Versions (v1)

> Converted from the PDF in `docs/pdf/07-milestones-and-versions.pdf` (the original). Owner decisions that change this document are in `docs/00-owner-decisions.md` and win over it.

```text
Clout City: Hollywood Music — Milestones
and Versions (v1)
  ​Oct 17, 2026        · ​@Internovatechnologies

This document splits the Hollywood Music build into versions that each go live on their
own, starting with a 24-hour teaser. The other documents define the full game; this one
decides what ships when. The biggest difference from Clout City's plan: the performance
game is the riskiest piece, so it gets proven on a cheap Android phone in the first week,
before anything is built on top of it.

Rules every version follows (unchanged from Clout City)

 1. Every version is live and usable at the real web address, on a low-end Android phone;
    unfinished features show a witty "Coming soon" card.
 2. Player data is built properly from day one; only visuals and placeholder content may
    be temporary.
 3. Rules come from the documents. If a version needs a rule to change, the document
    changes first.
 4. Nothing is promised that isn't built.
 5. One version at a time. Done means tested on your phone and merged.

Version overview
Seven versions, about 9 to 12 weeks to launch. Reuse is the main speed-up: port Clout
City's modules (auth, profiles, invites, HUD shell, Shop, Net Worth, bills, World State,
Stripe, chat, Story Studio) rather than rebuilding them.

  Version            Name                            What players get                                   Time

  v0.1               Tap In                          Browse Echo Flats, sign up, make an artist, see    24 hours
                                                     their home, invite friends

  v0.1.5             Lab                             A hidden test page: one song on the note           2 to 3 days
                                                     highway, with calibration (not public)

  v0.2               First Show                      The full performance game at Open Mic and          1.5 to 2
                                                     Bar, the tutorial, the first open mic, fame, the   weeks
                                                     leaderboard

  Version            Name                            What players get                                     Time

  v0.3               Echo Flats                      The neighborhood, The Rusty Amp and The              2 weeks
                                                     Basement, the band, the economy, three more
                                                     songs, hunts

  v0.4               Stories                         The News app and the pilot (loaded, not              1.5 to 2
                                                     started), The Marquee and crowd calls, the           weeks
                                                     last two songs, city news

  v0.5               Money and                       Real-money purchases, monuments and                  1 to 2 weeks
                     Social                          postcards, chat, crushes, date nights

  v1.0               Launch                          Real art, security and legal review, soft launch,    1 to 2 weeks
                                                     then the pilot

Song rollout
The first four songs are produced with an AI music tool whose terms grant full commercial
rights, through the song pipeline (New Features Spec section 7). Songs 5 and 6 are still
open: AI or commissioned, decided before v0.4.

  Song                                                          Made        Needed for                       Ships
                                                                by                                           with

  A placeholder loop (not shipped to                            AI          Building and testing the         v0.1.5
  players)                                                                  engine

  1. Open Mic Night (Be Nice)                                   AI          The tutorial and first open      v0.2
                                                                            mic

  2. Rent's Due (Again)                                         AI          Second starting song             v0.2

  3. My Ex Started a Podcast                                    AI          Local Act unlock                 v0.3

  4. Echo Flats, 3 AM                                           AI          Rusty Amp goal                   v0.3

  5. Opening Act Forever                                        Open        Buzzing unlock                   v0.4

  6. Overnight Sensation (Ten Years                             Open        Headliner unlock                 v0.4
  Later)

  Page Fourteen (story song)                                    Open        The pilot                        v0.4

Each song needs its stems (backing and lead) and four charts. Charts for songs 1 and 2
need only Open Mic and Bar in v0.2; their Club and Theater charts arrive with those
venues.

Place rollout
The 19 places arrive in three waves so each version needs art only for what it uses.

  Wave           Ships                 Places                                         New templates
                 with

  1              v0.2                  The three homes, The Grind                     Apartment, café, stage

  2              v0.3                  The Rusty Amp, The Basement, Riff & Ruin,      Store, studio (stage
                                       Echo Room Studios, El Cometa, Starlite         reused)
                                       Diner, Vantage rooftop, Fresh Flats Market,
                                       Hotel Valencia valet, Backlot 9, Lookout
                                       Park

  3              v0.4 to               The Marquee and Echo Flats Precinct            Landmark plaza
                 v0.5                  (v0.4); the CLOUTWOOD sign and the Wall
                                       of Almost (v0.5)

Unbuilt places don't appear on the map except as v0.1's pins; adding a place is data and
art, never code; daily tasks draw only from places that exist.

v0.1 "Tap In" (24 hours)
An early-access teaser: claim your artist name, see yourself at home, recruit your crew
before the town opens.

  Feature                       What it does                                 Spec

  Guest map                     The illustrated Echo Flats map (one          Clarifications 3; Design Guide
                                placeholder illustration is fine), pan       C46 to C49
                                and two zooms, pins for The Grind, The
                                Rusty Amp, The Basement, The
                                Marquee and the homes, locked
                                districts under clouds, the Halo Dome
                                lit. Any tap opens sign-up

  Sign-up                       Email magic link, 18+ checkbox, terms        Clarifications 1
                                and privacy links

  Invite capture                The invite code survives sign-up             Clout City Clarifications 7

  Mini creator                  Name, the Look options, a scene chip         Clarifications 1
                                and an instrument choice; the avatar
                                updates instantly

  Feature                       What it does                            Spec

  Home screen                   HUD, side column, stats panel, nav.     Clarifications 2
                                Home and Map work; everything else
                                shows "Coming soon." Fame and
                                money show "—"

  3D artist at                  The ported Clout City 3D character in   Clout City Design Guide C38
  home                          one room, idle animation

  Invite screen                 Personal link, share button, "2 of 5    Clout City Clarifications 7
                                joined," "Rewards unlock when the
                                town opens"

  Legal pages                   Basic terms and privacy, marked for     —
                                lawyer review

Not in v0.1: shows, the performance game, fame, the economy, stories, payments, chat,
music.

24-hour plan: hours 0 to 2 you set up the repo (with these docs, the Clout City docs for
reference, and CLAUDE.md), Vercel and Supabase, and generate the map and room
images; hours 2 to 18 Claude Code ports auth, profiles, invites and the HUD shell, then
builds the map, creator and home; hours 18 to 24 invite screen, legal pages, phone testing
and launch.

You test: a fresh browser lands on the map; tapping anything opens sign-up and the 18+
box is required; the magic link works; a friend's sign-up shows in your crew count; creator
choices update the avatar instantly; nothing is blank or broken on a cheap Android phone.

v0.1.5 "Lab" (2 to 3 days, not public)
A hidden page ( /lab , admin only) that proves the performance game before anything
depends on it.

     The note highway at Open Mic and Bar with one AI placeholder loop and a hand-made
     chart.
     Tap and hold notes, timing grades, the multiplier, the Crowd meter, and a bare results
     screen.
     Calibration (C64) with the saved per-device offset.
     A debug overlay: frame rate, measured audio latency, and each hit's timing error in ms.

You test, on your phone and a low-end Android phone: notes stay in sync with the music
for a whole song; taps feel on time after calibration; at least 50 fps; switching tabs pauses
and resumes cleanly. If timing feels off on Android, fix it here; nothing else starts until it

feels good.

v0.2 "First Show" (1.5 to 2 weeks)
The complete first session: link → creator → tutorial → first open mic → leaderboard.

     The rest of the creator: the Sound step (instrument, scene, band name), Birth lottery
     (C$4,000 to C$8,000 plus a starter instrument) and Home (three rooms).
     Welcome and five tooltips; the protected first open mic with the tutorial song;
     calibration right after.
     The performance game at Open Mic and Bar (C50 to C57 minus crowd calls): taps,
     holds, Hype notes and the Hype button, streaks, callouts, the Crowd meter and booed-
     off state, results and stars. Practice at home.
     Songs 1 and 2 (AI), with Open Mic and Bar charts, through the song pipeline.
     Wave 1 places: the homes and The Grind with its stage scene (C59) and show row
     (C58); one paid show per venue per day.
     Fame, fans, the leaderboard (Echo Flats and Crew), invite rewards paid retroactively
     for v0.1 invites, Google sign-in, the PWA prompt, background music and show audio
     settings.

Players from v0.1 finish the Sound, Birth lottery and Home steps on their next visit, then
get the tutorial; name, look and crew carry over.

You test: a friend with no help goes from link to a finished open mic and the leaderboard;
songs stay in sync on a cheap Android phone; a bad performance at Open Mic never boos
you off; one paid show per day is enforced and practice is unlimited.

v0.3 "Echo Flats" (2 weeks)
Echo Flats becomes a place to live and climb: the full daily loop of shows, work, band and
spending.

     The location system from data, with wave 2 places (11) and their cards, lore and
     actions; placeholder art is fine.
     The Rusty Amp (Bar) and The Basement (Club) with fame-tier gates; Club difficulty
     adds chords and power strums; Club charts for songs 1 and 2.
     Songs 3 and 4 (AI) with Open Mic, Bar and Club charts; song unlocks by fame tier and
     goals.
     The band: the Musicians Wanted board, hiring, weekly band pay, Chemistry, rehearsal
     (the call-and-response mini-game, C56 and C63), quitting and letting go; The
     Basement's two-bandmate requirement; bandmates on stage.

     The economy: Energy, Mood and Confidence rules; dining in three tiers; groceries and
     home cooking; day jobs; the Deals app with three tiers gated by fans; daily tasks paying
     cash; fame cooldowns; club nights.
     The Shop (six categories, cosmetic instruments and gear, Instrument tab in Your Look),
     Net Worth with 60% selling, weekly bills with band pay, missed-rent rules.
     Travel (Go there, four modes, skippable trip view), the two clocks, decorative vehicles.
     Treasure hunts, simplified: eight scene tracks through the Hunt tab and "Ask around,"
     reviewed in the Story Studio (hunt review screen).

You test: a week of play with time travel. Rent and one bandmate are affordable from
shows and jobs; reaching Buzzing feels earned but not grindy; a bandmate left unpaid
actually quits; Club charts feel fair on a phone; no daily task is ever impossible. Tune
venue fees, fan rates and deal multipliers with the economy spreadsheet.

v0.4 "Stories" (1.5 to 2 weeks)
The story system and the top of the P1 ladder. The pilot is loaded and tested but not
started.

     The World State layer ported from Clout City, plus show_slot and song_injection
     (World State brief).
     The News app with beat cards, "Previously," catch-up, the archive and shadow
     guesses; predictions with live results, rewards and badges.
     "Who Cancelled the Midnight Saints?" and its three side arcs as data (side arcs
     unlock in v0.5); wave 3 places The Marquee and Echo Flats Precinct; the story song
     "Page Fourteen."
     The Marquee (Theater) with crowd calls in the performance game; Theater charts for
     every song.
     Songs 5 and 6 through the song pipeline.
     The Story Studio grows story review (both gates, editor-pass report, scheduling,
     preview with time travel, pause and retire), song review, news review and the chat
     report queue.
     City news, the recurring cast and NPC lines at places (New Features Spec); hunts
     move onto the World State layer with NPC clues and riff challenges.
     The validation script, time travel and debug panel.

You test: step through all 10 days with time travel: every beat, effect, cancelled slot,
injected song, chatter phase and prediction fires on the right day; P1 closes before Day 7;
the pop-up show spawns at The Rusty Amp; "Page Fourteen" appears in setlists on Day 7
and stays for players who played it; nothing changes how a show is scored.

v0.5 "Money and Social" (1 to 2 weeks)
Real money and player-to-player features, in Stripe test mode until v1.0. Mostly ported
from Clout City.

     One Stripe Checkout flow for exclusive events ($3.99), collector instruments and
     outfits, the pilot's three side arcs ($2.99) and monument postcards ($0.99);
     entitlements by SKU; refunds with fame clawback.
     Monuments: the CLOUTWOOD sign lookout and the Wall of Almost as full locations
     with the landmark plaza, NPCs, activities and postcards; the Collection with the new
     Show cards tab.
     Chat (10 a day, filter, block, report), then crushes, crush invites and date nights,
     including "Come to my show."
     The show share card (C65) and analytics for the success metrics (first show, invites,
     day-1 return, shows per day, finish rate, beat opens, predictions, purchases).

You test: each product's test purchase unlocks it, a replayed payment doesn't duplicate it,
a refund removes it and its fame; a chat report reaches the Story Studio queue; a "Come
to my show" date pays only after both players have done their part.

v1.0 "Launch" (1 to 2 weeks, then the soft launch)
     Real art for the map (day and night), every place, the stage scenes, avatar instruments
     and stage sprites, album tiles, postcards, logo and icon.
     Final audio for all six songs, mastered to the same loudness, and a final timing pass on
     every chart.
     Performance work for low-end Android, especially shows.
     Reviews: security (including the Story Studio's admin-only access), lawyer-reviewed
     terms, privacy and 18+ wording, name checks for every place and the CLOUTWOOD
     sign, and a check of the AI music tool's license for every AI song. Stripe live mode
     confirmed with one real $0.99 purchase and refund.

Then, in order: soft launch to 20 to 50 people for 1 to 2 weeks, tuning the economy and
chart difficulty from real play; approve the next, lighter story ("Who's Vexa's Plus-One?");
set the pilot's start to a Sunday in the Story Studio and plan the push around Day 1.

Running versions in Claude Code
Save this as docs/07-milestones-and-versions.md in the hollywood-music repository,
with the other Hollywood Music docs and the Clout City docs in docs/clout-city/ for
reference. Add a "Current version" line to CLAUDE.md.

To start a version, open a session at claude.ai/code on the repo and send:

   Read CLAUDE.md and docs/07-milestones-and-versions.md. We're building
   [version and name].
   Where a feature exists in Clout City, port it and change only what the
   Hollywood docs change.
   Build only what's in that version's scope; anything else gets a "Coming soon"
   card.
   First, list the steps you'll take, in plain language, and wait for my OK.
   After each step, open a pull request with its Vercel preview link and what to
   test on my phone.

To ship it: test every item on your phone and a low-end Android phone, merge, ask Claude
Code for plain-language release notes, update "Current version," then start the next. If a
version runs long, move scope from the bottom of its list to the next version; never skip
the timing tests.
```
