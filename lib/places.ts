// Echo Flats places on the map (v0.1: the four venues and the three homes). Real lat/lng (lib/map/geo.ts),
// invented names (Clarifications 3). Rents and prices arrive with the economy in v0.2.

import type { LatLng } from "./map/geo.ts";

export type PlaceCategory = "venue" | "home" | "landmark";

export interface PlacePin {
  id: string;
  name: string;
  emoji: string;
  category: PlaceCategory;
  neighborhood: string;
  at: LatLng;
  /** One line for the guest card (lore). */
  blurb: string;
}

export const PLACE_PINS: PlacePin[] = [
  { id: "the-grind", name: "The Grind", emoji: "☕", category: "venue", neighborhood: "Echo Flats", at: [34.0776, -118.2598], blurb: "A café with an open mic and a barista who has heard every song about heartbreak. Twice." },
  { id: "rusty-amp", name: "The Rusty Amp", emoji: "🎸", category: "venue", neighborhood: "Echo Flats", at: [34.0784, -118.2652], blurb: "A dive bar where the sound guy has opinions and the jukebox has more." },
  { id: "the-basement", name: "The Basement", emoji: "🪩", category: "venue", neighborhood: "Echo Flats", at: [34.0868, -118.2733], blurb: "A club under a club. The bass reaches the street before you do." },
  { id: "the-marquee", name: "The Marquee", emoji: "🎭", category: "venue", neighborhood: "Echo Flats", at: [34.0905, -118.2772], blurb: "An old theater with your name nowhere on its sign. Yet." },
  { id: "laundromat-loft", name: "Laundromat Loft", emoji: "🧺", category: "home", neighborhood: "Echo Flats", at: [34.0752, -118.2556], blurb: "A studio over a laundromat. The dryers keep time better than most drummers." },
  { id: "band-house", name: "Band House", emoji: "🏠", category: "home", neighborhood: "Echo Flats", at: [34.0818, -118.2618], blurb: "A room in a house where five bands share one fridge and zero rules." },
  { id: "garage-bungalow", name: "Garage Bungalow", emoji: "🏡", category: "home", neighborhood: "Echo Flats", at: [34.0882, -118.2662], blurb: "A bungalow with a garage you can be loud in. The neighbors have been warned." },
  { id: "cloutwood-sign", name: "The CLOUTWOOD Sign", emoji: "🌄", category: "landmark", neighborhood: "Elysian Hills", at: [34.0846, -118.2468], blurb: "Nine giant letters on the hill and a lookout where everyone practices their album-cover face." },
  { id: "halo-dome", name: "The Halo Dome", emoji: "🏟️", category: "landmark", neighborhood: "Elysian Hills", at: [34.0739, -118.2400], blurb: "Stadium Status: locked. Sixty thousand seats, and not one of them knows your name." },
];

/** Where the guest map opens: Echo Park, framed on the venues. */
export const GUEST_START = { at: [34.0815, -118.2620] as LatLng, zoom: 14.2 };
