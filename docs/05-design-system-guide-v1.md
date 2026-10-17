# Clout City: Hollywood Music — Design System Guide (v1)

> Converted from the PDF in `docs/pdf/05-design-system-guide-v1.pdf` (the original). Owner decisions that change this document are in `docs/00-owner-decisions.md` and win over it.

```text
Clout City: Hollywood Music — Design
System Guide (v1)
  ​Oct 17, 2026       · ​@Internovatechnologies

This is the builder spec for Clout City: Hollywood Music's UI. It is a delta on the Clout City
Design System Guide (v2): copy that guide into the repo's docs folder; everything in it
applies unless this guide changes it. This guide covers what changes for Hollywood, the
illustrated map, and the new performance-game screens (C46 to C65). Game rules come
from Clarifications & Updates; where they disagree on behavior, Clarifications wins.

Sizes are in iPhone points at a 390 pt portrait viewport, as in Clout City.

1. Design principles
Clout City's seven principles carry over (glass over the world, pills as the atom, two
weights of text, one loud button, real money always marked, delight through emoji and
wit, characters as the hero). Two are added for the performance game.

 8. The highway is sacred. During a show nothing covers the lanes: no toasts, no prompts,
    no banners, no HUD. Every pixel either helps the player hit the next note or shows how
    the crowd feels.
 9. Read in a glance, feel in the thumbs. Notes are big, high-contrast and distinct by shape
    as well as color; every hit gets instant visual and audio feedback within one frame of
    the tap.

2. Brand layer: from NYC night to Hollywood after dark
The system keeps Clout City's structure and most tokens and swaps the city's mood: taxi
cabs and wet streets become marquee bulbs, spotlights, sunset haze and stage neon.

  Clout City: NYC                                        Clout City: Hollywood Music

  Key art: rainy night street, bridge, yellow            Key art: a marquee at dusk with the player's
  cabs                                                   name in bulbs, palm silhouettes, the
                                                         CLOUTWOOD sign on the hill, the Halo Dome
                                                         glowing in the distance

  Taxi yellow accent (taxi-400)                          Spotlight yellow: the same hex, renamed
                                                         spotlight-400. Fame star, active nav tab,
                                                         progress

  Clout City: NYC                                              Clout City: Hollywood Music

  Neon magenta for nightlife and LIVE                          Unchanged, and the color of the stage

  Hazard stripes for closures                                  Marquee bulbs (a dotted edge of warm lights)
                                                               for announcements and "Coming soon"; hazard
                                                               stripes stay only for story closures

  Night map generated from street                              Hand-illustrated town map in a sunset-to-night
  geometry                                                     palette (section 4)

  Clout flame                                                  Fame star

  Tagline "TAP IN. BLOW UP"                                    "PLAY LOUD. BLOW UP." in the same tagline
                                                               style

  Logo "CLOUT CITY NYC"                                        "CLOUT CITY" wordmark (unchanged asset)
                                                               with a "HOLLYWOOD MUSIC" badge in place of
                                                               "NYC"

Unchanged: red main buttons, gold for real money only (logo, tagline, real-cash card
border,      ✨ REAL CASH tag), cream light sheets, dark glass chrome, C$ for virtual cash, the
3D chibi avatar on a night stage, Bungee, Barlow Condensed and Inter.

3. Color and type
All Clout City core, status, gold, glass and type tokens stay. The taxi tokens are renamed
spotlight (same values), and three groups are added: lane colors, judgment colors and
stage gradients.

Renamed

  Clout City token                 Hollywood token       Hex

  taxi-400                         spotlight-400         #FFC21A

  taxi-500                         spotlight-500         #F2A900

  taxi-tint                        spotlight-tint        #FFF3CC

Lane colors (performance game only)
Each lane has a color and a shape, so the lanes read without color. The order deliberately
differs from any well-known rhythm game's fret colors. Open Mic uses lanes 1 to 3.

  Lane         Token                        Hex          Note shape

  1            lane-cyan                    #2EC4FF      Circle

  2            lane-magenta                 #FF2E88      Diamond

  3            lane-spotlight               #FFC21A      Square

  4            lane-lime                    #8BE04B      Triangle

Notes are drawn as the shape filled with the lane color, a 2 pt text-on-dark outline and a
soft glow at 35%. Hold tails use the lane color at 55%. Hype notes are a white star with a
lane-colored rim and a pulsing glow.

Judgment and meter colors

  Token                        Hex                                  Use

  judge-perfect                #FFF6E0 with a neon-500              "PERFECT" text and hit sparks
                               glow

  judge-great                  #8BE04B                              "GREAT"

  judge-good                   #2EC4FF                              "GOOD"

  judge-miss                   #D93A2F at 80%                       "MISS" and the brief lane flash

  crowd-losing-                neon-500 #FF2E88                     Crowd meter 80 to 100
  it

  crowd-into-it                green-500 #40B589                    Crowd meter 50 to 79

  crowd-                       spotlight-400 #FFC21A                Crowd meter 25 to 49
  restless

  crowd-booing                 red-500 #D93A2F                      Crowd meter 0 to 24

  hype-500                     #B57CFF                              Hype meter fill, Hype button, highway glow
                                                                    while Hype is active

Hype gets its own violet so it never reads as a crowd state or as real money. Gold never
appears anywhere in the performance game.

New gradients

  Name                       Stops                                   Where

  sunset-sky                 #2B1A4A → #C23B6E 55% →                 Splash, guest map sky at dusk, share
                             #FF8A3D 100%, linear 180°               cards

  stage-spot                 #14111A base + radial #FFC21A at        Behind the highway on every stage
                             18% from top centre + radial
                             #FF2E88 at 22% bottom

  hype-surge                 #B57CFF → #FF2E88, linear 90°           The highway edges and the Hype
                                                                     button while Hype is active

  marquee-                   repeating radial dots, #FFE7A8 4 pt     Announcement bars, "Coming soon,"
  bulbs                      every 12 pt on night-900                the results header

Type additions

  Token                          Family / weight                   Size               Example

  show-score                     Barlow Condensed 700,             22 / 24            "184,520"
                                 tabular

  show-                          Bungee                            20 / 24            "×4"
  multiplier

  judgment                       Bungee                            18 / 20,           "PERFECT"
                                                                   uppercase

  callout                        Bungee                            24 / 28            "50 NOTE
                                                                                      STREAK!"

  results-stars                  Native star glyph, spotlight-     32 pt              ★★★★☆
                                 400

Everything else uses Clout City's type scale. Fame uses hud-number in spotlight-400,
exactly where clout was.

4. Reused components (C1 to C45)
Every Clout City component is reused with its anatomy, sizes, states and motion. This
table lists only what changes; anything not listed is built exactly as specified in the Clout
City guide.

  Component                                              Change for Hollywood Music

  C1 HUD                                                 Clout flame → fame star (outline star + number,
                                                         spotlight-400). Everything else unchanged

  C2 Invite and players-online pills                     Unchanged

  C3 Side icon column                                    Six icons: Tasks/Goals (checklist), Shows
                                                         (microphone), Places (building), Band
                                                         (drumsticks), Bills (receipt), Your Look (person).
                                                         Shows badge: a slot just opened or an event starts
                                                         soon. Band badge: low Chemistry or band pay due

  C4 Stats panel                                         Unchanged; suggestions point to practice or the
                                                         open mic for low Confidence, the Deals app for
                                                         high fans

  C5 Bottom nav                                          Unchanged (Home, Map, Phone, Shop)

  C6 Story prompt                                        Copy: "Echo Flats has a mystery. Think you can
                                                                             🎸
                                                         crack it?" Emoji tile

  C8 Buttons                                             Unchanged. "Take the stage" and "Play a show" are
                                                         primary-red

  C10 Style chips                                        Become scene chips in the Sound step: Garage
                                                         Rocker, Bedroom Pop, Trap Hopeful, Indie Sadcore,
                                                         Synthwave Kid, Country Crossover, Mall Punk,
                                                         Afrobeats Dreamer

  C14 Step progress                                      Four segments: Look, Sound, Birth lottery, Home

  C15 Tooltip                                            Tooltip 5 targets the Shows icon

  C16 Reason banner                                                     🎟️
                                                         New variants: " Show cancelled: venue double-
                                                                   📈
                                                         booked," " Tickets +50%: fans lining up for the
                                                         Saints"

  C19 to C21 Map                                         Replaced by the illustrated map (section 5)

  C22 Live ticker                                        Adds show results: "🎸 @maya got 5 stars at The
                                                         Rusty Amp"

  C23 Item card                                          Instruments and Gear show the instrument on a
                                                         small stage tile; meta reads "Cosmetic: doesn't
                                                         change your score" on every instrument and gear
                                                         card

  Component                                              Change for Hollywood Music

  C26 Event cards                                        Club event → club night; the first-task party → the
                                                         open mic card ("Happening now," "Bring the crew"
                                                         secondary, "Take the stage" primary-red)

  C27 Leaderboard                                        Overline "ECHO FLATS LEADERBOARD"; fame in
                                                         spotlight-500; each row shows fame tier as a small
                                                         tag

  C28 Profile                                            Status row:⭐               👥
                                                                          fame · rank ·      💎
                                                                                        fans ·  net worth.
                                                         Adds fame tier title, band (name and member
                                                         portraits), instrument, best show and setlist
                                                         progress

  C29 Phone                                              Apps: News, Messages, Bank, Deals (renamed
                                                         Gigs), Settings. Wallpaper uses sunset-sky. City
                                                         line reads "Echo Flats"

  C30 to C34 Story cards                                 Unchanged; Lola's byline avatar gets sunglasses

  C36 Gig card                                           Becomes the deal card: tier tags SESSION GIG,
                                                         BRAND DEAL, BIG BREAK; gate line reads "Needs
                                                         1,000 fans (you have 640)"

  C37 Location card                                      Venues add a show row (C58) above the visit
                                                         actions. Instruments shop adds the Musicians
                                                         Wanted row

  C38 Interior scene                                     Adds the stage template (C59) for venues; the
                                                         eight Clout City templates are reused for homes,
                                                         café, diner, store and studio

  C39 Collection                                         Tabs: Postcards, Hunt cards, Event cards, Show
                                                         cards (one per venue on your first 5-star show)

  C42 Treasure hunt                                      Unchanged; tracks named by scene

  C43 Your Look                                          Adds an Instrument tab; the avatar holds the
                                                         selected instrument

  C44 Bank                                               Card name "Bank of Clout" unchanged;
                                                         transactions name venues ("Show · The Rusty
                                                         Amp") and band pay

  C45 Bills                                              Adds band pay rows, one per bandmate

5. The illustrated map (replaces C19 to C21)
The map follows Lagos Life rather than Clout City's real-street map: one contained, hand-
illustrated board of a fictional town, where every building is a recognizable drawing and
the whole neighborhood fits on about a screen and a half.

C46. Illustrated base map
     Art: a single illustration of Echo Flats and its surroundings in a three-quarter top-down
     view (about 30° tilt), drawn at 3× for a 390 pt viewport. Buildings are chunky, slightly
     exaggerated sprites with readable silhouettes (a café with a striped awning, a dive bar
     with a guitar sign, a theater with a bulb marquee); roads, palms, a low hill with the
     CLOUTWOOD letters, and a strip of the locked districts on every edge.
     Two versions: day (warm, sunlit) and night (navy shadows, lit windows, glowing signs
     and neon). The 2 s crossfade from Clout City runs as the city clock passes dusk and
     dawn.
     Camera: pan within fixed bounds (the board never scrolls into emptiness), two zoom
     levels (overview and street). Default view centres on the player's home with the Halo
     Dome visible on the far edge.
     Performance: the map ships as image tiles per zoom level; only pins, vehicles, labels
     and overlays draw live. No street data, no map library.
     Palette guidance for the artist: night-800 to night-700 for shadowed ground, sunset-
     sky for the dusk sky band, spotlight-400 and neon-500 for signs, no gold anywhere, no
     real signage, logos or real buildings.

C47. Building labels and pins
     Each place is its building sprite plus a name plate: a glass-dark pill (24 pt) under the
     building with a 16 pt emoji tile and the name in Inter 600 12 pt. Tapping the building or
     the plate opens the location card (C37).
     Venues get a marquee plate instead: night-900 with a 1 pt row of marquee bulbs on top,
     the venue name in Barlow Condensed 700 13 pt uppercase, and a status line: " Slot    🎤
     open" (neon-600 dot), "Doors in 25 min," "Played today ✓" or        🔒 with the fame tier
     needed.
     Story places show a small neon-600 dot during an active beat; closed places dim to
     50% with a           🚨 tile; hunt steps show a 🔍 marker. Decorative vehicles loop the roads
     beneath the plates (Clout City rules).
     The player's marker is their avatar head in a spotlight-400 ring on their current building;
     the locate button recentres on it.

C48. Locked district
     Locked districts sit under soft, slowly drifting illustrated clouds (night-700 at 85%),
     with the district's tallest landmark poking through.
     A centred pill:          🔒 + district name + "Coming soon" in meta, with a marquee-bulbs edge.
     Tapping opens a sheet with the district's illustration and a one-line Lola teaser.
     Reduced motion stops the drift.

C49. The Halo Dome and the fame ladder card
     The stadium sits on the far edge of the map, always lit, with slow sweeping searchlights
     at night (off under reduced motion). Its plate reads "Stadium Status        🔒."
     Tapping it opens the fame ladder card: a bottom sheet with the six tiers as a vertical
     ladder (Nobody at the bottom, Stadium Status at the top), each with its venue name,
     capacity and fame needed; the player's avatar head sits on their current rung with a
     spotlight-400 progress bar to the next. Unlocked rungs are full color, P1-locked rungs
     show "Coming later."

6. The show screen at a glance

show screen · portrait, Bar difficulty, 4 lanes

Everything a player needs mid-song sits at the highway's edges: score and progress on
top, the Crowd meter on the left, Hype on the right, and the multiplier just above the hit
line. Section 7 specifies each part.

7. Performance components (C50 to C57)
The show screen is full-screen and portrait. The main game HUD, side column, nav and
ticker are hidden for the whole song; the only chrome is the show HUD, the two meters
and a pause button.

C50. Show HUD
     A 44 pt strip at the top inside the safe area, on glass-dark at 50%: song title (Inter 600
     13 pt, text-on-dark) and venue (meta) on the left; score in show-score, tabular, on the
     right.
     Under it, a 3 pt song progress line across the full width (text-on-dark at 20% track,
     spotlight-400 fill), with small ticks marking Hype phrases and crowd calls.
     The multiplier sits just above the hit line, centred: a night-900 circle 40 pt with show-
     multiplier text in spotlight-400 (×1 is shown dim at 40%). It pops (scale 1 → 1.25 → 1)
     each time it rises; at ×8 during Hype it turns hype-500.
     Pause: a 36 pt icon-round (glass-dark) top-left. It opens a small sheet: Resume, Restart
     (practice only), Quit ("The crowd will remember"). Resuming runs 3, 2, 1.

C51. Note highway and lanes
     The highway fills the space between the meters: about 300 pt wide at the hit line,
     narrowing to about 60% at the top for depth, on the stage-spot backdrop. Lane
     dividers are 1 pt text-on-dark at 18%; beat lines cross the highway every beat at 8%
     (every bar at 16%).
     The hit line sits 22% up from the bottom: one 3 pt text-on-dark line at 70% with a
     target per lane, an outlined copy of that lane's note shape (2 pt, lane color).
     Tap zones are the full lane width from the bottom edge to 40 pt above the hit line. They
     are invisible except for feedback: a pressed lane brightens its target and shows a 40%
     lane-color column for as long as the thumb is down.
     Lane counts: 3 at Open Mic (lanes 1 to 3, each wider), 4 everywhere else. Minimum lane
     width at the hit line: 64 pt.
     Behind the highway, the stage (C59) shows the player's avatar, bandmates and the
     crowd, kept to 35% brightness under the highway so notes always win.

C52. Notes

  Note                      Look                                                    Size at the hit line

  Tap                       Lane shape filled with lane color, 2 pt cream           48 pt
                            outline, 35% glow

  Hold                      Tap note head plus a tail of lane color at 55%, 18 pt   48 pt head
                            wide; the tail brightens while held and sparks at
                            the end

  Chord                     Two tap notes joined by a 2 pt cream bar                48 pt each

  Note                      Look                                                     Size at the hit line

  Power strum               Tap note with an upward chevron inside and a short       48 pt
                            vertical streak above it

  Hype note                 White star with a lane-color rim and a pulsing hype-     52 pt
                            500 glow; the phrase is bracketed by a faint violet
                            band on the highway

Notes scale with perspective as they travel (about 55% size at the top). "Big notes" in
Settings adds 15%.

C53. Judgments, sparks and callouts
     Judgment text (judgment style) pops 40 pt above the hit line in that lane: PERFECT,
     GREAT, GOOD or MISS in their judgment colors, rising 12 pt and fading over 300 ms.
     Only the latest judgment per lane shows.
     Hit sparks: a burst of 6 to 10 lane-colored particles from the target on every hit; a
     bigger burst and a cream ring on Perfect. A miss flashes the lane red at 25% for 120 ms
     and dims the note.
     Callouts (callout style, text-on-dark with a neon-500 glow) slide in from the top of the
     highway and leave within 1.2 s: "HOT START!", "50 NOTE STREAK!", "HYPE READY!",
     "CROWD'S ON ITS FEET!". Never more than one at a time, and never over the bottom
     third of the highway.

C54. Crowd meter
     A vertical capsule on the left edge, 14 × 220 pt, glass-dark track, centred on the
     highway's lower half. Fill rises from the bottom in the crowd color for its range (booing
     red, restless yellow, into-it green, losing-it neon), with a cream needle line at the
     current value.
     Above it, a live crowd label pill (glass-dark, label-tag): LOSING IT, INTO IT, RESTLESS or
     BOOING, with an emoji (                    🔥, 🙌, 😐, 👎). The label crossfades when the range changes.
     In Booing, the capsule pulses red every 0.8 s and the screen edges get a faint red
     vignette. Under reduced motion, the pulse becomes a steady red outline.

C55. Hype meter and Hype button
     A matching vertical capsule on the right edge, filling in hype-500, with a tick at 50%.
     Below it, the Hype button: a 56 pt circle, dim (night-900, hype-500 outline at 40%) until
     the meter reaches 50%, then full hype-surge fill with a breathing glow and the label
     "HYPE" in Bungee 12 pt. It sits within thumb reach above the right lane's tap zone,

     never inside it.
     While Hype is active: the highway edges glow with hype-surge, the lanes' beat lines
     turn violet, the crowd raises lighters on the stage, the multiplier turns hype-500, and
     the meter drains visibly.

C56. Crowd call strip
     During a crowd call the highway dims to 30% and a call strip slides down from the top:
     a glass-dark band 88 pt tall, full width minus 24 pt, radius-lg.
     Inside: a horizontal timeline with beat ticks, the phrase's notes as small lane shapes (28
     pt) in their lane colors, and a cream cursor sweeping left to right. Overline "THEY
     CALL" during the call; "YOU ANSWER" during the response.
     During the response, the player taps the lanes on the highway's tap zones as usual;
     each echoed note lights its icon on the strip with its judgment color. An echo label
     (Nailed it, Close, Off) shows at the strip's right end. A clean echo plays "THEY SANG IT
     BACK!" as a callout.

C57. Results card
     A full-screen sheet over the dimmed stage, rising after the last note: a marquee-bulbs
     header with the venue name, then the star rating (results-stars, popping in one by
     one), the score in display-xl, and a 2 × 2 grid of stats (accuracy, best streak, crowd
     peak, notes hit) in show-score with overline labels.
     Badges row when earned: FULL COMBO (neon-600 label), NEW BEST (spotlight-tint
     info badge), first 5-star show card.
     Rewards row:             👥 +fans, ⭐ +fame (spotlight-400), +C$ (green-text), each counting up
     over 600 ms. If fame was already earned at this venue today, the fame chip reads
     "Fame again tomorrow."
     Lola's one-line review in body italics ("Four stars. The bartender stopped pouring to
     listen. Briefly.").
     Buttons: primary-red "Continue," primary-night "↗ Share" (C65), and in practice a
     secondary "Play again."
     Booed-off variant: the header turns red-500 with "BOOED OFF," no stars, the partial
     pay, Lola's roast, and a primary-red "Try again" when today's retry is available.

8. Venue, setlist, band and setup components (C58 to C65)

C58. Show row (on a venue's location card)
     Sits above the visit actions on every venue's card (C37): overline "TONIGHT'S SLOT,"
     the difficulty as a tag (OPEN MIC, BAR, CLUB, THEATER), capacity in meta ("120 cap"),
     and the reward preview as meta chips (C$ fee range, ⚡ Energy,       👥 fans, ⭐ fame).
     Button: primary-red "Play a show" once the player is at the venue; before arriving, the
     card's main button is "Go there" as usual.
     Disabled states keep the button visible with a reason in meta: "Doors in 25 min,"
     "Played today: back tomorrow," "Needs Buzzing (1,840 / 2,500 fame)," "Need 2
     bandmates," "Not enough Energy," or a story reason banner (C16) such as "        🎟️ Show
     cancelled: venue double-booked."
     After a booed-off show: "The sound guy owes you one" with a primary-red "Try again"
     (once a day).

C59. Stage scene (new interior template)
     A 2.5D illustrated stage per venue on a shared template: back wall with the venue's
     sign, stage lights, a riser, and a crowd zone in front. Recolored and re-propped per
     venue (café corner with fairy lights, dive bar with a chain-link backdrop, club with LED
     walls, theater with velvet curtains and a balcony).
     The player's avatar stands centre stage holding their instrument; bandmates stand at
     marked spots behind. Avatars on stage are pre-rendered 2D sprites from the 3D
     model (idle, playing loop, Hype pose, bow), so the stage stays fast on low-end phones.
     Crowd density follows turnout: 6 to 40 crowd sprites, filling from the front. Crowd
     animation follows the Crowd meter: bob (Into It), jump with raised hands (Losing It),
     arms crossed and looking at phones (Restless), thumbs down (Booing).
     Outside a show, the stage is the venue's interior: the player can walk around and
     "Watch a show," where an NPC act plays on stage.

C60. Setlist picker
     A bottom sheet titled "Pick your song," with the venue and difficulty in subtext.
     One row per song: an album-tile (56 pt, original cover art), title in title style, feel and
     BPM in meta, the player's best stars at this difficulty (★ row, spotlight-500 on, divider
     off) and a NEW label on unplayed songs. Locked songs stay in the list dimmed with
     their unlock condition ("Unlocks at Buzzing").
     A story song (when live) sits at the top with a neon "LIMITED" tag and its window
     ("Playable until Saturday").

     Tapping a row selects it (selection card, single); primary-red "Take the stage" starts the
     soundcheck: a pill-solid "Soundcheck… 80%" over the stage while audio loads, then a
     3, 2, 1 in display-xl.

C61. Band screen
     Opened from the Band icon (C3). Header: the band name in display-lg with an edit
     pencil (once a week) and the number of members.
     One card per member (surface-card, radius-lg): portrait (56 pt), name and role in title,
     personality line in subtext, the weekly fee in meta, and a Chemistry bar (6 pt; green-
     500 at 60+, spotlight-400 from 20 to 59, red-500 under 20) with a status word ("Tight,"
     "Fine," "Restless," "Halfway out the door"). Buttons: primary-red "Rehearse" and a ⋯
     menu with destructive "Let go" (confirmed).
     The player's own card is first, showing their instrument; empty slots show a dashed
     card with "Find a bandmate" (opens the board at Riff & Ruin).
     A warning row appears when any member is below 20: "Dez is 'taking some time to find
     himself.' 2 days to win him back."

C62. Musicians Wanted card
     Pinned-flyer style cards on a corkboard background (surface-raised, slight paper
     texture, a cartoon pushpin), one per candidate: portrait, name, role, personality line,
     starting Chemistry, weekly fee.
     Primary-green "Hire" opens a big-purchase confirmation: "Hire Dez for C$120 a week?
     Band pay is due with rent."

C63. Rehearsal
     Opens at Echo Room Studios or the Garage Bungalow: the bandmate on a small
     practice-room stage, and the crowd call strip (C56) as the full play area, five phrases
     per session.
     A progress row of five dots, then a small results card: accuracy, Chemistry change
     ("Dez +6 · Tight") and Energy spent.

C64. Calibration
     Shown once after the tutorial show and from Settings: a pulsing ring on a stage-spot
     background with the instruction "Tap the big button on every beat," eight beats, then
     "You're synced" with the measured offset in meta. A secondary "Redo" and primary-
     red "Done."
     A second, optional visual check: a flashing note and a click; the player nudges a slider
     until they line up.

C65. Show share card
     A 9:16 image for stories and a 1:1 variant: sunset-sky background, the player's avatar on
     stage, the venue name on a marquee, stars, the song title, "+37 fans," the band name
     and the game's wordmark with "PLAY LOUD. BLOW UP." No score digits smaller than 18
     pt; no real-money marks.

9. Motion, audio feedback and accessibility
Clout City's motion table stays. These rows are added for shows; every show animation is
tied to the audio clock, never to frame timing.

  Interaction                             Duration                                                     Easing

  Note travel                             Linear, set by difficulty (2.0 s to 1.4 s top to hit line)   linear

  Judgment pop                            300 ms rise 12 pt + fade                                     ease-out

  Hit spark                               250 ms burst                                                 ease-out

  Multiplier rise                         180 ms scale 1 → 1.25 → 1                                    back-out

  Callout                                 1.2 s: 150 ms slide in, hold, 200 ms fade                    ease-out

  Crowd label change                      250 ms crossfade                                             ease-in-out

  Hype start                              400 ms highway edge glow-in, then a 1.2 s                    ease-in-out
                                          breathing loop

  Results stars                           120 ms each, 80 ms apart, scale 0.6 → 1                      back-out

  Reward count-up                         600 ms                                                       ease-out

  Soundcheck to 3, 2, 1                   3 beats at the song's BPM                                    linear

Audio feedback. Hits produce no extra click sound (the music is the feedback); a miss
briefly drops the lead stem and plays a soft muted-string sound. Crowd reactions (cheers,
chatter, boos) follow the Crowd meter. Callouts have a short crowd swell. UI sounds
outside shows are unchanged from Clout City.

Accessibility.

     Lanes differ by shape as well as color; judgments are words, not just colors.
     Reduced motion: no screen shake, no flashes, no particle bursts (a simple ring instead),
     no drifting clouds or searchlights.
     Settings: note speed (1× to 1.5×), big notes (+15%), high-contrast highway (solid night-
     900 behind the lanes, stage hidden), and haptics on or off.

       Contrast: judgment words and callouts sit on the dark highway at 7:1 or better.
       Every show can be paused; leaving the tab pauses automatically.

10. Starter tokens (CSS additions)
Add these to the Clout City token file; keep every existing token, and alias the taxi tokens
to the new spotlight names during migration.

   :root {
       /* renamed (same values as taxi-*) */
       --spotlight-400:#FFC21A; --spotlight-500:#F2A900; --spotlight-tint:#FFF3CC;

       /* lanes: color + shape (circle, diamond, square, triangle) */
       --lane-1:#2EC4FF; --lane-2:#FF2E88; --lane-3:#FFC21A; --lane-4:#8BE04B;

       /* judgments */
     --judge-perfect:#FFF6E0; --judge-great:#8BE04B; --judge-good:#2EC4FF; --
   judge-miss:rgba(217,58,47,.8);

       /* crowd meter */
       --crowd-losing-it:#FF2E88; --crowd-into-it:#40B589; --crowd-
   restless:#FFC21A; --crowd-booing:#D93A2F;

       /* hype: violet, never gold */
       --hype-500:#B57CFF;
       --g-hype:linear-gradient(90deg,#B57CFF,#FF2E88);

       /* Hollywood gradients */
       --g-sunset:linear-gradient(180deg,#2B1A4A 0%,#C23B6E 55%,#FF8A3D 100%);
     --g-stage:radial-gradient(60% 40% at 50%
   0%,rgba(255,194,26,.18),transparent),
                          radial-gradient(70% 50% at 50%
   100%,rgba(255,46,136,.22),transparent),#14111A;
       --marquee-bulb:#FFE7A8;

       /* show layout */
       --hit-line:22%;                                   /* from the bottom edge */
       --lane-min:64px;                                  /* at the hit line */
       --note-size:48px;
   }

11. Build checklist
     Copy the Clout City Design System Guide (v2) into docs and ship its token file plus
     section 10's additions.
     Approve one static frame of the illustrated Echo Flats map (day and night) before
     building plates and gestures.
     Build the show screen (C50 to C57) against one placeholder song first; test timing on a
     low-end Android phone before any art.
     Lock the highway's look with one approved screenshot at each of the four difficulties.
     Build calibration (C64) before tuning timing windows.
     Build venue, setlist, band and share components (C58 to C65).
     Apply the C1 to C45 changes in section 4.
     Audit: no gold in the performance game; lanes readable in grayscale; nothing overlaps
     the highway during a show.
     Check every screen at 390 pt and keep shows at 50 fps or better on a low-end Android
     device.
```
