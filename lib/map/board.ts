// The illustrated Echo Flats board (Clarifications 3, Design C46 to C49; owner, Oct 17: back to the contained
// Lagos Life style map). One fictional town drawn slightly from above: chunky building sprites, palm-lined roads,
// the hills with the CLOUTWOOD letters, the locked districts on every edge and the Halo Dome on the far edge.
// This is the v0.1 placeholder art (Milestones: "one placeholder illustration is fine"): it is generated here and
// written to public/map/ by scripts/gen-board.ts, so real art can later replace the files without code changes.
// Board units are CSS pixels at the street zoom.

export const BOARD = { w: 900, h: 1300 };

export type Theme = "day" | "night";

type Kind =
  | "cafe" | "divebar" | "club" | "theater" | "loft" | "house" | "bungalow" | "shop" | "diner" | "market"
  | "studio" | "precinct" | "hotel" | "tower" | "generic" | "mansion" | "hangar" | "stage" | "metro";

interface Building {
  /** Footprint on the ground: left, top (back edge), width and depth, in board units. */
  x: number;
  y: number;
  w: number;
  d: number;
  /** Wall height: how far the roof sits above the ground. */
  h: number;
  kind: Kind;
  wall: string;
  roof: string;
  /** A place id, when the building is a place (its plate sits under it). */
  place?: string;
}

/** Where each place's name plate sits (under its building), for the live map layer. */
export interface Spot {
  id: string;
  x: number;
  y: number;
}

const DAY = {
  sky: ["#FFE3CC", "#FFD3B5"], ground: "#EBDDC4", park: "#B7D59A", parkDark: "#8FBF76", road: "#D2C8B8",
  roadLine: "#FFFFFF", water: "#8FD0E6", sand: "#F3E3BE", hill: "#A9CC8C", hillDark: "#86B46F",
  glass: "#9FC3E0", sidewalk: "#F5EBD9", shadow: "rgba(60,40,30,.16)", outline: "rgba(40,30,30,.18)", palm: "#5E9A58", trunk: "#9C7A54",
};
const NIGHT = {
  sky: ["#16233F", "#2A2550"], ground: "#25202D", park: "#1F2A24", parkDark: "#18221C", road: "#332D3A",
  roadLine: "rgba(255,194,26,.45)", water: "#14304A", sand: "#3A3340", hill: "#22302A", hillDark: "#1A2621",
  glass: "#2A2530", sidewalk: "#302A38", shadow: "rgba(0,0,0,.35)", outline: "rgba(0,0,0,.35)", palm: "#2F4A33", trunk: "#4A3C30",
};

/** Small deterministic random, so the board draws the same every time. */
function rand(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Echo Flats is a regular city grid (owner, Oct 17: more space between buildings, on a grid): streets every
 * 180 units each way, so every block is the same 150-unit square with one building set back from the street.
 */
const GRID = { cols: [180, 360, 540], rows: [315, 495, 675, 855], block: 150, road: 30 };

const ROADS = {
  /** Horizontal streets: [y, x from, x to]. Echo Boulevard (y 660) runs the full width into the districts. */
  h: [[300, 165, 735], [480, 165, 735], [660, 0, 900], [840, 165, 735], [1020, 165, 735]] as [number, number, number][],
  /** Vertical streets: [x, y from, y to]. */
  v: [[165, 285, 1035], [345, 285, 1035], [525, 285, 1035], [705, 285, 1035]] as [number, number, number][],
  width: GRID.road,
};

const B = (x: number, y: number, w: number, d: number, h: number, kind: Kind, wall: string, roof: string, place?: string): Building =>
  ({ x, y, w, d, h, kind, wall, roof, place });

/** One building in a grid block (column 0 to 2, row 0 to 3), centred and set back with a front yard. */
function inBlock(col: number, row: number, w: number, d: number, h: number, kind: Kind, wall: string, roof: string, place?: string): Building {
  const bx = GRID.cols[col], by = GRID.rows[row];
  return B(bx + (GRID.block - w) / 2, by + 108 - d, w, d, h, kind, wall, roof, place);
}

/** Echo Flats, block by block (v0.1 shows the venues and homes as places; the rest are scenery until they open). */
const BUILDINGS: Building[] = [
  // Row 0: Lookout Park (no building), a guitar shop, a market
  inBlock(1, 0, 100, 44, 34, "shop", "#E8B4B8", "#B5656F"),
  inBlock(2, 0, 104, 44, 30, "market", "#DDEBD3", "#5E9A58"),
  // Row 1: north side of Echo Boulevard
  inBlock(0, 1, 100, 50, 56, "loft", "#BFD7E8", "#7FA6C2", "laundromat-loft"),
  inBlock(1, 1, 104, 48, 40, "cafe", "#F6C9A8", "#E07A5F", "the-grind"),
  inBlock(2, 1, 104, 50, 46, "divebar", "#7A5C58", "#4B3B3A", "rusty-amp"),
  // Row 2: south side of Echo Boulevard
  inBlock(0, 2, 100, 50, 44, "studio", "#D9CFE8", "#9A8CB8"),
  inBlock(1, 2, 112, 56, 58, "theater", "#C24A4A", "#7E2E35", "the-marquee"),
  inBlock(2, 2, 104, 54, 50, "club", "#3A3345", "#24202C", "the-basement"),
  // Row 3
  inBlock(0, 3, 96, 48, 40, "house", "#F7D9B5", "#C46B4E", "band-house"),
  inBlock(1, 3, 100, 46, 34, "diner", "#F2F2EE", "#E05A5A"),
  inBlock(2, 3, 108, 50, 32, "bungalow", "#CFE3D2", "#6E9C7A", "garage-bungalow"),
];

/** Locked districts' scenery (under clouds), and their centres for the lock pill. */
export const DISTRICTS = [
  { id: "starline", name: "Starline Boulevard", x: 75, y: 650, rect: [0, 280, 150, 780] },
  { id: "neon-row", name: "Neon Row", x: 825, y: 760, rect: [750, 450, 150, 620] },
  { id: "canyon-heights", name: "Canyon Heights", x: 700, y: 150, rect: [520, 40, 380, 230] },
  { id: "studio-lot", name: "Studio Lot", x: 210, y: 1180, rect: [0, 1080, 420, 220] },
  { id: "pier", name: "Pier District", x: 660, y: 1190, rect: [420, 1080, 480, 220] },
] as const;

/** The Halo Dome's lot (always visible, never under clouds) and the CLOUTWOOD hill. */
export const HALO_DOME = { x: 820, y: 360 };
export const CLOUTWOOD = { x: 300, y: 205 };

export const SPOTS: Spot[] = [
  ...BUILDINGS.filter((b) => b.place).map((b) => ({ id: b.place!, x: b.x + b.w / 2, y: b.y + b.d + 14 })),
  { id: "halo-dome", x: HALO_DOME.x, y: HALO_DOME.y + 62 },
  { id: "cloutwood-sign", x: CLOUTWOOD.x, y: CLOUTWOOD.y + 70 },
];

function windows(b: Building, night: boolean, c: typeof DAY, top: number, bottom: number): string {
  let out = "";
  const cols = Math.max(2, Math.floor(b.w / 22));
  const rows = Math.max(1, Math.floor((bottom - top - 14) / 18));
  const gx = b.w / cols;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const lit = night && rand(b.x * 7 + b.y * 3 + r * 13 + k) > 0.3;
      out += `<rect x="${(b.x + k * gx + gx * 0.28).toFixed(1)}" y="${(top + 7 + r * 18).toFixed(1)}" width="${(gx * 0.44).toFixed(1)}" height="9" rx="1.5" fill="${lit ? "#FFD27A" : c.glass}"/>`;
    }
  }
  return out;
}

/** One building sprite: ground shadow, front wall, roof, windows and its kind's details. */
function building(b: Building, night: boolean, c: typeof DAY): string {
  const top = b.y - b.h; // the roof's back edge
  const wallTop = top + b.d; // the roof's front edge, where the front wall starts
  const ground = b.y + b.d;
  const neon = night ? ' filter="url(#glow)"' : "";
  let s = `<rect x="${b.x + 6}" y="${ground - 6}" width="${b.w}" height="12" rx="6" fill="${c.shadow}"/>`;
  s += `<rect x="${b.x}" y="${wallTop}" width="${b.w}" height="${b.h}" fill="${b.wall}" stroke="${c.outline}"/>`;
  // A darker right-hand edge gives the block some volume.
  s += `<rect x="${b.x + b.w - 8}" y="${wallTop}" width="8" height="${b.h}" fill="rgba(0,0,0,.12)"/>`;
  if (b.kind === "house") {
    s += `<polygon points="${b.x - 4},${wallTop + 4} ${b.x + b.w / 2},${top - 8} ${b.x + b.w + 4},${wallTop + 4}" fill="${b.roof}" stroke="${c.outline}"/>`;
  } else if (b.kind === "hangar") {
    s += `<path d="M${b.x} ${wallTop} Q${b.x + b.w / 2} ${top - 18} ${b.x + b.w} ${wallTop} Z" fill="${b.roof}" stroke="${c.outline}"/>`;
  } else {
    s += `<rect x="${b.x}" y="${top}" width="${b.w}" height="${b.d}" fill="${b.roof}" stroke="${c.outline}"/>`;
    s += `<rect x="${b.x + 4}" y="${top + 4}" width="${b.w - 8}" height="${b.d - 8}" fill="rgba(255,255,255,.08)"/>`;
  }
  const door = `<rect x="${b.x + b.w / 2 - 7}" y="${ground - 16}" width="14" height="16" fill="${night ? "#FFB347" : "#5A4636"}"/>`;

  switch (b.kind) {
    case "cafe":
      s += windows(b, night, c, wallTop, ground - 18);
      for (let i = 0; i < 8; i++) {
        s += `<polygon points="${b.x + 8 + i * 12},${ground - 22} ${b.x + 20 + i * 12},${ground - 22} ${b.x + 22 + i * 12},${ground - 14} ${b.x + 6 + i * 12},${ground - 14}" fill="${i % 2 ? "#FFF6E0" : "#E04E4E"}"/>`;
      }
      s += door;
      break;
    case "divebar":
      s += windows(b, night, c, wallTop, ground - 20);
      s += door;
      // A guitar sign on the roof.
      s += `<g${neon}><ellipse cx="${b.x + 30}" cy="${top - 4}" rx="9" ry="11" fill="${night ? "#FF2E88" : "#E07A5F"}"/><rect x="${b.x + 28}" y="${top - 34}" width="4" height="24" fill="${night ? "#FF2E88" : "#7A4A2A"}"/></g>`;
      break;
    case "club":
      s += `<rect x="${b.x + 6}" y="${wallTop + 8}" width="${b.w - 20}" height="5" fill="${night ? "#2EC4FF" : "#5A6E88"}"${neon}/>`;
      s += `<rect x="${b.x + 6}" y="${wallTop + 20}" width="${b.w - 20}" height="5" fill="${night ? "#FF2E88" : "#7A5A7A"}"${neon}/>`;
      s += `<rect x="${b.x + b.w / 2 - 9}" y="${ground - 18}" width="18" height="18" fill="${night ? "#FF2E88" : "#24202C"}"${neon}/>`;
      break;
    case "theater": {
      s += windows(b, night, c, wallTop, ground - 34);
      // The bulb marquee over the doors and a tall blade sign.
      const my = ground - 30;
      s += `<rect x="${b.x + 10}" y="${my}" width="${b.w - 28}" height="14" fill="${night ? "#14111A" : "#2A2530"}"/>`;
      for (let i = 0; i < 16; i++) s += `<circle cx="${b.x + 14 + i * ((b.w - 36) / 15)}" cy="${my + 2}" r="1.6" fill="#FFE7A8"${neon}/>`;
      s += `<rect x="${b.x + 18}" y="${my + 5}" width="${b.w - 44}" height="5" fill="${night ? "#FFC21A" : "#E9D8A6"}"${neon}/>`;
      s += `<rect x="${b.x + b.w - 26}" y="${top - 26}" width="14" height="${b.h + 6}" fill="#FFC21A" stroke="${c.outline}"${neon}/>`;
      s += door;
      break;
    }
    case "loft":
      s += windows(b, night, c, wallTop, ground - 26);
      for (let i = 0; i < 4; i++) s += `<circle cx="${b.x + 18 + i * 22}" cy="${ground - 12}" r="6" fill="${night ? "#FFD27A" : "#DDEAF2"}" stroke="#7FA6C2" stroke-width="2"/>`;
      break;
    case "house":
      s += windows(b, night, c, wallTop + 6, ground - 18);
      s += `<rect x="${b.x + 10}" y="${ground - 10}" width="${b.w - 20}" height="4" fill="#C9A06A"/>`;
      s += door;
      break;
    case "bungalow":
      s += windows({ ...b, w: b.w * 0.5 }, night, c, wallTop, ground - 14);
      for (let i = 0; i < 4; i++) s += `<rect x="${b.x + b.w * 0.58}" y="${ground - 26 + i * 6}" width="${b.w * 0.36}" height="5" fill="${night ? "#3A4A40" : "#F4F4EE"}" stroke="${c.outline}"/>`;
      break;
    case "market":
      s += `<rect x="${b.x + 4}" y="${ground - 20}" width="${b.w - 8}" height="7" fill="#40B589"/>`;
      s += windows(b, night, c, wallTop, ground - 20);
      s += door;
      break;
    case "diner":
      s += `<rect x="${b.x}" y="${wallTop + 6}" width="${b.w}" height="4" fill="#E05A5A"${neon}/>`;
      s += windows(b, night, c, wallTop + 8, ground - 4);
      break;
    case "studio":
      s += `<rect x="${b.x + 16}" y="${ground - 30}" width="${b.w - 40}" height="30" fill="${night ? "#2A2530" : "#B9AED0"}"/>`;
      s += `<circle cx="${b.x + b.w - 18}" cy="${wallTop + 14}" r="5" fill="${night ? "#FF2E88" : "#C9A0B8"}"${neon}/>`;
      break;
    case "precinct":
      s += `<rect x="${b.x}" y="${wallTop + 6}" width="${b.w}" height="5" fill="#2F7BEA"/>`;
      s += windows(b, night, c, wallTop + 10, ground - 16);
      s += door;
      break;
    case "metro":
      s += `<rect x="${b.x + 4}" y="${wallTop + 3}" width="${b.w - 8}" height="6" fill="#FFF6E0"/>`;
      break;
    case "stage":
      s += `<rect x="${b.x + 6}" y="${wallTop + 4}" width="${b.w - 12}" height="${b.h - 8}" fill="${night ? "#FF2E88" : "#C9A0B8"}"${neon}/>`;
      break;
    default:
      s += windows(b, night, c, wallTop, ground - 16);
      s += door;
  }
  return s;
}

function palm(x: number, y: number, c: typeof DAY): string {
  return `<g><rect x="${x - 1.5}" y="${y - 26}" width="3" height="26" fill="${c.trunk}"/>`
    + [0, 60, 120, 180, 240, 300].map((a) => {
      const r = (a * Math.PI) / 180;
      return `<ellipse cx="${(x + Math.cos(r) * 7).toFixed(1)}" cy="${(y - 27 + Math.sin(r) * 4).toFixed(1)}" rx="8" ry="3" transform="rotate(${a} ${(x + Math.cos(r) * 7).toFixed(1)} ${(y - 27 + Math.sin(r) * 4).toFixed(1)})" fill="${c.palm}"/>`;
    }).join("") + `</g>`;
}

function tree(x: number, y: number, c: typeof DAY): string {
  return `<ellipse cx="${x + 3}" cy="${y + 2}" rx="9" ry="3" fill="${c.shadow}"/><circle cx="${x}" cy="${y - 8}" r="9" fill="${c.parkDark}"/><circle cx="${x - 3}" cy="${y - 11}" r="5" fill="${c.park}" opacity=".6"/>`;
}

/** The scenery inside each locked district (drawn under the clouds; the tallest landmark pokes through). */
function districtScenery(night: boolean, c: typeof DAY): string {
  let s = "";
  // Starline Boulevard: theaters and a walk of stars along a boulevard.
  s += `<rect x="60" y="280" width="26" height="780" fill="${c.road}"/>`;
  for (let i = 0; i < 12; i++) s += `<polygon points="73,${300 + i * 64} 76,${307 + i * 64} 83,${307 + i * 64} 77,${311 + i * 64} 79,${318 + i * 64} 73,${314 + i * 64} 67,${318 + i * 64} 69,${311 + i * 64} 63,${307 + i * 64} 70,${307 + i * 64}" fill="#FFC21A" opacity=".8"/>`;
  s += building(B(8, 360, 46, 40, 70, "theater", "#B54848", "#6E2A30"), night, c);
  s += building(B(96, 520, 46, 40, 120, "tower", "#E8DCCB", "#A9927A"), night, c);
  s += building(B(8, 700, 46, 40, 56, "generic", "#E9C9A0", "#B98A5A"), night, c);
  s += building(B(96, 860, 46, 40, 80, "theater", "#C25A4A", "#7E3A35"), night, c);
  // Neon Row: the club strip.
  s += `<rect x="812" y="450" width="26" height="620" fill="${c.road}"/>`;
  for (let i = 0; i < 5; i++) s += building(B(i % 2 ? 846 : 760, 470 + i * 116, 46, 44, 60 + (i % 3) * 40, "club", "#3A3345", "#24202C"), night, c);
  // Canyon Heights: mansions on the hills.
  s += `<ellipse cx="710" cy="200" rx="230" ry="110" fill="${c.hill}"/><ellipse cx="800" cy="150" rx="140" ry="80" fill="${c.hillDark}"/>`;
  s += building(B(600, 140, 70, 46, 30, "mansion", "#FFF6E8", "#C46B4E"), night, c);
  s += building(B(740, 92, 80, 46, 36, "mansion", "#F4E6D0", "#7E8A6A"), night, c);
  s += `<rect x="690" y="200" width="44" height="18" rx="4" fill="${c.water}"/>`;
  // Studio Lot: soundstage hangars and a water tower.
  for (let i = 0; i < 3; i++) s += building(B(30 + i * 130, 1120, 110, 70, 46, "hangar", "#D9D2C2", "#B0A690"), night, c);
  s += `<rect x="360" y="1088" width="4" height="40" fill="#8A8A8A"/><ellipse cx="362" cy="1084" rx="16" ry="12" fill="#C9C2B2"/>`;
  // Pier District: beach, sea, the pier and a Ferris wheel.
  s += `<rect x="420" y="1080" width="480" height="70" fill="${c.sand}"/><rect x="420" y="1150" width="480" height="150" fill="${c.water}"/>`;
  s += `<rect x="640" y="1150" width="30" height="130" fill="#B08A64"/>`;
  s += `<circle cx="655" cy="1180" r="34" fill="none" stroke="${night ? "#FF2E88" : "#E07A5F"}" stroke-width="3"${night ? ' filter="url(#glow)"' : ""}/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    s += `<line x1="655" y1="1180" x2="${(655 + Math.cos(a) * 34).toFixed(1)}" y2="${(1180 + Math.sin(a) * 34).toFixed(1)}" stroke="${night ? "#FFC21A" : "#C9A06A"}" stroke-width="1.5"/>`;
  }
  return s;
}

/** The Halo Dome: an original stadium under a floating ring of light, always lit. */
function haloDome(night: boolean, c: typeof DAY): string {
  const { x, y } = HALO_DOME;
  let s = `<ellipse cx="${x}" cy="${y + 40}" rx="86" ry="34" fill="${c.park}"/>`;
  s += `<ellipse cx="${x + 6}" cy="${y + 46}" rx="64" ry="14" fill="${c.shadow}"/>`;
  s += `<path d="M${x - 58} ${y + 40} Q${x - 58} ${y - 10} ${x} ${y - 14} Q${x + 58} ${y - 10} ${x + 58} ${y + 40} Z" fill="${night ? "#3A3345" : "#F2EEE6"}" stroke="${c.outline}"/>`;
  s += `<path d="M${x - 58} ${y + 40} Q${x} ${y + 54} ${x + 58} ${y + 40}" fill="${night ? "#2A2530" : "#DCD4C6"}"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${x - 50 + i * 12}" y="${y + 20}" width="6" height="10" fill="${night ? "#FFD27A" : "#9FC3E0"}"/>`;
  s += `<ellipse cx="${x}" cy="${y - 34}" rx="54" ry="10" fill="none" stroke="#FFF6E0" stroke-width="4" filter="url(#glow)"/>`;
  s += `<ellipse cx="${x}" cy="${y - 34}" rx="54" ry="10" fill="none" stroke="#FFC21A" stroke-width="1.5" opacity=".9"/>`;
  return s;
}

/** The hill with the CLOUTWOOD letters (original lettering, never the real sign). */
function cloutwood(night: boolean, c: typeof DAY): string {
  const { x, y } = CLOUTWOOD;
  let s = `<ellipse cx="${x}" cy="${y + 40}" rx="230" ry="95" fill="${c.hill}"/>`;
  s += `<ellipse cx="${x - 120}" cy="${y + 20}" rx="130" ry="70" fill="${c.hillDark}"/>`;
  for (let i = 0; i < 9; i++) s += tree(x - 200 + i * 48, y + 96 + (i % 2) * 10, c);
  s += `<text x="${x}" y="${y + 18}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="30" letter-spacing="3" fill="#FFFFFF" stroke="${night ? "rgba(255,246,224,.4)" : "rgba(0,0,0,.15)"}" stroke-width="1"${night ? ' filter="url(#glow)"' : ""}>CLOUTWOOD</text>`;
  return s;
}

/** The whole board as an SVG document, in day or night colors. */
export function boardSvg(theme: Theme): string {
  const night = theme === "night";
  const c = night ? NIGHT : DAY;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOARD.w} ${BOARD.h}" width="${BOARD.w}" height="${BOARD.h}">`;
  s += `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset="1" stop-color="${c.sky[1]}"/></linearGradient>`;
  s += `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  s += `<rect width="${BOARD.w}" height="${BOARD.h}" fill="${c.ground}"/>`;
  s += `<rect width="${BOARD.w}" height="120" fill="url(#sky)"/>`;
  if (night) for (let i = 0; i < 40; i++) s += `<circle cx="${(rand(i) * BOARD.w).toFixed(0)}" cy="${(rand(i + 99) * 100).toFixed(0)}" r="${rand(i + 7) > 0.8 ? 1.4 : 0.8}" fill="#FFF6E0" opacity=".8"/>`;
  s += cloutwood(night, c);

  // Blocks: a sidewalk square each, Lookout Park filling the first one, trees on every block's back corners.
  for (const by of GRID.rows) for (const bx of GRID.cols) {
    s += `<rect x="${bx}" y="${by}" width="${GRID.block}" height="${GRID.block}" rx="10" fill="${c.sidewalk}"/>`;
    s += `<rect x="${bx + 8}" y="${by + 8}" width="${GRID.block - 16}" height="${GRID.block - 16}" rx="6" fill="${c.ground}"/>`;
  }
  s += `<rect x="${GRID.cols[0] + 8}" y="${GRID.rows[0] + 8}" width="${GRID.block - 16}" height="${GRID.block - 16}" rx="6" fill="${c.park}"/>`;
  s += `<ellipse cx="${GRID.cols[0] + 75}" cy="${GRID.rows[0] + 80}" rx="26" ry="12" fill="${c.water}"/>`;

  // Streets with dashed centre lines.
  const half = ROADS.width / 2;
  for (const [y, x1, x2] of ROADS.h) s += `<rect x="${x1}" y="${y - half}" width="${x2 - x1}" height="${ROADS.width}" fill="${c.road}"/><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${c.roadLine}" stroke-width="2" stroke-dasharray="10 10"/>`;
  for (const [x, y1, y2] of ROADS.v) s += `<rect x="${x - half}" y="${y1}" width="${ROADS.width}" height="${y2 - y1}" fill="${c.road}"/><line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${c.roadLine}" stroke-width="2" stroke-dasharray="10 10"/>`;
  s += districtScenery(night, c);
  s += haloDome(night, c);

  // Trees on each block's corners (palms along Echo Boulevard), then buildings, back to front.
  const items: { y: number; svg: string }[] = [];
  GRID.rows.forEach((by, r) => GRID.cols.forEach((bx) => {
    const boulevard = r === 1 || r === 2;
    for (const [tx, ty] of [[bx + 16, by + 30], [bx + GRID.block - 16, by + 30], [bx + 16, by + GRID.block - 10], [bx + GRID.block - 16, by + GRID.block - 10]]) {
      const front = ty > by + 100;
      if (boulevard && ((r === 1 && front) || (r === 2 && !front))) items.push({ y: ty, svg: palm(tx, ty, c) });
      else if (!front || r === 0) items.push({ y: ty, svg: tree(tx, ty, c) });
    }
  }));
  for (const b of BUILDINGS) items.push({ y: b.y + b.d, svg: building(b, night, c) });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) s += it.svg;

  s += `</svg>`;
  return s;
}
