# Clout City: Hollywood Music — Clarifications & Updates (v1)

> Converted from the PDF in `docs/pdf/02-clarifications-and-updates-v1.pdf` (the original). Owner decisions that change this document are in `docs/00-owner-decisions.md` and win over it.

```text
Clout City: Hollywood Music — Clarifications
& Updates (v1)
  ​Oct 17, 2026        · ​@Internovatechnologies

This is the source of truth for Clout City: Hollywood Music's P1 game rules and scope. It is
built from Clout City: NYC's Clarifications & Updates (v2): every rule there applies here
unless this document changes it. Where another Hollywood Music document disagrees,
this one wins, except for the World State layer, which follows the World State Layer Brief.

Related documents: Game Concept Note, World State Layer Brief, Story Quality Brief,
Design System Guide, Milestones and Versions, New Features Spec.

Renames from Clout City: clout → fame (score); Queens → Echo Flats (starting
neighborhood); boroughs → districts; club events → club nights; gigs → brand deals; Gigs
app → Deals app. C$ (Clout Dollars) and Crew keep their names.

1. First-time experience and onboarding
The Clout City flow, with one changed creator step and a first show in place of the first
party. Order: guest map → sign-up → creator (Look, Sound, Birth lottery, Home) →
welcome → 5 tooltips → first task (open mic) → leaderboard → invite prompt → PWA
prompt → story prompt.

  #                Step                                       What changes from Clout City

  1                Guest map                                  The illustrated Echo Flats map (section 3), with
                                                              locked districts under clouds and the Halo
                                                              Dome lit at the edge. First tap opens sign-up
                                                              and starts the music

  2                Sign-up                                    Unchanged: email or Google, 18+ checkbox

  3a               Look                                       Unchanged: name field, presentation, body
                                                              type, skin and hair, headwear then coverings,
                                                              glasses and eyes, garments and colors. The
                                                              eight starting styles move to the Sound step as
                                                              scenes

  3b               Sound                                      New, replaces Traits. Pick an instrument
                                                              (Guitar or Keys in P1), one of eight starting
                                                              scenes, and a band name (default: the player's
                                                              name). The avatar now holds the instrument

  #                Step                                       What changes from Clout City

  3c               Birth lottery                              Rolls starting cash between C$4,000 and
                                                              C$8,000, plus one starter instrument (a beat-
                                                              up model of the chosen instrument, cosmetic
                                                              only)

  3d               Home                                       Echo Flats rooms with weekly rent (section 3).
                                                              Homes whose first rent would leave less than
                                                              the phone bill are disabled

  4                Welcome                                    New copy (below)

  5 to 9           Tooltips                                   Fame (star), Money, Map, Phone, Shows (the
                                                              mic icon). Tooltip 5 ends by tapping the Shows
                                                              icon

  10               First task: open mic                       The Grind's open mic, always "happening now."
                                                              Buttons: "Bring the crew" (invite a friend into
                                                              the crowd, optional) and "Take the stage." The
                                                              player plays the tutorial song (section 4)

  11 to            Leaderboard, invite, PWA, hand-            Unchanged in order and rules; the story
  14               off                                        prompt reads "Echo Flats has a mystery. Think
                                                              you can crack it?"

Starting scenes (chips in the Sound step; each sets 3 to 4 starter clothing items and the
treasure-hunt track, with no stats or bonuses): Garage Rocker, Bedroom Pop, Trap
Hopeful, Indie Sadcore, Synthwave Kid, Country Crossover, Mall Punk, Afrobeats Dreamer.

The first open mic is protected and can't be failed. The tutorial song runs on Open Mic
difficulty with coaching prompts; the Crowd meter can't empty during it. Every result
pays first fans, fame and tips, and the completion card scales its joke to the score.

Starting cash rule. The minimum roll (C$4,000) always covers the cheapest room's first
rent and the phone bill. The open mic is free.

Tutorial script
Welcome: Welcome to Hollywood. Every waiter here is in a band. Yours just has to be the
one that makes it. Here's a quick tour before the industry eats you alive. [Let's go] · Skip
tour (bold of you)

Tooltip 1: Fame: This is your fame: a scientific measure of how many strangers would ask
for a selfie. Grow it by playing shows, being seen and owning things a real star would own.
[Next]

Tooltip 2: Money: Your bank balance: rent, strings and the occasional bribe to a sound guy.
The diamond is your net worth, aka everything you could sell if the band breaks up. [Next]

Tooltip 3: Map: This is Echo Flats. Every legend started somewhere cheap. The rest of
town is locked until you're worth the drive. [Next]

Tooltip 4: Phone: Your phone. Gossip, brand deals, and your mom asking if this is "still the
music thing." [Next]

Tooltip 5: Shows: Breaking news: the café's open mic has a slot. It's yours. Tap to take the
stage.

Completion card (by stars): 1 to 2 stars: "Nine people clapped. Two were your crew. It
counts." 3 stars: "Solid. A guy filmed it. Vertically." 4 to 5 stars: "The barista asked for your
name. Not for the cup." Then "+N fans · +N fame · +C$N tips."

Leaderboard: "In this town, fame is the only ranking that counts. Here's where you stand."
[Climb the charts]

2. Home screen and HUD
The Clout City layout carries over: a persistent top bar, a fixed right-side column, a
collapsible stats panel and a four-tab nav. The changes are the fame icon, a Shows icon
and a band button.

Top bar (persistent)

  Side           Element                  Icon                 Shows             On tap

  Left           Time                     Text                 City-clock time   None
                                                               of day

  Left           Daily Tasks              Checkmark + "0/5"    Today's tasks     Opens Tasks on the
                                                               done              Daily tab

  Left           Sound                    Speaker / slashed    Music on or off   Toggles mute
                                          speaker                                (remembered)

  Right          Fame                     Star + number        The player's      Opens the fame
                                          (spotlight yellow)   fame              leaderboard

  Right          Net Worth                Diamond, no figure   —                 Opens the Net Worth
                                                                                 screen

  Right          Bank                     "C$4,000"            Cash to spend     Opens transactions
                 Balance

Upper left, below the top bar
Unchanged: the Invite your Crew pill and the Players Online pill (hidden below the
threshold, which starts at 1).

Right-side column (fixed)

  Order           Element                   Icon              Opens                        Badge

  1               Tasks/Goals               Checklist         Daily / Goals / Hunt         —

  2               Shows                     Microphone        Today's show slots at        When a slot opens or
                                                              unlocked venues, plus club   an event starts soon
                                                              nights and events

  3               Places                    Building          The Places list              —

  4               Band                      Drumsticks        The band screen (section     When Chemistry is low
                                                              5)                           or band pay is due

  5               Bills                     Receipt           Bills and due dates          When a bill is due

  6               Your Look                 Person            The dressing room, now       —
                                                              with an Instrument tab

The Shows icon replaces Clout City's Events champagne glass: events still live inside it,
under the shows.

Bottom left: avatar bubble and stats panel
Unchanged from Clout City: a 56 pt avatar bubble opening the profile, and the collapsible
Energy, Mood and Confidence panel with one suggested action per stat. Low Energy
points to the cheapest open food; low Mood to a free boost (Lookout Park, a meal); low
Confidence to practice or an open mic; high fans to the Deals app.

Profile adds Fans, fame tier (Nobody to Stadium Status), band name and members,
instrument, best show (venue, song, stars) and setlist progress to Clout City's profile.
Fame, rank, fans and net worth are public.

Bottom navigation: Home, Map, Phone, Shop (unchanged).

Notification pins: Net Worth and Invite your Crew on first play, as in Clout City, plus Band
the first time a bandmate can be hired.

3. Map, Echo Flats and places
P1 has one compact, hand-illustrated 2D map of a fictional Hollywood. Every player lives in
Echo Flats; the other districts are locked.

 1. One illustrated map (Lagos Life style). The map is a single piece of art, not generated
     from real street data: a stylized town drawn slightly from above, with buildings as
     illustrated sprites, palm-lined roads, the hills with the CLOUTWOOD sign, and day and
     night versions. Echo Flats fits on about 1.5 phone screens at default zoom, with two
     zoom levels. It keeps Clout City's map interface (show pins, move the camera, locate
     the player, set a district's lock state), so districts can be added as new art and data
     without touching game logic.
 2. Locked districts sit around Echo Flats under slow-drifting clouds with a                  🔒 pill and
     "Coming soon": Starline Boulevard, Neon Row, Canyon Heights, the Studio Lot and the
     Pier District. Tapping one opens a sheet with its illustration and a one-line Lola teaser.
 3. The Halo Dome is a map-flavor location at the far edge, always lit, with a pill reading
    "Stadium Status: locked." Its card shows the fame ladder and the player's place on it.
 4. The living map: when zoomed in, a few decorative cars, a city bus and a light-rail train
     loop the roads, with headlights at night. Same caps as Clout City (about 30 on screen,
     paused when hidden, off under reduced motion).
 5. Place rules are unchanged: location cards with illustration, lore and actions; visits cost
     cash and pay fame by price, once per real day per place; no spending before arriving;
     travel by distance band; story effects show a reason banner; no purchases at places
     except the monument postcard; invented names only.

Echo Flats: P1 places

  Category                   Place                            Depth               Main actions

  Homes                      Laundromat Loft (studio,         Full (apartment     Move in, practice, nap, sit,
                             C$300/wk), Band House            template)           cook
                             room (C$450/wk), Garage
                             Bungalow (C$800/wk, own
                             rehearsal space)

  Venues                     The Grind (café open mic),       Full (stage         Play a show, watch a
                             The Rusty Amp (dive bar),        template, section   show, grab a drink or
                             The Basement (club), The         4)                  snack
                             Marquee (theater)

  Category                   Place                            Depth               Main actions

  Music                      Riff & Ruin (guitar shop,        Full / scene card   Open Instruments and
                             Musicians Wanted board,                              Gear in the Shop, hire
                             clerk job), Echo Room                                bandmates, work a shift;
                             Studios (rehearsal rooms)                            rehearse with the band

  Dining                     El Cometa taco truck             Scene cards, The    Eat (Energy); fame once a
                             (budget), Starlite Diner         Grind full          day
                             (medium), The Grind
                             (medium), Vantage rooftop
                             (luxury)

  Groceries                  Fresh Flats Market               Scene card          Buy grocery bundles for
                                                                                  the home fridge

  Work                       Hotel Valencia valet stand,      Scene cards         Work a shift
                             Backlot 9 (film extras
                             casting)

  Outdoors                   Lookout Park                     Scene card          Hang out (Mood), busk
                                                                                  (small tips, no fame)

  Civic                      Echo Flats Precinct              Scene card          Story actions only

  Monuments                  The CLOUTWOOD Sign               Full (landmark      Pose for a photo, people-
                             lookout, The Wall of Almost      plaza)              watch, chat with an NPC,
                             (a mural of musicians who                            postcard
                             nearly made it)

  Map flavor                 Echo Flats Metro station,        Label and lore      None
                             the Halo Dome, the locked
                             districts

That's 19 visitable places. Rents and every price live in config.

Dining and Energy follow Clout City: the visit price is the meal, every meal restores
Energy, the first visit each day pays fame by price. Venues sell a luxury-priced drink or
snack (medium Energy, no fame). Groceries cooked at home are the budget option.

Names. All businesses, labels, radio stations and venues are invented. The CLOUTWOOD
sign is original art and lettering, never the real hillside sign; no real Hollywood venue,
theater, studio or star is named or drawn.

Daily tasks and goals
As in Clout City: five tasks a day, cash each plus an all-done bonus, reset at midnight New
York time, shown as "0/5." The picker draws from shows at unlocked venues, visits,
practice, band rehearsal and story tasks, and only picks places that are open and off
cooldown. Goals are long-term ("Get 4 stars at The Rusty Amp," "Hire a drummer," "Reach
Buzzing"). The Hunt tab hosts the weekly treasure hunt (section 14).

4. Shows: the performance game
A show is a roughly 2-minute rhythm game on a vertical note highway, played with thumbs.
It borrows mechanics (not looks, names or songs) from Guitar Hero, DJ Hero and PaRappa
the Rapper, and it's the only thing in the game that is pure skill. All numbers below are
defaults in config.

4.1 Playing a show
 1. Slots. Each unlocked venue offers one paid show per player per real New York day
     ("Tonight's slot"). The Grind's open mic is always open; the other venues open on the
     city clock (evening to late), with a countdown in real minutes before doors.
 2. Requirements: the venue's fame tier (Concept Note section 4), enough Energy, and
     from The Basement up, at least two bandmates (section 5).
 3. Flow: Go there → Play a show → pick a song from your setlist → soundcheck (audio
     loads) → 3, 2, 1 → play → results → rewards and share card.
 4. One retry. If you're booed off, "the sound guy owes you one": one retry at that venue
     that day.
 5. Watching. Every venue also has a free "Watch a show" visit action (normal visit rules:
     price, fame once a day, Mood).

4.2 Difficulty by venue

 Difficulty        Venue                     Lanes Notes used                    Max notes per   Notes visible
                                                                                 second          for

 Open              The Grind                 3           Tap, hold               2               2.0 s
 Mic

 Bar               The Rusty                 4           Tap, hold, Hype         3.5             1.8 s
                   Amp

 Club              The Basement              4           Plus chords and power   5               1.6 s
                                                         strums

 Theater           The Marquee               4           Plus crowd calls        6.5             1.4 s

Arena and Stadium difficulties come with those venues, after P1. Practice can use any
difficulty the player has unlocked, plus a preview of the next one.

4.3 The highway and controls
     Lanes run top to bottom; notes slide down to a hit line about 22% up from the bottom
     edge. The tap zone for each lane is the full lane width below and just above the hit line,
     so thumbs never have to hit a small target.
     Each lane has its own color and shape (circle, diamond, square, triangle), so lanes read
     without color.
     Tapping an empty lane is never penalized; phone screens get mis-taps.
     Note speed (1× to 1.5×) and "big notes" are player settings. They change readability
     only, never scoring.

4.4 Note types

  Note                    How to play it                               Where it appears   Inspired by

  Tap                     Tap as it crosses the hit line               All                Guitar Hero
                                                                                          frets

  Hold                    Tap and keep your thumb down                 All                Sustains
                          until the tail ends; bonus points
                          while held

  Chord                   Two lanes at once, both thumbs               Club, Theater      Chords

  Power                   Flick upward through the hit line in         Club, Theater      DJ Hero
  strum                   that lane                                                       scratches

  Hype note               A glowing star-shaped note, in a             Bar and up         Star Power
                          short phrase; hit every one in the                              phrases
                          phrase to fill Hype

  Crowd                   A call-and-response section (4.7)            Theater (Club in   PaRappa the
  call                                                                 later songs)       Rapper

4.5 Timing, score and streaks

  Grade              Window (either side)                     Points    Crowd meter

  Perfect            45 ms                                    100       +1.5

  Great              90 ms                                    70        +1.5

  Grade              Window (either side)                     Points             Crowd meter

  Good               135 ms                                   40                 +0.5

  Miss               beyond                                   0, streak resets   −4

     Holds add 10 points per beat held. Each note in a chord scores separately.
     Streak multiplier: ×2 at 10 notes, ×3 at 20, ×4 at 30. A miss resets it to ×1.
     Callouts pop over the highway: "Hot Start!" (first 25 notes clean), "50 Note Streak!" and
     every 50 after, "Hype Ready!", "Crowd's on its feet!"
     When a note is missed, the lead part of the song drops out briefly, so you hear the
     mistake (two audio stems per song: backing and lead).

4.6 Hype meter (the power move)
     Each completed Hype phrase adds 25%; fully held holds add a little.
     At 50% or more, the Hype button (a glowing pill beside the highway) lights up: "Hype
     Ready!"
     Tapping it starts Hype: the multiplier doubles (up to ×8), Crowd meter gains double,
     and the stage lights, highway glow and crowd go wild. It drains in about 8 seconds per
     50%.
     Hype can't be bought, refilled or carried between shows.

4.7 Crowd calls (call and response)
In a crowd call, a bandmate or the crowd plays a short phrase (1 to 2 bars) and the player
plays it back.

 1. Call: the highway dims and a horizontal call strip slides in at the top, with the phrase's
     notes as lane icons on a timeline and a cursor sweeping across as the phrase plays.
 2. Response: the cursor sweeps again and the player taps the same lanes in the same
     rhythm. The strip shows where each note should land, but no notes fall.
 3. Each echoed note is graded like a normal note. A clean echo shows "They sang it back!"
     and adds 25% Hype. A live label rates the echo: Nailed it, Close, Off.

The same mechanic powers band rehearsal at Echo Room Studios (section 5).

4.8 Crowd meter (reading the room)
A meter beside the highway, starting at 60 out of 100, with a live label that changes as it
moves:

  Range                Label               Effect

  80 to 100            Losing It           Lighters up; crowd sings along

  50 to 79             Into It             Normal

  25 to 49             Restless            Crowd chatter rises in the mix

  0 to 24              Booing              The meter pulses red; boos in the mix

If it hits 0, the player is booed off: the song stops, the show pays 25% of the venue fee
with no door share, fans or fame, Mood drops, and Lola delivers a one-line roast. At Open
Mic difficulty, drains are halved and the crowd can't boo you off (open mic crowds are
polite). The tutorial show can't fail at all.

4.9 Results and rewards
Stars come from the score as a share of the chart's base maximum (without Hype): 1 star
for finishing, 2 stars from 40%, 3 from 60%, 4 from 75%, 5 from 90%. No misses earns a
Full Combo badge. The results card shows stars, score, accuracy, best streak, crowd peak
and a personal best per song and difficulty.

  Reward                    Rule (defaults)

  Cash                      Venue fee × star factor, plus door share. Fees: The
                            Grind C$20 to C$60 in tips, The Rusty Amp C$150,
                            The Basement C$400, The Marquee C$1,200. Star
                            factor: 0.5, 0.75, 1.0, 1.25, 1.5

  Door share                Turnout × ticket price × 20%. Turnout = 20% of
                            capacity + 5% of the player's fans, capped at
                            capacity

  Fans                      Capacity × 15% × star factor

  Fame                      Venue base fame × star factor × Mood and
                            Confidence multipliers; Full Combo +20%. Paid
                            once per venue per real day

  Energy cost               The Grind 15, The Rusty Amp 20, The Basement 25,
                            The Marquee 30

  Confidence                +5 for 4 stars or more; −5 when booed off

Story effects can change a venue's availability or ticket price (cost only, per the World
State brief) but never the timing windows, scoring, stars, fans or fame of a show.

4.10 Practice
Free, unlimited and available any time: at home on the practice amp or at Echo Room
Studios. Any unlocked song, section looping and 75% speed. Practice pays nothing and
costs no Energy, except that one practice session can count as a daily task.

4.11 Songs
P1 ships six original songs, each about 1:45 to 2:30 long and charted at all four P1
difficulties. Two are unlocked at the start; the rest unlock with fame tiers and goals.

  #           Song                                            Feel                  BPM   Unlocks

  1           Open Mic Night (Be Nice)                        Indie pop, tutorial   92    Start
                                                              song

  2           Rent's Due (Again)                              Garage rock           128   Start

  3           My Ex Started a Podcast                         Synth-pop             110   Local Act

  4           Echo Flats, 3 AM                                Lo-fi R&B             84    Goal: 3 shows at The
                                                                                          Rusty Amp

  5           Opening Act Forever                             Pop punk              150   Buzzing

  6           Overnight Sensation (Ten                        Anthem rock           120   Headliner
              Years Later)

Stories can add a limited-time story song (a diss track, a breakup ballad) through the
World State layer; players who play it during its window keep it in their setlist.

4.12 Charts and audio
      Chart data: one file per song and difficulty: song id, BPM, audio offset, sections (Hype
      phrases, crowd calls) and notes (time in ms, lane, type, hold length). Songs and charts
      are data, so new songs are content, never code.
      Validation: notes per second within the difficulty's cap; at least 120 ms between notes
      in the same lane; holds at least 400 ms; no chords below Club; 2 to 4 Hype phrases per
      song; crowd calls only at Club and Theater.
      Audio: two compressed stems per song (backing and lead), fully loaded before the
      countdown.
      Rights: every song is commissioned with full rights (work for hire, including stems and
      edits) or licensed royalty-free with commercial, modification and stem rights. AI-
      generated music is used only if the tool's terms grant full commercial rights. No real
      songs, covers or sound-alikes of real artists.

4.13 Timing, devices and fairness
     The audio clock is the master. Note positions come from the Web Audio clock, never
     the frame timer, so lag never moves the notes.
     Calibration: after the tutorial show, the player taps along to 8 beats; the audio offset is
     saved per device. Settings has "Recalibrate."
     Pausing: leaving the tab pauses the song; it resumes with a 3, 2, 1. Pausing gives no
     advantage.
     Performance: at least 50 fps on a low-end Android phone; background stage animation
     drops first if frames slip; reduced motion turns off flashes.
     Haptics: an optional light buzz on Perfect where the browser supports it.
     Fair play: no item, purchase or story changes timing or scoring. The server rejects
     impossible results (a score above the chart's maximum, a show shorter than the song)
     and enforces one paid show per venue per day.

5. Band, bandmates and Chemistry
Players start solo and build a band of up to three NPC bandmates. Bandmates are a
money sink, a venue requirement and the main source of personal drama.

 1. Hiring. From Local Act on, the Musicians Wanted board at Riff & Ruin lists 3 to 4
    candidates, refreshed weekly: one for each open role (drums, bass, keys or guitar,
     whichever the player doesn't play). Each has a name, a portrait, a one-line personality
     with a want and a flaw ("Dez: hits hard, shows up late, owes everyone money"), a
     weekly fee and a starting Chemistry. Hiring is a big-purchase confirmation.
 2. Weekly fee. Band pay is a weekly bill beside rent, due on the same day. Fees scale with
     the bandmate's skill flavor, from C$80 to C$300 a week (config).
 3. Chemistry (0 to 100) per bandmate, shown as a bar on the band screen.

  Raises Chemistry                                            Lowers Chemistry

  Rehearsing together (+8, once a day per                     Missing band pay (−20, then −5 a day)
  bandmate)

  Shows with 4 stars or more (+3)                             Getting booed off (−6)

  Paying on time for a full week (+2)                         A week without a show or rehearsal
                                                              (−5)

  Story moments that favor them                               Story moments that strain them

 4. Quitting. When Chemistry falls below 20, the bandmate posts a warning ("Dez is
     'taking some time to find himself'"). If it stays below 20 for 3 real days, they quit: the
     slot reopens, and Lola runs a small personal News item about the breakup. No items
     are lost.
 5. Firing. Players can let a bandmate go from the band screen (destructive button,
     confirmed). It ends their fee and lowers every other bandmate's Chemistry by 3.
 6. Venue requirement. The Basement and The Marquee need at least two bandmates. If a
     quit drops the band below that, those venues show "Need 2 bandmates" until the slot
     is filled.
 7. On stage. Bandmates appear on the venue stage behind the player and are the "caller"
     in crowd calls. Chemistry never changes the player's score.
 8. Rehearsal (Echo Room Studios or the Garage Bungalow). A short call-and-response
     mini-game (section 4.7): a bandmate plays a phrase, the player echoes it, five phrases
     per session. Costs 10 Energy and the room fee (free at the Bungalow); raises that
     bandmate's Chemistry by up to 8 by accuracy.
 9. Band screen. Opened from the Band icon: band name (editable once a week),
     members with role, portrait, Chemistry bar, fee and "Rehearse," open slots with "Find a
     bandmate," and the band's best show.

After P1: friends as bandmates (player bands), bandmate stems that fill out each song as
the band grows, and bandmates with their own story arcs.

6. Shop, Net Worth, selling and bills
Clout City section 5 applies unchanged (item listings, Net Worth screen, item values, 60%
selling, diminishing returns on purchased fame, Your Look, no gifting, no buying C$), with
these changes.

 1. Categories: Fashion, Instruments, Gear (amps, pedals, mic stands, stage lights), Rides
     (a scooter, a used van for the band, cars), Homes and Luxury.
 2. Instruments and gear are cosmetic. A new guitar or keyboard changes how the
     instrument looks in the player's hands, on stage and in Your Look (which gains an
     Instrument tab), and pays fame on purchase with diminishing returns like any item. No
     instrument or gear changes timing, scoring, Hype, the Crowd meter, fans or pay.
 3. The band van (Rides) is fame flavor plus the "own car" travel option, as cars are in
     Clout City.
 4. Bills: weekly rent, phone and band pay (section 5); ride rental and insurance when a
     ride is rented or bought. Missed rent follows Clout City's rules (3-day grace, Mood
     drop, after 7 days a move to the cheapest room, nothing lost).

 5. Net Worth values follow Clout City: purchase price for C$ items, 1.5× the priciest C$
     item in the category for real-cash collector items (which can't be sold), C$0 for starter
     items including the starter instrument.

7. Events and real-money purchases
Clout City section 6 applies, re-themed for music.

  Event type                         Paid with                            Hollywood examples

  Club nights                        C$                                   Industry night at The Basement, a DJ set at
                                                                          Neon Row (locked), a showcase at The
                                                                          Marquee

  Free story                         Free                                 A candlelight tribute, a fan protest outside a
  events                                                                  venue, a surprise pop-up show spawned by a
                                                                          beat

  Exclusive                          Real money only                      A pop star's listening party, an award-show
  events                             ($3.99)                              afterparty, a legend's secret show

Exclusive events give keepsakes and recognition, not stats: an event card in the
Collection ("Seen at Vexa Monroe's listening party"), a profile badge, a plus-one, and a
News mention, exactly as in Clout City. Fame, Mood and Confidence match a comparable
club night, with diminishing returns.

Real-money products (P1)

  Product                              Price                  Promotion                                  Fame

  Exclusive events                     $3.99                  Promoted first: the first real-money       Diminishing
                                                              purchase players see                       returns

  Story side arcs                      $2.99                  Promoted second, inside the story          None
                                       each

  Collector items                      Set per                Not promoted; a few rare instruments       Diminishing
                                       item                   and stage outfits found while              returns
                                                              browsing

  Monument                             $0.99                  Offered once on the monument's card        None
  postcards                            each                   right after a visit

Payment rules are unchanged: hosted Stripe Checkout, one-time payments, the webhook
is the only thing that grants access, hasEntitlement(player, sku) is the single gate, a
refund revokes the item and takes back its exact fame, prices live in Stripe and config, and
only these products show $ prices, the gold border and the             ✨ REAL CASH tag.
Never sold, ever: C$, fans, fame, songs, venue unlocks, retries, continues, Hype, practice
tools, bandmate Chemistry, or anything that changes a show's result.

8. Age, Energy, income, fame and travel
These rules close the loop: day jobs and shows earn cash, meals restore Energy, shows
turn skill into fans and fame, and fans open brand deals.

Age and stats
     18+, confirmed at sign-up, as in Clout City.
     Energy, Mood and Confidence follow Clout City section 13: shows, visits, shifts,
     rehearsal and travel spend Energy; meals, venue snacks, napping, sitting, home
     cooking and the small midnight top-up restore it. At zero Energy players can read, vote,
     chat, shop, practice and pay bills, but can't play shows, visit, rehearse or work. Mood
     and Confidence multiply fame gains; Confidence drifts down a little each day.

Income

  Source                  What it pays                        Notes

  Shows                   Venue fee, door share, fans, fame   The main income once a player reaches
                          (section 4.9)                       Local Act

  Daily                   Cash each, plus an all-done bonus   Unchanged
  tasks

  Day jobs                Cash per shift, no fame             Barista at The Grind, clerk at Riff & Ruin,
                                                              valet at Hotel Valencia, film extra at
                                                              Backlot 9. Limited only by Energy

  Busking                 Small tips, no fame                 Lookout Park, once a day; a cheap
                                                              Confidence boost

  Brand                   Big cash, no fame (below)           The Deals app
  deals

Brand deals (Clout City's gigs, re-themed)
Brand deals are rarer, bigger-paying jobs, gated by fans instead of Confidence, because
brands pay for audiences.

 Tier              Example                                    Fans     Offered         Pay (vs.     Energy (vs.    Wait
                                                              needed                   one shift)   one shift)

 Session           "Play tambourine on a boy                  None     Most days       2 to 3×      1.5×           1 hour
 gig               band's comeback single.
                   Don't ask questions."

 Brand             "Write a six-second jingle for             1,000    About every     4 to 6×      2×             2
 deal              an oat-milk energy drink"                           other day                                   hours

 Big               "Your song in the trailer for a            10,000   Once or twice   10 to 15×    3×             4
 break             streaming show about sad                            a week                                      hours
                   vampires"

All Clout City gig rules apply: personal offers refresh and expire at New York midnight,
one active deal at a time, Energy paid up front, cash when the wait ends, never bought or
skipped with real money, invented brands and clients only, and stories can inject story
deals.

Balance targets: day jobs plus daily tasks cover the cheapest room, the phone bill and
budget meals with a small surplus; Rusty Amp shows plus session gigs cover one
bandmate; Basement shows and brand deals fund a full band and a better room; a big
break makes the Garage Bungalow or the band van reachable within weeks. Watch
median bank balance and days to Buzzing in analytics; tune venue fees and deal
multipliers first.

Fame
Unlike clout in Clout City, fame unlocks venues (the fame ladder in the Concept Note).
Fame comes from shows, place visits, events, story tasks, correct predictions, invites,
hunts and purchases (with diminishing returns). Fame never decreases, so a venue, once
unlocked, stays unlocked. Fame tiers also appear as a title on the profile.

Travel
Unchanged from Clout City: no spending before arriving; "Go there" with walk, metro,
rideshare or own ride, priced by simple distance bands; a skippable trip view; personal
timers that never move the shared city clock. Echo Flats is compact, so most trips are
short.

9. Story mode
Clout City section 9 applies unchanged in structure: one main story at a time, 6 to 10
beats, one per real day, a hidden truth solvable from free content, 2 to 3 predictions with
live results and "Called It" badges, world hooks, three $2.99 side arcs per story, late-joiner
catch-up, the archive and shadow guesses, all in the News app.

     The pilot: "Who Cancelled the Midnight Saints?", a 10-beat Echo Flats mystery about a
     band whose Marquee headline show is cancelled the night before a label signing. It's a
     lighter mystery than Sarah Bird: nobody dies.
     Music hooks stories can use on top of Clout City's (see the World State brief): cancel
     or add a show slot at a venue, add a limited-time story song, pack a venue with fans
     (ticket price up, with a reason banner), and inject story tasks such as "Play a show at
     The Rusty Amp the night the Saints play The Basement."
     The pilot start is set manually in the Story Studio when the player base is ready, on a
     Sunday.
     Shop story items work as in Clout City (a limited "Justice for the Saints" tour tee).

10. World State and the two clocks
The World State layer follows the World State Layer Brief and Clarifications section 12 of
Clout City: one source of truth, story days on a server-authoritative New York clock,
protected systems, cost-only price changes, the time-travel tool, the debug panel and the
Story Studio.

Added protected systems: the tutorial open mic, show scoring (timing windows, points,
stars, fans, fame), the Crowd meter, practice, and bandmate quitting. Stories can cancel or
add a show slot but never change how a show is scored.

Two clocks, unchanged: the city clock (one day every 2 real hours, shown in the HUD) sets
day and night, venue opening hours and show-slot times; the story calendar (real New
York days) controls beats, predictions, resets, the one-paid-show-per-venue limit, fame
cooldowns, chat limits, bills, band pay and the leaderboard. Anything that pays out follows
the story calendar.

11. Chat
Unchanged from Clout City section 10: a Messages app, 10 messages per player per day, a
word filter, block, report and the admin review queue (now in the Story Studio).

12. Sound and music
Two layers of audio, sharing the HUD speaker icon.

 1. Background music on the map and in menus: original lo-fi and indie loops, starting on
     the first tap, mute remembered per player (as in Clout City).
 2. Show audio in the performance game: song stems, crowd reactions (cheers, chatter,
     boos), and note feedback. The HUD mute applies to background music only; shows
     have their own volume in Settings, defaulting to on, because the performance game
     can't be played well in silence.
 3. Tracks: original or properly licensed music only (section 4.12). No real songs.

13. Crushes and date nights
Clout City section 14 applies unchanged (mutual-only crushes, crush invites, date nights,
safety, in-app notifications, gender-neutral copy), with one addition: "Come to my show."
A date night can be set at a venue where the sender has today's slot; the bonus pays
when the date has visited the venue ("Watch a show") and the sender has played there
that day. The second story is a dating comedy, and Lola's dating column runs weekly.

14. Treasure hunts
Clout City section 15 applies (weekly, opt-in, Monday to Sunday, 4 to 5 steps with "Ask
around," multiple-choice questions with a 10-minute retry, a finale, free hunt cards, cash
and fame, a badge after four), with one track per starting scene:

  Scene                                  Treasure

  Garage Rocker                          The first fuzz pedal ever sold in Echo Flats

  Bedroom Pop                            A lost cassette from a one-hit wonder

  Trap Hopeful                           A chain a legend left at Echo Room Studios

  Indie Sadcore                          A notebook of unreleased lyrics

  Synthwave Kid                          A prototype keytar

  Country Crossover                      A rhinestone guitar strap

  Mall Punk                              A signed skate deck from a band's first tour

  Afrobeats Dreamer                      A talking drum from a legendary session

All treasures and the musicians behind them are invented. From v0.4, a hunt step can be a
short riff challenge: echo a 4-note phrase at Echo Room Studios (call-and-response, any
accuracy above 60% passes; never a skill wall).

15. Tone, metrics and P1 scope
Tone. Satirical, funny and warm about the music industry: the open mic regular who's been
"almost signed" for six years, the lawyer whose contracts have a Page 14, the influencer
launching a singing career. Shop and activity copy leans in: "Vintage amp. Previous owner
swears it was used by someone famous. Won't say who." No real artists, labels, venues or
brands.

Success metrics. First show completed; crew invite sent; day-1 return of 35 to 40%
(stretch 50%). Plus performance health (shows per day, finish versus booed-off rate,
average stars by difficulty, practice sessions, drop-off per venue tier) and Clout City's
story and money metrics.

P1 scope
     Guest entry, sign-up and the four-step creator (Look, Sound, Birth lottery, Home) with
     eight starting scenes and two instruments (Guitar, Keys).
     The welcome, five tooltips and the protected first open mic with the tutorial song.
     The illustrated Echo Flats map with 19 places, locked districts, the Halo Dome and the
     CLOUTWOOD sign.
     The performance game: four difficulties, six original songs, Hype, crowd calls, the
     Crowd meter, results, practice and calibration.
     Four venues gated by fame; fans; the band with Chemistry, rehearsal and quitting.
     The fame leaderboard, Shop (six categories), Net Worth, selling, bills (rent, phone, band
     pay), day jobs and brand deals.
     Club nights, free story events and exclusive events; the four real-money products
     through one Stripe Checkout flow.
     Invites and crew, chat, crushes and date nights, weekly treasure hunts, background
     music.
     The News app with "Who Cancelled the Midnight Saints?" and three side arcs, the
     World State layer, the Story Studio, the time-travel tool and debug panel.

Later
Other districts, the Echo Bowl and the Halo Dome; DJ, Vocals and Drums; recording and
releasing singles with streaming royalties; tours; player bands and battle of the bands;
song leaderboards; merch tables at venues; city news beyond stories (it arrives in v0.4

per the New Features Spec).

Open questions
     Song production. Partly decided: an AI music tool with full commercial rights makes
     songs 1 to 4, through the song pipeline (New Features Spec section 7). Still open: who
     makes songs 5 and 6 and the pilot's story song (AI or commissioned), decided before
     v0.4.
     Instrument shown on stage. The 3D avatar is posed and rendered to 2D sprites for the
     stage, or drawn as 2D art; decide in the v0.2 art test.
```
