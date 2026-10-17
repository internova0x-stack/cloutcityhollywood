// The Sound step's choices (Clarifications 1, 3b). The database checks the same ids (migration 0002).

export const SCENES = [
  { id: "garage_rocker", label: "Garage Rocker", emoji: "🎸" },
  { id: "bedroom_pop", label: "Bedroom Pop", emoji: "🛏️" },
  { id: "trap_hopeful", label: "Trap Hopeful", emoji: "🎤" },
  { id: "indie_sadcore", label: "Indie Sadcore", emoji: "🌧️" },
  { id: "synthwave_kid", label: "Synthwave Kid", emoji: "🌆" },
  { id: "country_crossover", label: "Country Crossover", emoji: "🤠" },
  { id: "mall_punk", label: "Mall Punk", emoji: "🧷" },
  { id: "afrobeats_dreamer", label: "Afrobeats Dreamer", emoji: "🥁" },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const INSTRUMENTS = [
  { id: "guitar", label: "Guitar", emoji: "🎸" },
  { id: "keys", label: "Keys", emoji: "🎹" },
] as const;

export type InstrumentId = (typeof INSTRUMENTS)[number]["id"];

/** A scene's label and emoji; players who haven't picked yet show as a fresh face. */
export function sceneOf(id: string | null | undefined) {
  return SCENES.find((s) => s.id === id) ?? { id: null, label: "New in town", emoji: "✨" };
}
