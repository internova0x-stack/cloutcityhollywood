# Clout City: Hollywood Music — New Features Spec

> Converted from the PDF in `docs/pdf/08-new-features-spec.pdf` (the original). Owner decisions that change this document are in `docs/00-owner-decisions.md` and win over it.

```text
Clout City: Hollywood Music — New Features
Spec (Hunts, News, Songs and More)
  ​Oct 17, 2026       · ​@Internovatechnologies

This spec covers the features that sit around the core game: treasure hunts, the Story
Studio, the News feed, the recurring cast and NPCs, the neighborhood, travel and rest,
and the AI song pipeline. It adapts the Clout City New Features Spec; sections 1 to 7 are
decided, section 8 is for after P1. All rules from the other documents still apply: no real
artists, songs, brands or people; gold only for real money; C$ for virtual cash; real money
never shortens a wait, buys an edge or changes a show.

1. Treasure hunts
Version: simplified in v0.3, full in v0.4.

A weekly, opt-in hunt that sends players around Echo Flats following clues, with one track
for each of the eight starting scenes (treasures in Clarifications section 14). All tracks
share one weekly theme and the same set of places.

 1. Schedule: Monday at New York midnight to the following Sunday at midnight; stories
    start Sundays, so they never launch the same day.
 2. Opting in: the Hunt tab in Tasks/Goals; one tap joins; nothing about the hunt appears
    for players who haven't joined.
 3. Steps: 4 to 5, each at a different place. The player travels there (normal price and
    Energy) and uses the free "Ask around" action for the next clue. Some steps ask a
    multiple-choice question (wrong answers retry after 10 minutes). From v0.4, one step a
     week can be a riff challenge at Echo Room Studios: echo a 4-note phrase (any
     accuracy above 60% passes).
 4. Finale: find the right person at the right place and answer correctly.
 5. Rewards: a free collectible hunt card, cash about equal to a brand deal, and fame
    worth about 15 to 20% of an active player's weekly fame; four completed hunts earn a
     badge.
 6. Rules: clues are always free; at least one free or cheap step (Lookout Park, the Wall of
    Almost); steps avoid places affected by the live story; one correct answer per
    question; invented treasures and musicians only.

                               v0.3 (simplified)                 v0.4 (full)

  Clue delivery                "Ask around" on the location      NPCs give clues in their lines
                               card

  Engine                       Progress stored per player        A hunt arc in the World State layer

  World                        None                              NPC chatter about the treasure for joined
  reaction                                                       players

  Places                       Wave 2 places                     Any released place, including monuments

  Riff                         No                                Yes
  challenges

Weekly pipeline: Claude drafts the theme and eight tracks by Thursday; the validation
script checks places, story conflicts, a cheap step and single correct answers; it goes live
Monday unless vetoed in the Story Studio; measure joins, completions and step drop-off.

2. Story Studio
Version: ported from Clout City; hunt review in v0.3, story, song and news review in v0.4.

The one admin dashboard where all story, hunt, news and song content is reviewed,
approved, scheduled, previewed and paused. Only admin accounts can open it, checked
on the server for every page, request and action.

  Area                            What it does                           Version

  Hunt review                     The week's theme and eight tracks      v0.3
                                  as players see them, validation
                                  results, Approve or Send back

  Story gates                     Gate 1: blueprint and hidden truth.    v0.4
                                  Gate 2: finale and side arcs, beside
                                  the editor-pass report

  Song review                     Each song's audio with its stems,      v0.4 (songs 1 to 4 are approved in
  (new)                           every chart in a playable preview,     the /lab page until then)
                                  chart validation results, license
                                  record, Approve or Send back
                                  (section 7)

  Scheduling                      Story start dates (the pilot           v0.4
                                  included); hunt, news and story-
                                  song calendar

  Area                            What it does                           Version

  Preview                         Time travel through any day as         v0.4
                                  players will see it

  Safety                          Pause or retire any arc, beat, hunt,   v0.4
  switches                        news item or song without a
                                  deploy

  News review                     City news and cast updates             With News
                                  (section 3); auto-published unless
                                  vetoed, as in Clout City

  Chat reports                    The report queue: dismiss, warn,       v0.4
                                  mute or ban

3. News
Version: v0.4, on the News app that hosts stories.

The News app is the scene's gossip feed, so there's something new to read every day.

  Type                                 What it is                                    How often

  Story beats                          The current story                             One a day while a story
                                                                                     runs

  City news                            Developing stories about the invented         One or two a day
                                       celebrity world (section 4): feuds,
                                       breakups, surprise albums, tour
                                       cancellations, comebacks, flops

  Scene news                           Echo Flats itself: a bandmate quit            A few a week
                                       someone's band, The Rusty Amp's new
                                       sound guy, a venue's "best show this week"
                                       (players who opt in)

  Lola's dating                        The advice column as a recurring mini arc     Weekly
  column

  Hunt                                 This week's theme                             Mondays
  announcement

How players see it: the existing live ticker alternates headlines with player activity; the
home-screen prompt card shows the newest headline at most once a session; later,
headlines pop up on the map at the places they mention.

Fictional celebrities only. Real music news is ruled out: naming real artists risks
defamation and publicity-rights claims, summarizing real news raises copyright issues,
keeping it current needs daily curation, and avoiding bad news would need judging every
day. City news stays light: no real politics, tragedies or crime, and it never changes prices,
places or show slots (only stories do).

Production: Claude drafts a week of city news alongside the hunts; it auto-publishes on
schedule unless vetoed in the Story Studio. Each item is data (headline, two or three
sentences, cast involved, publish day) and moves to the archive after it runs.

4. Recurring cast and NPCs
Version: light NPCs with the v0.4 hunt upgrade; full conversations later.

The cast
     Story regulars: Lola Lowdown (narrator), Marty Vance, Esq. (the lawyer with a Page 14
     in every contract), Roxy Reyes (The Marquee's booker), the Midnight Saints (Jolene
     Vega, Moss Delaney and the bassist nobody remembers).
     The celebrity world (new, for city news): eight invented stars, one per type, each with
     a one-line personality, a want and a flaw:

  Type                                     Name                  One line

  Pop superstar                            Vexa Monroe           Wants one normal night; posts every
                                                                 second of it

  Rap star                                 Lil Overdraft         Wants a chart-topper; always "between
                                                                 deals"

  Boy band                                 Five Alarm (a five-   Want to go solo, all five, at once
                                           piece)

  Rock legend                              Dusty Thorne          On his fourth farewell tour

  Super-producer                           Kayden "Knobs"        Claims credit for every hit since 2009
                                           Okafor

  Country crossover                        Shelby Rae Colt       Wants credibility in two genres; has
                                                                 neither fanbase's trust

  Streamer turned                          DJ Kombucha           Wants to be taken seriously; streams his
  singer                                                         own therapy

  Influencer turned                        Tiara Vance           "Basically a singer"; Marty's niece
  singer

     The wannabes: the open-mic regular "almost signed" for six years, a self-declared label
     CEO with one artist (himself), a busker who claims to have taught everyone.

All names are invented and checked against real artists before launch. Everyone goes into
a cast and city bible so they stay consistent across stories, news and hunts.

NPCs at places

  Part                              How it works

  Who                               Regulars tied to a place: The Grind's barista, The
                                    Rusty Amp's bartender, The Basement's sound guy,
                                    Riff & Ruin's clerk, the Lookout Park busker, the
                                    tour guide at the CLOUTWOOD sign

  Where                             At a marked spot in the place's scene with a
                                    speech-bubble label

  Lines                             A rotating line that changes with the live story's
                                    phase and with city news ("Did you hear Five Alarm
                                    broke up again? Third time this month.")

  Part                              How it works

  Personal updates                  Each regular has a small life of their own, updated
                                    weekly (the sound guy's band finally got a gig)

  Hunts                             During a hunt, the right NPC's line becomes that
                                    step's clue for joined players (v0.4)

  Data                              All NPCs and lines are data, written with the
                                    week's content

5. A dense starting neighborhood
Version: the base of P1, rolled out in three waves (Milestones and Versions).

Clout City moved to a dense starting neighborhood after testing; Hollywood Music starts
that way. Every player lives in Echo Flats, with 19 places close together, so the town feels
busy from the first minute and short trips are cheap. The full list is in Clarifications section
3.

Notes

     Mostly scene cards. Full interiors are needed only for the homes (one shared
     apartment template), The Grind (café template plus a stage), the four venues (the
     shared stage template, re-propped), Riff & Ruin (store) and Echo Room Studios
     (studio). Everything else needs one illustration.
     Four stages, one template. Each venue's stage reuses one template with its own
     backdrop, lighting, props and crowd size.
     No school. The game is 18+, so there's no high school; a community college can come
     with a later district.
     No place of worship in P1. If one is added later, it is generic, gets an invented name and
     stays out of the stories.
     The supermarket and fridge carry over from Clout City: groceries bought at Fresh
     Flats Market are cooked at home, the budget way to restore Energy.
     Later districts (Starline Boulevard, Neon Row, Canyon Heights, the Studio Lot, the Pier
     District) arrive as new map art and data, a short trip away.

6. Travel, rest at home and food at venues
Version: v0.3. Rules match Clout City; full detail in Clarifications section 8.

Travel: no spending before arriving (a card's actions preview until the player is there; the
main button is "Go there"); walk (free, slow, more Energy), metro (cheap), rideshare (fast,
pricier) or own ride (the band van or a car; no fares); costs from simple distance bands; a
skippable trip view from above; personal timers that never move the shared city clock.

  Where                    Action                 Effect                                 Limit

  Home                     Nap                    Restores Energy over a short timer     Capped per day

  Home                     Sit                    Some Energy and Mood                   Capped per day

  Home                     Cook a meal            Energy from one fridge meal; no fame   What's in the
                                                                                         fridge

  Home                     Practice               Free, unlimited; no rewards            None

  Venues                   Grab a drink or        Medium Energy, luxury price, no fame   None
                           snack

  Dining                   Eat                    Energy by tier; fame once a day        None
  places

  Everyone                 Midnight top-up        A small amount of Energy each New      Daily
                                                  York midnight

Groceries: a few cheap bundles at Fresh Flats Market ("Ramen week," "Pre-tour meal
prep"), stored in the home fridge up to a set number of meals, consumables that never
show on Net Worth and can't be sold. Cooking is the budget option, dining the social and
fame option, venue snacks the convenience option.

7. The AI song pipeline
Version: in use from v0.1.5; song review moves into the Story Studio in v0.4.

Decided: the first four songs are made with an AI music tool. Songs 5 and 6 and the pilot's
story song are decided before v0.4 (AI or commissioned); they go through the same steps
either way. Expect about a day of your time per song, most of it on the charts.

Steps
 1. Brief (Claude writes it). Title, feel, BPM, key, target length (1:45 to 2:30), a section map
     (intro, verse, chorus, bridge, outro) marking where Hype phrases and crowd calls will
     go, mood, and a satirical lyric concept with original lyrics if the song has vocals.
     Prompts describe genre, era and instruments only; never "in the style of" a real artist.

 2. Generate (you, in the tool). Make several takes, pick the best, and export the full mix
     plus stems. The game needs two: the lead (the instrument the player plays) and the
     backing (everything else). If the tool can't export stems, separate them with a stem-
     splitting tool.
 3. Rights record. Use a plan whose terms grant full commercial use. Save the tool name,
     plan, a copy of the terms on the day, the generation date and the prompt in the song's
     record. Two cautions: purely AI-made audio may not be protected by copyright in the
     US, so others could reuse it (acceptable for P1; your own edits to the arrangement and
     mix help); and listen for any resemblance to a well-known song before approving.
 4. Master. Even out loudness across songs (about −14 LUFS), trim silence, and measure
     the exact BPM and the time of the first beat. Export compressed audio for the web.
 5. Chart. A charting script built by Claude Code drafts notes for each difficulty from the
     lead stem's beats and onsets, already within each difficulty's limits. You then play and
     edit the draft in the chart editor (add, delete, move or lengthen notes on a beat grid;
     mark Hype phrases and crowd calls).
 6. Validate. The script checks every chart against Clarifications section 4.12: notes per
     second, same-lane spacing, hold length, no chords below Club, 2 to 4 Hype phrases,
     crowd calls only at Club and Theater.
 7. Playtest and approve. Play every chart on your phone; ask one other person to play the
     Open Mic and Bar charts cold. Approve in song review (the /lab page until v0.4).

Song record (data)

  Field                                           Notes

   id , title , feel , bpm , offset_ms ,          Measured in step 4
   duration_s

   stems                                          lead , backing audio files

   charts                                         One file per difficulty: open_mic , bar , club ,
                                                  theater

   unlock                                         start , a fame tier, a goal id, or story
                                                  (injected by song_injection )

   tags                                           e.g. garage_rock , story_song , midnight-
                                                  saints

   license                                        Tool, plan, terms copy, generated date,
                                                  prompt, or the composer's work-for-hire
                                                  contract

  Field                                                              Notes

   status                                                             draft , approved , paused , retired

Briefs for the first four songs

  #           Song                                Feel and BPM                    Lyric concept

  1           Open Mic Night                      Bright indie pop, 92 BPM,       A nervous first-timer begging a
              (Be Nice)                           simple and steady (the          café crowd of nine to clap
                                                  tutorial song)

  2           Rent's Due                          Fuzzy garage rock, 128 BPM,     A band counting tips in the van
              (Again)                             big chorus                      the night before rent

  3           My Ex Started a                     Glossy synth-pop, 110 BPM       Discovering your breakup is
              Podcast                                                             now Episode 4, with sponsors

  4           Echo Flats, 3 AM                    Lo-fi R&B, 84 BPM, laid-back    Walking home past every closed
                                                  with long holds                 venue, still humming the set

8. Later features
Not part of P1; don't build yet. Each needs more players, more art or a proven core first.

  Feature                                    What it is                            Why later

  New districts and                          Starline Boulevard, Neon Row,         Needs map art, venues and
  bigger venues                              Canyon Heights, the Studio Lot,       harder charts; P1 must prove
                                             the Pier District; the Echo Bowl      the ladder first
                                             amphitheater (Star) and the
                                             Halo Dome stadium (Stadium
                                             Status)

  More instruments                           DJ (turntable lanes, scratches,       Each is its own mechanic and
                                             crossfades, after DJ Hero),           its own charts
                                             Vocals (call-and-response,
                                             after PaRappa), Drums

  Record and release                         Record a single at the Studio         A new economy loop; needs
                                             Lot, release it, earn daily           balancing against shows
                                             streaming royalties, shoot a
                                             music video

  Feature                                    What it is                        Why later

  Tours                                      Book a run of shows across        Needs districts
                                             districts over several days

  Player bands                               Friends as bandmates, a shared    Needs live sync and enough
                                             band name and fame, co-op         players
                                             shows

  Battle of the bands                        Weekly head-to-head on the        Needs song leaderboards and
                                             same song, judged by score        anti-cheat beyond P1's checks

  Song leaderboards                          Top scores per song and           Needs stronger score
                                             difficulty                        verification

  Players in the same                        See which real players are at a   Needs live presence; stranger
  crowd                                      venue, with preset reactions      chat stays ruled out

  Merch tables                               Sell band merch at venues         Purchases at places aren't in P1

  NPC conversations                          Back-and-forth talks with         Needs a dialogue system and
                                             choices                           more weekly writing

  News on the map                            Headlines pop up at the places    After the News feed proves
                                             they mention                      itself

  Seasonal events                            Award season, festival            After the weekly cadence is
                                             weekend, holiday specials with    stable
                                             limited songs

  Song packs                                 New songs added in batches,       After the song pipeline has run
                                             always earned in play, never      for a few months
                                             sold
```
