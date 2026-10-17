// Landmark buildings on the city map (ported from Clout City NYC, where the owner asked for "key buildings
// and landmarks rendered like in the earlier build"). Each one is a hand-built low-poly model (components/map/landmarkModels.ts)
// standing at its real lat/lng, drawn by a three.js layer inside MapLibre. The plain OpenStreetMap
// blocks under it are hidden, so the model replaces them. Added in batches of five.
// Pure data, safe to import anywhere.

import type { LatLng } from "./geo.ts";

export type LandmarkKind = "cafe" | "dive-bar" | "club" | "theater" | "loft" | "band-house" | "bungalow"
  | "halo-dome" | "cloutwood-sign";

export interface Landmark {
  id: string;
  /** The game place it stands for (lib/city.ts), when there is one. */
  placeId?: string;
  name: string;
  at: LatLng;
  kind: LandmarkKind;
  /** Which way the front faces, degrees clockwise from north (180 = faces south, toward the camera). */
  facing: number;
  /** Drawn bigger than life so it reads from helicopter height. */
  scale: number;
  /**
   * Its site: meters around it (at that scale) where OpenStreetMap buildings are hidden and the
   * ground covers the streets, so a landmark bigger than a block merges the blocks under it
   * (owner, Oct 16: "the white roads don't pass under them"). Traffic stops at the edge.
   */
  clear: number;
  /**
   * What the site's ground is: park grass or a city block. "none" is a structure that stands
   * where it is over roads or water (a bridge): no site, no placement, traffic drives through.
   */
  ground: "park" | "block" | "none";
  /**
   * A bridge's length between its shores, in meters (the model stretches to it). On a structure
   * over a street (an elevated station) it's the strip along the street, `clear` meters either
   * side, where the buildings are hidden.
   */
  length?: number;
}

/** Where the map stood a landmark: placement moves it; a bridge also turns and stretches to its road. */
export interface Spot { at: LatLng; facing?: number; length?: number }

/** The length the bridge model is built at (components/map/landmarkModels.ts), before stretching. */
export const BRIDGE_BUILT_M = 1136;

/**
 * v0.1 (owner decisions: the NYC map style on Echo Park and Silver Lake streets): the four venues and the
 * three homes of Echo Flats, then the map-flavor landmarks in the Elysian Park hills. Invented names only.
 */
export const LANDMARKS: readonly Landmark[] = [
  { id: "the-grind", placeId: "the-grind", name: "The Grind", at: [34.0776, -118.2598], kind: "cafe", facing: 180, scale: 2.4, clear: 30, ground: "block" },
  { id: "rusty-amp", placeId: "rusty-amp", name: "The Rusty Amp", at: [34.0784, -118.2652], kind: "dive-bar", facing: 180, scale: 2.2, clear: 38, ground: "block" },
  { id: "the-basement", placeId: "the-basement", name: "The Basement", at: [34.0868, -118.2733], kind: "club", facing: 180, scale: 2, clear: 50, ground: "block" },
  { id: "the-marquee", placeId: "the-marquee", name: "The Marquee", at: [34.0905, -118.2772], kind: "theater", facing: 180, scale: 2, clear: 45, ground: "block" },
  { id: "laundromat-loft", placeId: "laundromat-loft", name: "Laundromat Loft", at: [34.0752, -118.2556], kind: "loft", facing: 180, scale: 2.2, clear: 28, ground: "block" },
  { id: "band-house", placeId: "band-house", name: "Band House", at: [34.0818, -118.2618], kind: "band-house", facing: 180, scale: 2.2, clear: 30, ground: "block" },
  { id: "garage-bungalow", placeId: "garage-bungalow", name: "Garage Bungalow", at: [34.0882, -118.2662], kind: "bungalow", facing: 180, scale: 2.2, clear: 30, ground: "block" },
  // Map flavor (Clarifications 3): the stadium at the far edge, always lit, and the hillside letters.
  { id: "halo-dome", placeId: "halo-dome", name: "The Halo Dome", at: [34.0739, -118.2400], kind: "halo-dome", facing: 200, scale: 1.5, clear: 230, ground: "block" },
  { id: "cloutwood-sign", name: "CLOUTWOOD", at: [34.0846, -118.2468], kind: "cloutwood-sign", facing: 200, scale: 2.2, clear: 140, ground: "park" },
];

/**
 * A filter that keeps an OpenStreetMap building only when it is clear of every landmark
 * ("distance" from a building to a point inside it is 0).
 */
export function clearOfLandmarks(list: readonly Landmark[] = LANDMARKS): unknown[] {
  return ["all", ...list.filter((l) => l.clear > 0).map((l) => [">", ["distance", siteShape(l)], l.clear])];
}

const M_PER_DEG = 111_320;

/** A site's middle: its point, or for a structure over a street, the line it runs along. */
function siteShape(l: Landmark): GeoJSON.Point | GeoJSON.LineString {
  if (l.ground !== "none" || !l.length) return { type: "Point", coordinates: [l.at[1], l.at[0]] };
  // The model's length runs along its x axis, which points to (facing - 90) on the compass.
  const b = ((l.facing - 90) * Math.PI) / 180;
  const k = Math.cos((l.at[0] * Math.PI) / 180);
  const dx = (Math.sin(b) * l.length) / 2, dy = (Math.cos(b) * l.length) / 2;
  return {
    type: "LineString",
    coordinates: [-1, 1].map((s) => [l.at[1] + (s * dx) / (k * M_PER_DEG), l.at[0] + (s * dy) / M_PER_DEG]),
  };
}

/** Each landmark's site as a ground polygon (a 40-sided circle), for the map's site layer. */
export function landmarkSites(list: readonly Landmark[] = LANDMARKS): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: list.filter((l) => l.ground !== "none").map((l) => {
      const k = Math.cos((l.at[0] * Math.PI) / 180);
      const ring = Array.from({ length: 41 }, (_, i) => {
        const a = ((i % 40) / 40) * Math.PI * 2;
        return [l.at[1] + (Math.cos(a) * l.clear) / (M_PER_DEG * k), l.at[0] + (Math.sin(a) * l.clear) / M_PER_DEG];
      });
      return { type: "Feature", properties: { id: l.id, ground: l.ground }, geometry: { type: "Polygon", coordinates: [ring] } };
    }),
  };
}

/** Whether a point (lng, lat) is on a landmark's site: traffic doesn't drive there. */
export function onLandmarkSite(lng: number, lat: number, list: readonly Landmark[] = LANDMARKS): boolean {
  const k = Math.cos((lat * Math.PI) / 180);
  return list.some((l) => l.ground !== "none" && Math.hypot((lng - l.at[1]) * k * M_PER_DEG, (lat - l.at[0]) * M_PER_DEG) < l.clear);
}

// ---------------------------------------------------------------------------
// Placement (owner, Oct 16: "they should be inside the blocks"): a landmark moves to the nearest
// spot where no main road or rail line crosses its site, covering as few side streets as it can.
// The map runs this on the real streets around it once they've loaded (components/map/CityMap.tsx).
// ---------------------------------------------------------------------------

/** A road from the map's tiles: its points (lng, lat) and whether it's a main road or rail. */
export interface RoadLine { major: boolean; bridge?: boolean; pts: readonly (readonly [number, number])[] }
/** A water polygon from the map's tiles: its rings (outer, then holes) of (lng, lat) points. */
export type WaterArea = readonly (readonly (readonly [number, number])[])[];

export const MAJOR_ROAD_CLASSES = new Set(["motorway", "trunk", "primary", "secondary", "tertiary", "rail", "transit"]);
/** How far a landmark may move from its place's coordinates, and how finely to search. */
export const PLACE_SEARCH = { radius: 360, step: 12, majorMargin: 8 } as const;

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Which local points (meters, x east, y north, within `reach` of the middle) are on water, as a
 * grid filled row by row (one pass over the polygons' edges per row, so a long coastline is cheap).
 */
function waterGrid(water: readonly WaterArea[], toM: (lng: number, lat: number) => [number, number], reach: number, cell: number) {
  const n = Math.ceil(reach / cell);
  const size = 2 * n + 1;
  const wet = new Uint8Array(size * size);
  for (const area of water) {
    const rings = area.map((r) => r.map(([lng, lat]) => toM(lng, lat)));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const r of rings) for (const [x, y] of r) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    if (maxX < -reach || minX > reach || maxY < -reach || minY > reach) continue;
    for (let j = 0; j < size; j++) {
      const y = (j - n) * cell;
      if (y < minY || y > maxY) continue;
      // Where this row crosses the polygon's edges (even-odd, so holes count).
      const xs: number[] = [];
      for (const r of rings) {
        for (let i = 0, p = r.length - 1; i < r.length; p = i++) {
          const [ax, ay] = r[p], [bx, by] = r[i];
          if ((ay > y) !== (by > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
        }
      }
      xs.sort((a, b) => a - b);
      for (let q = 0; q + 1 < xs.length; q += 2) {
        const from = Math.max(0, Math.ceil(xs[q] / cell) + n), to = Math.min(size - 1, Math.floor(xs[q + 1] / cell) + n);
        for (let i = from; i <= to; i++) wet[j * size + i] = 1;
      }
    }
  }
  return (x: number, y: number): boolean => {
    const i = Math.round(x / cell) + n, j = Math.round(y / cell) + n;
    return i >= 0 && j >= 0 && i < size && j < size && wet[j * size + i] === 1;
  };
}

/** Points around a site's edge (and its middle) that must all be on land. */
const RIM = [[0, 0], ...Array.from({ length: 16 }, (_, i) => [Math.cos((i / 16) * Math.PI * 2), Math.sin((i / 16) * Math.PI * 2)])];

/**
 * Where to stand a landmark: the closest spot (within PLACE_SEARCH.radius) whose site no main road
 * comes near and no water reaches (owner, Oct 16: "they look like they're on the water"),
 * preferring spots that cover no side street. Returns its own spot when that's clear, or when
 * nothing nearby is.
 */
export function placeLandmark(l: Landmark, roads: readonly RoadLine[], others: readonly Landmark[] = [], water: readonly WaterArea[] = []): LatLng {
  if (l.ground === "none") return l.at;
  const k = Math.cos((l.at[0] * Math.PI) / 180);
  // Local meters around the place (x east, y north).
  const toM = (lng: number, lat: number): [number, number] => [(lng - l.at[1]) * k * M_PER_DEG, (lat - l.at[0]) * M_PER_DEG];
  const reach = PLACE_SEARCH.radius + l.clear + PLACE_SEARCH.majorMargin;
  const segs: { major: boolean; a: [number, number]; b: [number, number] }[] = [];
  for (const r of roads) {
    for (let i = 1; i < r.pts.length; i++) {
      const a = toM(r.pts[i - 1][0], r.pts[i - 1][1]);
      const b = toM(r.pts[i][0], r.pts[i][1]);
      if (segDist(0, 0, a[0], a[1], b[0], b[1]) <= reach) segs.push({ major: r.major, a, b });
    }
  }
  const near = others.filter((o) => o.id !== l.id && o.ground !== "none").map((o) => ({ at: toM(o.at[1], o.at[0]), r: o.clear + l.clear }));
  const wet = water.length ? waterGrid(water, toM, PLACE_SEARCH.radius + l.clear, 4) : null;
  const cost = (x: number, y: number): number => {
    // Sites never overlap, and stand on land.
    for (const o of near) if (Math.hypot(x - o.at[0], y - o.at[1]) < o.r) return Infinity;
    if (wet && RIM.some(([u, v]) => wet(x + u * l.clear, y + v * l.clear))) return Infinity;
    let minors = 0;
    for (const s of segs) {
      const d = segDist(x, y, s.a[0], s.a[1], s.b[0], s.b[1]);
      if (s.major && d < l.clear + PLACE_SEARCH.majorMargin) return Infinity;
      if (!s.major && d < l.clear) minors++;
    }
    // Moving costs a meter a meter; each side street merged under the site costs as much as 150 m.
    return Math.hypot(x, y) + minors * 150;
  };
  let best: [number, number] = [0, 0];
  let bestCost = cost(0, 0);
  if (bestCost === 0) return l.at;
  const n = Math.floor(PLACE_SEARCH.radius / PLACE_SEARCH.step);
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const x = i * PLACE_SEARCH.step, y = j * PLACE_SEARCH.step;
      if (Math.hypot(x, y) > PLACE_SEARCH.radius || Math.hypot(x, y) >= bestCost) continue;
      const c = cost(x, y);
      if (c < bestCost) { bestCost = c; best = [x, y]; }
    }
  }
  if (!Number.isFinite(bestCost)) return l.at;
  return [l.at[0] + best[1] / M_PER_DEG, l.at[1] + best[0] / (k * M_PER_DEG)];
}

/** The landmarks with some moved (and bridges turned and stretched) to where the map stood them. */
export function withPositions(moved: Readonly<Record<string, Spot>>, list: readonly Landmark[] = LANDMARKS): Landmark[] {
  return list.map((l) => {
    const m = moved[l.id];
    return m ? { ...l, at: m.at, facing: m.facing ?? l.facing, length: m.length ?? l.length } : l;
  });
}

/**
 * A bridge fitted to its road (owner, Oct 16: "it doesn't cross to the other side"): the bridge
 * segments of the map's roads near it, along their main direction, end to end. Null when the
 * map has no bridge road there.
 */
export function fitBridge(l: Landmark, roads: readonly RoadLine[]): Spot | null {
  const k = Math.cos((l.at[0] * Math.PI) / 180);
  const pts: [number, number][] = [];
  for (const r of roads) {
    if (!r.bridge) continue;
    for (const [lng, lat] of r.pts) {
      const p: [number, number] = [(lng - l.at[1]) * k * M_PER_DEG, (lat - l.at[0]) * M_PER_DEG];
      if (Math.hypot(p[0], p[1]) < 900) pts.push(p);
    }
  }
  if (pts.length < 2) return null;
  // Main direction: the principal axis of the points.
  const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  let sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of pts) { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); syy += (y - my) ** 2; }
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const ux = Math.cos(angle), uy = Math.sin(angle);
  const along = pts.map(([x, y]) => (x - mx) * ux + (y - my) * uy);
  const lo = Math.min(...along), hi = Math.max(...along);
  const length = hi - lo;
  if (length < 300) return null;
  const cx = mx + ux * (lo + hi) / 2, cy = my + uy * (lo + hi) / 2;
  // The model's length runs along its x axis, which points to (facing - 90) on the compass.
  const bearing = ((Math.atan2(ux, uy) * 180) / Math.PI + 360) % 180;
  return {
    at: [l.at[0] + cy / M_PER_DEG, l.at[1] + cx / (k * M_PER_DEG)],
    facing: bearing + 90,
    length: Math.min(2000, length),
  };
}

/**
 * The street grid's direction around a point: the length-weighted average of nearby street
 * bearings folded into a quarter turn, in degrees (-45 to 45). Null when there are no streets.
 */
function gridAngle(l: Landmark, roads: readonly RoadLine[], radius: number): number | null {
  const k = Math.cos((l.at[0] * Math.PI) / 180);
  let sx = 0, sy = 0;
  for (const r of roads) {
    for (let i = 1; i < r.pts.length; i++) {
      const ax = (r.pts[i - 1][0] - l.at[1]) * k * M_PER_DEG, ay = (r.pts[i - 1][1] - l.at[0]) * M_PER_DEG;
      const bx = (r.pts[i][0] - l.at[1]) * k * M_PER_DEG, by = (r.pts[i][1] - l.at[0]) * M_PER_DEG;
      const len = Math.hypot(bx - ax, by - ay);
      if (len < 1) continue;
      // The segment's nearest point, not its middle: a long straight avenue passing by still counts.
      const t = Math.max(0, Math.min(1, (-ax * (bx - ax) - ay * (by - ay)) / (len * len)));
      if (Math.hypot(ax + t * (bx - ax), ay + t * (by - ay)) > radius) continue;
      const bearing = Math.atan2(bx - ax, by - ay); // radians clockwise from north
      sx += len * Math.cos(4 * bearing);
      sy += len * Math.sin(4 * bearing);
    }
  }
  if (Math.hypot(sx, sy) < 1) return null;
  return ((Math.atan2(sy, sx) / 4) * 180) / Math.PI;
}

/**
 * Whether the streets around a landmark have loaded (a street grid within `radius` meters). Until they
 * have, it isn't placed: placing it early would stand it square to the camera, off the grid, for good.
 */
export function streetsNear(l: Landmark, roads: readonly RoadLine[], radius = 250): boolean {
  return gridAngle(l, roads, radius) !== null;
}

/** The four facings that line up with a grid, the one closest to `prefer` first. */
function gridFacings(grid: number, prefer: number): number[] {
  const turn = (d: number) => Math.abs(((d - prefer + 540) % 360) - 180);
  return [0, 1, 2, 3].map((q) => (((grid + q * 90) % 360) + 360) % 360).sort((a, b) => turn(a) - turn(b));
}

/**
 * Which way a landmark should face so it lines up with the street grid around it (owner, Oct 16:
 * "make them tilt in line with the grid"). Of the four facings that line up with it, the one
 * closest to the landmark's own (south, toward the camera) wins. Its own facing when no streets.
 * With `water`, a waterfront landmark (a pier) faces the water when one of the four does.
 */
export function gridFacing(l: Landmark, roads: readonly RoadLine[], radius = 250, water: readonly WaterArea[] = []): number {
  const grid = gridAngle(l, roads, radius);
  if (grid === null) return l.facing;
  const options = gridFacings(grid, l.facing);
  if (!water.length) return options[0];
  const k = Math.cos((l.at[0] * Math.PI) / 180);
  const reach = l.clear * 1.5;
  const wet = waterGrid(water, (lng, lat) => [(lng - l.at[1]) * k * M_PER_DEG, (lat - l.at[0]) * M_PER_DEG], reach + 8, 4);
  const front = (f: number) => [Math.sin((f * Math.PI) / 180) * reach, Math.cos((f * Math.PI) / 180) * reach];
  return options.find((f) => { const [x, y] = front(f); return wet(x, y); }) ?? options[0];
}

/**
 * A structure over a street (an elevated station) set on its street: the nearest main road within
 * `radius` meters (else the nearest street), the spot moved onto it and turned to run along it.
 * Null when no street is near.
 */
export function onStreet(l: Landmark, roads: readonly RoadLine[], radius = 80): Spot | null {
  const major = roads.filter((r) => r.major);
  return (major.length && nearestStreet(l, major, radius)) || nearestStreet(l, roads, radius);
}

function nearestStreet(l: Landmark, roads: readonly RoadLine[], radius: number): Spot | null {
  const k = Math.cos((l.at[0] * Math.PI) / 180);
  let best: { d: number; x: number; y: number; bearing: number } | null = null;
  for (const r of roads) {
    if (r.bridge) continue;
    for (let i = 1; i < r.pts.length; i++) {
      const ax = (r.pts[i - 1][0] - l.at[1]) * k * M_PER_DEG, ay = (r.pts[i - 1][1] - l.at[0]) * M_PER_DEG;
      const bx = (r.pts[i][0] - l.at[1]) * k * M_PER_DEG, by = (r.pts[i][1] - l.at[0]) * M_PER_DEG;
      const len = (bx - ax) ** 2 + (by - ay) ** 2;
      if (len < 1) continue;
      const t = Math.max(0, Math.min(1, (-ax * (bx - ax) - ay * (by - ay)) / len));
      const x = ax + t * (bx - ax), y = ay + t * (by - ay);
      const d = Math.hypot(x, y);
      if (d <= radius && (!best || d < best.d)) best = { d, x, y, bearing: (Math.atan2(bx - ax, by - ay) * 180) / Math.PI };
    }
  }
  if (!best) return null;
  // The model's length runs along its x axis (facing - 90): of the two facings along the street,
  // the one closer to its own.
  const options = [best.bearing + 90, best.bearing + 270].map((f) => ((f % 360) + 360) % 360);
  const turn = (d: number) => Math.abs(((d - l.facing + 540) % 360) - 180);
  return { at: [l.at[0] + best.y / M_PER_DEG, l.at[1] + best.x / (k * M_PER_DEG)], facing: turn(options[0]) <= turn(options[1]) ? options[0] : options[1] };
}
