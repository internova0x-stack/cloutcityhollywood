// The districts (owner decisions: Echo Flats on Echo Park and Silver Lake streets; the rest locked). Rough
// outlines in real lat/lng, a name, where the lock pill sits and Lola's one-line teaser. Pure data.

import type { LatLng } from "./geo.ts";

export type DistrictId = "echo_flats" | "starline_blvd" | "neon_row" | "canyon_heights" | "studio_lot" | "pier_district";

export interface District {
  id: DistrictId;
  name: string;
  /** Outline: [lng, lat] corners, closed. */
  ring: [number, number][];
  labelAt?: LatLng;
  teaser?: string;
}

const box = (s: number, w: number, n: number, e: number): [number, number][] => [[w, s], [e, s], [e, n], [w, n], [w, s]];

export const DISTRICTS: District[] = [
  { id: "echo_flats", name: "Echo Flats", ring: [[-118.2860, 34.0890], [-118.2790, 34.0960], [-118.2560, 34.0960], [-118.2350, 34.0880], [-118.2330, 34.0690], [-118.2560, 34.0660], [-118.2760, 34.0720], [-118.2860, 34.0890]] },
  { id: "starline_blvd", name: "Starline Boulevard", ring: box(34.0960, -118.3420, 34.1060, -118.3000), labelAt: [34.1010, -118.3210],
    teaser: "Stars in the sidewalk, costumed strangers and a guy selling maps to houses he's never seen. Starline isn't ready for you yet, babe." },
  { id: "neon_row", name: "Neon Row", ring: box(34.0880, -118.3950, 34.1000, -118.3600), labelAt: [34.0940, -118.3770],
    teaser: "Where bands get discovered, signed and dropped in one weekend. Get some fame first, sweetie. The doorman reads the charts." },
  { id: "canyon_heights", name: "Canyon Heights", ring: box(34.1080, -118.3600, 34.1350, -118.3000), labelAt: [34.1200, -118.3300],
    teaser: "Infinity pools, gated driveways and neighbors who 'used to be in a band'. The gate code changes when you get famous. Not before." },
  { id: "studio_lot", name: "Studio Lot", ring: box(34.1400, -118.3450, 34.1750, -118.3000), labelAt: [34.1560, -118.3220],
    teaser: "Soundstages, golf carts and a cafeteria where everyone is pitching something. You need a pass, babe. I'm working on it." },
  { id: "pier_district", name: "Pier District", ring: box(33.9850, -118.5050, 34.0300, -118.4600), labelAt: [34.0080, -118.4820],
    teaser: "A pier, a boardwalk and drummers who've played the same beat since 1987. The beach can wait. The rent can't." },
];

export const LOCKED_DISTRICTS = DISTRICTS.filter((d) => d.id !== "echo_flats");

/** GeoJSON for the map style, each district marked locked or not. */
export function districtShapes(locked: ReadonlySet<DistrictId>): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: DISTRICTS.map((d) => ({
      type: "Feature",
      properties: { id: d.id, name: d.name, locked: locked.has(d.id) },
      geometry: { type: "Polygon", coordinates: [d.ring] },
    })),
  };
}
