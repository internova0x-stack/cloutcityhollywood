# Clout City: Hollywood Music — World State Layer Brief (v1)

> Converted from the PDF in `docs/pdf/03-world-state-layer-brief-v1.pdf` (the original). Owner decisions that change this document are in `docs/00-owner-decisions.md` and win over it.

```text
Clout City: Hollywood Music — World State
Layer Brief (v1)
  ​Oct 17, 2026        · ​@Internovatechnologies

1. Context
The World State layer is the same day-one system as in Clout City: NYC. Every story beat
writes to it and every game system reads from it. Port Clout City's World State module
as-is; this brief lists what changes for Hollywood Music and adds the music-specific
effects, tags and protected systems.

Clout City: Hollywood Music is a satirical music-career life game: a player arrives in Echo
Flats, plays shows as a rhythm game, builds a band, grows fame and fans, and climbs from
a café open mic toward a stadium. Stories are the main retention driver, and the town
should react to them: NPCs gossip, shows get cancelled, venues pack with fans, a diss
track turns up in everyone's setlist.

The first story is "Who Cancelled the Midnight Saints?": a 10-beat Echo Flats mystery
with three predictions and three premium side arcs. It is the layer's acceptance test. The
schema must support every future arc, so nothing is shaped around this one story.

First step: inspect the Hollywood Music repo and the ported Clout City modules, and
report where each system integrates before building. Stack: Next.js, Supabase, Stripe and
Vercel.

Related documents: Clarifications & Updates (rules and P1 scope), Story Quality Brief
(content rules), Design System Guide (UI), New Features Spec (hunts, news, Story Studio,
song pipeline).

2. Principles
All eight Clout City principles hold, with fame in place of clout.

 1. Data-driven: arcs, beats, predictions, effects, chatter, story tasks and story songs live
     in data files.
 2. Derived, not mutated: global world state is a pure function of (arc definitions, world
    clock). Only per-player progress is stored.
 3. Tag-based targeting: places, venues, show slots, events, shop items, songs, tasks and
    NPC types carry tags ( the_marquee , venue , rusty_amp , instruments , story_song ).
     Effects target tags, optionally scoped to a district.

 4. Expiring effects: every effect ends by expiry or a later beat.
 5. Fail-safe defaults: anything missing or unmatched behaves as if there were no world
    state.
 6. Progression-safe: effects never block protected systems (section 7).
 7. Explainable: every changed price, closure or cancelled show returns reason text for
    the reason banner ("Show cancelled: venue double-booked").
 8. Rewards come from base values, and skill is untouchable: price effects change only
    what a player pays; nothing in this layer changes how a show is scored, its stars, or the
     fans and fame it pays.

3. Data model
The arc, beat and prediction objects are unchanged from Clout City (fields id , title ,
type main / side / hunt, parent_arc_id , tier , sku , status , start_at ,
 start_weekday , district_scope (was borough_scope ), teaser , answer_key ,
 beats[] ; beats with day , status , visible_at , effective_at , news[] , effects[] ,
 story_tasks[] , prediction , requires , points_at_answer ; predictions with
 closes_at , reveal_beat , correct , reward , changeable ).

Effect types
The seven Clout City effect types stay; two music effects are added.

  Type                                       Purpose                             Midnight Saints example

   price_multiplier                          Changes a price by tag;             "Watch a show" at The Rusty
                                              applies_to : visit_price           Amp ×1.5, Days 2 to 5
                                             (including "Watch a show"),
                                              event_entry , shop_price or
                                              rehearsal_fee

   availability                              Close, restrict, cancel or open     The Marquee restricted to
                                             entities by tag, with reason text   "lobby only" on Day 1

   chatter_topic                             Activates a gossip topic and        midnight-saints , phase early
                                             phase

   task_injection                            Adds or removes story tasks or      story:midnight-saints:watch-
                                             story deals                         the-popup

   place_state                               Changes how a place looks, or       A fan protest outside The
                                             spawns a place or event             Marquee; a free pop-up show at
                                                                                 The Rusty Amp

  Type                                       Purpose                            Midnight Saints example

   flag                                      Sets a world flag for requires     saints-solved

   reward_modifier                           Adjusts fame for tagged tasks;     —
                                             never purchases, side arcs or
                                             shows

   show_slot (new)                           Cancels, adds or delays a          The Marquee's slot cancelled on
                                             venue's player show slot for a     Day 7: "Show cancelled: venue
                                             day, with reason text. A           double-booked"
                                             cancelled slot is never the
                                             player's only paid venue that
                                             day (validation)

   song_injection                            Adds a story song to every         "Page Fourteen" playable at Bar
  (new)                                      eligible player's setlist for a    and Club, Days 7 to 10
                                             window, at the venues and
                                             difficulties listed; players who
                                             play it in the window keep it

Story songs
A story song is a normal song record (audio stems, one chart per difficulty, tags including
 story_song and the arc id) produced through the song pipeline (New Features Spec). It
is only listed while a song_injection is active. It pays like any song; it never changes
scoring.

State
World state (computed): world time, active arcs, active effects, flags, open and closed
predictions, injected songs, cancelled or added show slots.

Player state (stored): beats seen, story tasks done, votes, shadow guesses, hunt
progress, badges, entitlements, and kept story songs.

4. Query API and resolution rules
All Clout City functions stay ( getModifiers , isAvailable , getPrice , getFame (was
 getClout ), getChatter , getStoryTasks , getNewsFeed , getPredictions ,
 hasEntitlement ). Two are added.

  Function                                                   Returns

   getShowSlot(venue, player, day)                           {open, opens_at, reason} : the player's paid slot
                                                             at that venue today, after any show_slot effect

   getSetlist(player, venue)                                 The songs this player can play at this venue's
                                                             difficulty: unlocked songs, kept story songs, and
                                                             any song injected right now

Stacking rules are unchanged (highest price multiplier, capped at 2×; closures override; at
most 2 chatter topics; protected systems ignored; paused arcs contribute nothing), plus:
a show_slot cancel overrides an add on the same venue and day.

5. Story timing
Unchanged from Clout City: one story day equals one real New York calendar day on a
server-authoritative clock; main arcs of 6 to 10 beats; never two finales on one day;
 start_weekday (Sunday for the pilot); late joiners read every released beat and vote in
open predictions; finished arcs move to the archive with shadow guesses; the pilot's start
is set manually in the Story Studio; pause and retire are data edits. The time-travel control
and debug panel are required, and the debug panel adds injected songs and show-slot
changes.

6. NPC chatter
Unchanged structure: four phases (early, mid, late, post), 2 to 3 lines per NPC type per
topic per phase, generic fallback, no answer-hinting line before its prediction closes.
Hollywood NPC types: barista, bartender, sound guy, bouncer, valet, guitar-shop clerk,
busker, rideshare driver, film extra.

7. Story tasks, places and progression safety
Story tasks are tagged story:<arc_id>:<task> , earn fame and can count toward daily
tasks. Allowed actions: visit a place, watch a show at a venue, play a show at a venue, play
a story song, attend an event, share a beat, vote, open an evidence card, buy a Shop item,
rehearse with your band.

Places, venues and events: effects can spawn, change, restrict or cancel them, including
free story events and show slots, always with reason text. Fame cooldowns are never
reset by stories.

Protected systems (effects never apply):

       Onboarding, the tutorial and the first open mic.
       Show scoring: timing windows, points, multiplier, Hype, the Crowd meter, stars, fans,
       fame and pay from a show.
       Practice, calibration and rehearsal results.
       Bandmates: hiring, Chemistry and quitting are per-player and never driven by shared
       stories.
       Venue unlocks by fame tier (Clout City's borough unlock flow).
       Sign-up, log-in, all purchase flows, bills, rent and band pay.

Daily tasks only pick venues with an open slot and places that are open and off cooldown,
so a story never makes a task impossible.

8. Premium content, entitlements and payments
Unchanged from Clout City: the main arc is always free; side arcs ($2.99), exclusive
events, collector items and monument postcards are all gated by
 hasEntitlement(player, sku) ; Stripe Checkout with an idempotent webhook as the
only grant; charge.refunded revokes; prices in Stripe and config. Side arcs are personal-
layer only, add no fame, give no edge in predictions, and are never touched by
 reward_modifier or song_injection .

Never sell: the ending or reveal, influence in polls, information pointing at an open
prediction, story songs, or anything that affects a show.

9. Example data
An excerpt of the pilot (3 of 10 beats). The full arc follows the Story Quality Brief's
blueprint for "Who Cancelled the Midnight Saints?"; start_at is a placeholder Sunday.

   {
       "id": "midnight-saints",
       "title": "Who Cancelled the Midnight Saints?",
       "type": "main",
       "tier": "free",
       "status": "active",
       "start_at": "2026-11-08",
       "start_weekday": "sunday",
       "district_scope": ["echo_flats"],
       "answer_key": { "sent_the_email": "moss-delaney", "server_only": true },
       "beats": [
           {
               "id": "ms-1",

               "day": 1,
               "status": "active",
               "news": [{ "headline": "Saints' Big Night Cancelled by Email",
   "previously": null }],
               "effects": [
                 { "type": "chatter_topic", "topic": "midnight-saints", "phase":
   "early", "priority": 2 },
                   { "type": "place_state", "tags": ["the_marquee"], "state":
   "fan_protest", "reason": "Fans demanding answers", "expires_day": 3 },
                   { "type": "task_injection", "add": ["story:midnight-saints:watch-at-
   the-marquee"] }
         ]
           },
           {
               "id": "ms-3",
               "day": 3,
               "status": "active",
         "news": [{ "headline": "Page Fourteen", "previously": "Someone emailed
   The Marquee from the lawyer's account at 2:14 AM. Marty says it wasn't him."
   }],
               "effects": [
                   { "type": "price_multiplier", "tags": ["rusty_amp"], "applies_to":
   "visit_price", "multiplier": 1.5, "reason": "Saints fans packing the bar",
   "expires_day": 6 }
               ],
               "prediction": {
                   "id": "P1",
           "question": "Who sent the cancellation email?",
           "options": ["Marty Vance", "Kiki Moon", "Jolene Vega", "Moss
   Delaney"],
                   "closes_at": { "day": 6, "time": "23:59" },
                   "reveal_beat": "ms-9",
                   "correct": "Moss Delaney",
                   "reward": { "fame": 80, "badge": "called-it" },
                   "changeable": true
             }
           },
           {
               "id": "ms-7",
               "day": 7,
               "status": "active",
         "points_at_answer": true,
         "news": [{ "headline": "The Show Must Go On (At a Dive Bar)",
   "previously": "Jolene has a secret solo offer, and the contract's Page
   Fourteen is real." }],
         "effects": [

           { "type": "show_slot", "tags": ["the_marquee"], "action": "cancel",
   "reason": "Show cancelled: venue double-booked", "expires_day": 8 },
           { "type": "place_state", "tags": ["rusty_amp"], "spawn_event":
   "saints-popup", "event_type": "free_story", "expires_day": 8 },
           { "type": "song_injection", "song": "page-fourteen", "difficulties":
   ["bar", "club"], "expires_day": 10 },
           { "type": "chatter_topic", "topic": "midnight-saints", "phase":
   "late", "priority": 2 }
         ]
       }
       ]
   }

Validation rejects P1 if closes_at is later than the start of ms-7 , which is flagged
 points_at_answer .

10. Build sequence and deliverables
The same three stages as Clout City, all before launch: foundation (port the module, tags,
clock, time travel, debug panel, News feed, chatter, price and availability hooks), story
mechanics (closures, place_state , show_slot , song_injection , story tasks,
predictions, the pilot as data), premium (entitlements, Stripe, refunds, the three side
arcs).

Deliverables: an integration report; the ported module with the two new effects; the pilot
and side arcs as data; dev tools; the validation script (Clout City's checks plus: every
injected song exists with charts for its listed difficulties, no cancelled slot leaves a player
with no open paid venue that day, no effect targets a protected system); unit tests (Clout
City's plus show-slot cancel and add, song injection and keeping, and proof that no effect
changes show scoring); a one-page "how to add a new arc" guide.

Acceptance: with time travel in staging, every pilot beat, effect, show-slot change,
injected song, chatter phase, prediction window and side-arc unlock fires on the right day;
a test purchase unlocks a side arc, a replayed webhook doesn't duplicate it, and a refund
revokes it.

11. Content rules
As in Clout City, in full in the Story Quality Brief: fictional characters, bands, labels,
venues and brands only; no real artists, songs or companies; serious subjects off-screen
and non-graphic; satire aimed at personalities, never at groups, faith or grief; narrated by
Lola Lowdown, "Hollywood's most reliable unreliable source."
```
