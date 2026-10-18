// Echo Flats places on the map (v0.1: the four venues and the three homes, plus two landmarks). Where each one
// stands on the illustrated board is in lib/map/board.ts (SPOTS). Invented names (Clarifications 3). Rents and
// prices arrive with the economy in v0.2.

export type PlaceCategory = "venue" | "home" | "landmark";

export interface PlacePin {
  id: string;
  name: string;
  emoji: string;
  category: PlaceCategory;
  neighborhood: string;
  /** A venue's status line on its marquee plate (C47): the open mic, or the fame tier that unlocks it. */
  status?: string;
  /** One line for the guest card (lore). */
  blurb: string;
}

export const PLACE_PINS: PlacePin[] = [
  { id: "the-grind", name: "The Grind", emoji: "☕", category: "venue", neighborhood: "Echo Flats", status: "🎤 Open mic", blurb: "A café with an open mic and a barista who has heard every song about heartbreak. Twice." },
  { id: "rusty-amp", name: "The Rusty Amp", emoji: "🎸", category: "venue", neighborhood: "Echo Flats", status: "🔒 Local Act", blurb: "A dive bar where the sound guy has opinions and the jukebox has more." },
  { id: "the-basement", name: "The Basement", emoji: "🪩", category: "venue", neighborhood: "Echo Flats", status: "🔒 Buzzing", blurb: "A club under a club. The bass reaches the street before you do." },
  { id: "the-marquee", name: "The Marquee", emoji: "🎭", category: "venue", neighborhood: "Echo Flats", status: "🔒 Headliner", blurb: "An old theater with your name nowhere on its sign. Yet." },
  { id: "laundromat-loft", name: "Laundromat Loft", emoji: "🧺", category: "home", neighborhood: "Echo Flats", blurb: "A studio over a laundromat. The dryers keep time better than most drummers." },
  { id: "band-house", name: "Band House", emoji: "🏠", category: "home", neighborhood: "Echo Flats", blurb: "A room in a house where five bands share one fridge and zero rules." },
  { id: "garage-bungalow", name: "Garage Bungalow", emoji: "🏡", category: "home", neighborhood: "Echo Flats", blurb: "A bungalow with a garage you can be loud in. The neighbors have been warned." },
  { id: "cloutwood-sign", name: "The CLOUTWOOD Sign", emoji: "🌄", category: "landmark", neighborhood: "Elysian Hills", blurb: "Nine giant letters on the hill and a lookout where everyone practices their album-cover face." },
  { id: "halo-dome", name: "The Halo Dome", emoji: "🏟️", category: "landmark", neighborhood: "Elysian Hills", blurb: "Stadium Status: locked. Sixty thousand seats, and not one of them knows your name." },
];
