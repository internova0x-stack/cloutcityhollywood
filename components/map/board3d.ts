// The Echo Flats board as a 3D model in a bright mobile-strategy style (owner, Oct 17 and 18: 3D that still looks
// illustrated, "Clash of Clans inspired"), dressed as a Hollywood city (owner, Oct 18): paved blocks packed with
// mid-rise buildings, palm-lined streets with street lamps and traffic, a walk of stars on Echo Boulevard, and a huge
// hill across the back carrying the CLOUTWOOD letters. Original models only; the grid and the places keep the 2D
// board's layout (lib/map/board.ts). Gentle animations: drifting clouds, the dome's halo, flickering neon.
// One world unit is one board unit; x runs east and z runs south, like the board's x and y.

import {
  AmbientLight, BoxGeometry, BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry,
  DirectionalLight, DoubleSide, Group, HemisphereLight, IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial,
  InstancedMesh, Object3D, OrthographicCamera, PCFSoftShadowMap, PlaneGeometry, Scene, SphereGeometry, SRGBColorSpace,
  TorusGeometry, Vector3, WebGLRenderer, type Material,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  BUILDINGS as BOARD_BUILDINGS, DISTRICTS as BOARD_DISTRICTS, GRID as BOARD_GRID, HALO_DOME as BOARD_HALO, SPOTS,
  type Building, type Spot,
} from "../../lib/map/board.ts";

/**
 * The 3D city spreads the 2D board's grid out (owner, Oct 18: wider roads, more space between buildings): every block
 * keeps its size, but block centres move apart by SPREAD around the board's middle, so the streets become boulevards.
 */
const SPREAD = 1.3;
const MID = { x: 450, y: 660 };
const spread = (v: number, c: number) => c + (v - c) * SPREAD;
const half = BOARD_GRID.block / 2;
export const GRID = {
  cols: BOARD_GRID.cols.map((x) => spread(x + half, MID.x) - half),
  rows: BOARD_GRID.rows.map((y) => spread(y + half, MID.y) - half),
  block: BOARD_GRID.block,
};
/** Street width: the gap between neighbouring blocks. */
const STREET = GRID.cols[1] - GRID.cols[0] - GRID.block;
const lastCol = GRID.cols[GRID.cols.length - 1] + GRID.block, lastRow = GRID.rows[GRID.rows.length - 1] + GRID.block;
const ROADS = {
  h: [
    ...GRID.rows.map((r) => r - STREET / 2), lastRow + STREET / 2,
  ].map((y, i) => (i === 2 ? [y, -300, 1200] : [y, GRID.cols[0] - STREET, lastCol + STREET]) as [number, number, number]),
  v: [...GRID.cols.map((c) => c - STREET / 2), lastCol + STREET / 2].map((x) => [x, GRID.rows[0] - STREET, lastRow + STREET] as [number, number, number]),
  width: STREET,
};
/** Echo Boulevard, the street between rows 1 and 2, runs out into the districts. */
const BOULEVARD_Z = GRID.rows[2] - STREET / 2;
/** Each building moves with its block. */
const BUILDINGS: Building[] = BOARD_BUILDINGS.map((b) => {
  const col = BOARD_GRID.cols.findIndex((c) => b.x >= c && b.x < c + BOARD_GRID.block);
  const row = BOARD_GRID.rows.findIndex((r) => b.y >= r - 20 && b.y < r + BOARD_GRID.block);
  return { ...b, x: b.x + GRID.cols[col] - BOARD_GRID.cols[col], y: b.y + GRID.rows[row] - BOARD_GRID.rows[row] };
});
const DISTRICTS = BOARD_DISTRICTS.map((d) => {
  const [x, y, w, h] = d.rect;
  const dx = spread(x + w / 2, MID.x) - (x + w / 2), dy = spread(y + h / 2, MID.y) - (y + h / 2);
  return { ...d, x: d.x + dx, y: d.y + dy, rect: [x + dx, y + dy, w, h] as const };
});
const HALO_DOME = { x: spread(BOARD_HALO.x, MID.x), y: spread(BOARD_HALO.y, MID.y) };
/** The 3D city's extent, for keeping the camera over it. */
export const BOUNDS = { x0: -120, x1: 1020, y0: -40, y1: 1360 };

/** Buildings are deeper in 3D than their foreshortened 2D footprints. */
const DEPTH = 1.5;
/** The camera looks down at this angle (degrees above the ground), turned 45° so the grid reads as diamonds. */
export const PITCH = 35;
/** Turned 30°: the grid still reads on the diagonal, and the hill stays across the back of the view. */
export const YAW = 30;
/** Each place's building moves to the front of its block, so the street is lined with buildings. */
const FRONT_INSET = 12;
/** The hills behind the town: [centre x, centre z, radius x, height, radius z]. */
const HILLS: [number, number, number, number, number][] = [
  [400, -50, 330, 270, 205], [-60, -60, 260, 210, 190], [820, -70, 300, 240, 200], [1150, -50, 220, 170, 170],
];

/** The ground height of the hills at a point (0 on the flat). */
function hillHeight(x: number, z: number): number {
  let best = 0;
  for (const [cx, cz, rx, h, rz] of HILLS) {
    const k = 1 - ((x - cx) / rx) ** 2 - ((z - cz) / rz) ** 2;
    if (k > 0) best = Math.max(best, h * Math.sqrt(k));
  }
  return best;
}

/** The ground height the middle CLOUTWOOD letter stands at, on the big hill's south face. */
const SIGN_H = 130;
/** Letter size and spacing in board units. */
const LETTER = { w: 46, h: 68, step: 50 };
/**
 * The CLOUTWOOD letters (owner, Oct 19: a hillside sign like the famous one): separate white block letters standing
 * upright on legs, close together in one straight row across the view. Each letter slides up or down the slope until
 * it lines up with the middle one on screen, so the row reads level while every letter stands on the ground.
 * Original lettering, never the real sign's.
 */
const SIGN = (() => {
  const yaw = (YAW * Math.PI) / 180, pitch = (PITCH * Math.PI) / 180;
  const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  const away = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  const base = { x: 300, z: 262 };
  // How high a ground point t units up the view appears on screen.
  const rise = (x: number, z: number, t: number) => hillHeight(x, z) * Math.cos(pitch) + t * Math.sin(pitch);
  const walk = (o: number, stop: (x: number, z: number, t: number) => boolean) => {
    for (let t = 0; t < 600; t += 1) {
      const x = base.x + right.x * o + away.x * t, z = base.z + right.z * o + away.z * t;
      if (stop(x, z, t)) return { x, z, y: hillHeight(x, z) };
    }
    return { x: base.x, z: base.z, y: 0 };
  };
  const mid = walk(0, (x, z) => hillHeight(x, z) >= SIGN_H);
  const level = rise(mid.x, mid.z, Math.hypot(mid.x - base.x, mid.z - base.z));
  return [..."CLOUTWOOD"].map((ch, i, all) => ({ ch, ...walk((i - (all.length - 1) / 2) * LETTER.step, (x, z, t) => rise(x, z, t) >= level) }));
})();
/** True just in front of the letters, where trees and homes would hide them. */
const nearSign = (x: number, z: number) => SIGN.some((l) => Math.hypot(x - l.x, z - l.z) < 30 || (Math.abs(x - l.x) < 30 && z > l.z && z < l.z + 70));

/** Which grid block a building stands in. */
function blockOf(b: Building) {
  const col = GRID.cols.findIndex((c) => b.x >= c && b.x < c + GRID.block);
  const row = GRID.rows.findIndex((r) => b.y >= r - 30 && b.y < r + GRID.block);
  return { bx: GRID.cols[col], by: GRID.rows[row], col, row };
}

/** A place's building in the 3D city: at the front of its block and taller (houses stay low). */
function cityBuilding(b: Building): Building {
  const { by } = blockOf(b);
  const lift = b.kind === "house" || b.kind === "bungalow" ? 1.15 : 1.75;
  return { ...b, h: Math.round(b.h * lift), y: by + GRID.block - FRONT_INSET - b.d };
}

/** A 3D spot also knows its height: 0 on the street, up the hill for the letters. */
export type Spot3D = Spot & { h: number };

/** Where plates sit in 3D: on the pavement in front of each place, and on the hill just under the letters. */
export const SPOTS_3D: Spot3D[] = SPOTS.map((s) => {
  const b = BUILDINGS.find((x) => x.place === s.id);
  if (b) {
    const { by } = blockOf(b);
    return { id: s.id, x: b.x + b.w / 2, y: by + GRID.block - FRONT_INSET + 4, h: 0 };
  }
  if (s.id === "cloutwood-sign") {
    const mid = SIGN[4];
    return { id: s.id, x: mid.x, y: mid.z + 30, h: hillHeight(mid.x, mid.z + 30) };
  }
  if (s.id === "halo-dome") return { id: s.id, x: HALO_DOME.x, y: HALO_DOME.y + 62, h: 0 };
  return { ...s, h: 0 };
});
const INK = "#3B2F35";

export interface BoardView {
  /** The board point (x, y in board units) at the centre of the screen. */
  center: { x: number; y: number };
  /** Screen pixels per board unit. */
  scale: number;
}

export interface Board3D {
  resize(w: number, h: number): void;
  setView(v: BoardView): void;
  setNight(night: boolean): void;
  /** Where a board point (on the ground) appears on screen, in CSS pixels. */
  project(x: number, y: number, height?: number): { x: number; y: number };
  /** Starts the animation loop (clouds, halo, neon); pauses itself while the page is hidden. */
  start(reducedMotion: boolean): void;
  dispose(): void;
}

export function createBoard3D(canvas: HTMLCanvasElement): Board3D {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  const scene = new Scene();

  // ---- Materials, shared by colour: bright paint, a little more saturated than the 2D board's pastels ----
  const toonCache = new Map<string, MeshLambertMaterial>();
  const toon = (color: string) => {
    let m = toonCache.get(color);
    if (!m) toonCache.set(color, (m = new MeshLambertMaterial({ color: new Color(color).offsetHSL(0, 0.04, 0.02) })));
    return m;
  };
  /** Things that glow at night (windows, signs, neon): plain colour, swapped between day and night. */
  const glows: { mat: MeshBasicMaterial; day: string; night: string; flicker?: boolean }[] = [];
  const glow = (day: string, night: string, flicker = false) => {
    const mat = new MeshBasicMaterial({ color: day });
    glows.push({ mat, day, night, flicker });
    return mat;
  };

  /** A mesh in a group (the style has no outlines; shadows give the shapes their edges). */
  function inked(geo: BufferGeometry, mat: Material, _outline = 0): Group {
    const g = new Group();
    g.add(new Mesh(geo, mat));
    return g;
  }

  const at = <T extends Object3D>(o: T, x: number, y: number, z: number): T => {
    o.position.set(x, y, z);
    return o;
  };

  // ---- Ground, blocks and streets ----
  const ground = new Mesh(new PlaneGeometry(BOUNDS.x1 - BOUNDS.x0 + 800, BOUNDS.y1 - BOUNDS.y0 + 800), toon("#C9B27D"));
  ground.rotation.x = -Math.PI / 2;
  at(ground, (BOUNDS.x0 + BOUNDS.x1) / 2, 0, (BOUNDS.y0 + BOUNDS.y1) / 2);
  scene.add(ground);
  const groundMat = ground.material as MeshLambertMaterial;

  const flat = (w: number, d: number, color: string | Material, x: number, z: number, y = 0.2) => {
    const m = new Mesh(new PlaneGeometry(w, d), typeof color === "string" ? toon(color) : color);
    m.rotation.x = -Math.PI / 2;
    return at(m, x, y, z);
  };
  const roadMat = toon("#8F8A86");
  for (const [y, x1, x2] of ROADS.h) scene.add(flat(x2 - x1, ROADS.width, roadMat, (x1 + x2) / 2, y, 0.3));
  for (const [x, y1, y2] of ROADS.v) scene.add(flat(ROADS.width, y2 - y1, roadMat, x, (y1 + y2) / 2, 0.3));
  // White centre lines on every street.
  const dashes: { x: number; y: number; z: number; ry?: number }[] = [];
  for (const [y, x1, x2] of ROADS.h) for (let x = x1 + 10; x < x2; x += 22) dashes.push({ x, y: 0.5, z: y });
  for (const [x, y1, y2] of ROADS.v) for (let y = y1 + 10; y < y2; y += 22) dashes.push({ x, y: 0.5, z: y, ry: Math.PI / 2 });
  // Each block: a raised pavement slab; Lookout Park keeps its grass, pond and a fountain.
  const kerb = toon("#D8CDB8");
  const paving = toon("#ECE4D4");
  GRID.rows.forEach((by, r) => GRID.cols.forEach((bx, c) => {
    const slab = new Mesh(new BoxGeometry(GRID.block, 3, GRID.block), kerb);
    scene.add(at(slab, bx + GRID.block / 2, 1.5, by + GRID.block / 2));
    const park = r === 0 && c === 0;
    scene.add(flat(GRID.block - 8, GRID.block - 8, park ? toon("#7F9A4C") : paving, bx + GRID.block / 2, by + GRID.block / 2, 3.2));
    if (park) {
      scene.add(flat(52, 26, glow("#8FD0E6", "#1E3A55"), bx + 75, by + 92, 3.4));
      scene.add(at(new Mesh(new CylinderGeometry(9, 11, 5, 16), kerb), bx + 75, 5.5, by + 48));
      scene.add(at(new Mesh(new CylinderGeometry(2, 2, 10, 8), glow("#BFE6F2", "#6FA9C8")), bx + 75, 11, by + 48));
    }
  }));
  // A walk of stars along both pavements of Echo Boulevard.
  const star = glow("#E79AB5", "#C2557E");
  for (const z of [GRID.rows[1] + GRID.block - 4, GRID.rows[2] + 4]) {
    for (let x = GRID.cols[0] + 10; x < GRID.cols[2] + GRID.block; x += 22) {
      const st = new Mesh(new CylinderGeometry(4, 4, 0.6, 5), star);
      scene.add(at(st, x, 3.5, z));
    }
  }

  // ---- Trees, palms, street lamps and traffic (instanced, so a whole city stays cheap to draw) ----
  const leaf = toon("#6B8A3A"), leafDark = toon("#5F8B3B"), trunk = toon("#9B7B55");
  type Spot3 = { x: number; y: number; z: number; ry?: number; s?: number };
  function instanced(geo: BufferGeometry, mat: Material, spots: Spot3[], colors?: string[]): InstancedMesh {
    const m = new InstancedMesh(geo, mat, spots.length);
    const o = new Object3D();
    spots.forEach((t, i) => {
      o.position.set(t.x, t.y, t.z);
      o.rotation.set(0, t.ry ?? 0, 0);
      o.scale.setScalar(t.s ?? 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      if (colors) m.setColorAt(i, new Color(colors[i % colors.length]));
    });
    m.instanceMatrix.needsUpdate = true;
    return m;
  }
  const trunkGeo = new CylinderGeometry(1.1, 1.6, 30, 6).translate(0, 15, 0);
  const crownGeo = mergeGeometries(Array.from({ length: 7 }, (_, i) => {
    const frond = new ConeGeometry(2.8, 17, 4);
    frond.rotateZ(Math.PI / 2.3).translate(7, 29, 0).rotateY((i / 7) * Math.PI * 2);
    return frond;
  }));
  const bushGeo = mergeGeometries([
    // Cylinders are indexed and icosahedrons aren't: merging needs them all the same.
    new CylinderGeometry(1.4, 1.8, 8, 6).translate(0, 4, 0).toNonIndexed(),
    new IcosahedronGeometry(9, 1).translate(0, 15, 0),
    new IcosahedronGeometry(6.5, 1).translate(5, 11, 3),
    new IcosahedronGeometry(6, 1).translate(-5, 12, -2),
  ]);

  // Palms line every street: three on each side of every block, set in from the kerb.
  const palms: Spot3[] = [];
  GRID.rows.forEach((by, r) => GRID.cols.forEach((bx, c) => {
    const e = 6, B2 = GRID.block;
    for (const t of [26, 75, 124]) {
      palms.push({ x: bx + t, y: 3, z: by + e }, { x: bx + t, y: 3, z: by + B2 - e });
      palms.push({ x: bx + e, y: 3, z: by + t }, { x: bx + B2 - e, y: 3, z: by + t });
    }
    void r;
    void c;
  }));
  // Palms also run out along Echo Boulevard into the districts.
  for (let x = -260; x < GRID.cols[0] - STREET; x += 40) palms.push({ x, y: 0, z: BOULEVARD_Z - STREET / 2 + 6 }, { x, y: 0, z: BOULEVARD_Z + STREET / 2 - 6 });
  for (let x = lastCol + STREET + 20; x < 1160; x += 40) palms.push({ x, y: 0, z: BOULEVARD_Z - STREET / 2 + 6 }, { x, y: 0, z: BOULEVARD_Z + STREET / 2 - 6 });
  palms.forEach((p, i) => { p.ry = i * 1.3; p.s = 0.9 + ((i * 37) % 10) / 40; });
  scene.add(instanced(new PlaneGeometry(10, 1.6).rotateX(-Math.PI / 2), glow("#FFFFFF", "#8A8170"), dashes));
  scene.add(instanced(trunkGeo, trunk, palms));
  scene.add(instanced(crownGeo, leafDark, palms));

  // Street lamps on every block corner.
  const lamps: Spot3[] = [];
  for (const by of GRID.rows) for (const bx of GRID.cols) {
    for (const [dx, dz] of [[4, 4], [GRID.block - 4, 4], [4, GRID.block - 4], [GRID.block - 4, GRID.block - 4]]) lamps.push({ x: bx + dx, y: 3, z: by + dz });
  }
  scene.add(instanced(new CylinderGeometry(0.7, 0.9, 22, 6).translate(0, 11, 0), toon("#4A4A55"), lamps));
  scene.add(instanced(new SphereGeometry(2.6, 8, 6).translate(0, 23, 0), glow("#F4F1E6", "#FFE29A"), lamps));

  // Traffic: cars in both lanes of every street.
  const cars: Spot3[] = [];
  ROADS.h.forEach(([y, x1, x2], i) => {
    for (let x = x1 + 40 + (i * 23) % 50; x < x2 - 20; x += 120) cars.push({ x, y: 0, z: y - 14, ry: Math.PI / 2 }, { x: x + 60, y: 0, z: y + 14, ry: -Math.PI / 2 });
  });
  ROADS.v.forEach(([x, y1, y2], i) => {
    for (let y = y1 + 60 + (i * 31) % 50; y < y2 - 20; y += 160) cars.push({ x: x + 14, y: 0, z: y, ry: 0 }, { x: x - 14, y: 0, z: y + 80, ry: Math.PI });
  });
  const carGeo = mergeGeometries([new BoxGeometry(9, 5, 16).translate(0, 3.5, 0), new BoxGeometry(8, 4, 8).translate(0, 8, -1)]);
  scene.add(instanced(carGeo, new MeshLambertMaterial({ color: "#FFFFFF" }), cars, ["#E8483B", "#F2C230", "#3E7FD6", "#FFFFFF", "#2E2A33", "#4CB36B", "#F08AB0"]));

  // Bushy trees in Lookout Park.
  const parkTrees: Spot3[] = [];
  for (let i = 0; i < 6; i++) parkTrees.push({ x: GRID.cols[0] + 26 + (i % 3) * 48, y: 3, z: GRID.rows[0] + 26 + Math.floor(i / 3) * 34, s: 0.9 });

  // ---- Buildings ----
  /** A striped canvas texture (awnings). */
  const stripes = (a: string, b: string) => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 8;
    const x = c.getContext("2d")!;
    for (let i = 0; i < 8; i++) {
      x.fillStyle = i % 2 ? b : a;
      x.fillRect(i * 8, 0, 8, 8);
    }
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  };

  function windows(g: Group, w: number, h: number, front: number, startY: number, endY: number, seed: number) {
    const cols = Math.max(2, Math.floor(w / 22));
    const rows = Math.max(1, Math.floor((endY - startY) / 16));
    const gx = w / cols;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const lit = Math.sin((seed + r * 13 + k * 7) * 12.9898) * 43758.5453 % 1;
        const mat = glow("#9FC3E0", Math.abs(lit) > 0.3 ? "#FFD27A" : "#2A2530");
        const pane = new Mesh(new PlaneGeometry(gx * 0.46, 8), mat);
        g.add(at(pane, -w / 2 + gx * (k + 0.5), startY + 6 + r * 16, front + 0.4));
      }
    }
  }

  function building(b: Building): Group {
    const g = new Group();
    const D = b.d * DEPTH;
    const front = D / 2;
    const body = inked(new BoxGeometry(b.w, b.h, D), toon(b.wall));
    g.add(at(body, 0, b.h / 2, 0));
    // Roof: a slab, a gable or a vault depending on the kind.
    if (b.kind === "house") {
      const roof = new Mesh(new CylinderGeometry(D * 0.62, D * 0.62, b.w + 8, 3), toon(b.roof));
      roof.rotation.z = Math.PI / 2;
      roof.rotation.x = Math.PI / 2;
      g.add(at(roof, 0, b.h + D * 0.28, 0));
    } else if (b.kind === "club" || b.kind === "theater" || b.kind === "diner") {
      // Flat roofs with a chunky parapet.
      g.add(at(new Mesh(new BoxGeometry(b.w + 6, 6, D + 6), toon(b.roof)), 0, b.h + 3, 0));
    } else {
      // A thick, overhanging hip roof: an eave slab and a four-sided pyramid.
      g.add(at(new Mesh(new BoxGeometry(b.w + 12, 4, D + 12), toon(b.roof)), 0, b.h + 2, 0));
      const rise = Math.min(b.w, D) * 0.42;
      const hip = new Mesh(new ConeGeometry(Math.SQRT1_2, 1, 4, 1), toon(b.roof));
      hip.rotation.y = Math.PI / 4;
      hip.scale.set(b.w + 12, rise, D + 12);
      g.add(at(hip, 0, b.h + 4 + rise / 2, 0));
    }
    // A stone plinth along the bottom of the walls.
    g.add(at(new Mesh(new BoxGeometry(b.w + 4, 6, D + 4), toon("#CDB98C")), 0, 3, 0));
    const door = glow("#5A4636", "#FFB347");
    const addDoor = (w = 12, h = 16) => g.add(at(new Mesh(new PlaneGeometry(w, h), door), 0, h / 2 + 1, front + 0.5));

    switch (b.kind) {
      case "cafe": {
        windows(g, b.w, b.h, front, 18, b.h - 4, b.x);
        const awning = new Mesh(new BoxGeometry(b.w - 10, 2, 14), new MeshLambertMaterial({ map: stripes("#E04E4E", "#FFF6E0") }));
        awning.rotation.x = 0.35;
        g.add(at(awning, 0, 18, front + 6));
        addDoor();
        // Café tables out front.
        for (const sx of [-30, 30]) g.add(at(new Mesh(new CylinderGeometry(5, 5, 1.5, 8), toon("#FFF6E0")), sx, 7, front + 20));
        break;
      }
      case "divebar": {
        windows(g, b.w, b.h, front, 18, b.h - 4, b.x);
        addDoor();
        const sign = new Group();
        sign.add(at(new Mesh(new SphereGeometry(8, 10, 8), glow("#E07A5F", "#FF2E88", true)), 0, 0, 0));
        sign.add(at(new Mesh(new BoxGeometry(3, 26, 3), glow("#7A4A2A", "#FF2E88", true)), 0, 18, 0));
        sign.scale.set(1, 1, 0.4);
        g.add(at(sign, -b.w / 2 + 22, b.h + 14, front - 6));
        break;
      }
      case "club":
        for (const [y, d, n] of [[b.h - 12, "#5A6E88", "#2EC4FF"], [b.h - 22, "#7A5A7A", "#FF2E88"]] as const) {
          g.add(at(new Mesh(new BoxGeometry(b.w - 16, 3, 1), glow(d, n, true)), 0, y, front + 0.6));
        }
        g.add(at(new Mesh(new PlaneGeometry(18, 20), glow("#24202C", "#FF2E88", true)), 0, 11, front + 0.5));
        break;
      case "theater": {
        windows(g, b.w, b.h, front, 30, b.h - 4, b.x);
        // Two tiers of jade roof with red eaves above the parapet.
        for (const [i, scale] of [[0, 1], [1, 0.62]] as const) {
          const tier = new Mesh(new ConeGeometry(Math.SQRT1_2, 1, 4, 1), toon("#3F8F7A"));
          tier.rotation.y = Math.PI / 4;
          tier.scale.set((b.w + 4) * scale, 22, (D + 4) * scale);
          g.add(at(tier, 0, b.h + 17 + i * 18, 0));
          g.add(at(new Mesh(new BoxGeometry((b.w + 8) * scale, 3, (D + 8) * scale), toon("#B8382F")), 0, b.h + 7 + i * 18, 0));
        }
        const marquee = inked(new BoxGeometry(b.w - 20, 12, 16), toon("#2A2530"), 0.8);
        g.add(at(marquee, 0, 22, front + 8));
        const bulb = glow("#E9D8A6", "#FFE7A8", true);
        for (let i = 0; i < 14; i++) g.add(at(new Mesh(new SphereGeometry(1.4, 6, 4), bulb), -b.w / 2 + 14 + i * ((b.w - 28) / 13), 29, front + 16));
        g.add(at(new Mesh(new PlaneGeometry(b.w - 34, 5), glow("#E9D8A6", "#FFC21A")), 0, 22, front + 16.2));
        const blade = inked(new BoxGeometry(12, b.h + 16, 6), glow("#FFC21A", "#FFC21A", true), 0.8);
        g.add(at(blade, b.w / 2 - 14, b.h / 2 + 18, front + 4));
        addDoor(16, 14);
        break;
      }
      case "loft":
        windows(g, b.w, b.h, front, 22, b.h - 4, b.x);
        for (let i = 0; i < 4; i++) {
          const washer = new Mesh(new CylinderGeometry(5, 5, 1, 12), glow("#DDEAF2", "#FFD27A"));
          washer.rotation.x = Math.PI / 2;
          g.add(at(washer, -b.w / 2 + 18 + i * 22, 10, front + 0.6));
        }
        break;
      case "house":
        windows(g, b.w, b.h, front, 16, b.h - 4, b.x);
        g.add(at(new Mesh(new BoxGeometry(b.w - 16, 2, 12), toon("#C9A06A")), 0, 4, front + 6));
        addDoor();
        break;
      case "bungalow":
        windows(g, b.w * 0.5, b.h, front, 10, b.h - 4, b.x);
        for (let i = 0; i < 4; i++) g.add(at(new Mesh(new BoxGeometry(b.w * 0.38, 4.5, 1), toon("#F4F4EE")), b.w * 0.25, 4 + i * 5.5, front + 0.6));
        break;
      case "market":
        g.add(at(new Mesh(new BoxGeometry(b.w - 8, 2, 10), toon("#40B589")), 0, 16, front + 5));
        windows(g, b.w, b.h, front, 18, b.h - 2, b.x);
        addDoor();
        break;
      case "diner":
        g.add(at(new Mesh(new BoxGeometry(b.w + 1, 3, D + 1), glow("#E05A5A", "#FF4D6D", true)), 0, b.h - 6, 0));
        windows(g, b.w, b.h, front, 6, b.h - 10, b.x);
        break;
      case "studio":
        g.add(at(new Mesh(new PlaneGeometry(b.w - 40, 26), toon("#B9AED0")), -8, 14, front + 0.5));
        g.add(at(new Mesh(new SphereGeometry(4, 8, 6), glow("#C9A0B8", "#FF2E88", true)), b.w / 2 - 14, b.h - 10, front + 2));
        break;
      default:
        windows(g, b.w, b.h, front, 16, b.h - 4, b.x);
        addDoor();
    }
    // The board's footprint: front edge at b.y + b.d, depth D going back (north).
    return at(g, b.x + b.w / 2, 3, b.y + b.d - front);
  }
  for (const b of BUILDINGS) scene.add(building(cityBuilding(b)));

  // Mid-rise fillers behind each place make the blocks read as a city: two per block, with rooftop details.
  const fillerColors = ["#F5F0E6", "#F2E2CC", "#F4D7C3", "#EFE5C8", "#E8ECEF", "#F0D2CC", "#E7DFD2", "#F7EBD8"];
  function filler(x: number, z: number, w: number, d: number, h: number, seed: number) {
    const g = new Group();
    g.add(at(new Mesh(new BoxGeometry(w, h, d), toon(fillerColors[seed % fillerColors.length])), 0, h / 2, 0));
    g.add(at(new Mesh(new BoxGeometry(w + 3, 4, d + 3), toon("#B8A684")), 0, h + 2, 0));
    // Windows on the two faces the camera sees (south and east).
    const cols = Math.max(2, Math.floor(w / 14)), rows = Math.max(2, Math.floor((h - 10) / 14));
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const lit = Math.abs(Math.sin((seed * 7 + r * 13 + k) * 12.9898) * 43758.5453 % 1) > 0.35;
      g.add(at(new Mesh(new PlaneGeometry((w / cols) * 0.5, 7), glow("#9FC3E0", lit ? "#FFD27A" : "#2A2530")), -w / 2 + (w / cols) * (k + 0.5), 10 + r * 14, d / 2 + 0.4));
    }
    const sideCols = Math.max(2, Math.floor(d / 14));
    for (let r = 0; r < rows; r++) for (let k = 0; k < sideCols; k++) {
      const lit = Math.abs(Math.sin((seed * 11 + r * 17 + k) * 12.9898) * 43758.5453 % 1) > 0.35;
      const pane = new Mesh(new PlaneGeometry((d / sideCols) * 0.5, 7), glow("#9FC3E0", lit ? "#FFD27A" : "#2A2530"));
      pane.rotation.y = Math.PI / 2;
      g.add(at(pane, w / 2 + 0.4, 10 + r * 14, -d / 2 + (d / sideCols) * (k + 0.5)));
    }
    // A rooftop detail: a water tower, air-conditioning units, a billboard or a terracotta tile roof.
    const kind = seed % 4;
    if (kind === 0) {
      g.add(at(new Mesh(new CylinderGeometry(6, 6, 9, 10), toon("#9C6B44")), w / 4, h + 12, 0));
      g.add(at(new Mesh(new ConeGeometry(6.5, 5, 10), toon("#7A5236")), w / 4, h + 19, 0));
    } else if (kind === 1) {
      for (const dx of [-8, 6]) g.add(at(new Mesh(new BoxGeometry(8, 5, 8), toon("#C7C7CC")), dx, h + 6.5, 0));
    } else if (kind === 3) {
      const tiles = new Mesh(new ConeGeometry(Math.SQRT1_2, 1, 4, 1), toon("#C1583F"));
      tiles.rotation.y = Math.PI / 4;
      tiles.scale.set(w + 8, 16, d + 8);
      g.add(at(tiles, 0, h + 12, 0));
    } else {
      const board = new Mesh(new BoxGeometry(w * 0.8, 16, 2), glow(["#F2C230", "#E8483B", "#3E7FD6"][seed % 3], ["#FF2E88", "#2EC4FF", "#FFC21A"][seed % 3], true));
      g.add(at(board, 0, h + 16, 0));
      g.add(at(new Mesh(new BoxGeometry(2, 10, 2), toon("#4A4A55")), 0, h + 6, 0));
    }
    return at(g, x, 3, z);
  }
  /** The Spinning Disc: a round record-company tower of stacked tiers (an original nod to a famous one). */
  function recordTower(x: number, z: number) {
    const g = new Group();
    for (let i = 0; i < 7; i++) {
      const r = 24 - i * 1.6;
      g.add(at(new Mesh(new CylinderGeometry(r, r, 11, 24), toon("#F4F1EA")), 0, 6 + i * 13, 0));
      g.add(at(new Mesh(new CylinderGeometry(r + 2.2, r + 2.2, 2.2, 24), toon("#6F8FA8")), 0, 12.5 + i * 13, 0));
      g.add(at(new Mesh(new CylinderGeometry(r + 0.3, r + 0.3, 5, 24), glow("#9FC3E0", "#FFD27A")), 0, 6 + i * 13, 0));
    }
    g.add(at(new Mesh(new CylinderGeometry(0.8, 1.2, 40, 6), toon("#C7C7CC")), 0, 112, 0));
    g.add(at(new Mesh(new SphereGeometry(2.2, 8, 6), glow("#E8483B", "#FF4D4D", true)), 0, 133, 0));
    return at(g, x, 3, z);
  }
  GRID.rows.forEach((by, r) => GRID.cols.forEach((bx, c) => {
    if (r === 0 && c === 0) return;
    const seed = r * 3 + c;
    // Kept lower than the places' buildings in front, so the venues stay the stars of each block.
    const h1 = 42 + ((seed * 53) % 46), h2 = 38 + ((seed * 71) % 56);
    scene.add(filler(bx + 30, by + 30, 48, 42, h1, seed));
    if (r === 0 && c === 2) scene.add(recordTower(bx + 118, by + 34));
    else scene.add(filler(bx + 120, by + 30, 48, 42, h2, seed + 5));
  }));

  // ---- The hills across the back, with the CLOUTWOOD letters and a few hillside homes ----
  HILLS.forEach(([cx, cz, rx, h, rz], i) => {
    const hill = new Mesh(new SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), toon(i % 2 ? "#C2A065" : "#CDAE73"));
    hill.scale.set(rx, h, rz);
    scene.add(at(hill, cx, 0, cz));
  });
  // The hills are thick with trees in two greens, kept clear of the letters, the observatory and the mast.
  const hillTrees: [Spot3[], Spot3[]] = [[], []];
  const rand = (n: number) => {
    const v = Math.sin(n * 127.1) * 43758.5453;
    return v - Math.floor(v);
  };
  for (let gx = -220, i = 0; gx < 1380; gx += 20) {
    for (let gz = -250; gz < 200; gz += 18, i++) {
      if (rand(i) > 0.62) continue;
      const x = gx + (rand(i + 0.3) - 0.5) * 16, z = gz + (rand(i + 0.7) - 0.5) * 14;
      const y = hillHeight(x, z);
      if (y < 14 || nearSign(x, z) || Math.hypot(x - 660, z - 20) < 95 || Math.hypot(x - 560, z + 110) < 16) continue;
      hillTrees[i % 3 ? 0 : 1].push({ x, y: y - 3, z, ry: i, s: 0.7 + rand(i + 0.5) * 0.6 });
    }
  }
  scene.add(instanced(bushGeo, toon("#6B7D3A"), hillTrees[0]));
  scene.add(instanced(bushGeo, toon("#6B8A3A"), hillTrees[1]));
  scene.add(instanced(bushGeo, leaf, parkTrees));
  // Hillside homes, white stucco with terracotta roofs, stepping up the lower slopes.
  const homeWalls = ["#FFF6E8", "#F6E3CF", "#F3D6C6", "#EFE7D6"];
  for (let i = 0; i < 22; i++) {
    const x = -100 + ((i * 131) % 1150), z = 40 + ((i * 37) % 90);
    const y = hillHeight(x, z);
    if (y < 12 || y > 150 || nearSign(x, z) || SIGN.some((l) => Math.abs(x - l.x) < 30 && Math.abs(z - l.z) < 30)) continue;
    const home = new Group();
    home.add(at(new Mesh(new BoxGeometry(26, 14, 20), toon(homeWalls[i % homeWalls.length])), 0, 7, 0));
    const roof = new Mesh(new ConeGeometry(Math.SQRT1_2, 1, 4, 1), toon("#C1583F"));
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(32, 10, 26);
    home.add(at(roof, 0, 19, 0));
    home.add(at(new Mesh(new PlaneGeometry(12, 6), glow("#8FD0E6", "#FFD27A")), 0, 7, 10.2));
    home.rotation.y = (i % 3) * 0.2;
    scene.add(at(home, x, y - 3, z));
  }

  // Starwatch Observatory on the hill: a white hall with a big bronze dome, two small ones and a lawn with an obelisk
  // (an original nod to the city's famous observatory).
  {
    const ox = 660, oz = 10, oy = hillHeight(ox, oz) - 6;
    const obs = new Group();
    obs.add(at(new Mesh(new BoxGeometry(150, 4, 90), toon("#8FA552")), 0, 2, 20));
    obs.add(at(new Mesh(new BoxGeometry(84, 20, 30), toon("#F7F4EE")), 0, 14, 0));
    obs.add(at(new Mesh(new CylinderGeometry(19, 19, 10, 24), toon("#F7F4EE")), 0, 28, 0));
    obs.add(at(new Mesh(new SphereGeometry(18, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon("#8C9196")), 0, 33, 0));
    for (const sx of [-40, 40]) {
      obs.add(at(new Mesh(new CylinderGeometry(9, 9, 8, 16), toon("#F7F4EE")), sx, 26, 0));
      obs.add(at(new Mesh(new SphereGeometry(8.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon("#7A9A8E")), sx, 30, 0));
    }
    const obelisk = new Mesh(new CylinderGeometry(1.5, 4, 34, 4), toon("#F7F4EE"));
    obs.add(at(obelisk, -36, 21, 42));
    obs.add(at(new Mesh(new PlaneGeometry(10, 4), glow("#9FC3E0", "#FFD27A")), 0, 12, 15.2));
    obs.rotation.y = 0.25;
    scene.add(at(obs, ox, oy, oz));
  }

  // A broadcast mast on the ridge beside the letters, with a blinking light.
  {
    const mx = 560, mz = -110, my = hillHeight(mx, mz) - 4;
    const mast = new Group();
    for (let i = 0; i < 8; i++) {
      const r = 3.2 - i * 0.3;
      mast.add(at(new Mesh(new CylinderGeometry(r - 0.3, r, 14, 6), toon(i % 2 ? "#E8E4DC" : "#D9453B")), 0, 7 + i * 14, 0));
    }
    for (const y of [40, 72]) mast.add(at(new Mesh(new CylinderGeometry(5, 5, 1.5, 12), toon("#C7C7CC")), 0, y, 0));
    mast.add(at(new Mesh(new SphereGeometry(2.4, 8, 6), glow("#E8483B", "#FF4D4D", true)), 0, 116, 0));
    scene.add(at(mast, mx, my, mz));
  }
  // The CLOUTWOOD letters: each one a white face with a grey back for depth, on two legs and a crossbar, turned to
  // face the town. They glow warm white at night.
  {
    const yaw = (YAW * Math.PI) / 180;
    const legMat = toon("#6E6A66");
    for (const l of SIGN) {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 192;
      const x = c.getContext("2d")!;
      x.fillStyle = x.strokeStyle = "#FFFFFF";
      x.textAlign = "center";
      x.textBaseline = "alphabetic";
      // Tall, heavy block letters: any bold sans, thickened with a stroke so phones without heavy fonts match.
      x.font = "bold 170px Arial, Helvetica, sans-serif";
      x.lineWidth = 16;
      x.lineJoin = "miter";
      x.save();
      x.translate(64, 178);
      x.scale(0.72, 1.18);
      x.strokeText(l.ch, 0, 0);
      x.fillText(l.ch, 0, 0);
      x.restore();
      const tex = new CanvasTexture(c);
      tex.colorSpace = SRGBColorSpace;
      const plane = new PlaneGeometry(LETTER.w, LETTER.h);
      const faceMat = new MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: DoubleSide });
      glows.push({ mat: faceMat, day: "#FFFFFF", night: "#FFF6E0" });
      const face = new Mesh(plane, faceMat);
      const back = new Mesh(plane, new MeshBasicMaterial({ map: tex, color: "#A8A096", transparent: true, alphaTest: 0.5, side: DoubleSide }));
      const g = new Group();
      const mid = 12 + LETTER.h / 2;
      g.add(at(face, 0, mid, 0));
      g.add(at(back, 0, mid, -2.5));
      for (const lx of [-12, 12]) g.add(at(new Mesh(new BoxGeometry(2, mid + 10, 2), legMat), lx, (mid + 10) / 2 - 10, -4));
      g.add(at(new Mesh(new BoxGeometry(28, 1.6, 1.6), legMat), 0, mid - 10, -4));
      g.rotation.y = yaw;
      scene.add(at(g, l.x, l.y - 4, l.z));
    }
  }

  // ---- The Halo Dome ----
  const dome = new Group();
  dome.add(at(new Mesh(new CylinderGeometry(90, 90, 3, 32), toon("#A9D18E")), 0, 1.5, 0));
  dome.add(at(inked(new CylinderGeometry(62, 66, 22, 28), toon("#EDE7DD")), 0, 13, 0));
  const shell = inked(new SphereGeometry(62, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon("#F7F3EC"));
  dome.add(at(shell, 0, 24, 0));
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const win = new Mesh(new PlaneGeometry(6, 8), glow("#9FC3E0", "#FFD27A"));
    win.position.set(Math.sin(a) * 66.5, 14, Math.cos(a) * 66.5);
    win.rotation.y = a;
    dome.add(win);
  }
  const halo = new Mesh(new TorusGeometry(56, 2.6, 8, 48), glow("#FFE7A8", "#FFF6E0"));
  halo.rotation.x = Math.PI / 2;
  dome.add(at(halo, 0, 108, 0));
  scene.add(at(dome, HALO_DOME.x, 0, HALO_DOME.y + 30));

  // ---- Locked districts: scenery under drifting low-poly clouds ----
  const districtGroup = new Group();
  const cloudMat = new MeshLambertMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.95 });
  const clouds: { o: Object3D; base: number; phase: number }[] = [];
  const sceneryMats = ["#E9C9A0", "#C25A4A", "#3A3345", "#D9D2C2", "#F4E6D0"];
  for (const d of DISTRICTS) {
    const [x, y, w, h] = d.rect;
    // A few landmark blocks that poke through the clouds (Canyon Heights is up in the hills already).
    for (let i = 0; i < (d.id === "canyon-heights" ? 0 : 4); i++) {
      const bw = 36 + (i % 2) * 14, bh = 50 + ((i * 37) % 70);
      const m = inked(new BoxGeometry(bw, bh, bw), toon(sceneryMats[(i + d.id.length) % sceneryMats.length]));
      districtGroup.add(at(m, x + w * (0.2 + 0.2 * i), bh / 2, y + h * (0.3 + (i % 2) * 0.4)));
    }
    // Clouds: clusters of chunky spheres covering the district.
    const n = Math.max(3, Math.round((w * h) / 7000));
    for (let i = 0; i < n; i++) {
      const puff = new Group();
      for (let k = 0; k < 4; k++) puff.add(at(new Mesh(new IcosahedronGeometry(15 + k * 4, 1), cloudMat), k * 15 - 22, 6 + (k % 2) * 6, (k % 2) * 8));
      // Canyon Heights' clouds keep to its eastern half, clear of the observatory on the ridge.
      const left = d.id === "canyon-heights" ? w * 0.45 : 30;
      const cx = x + left + ((i * 0.618) % 1) * (w - left - 30), cz = y + 40 + (((i * 0.382) + 0.15) % 1) * (h - 60);
      at(puff, cx, d.id === "canyon-heights" ? hillHeight(cx, cz) + 20 : 26, cz);
      districtGroup.add(puff);
      clouds.push({ o: puff, base: cx, phase: i * 1.7 });
    }
  }
  // The Pier District's sea.
  {
    const [px, py, pw, ph] = DISTRICTS.find((d) => d.id === "pier")!.rect;
    scene.add(flat(pw + 300, ph * 0.7 + 200, glow("#7FC4DE", "#14304A"), px + pw / 2 + 150, py + ph * 0.35 + ph * 0.35 + 100, 0.4));
    scene.add(flat(pw + 300, ph * 0.3, "#F3E3BE", px + pw / 2 + 150, py + ph * 0.15, 0.35));
  }
  scene.add(districtGroup);

  // ---- Lights ----
  const hemi = new HemisphereLight("#CFE3F2", "#C9B27D", 1.5);
  const sun = new DirectionalLight("#FFF1D6", 2.4);
  sun.position.set(MID.x - 560, 950, MID.y + 300);
  sun.target.position.set(MID.x, 0, MID.y);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1100, right: 1100, top: 1100, bottom: -1100, near: 10, far: 4000 });
  sun.shadow.bias = -0.0008;
  const ambient = new AmbientLight("#FFFFFF", 0.2);
  scene.add(hemi, sun, sun.target, ambient);
  // Everything casts and catches soft shadows, except the flat ground pieces, which only catch them.
  scene.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const flatPiece = o.geometry instanceof PlaneGeometry;
    o.castShadow = !flatPiece && o.material !== cloudMat;
    o.receiveShadow = true;
  });

  // ---- Camera ----
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 5000);
  let size = { w: 390, h: 780 };
  let view: BoardView = { center: { ...MID }, scale: 1 };
  const tilt = (PITCH * Math.PI) / 180;

  function placeCamera() {
    const halfW = size.w / 2 / view.scale;
    const halfH = size.h / 2 / view.scale;
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    // Looking from the south and above. The board's y maps to z, foreshortened by the tilt, so the view
    // centre is found by sliding the target along z to keep scale consistent with the 2D board.
    const target = new Vector3(view.center.x, 0, view.center.y);
    const yaw = (YAW * Math.PI) / 180;
    camera.position.set(target.x + Math.sin(yaw) * Math.cos(tilt) * 1500, target.y + Math.sin(tilt) * 1500, target.z + Math.cos(yaw) * Math.cos(tilt) * 1500);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }

  let night = false;
  // Grass, the hill and the trees darken at night too.
  const greens = ["#7F9A4C", "#C2A065", "#CDAE73", "#6B7D3A", "#6B8A3A", "#5F8B3B", "#8FA552"].map((c) => ({ mat: toon(c), day: toon(c).color.clone() }));
  function applyNight() {
    for (const gl of glows) gl.mat.color.set(night ? gl.night : gl.day);
    for (const g of greens) g.mat.color.copy(g.day).multiplyScalar(night ? 0.32 : 1);
    groundMat.color.set(night ? "#2B2A24" : "#C9B27D");
    roadMat.color.set(night ? "#2E2C30" : "#8F8A86");
    kerb.color.set(night ? "#3E3A36" : "#D8CDB8");
    paving.color.set(night ? "#4A4640" : "#ECE4D4");
    cloudMat.color.set(night ? "#4A4258" : "#FFFFFF");
    hemi.color.set(night ? "#4A5A8A" : "#CFE3F2");
    hemi.groundColor.set(night ? "#1A1622" : "#C9B27D");
    hemi.intensity = night ? 0.9 : 1.5;
    sun.color.set(night ? "#8EA2D8" : "#FFF1D6");
    sun.intensity = night ? 0.5 : 2.4;
    renderer.setClearColor(new Color(night ? "#16233F" : "#FFE3CC"), 0);
  }
  applyNight();

  let dirty = true;
  let raf = 0;
  let reduced = false;
  const t0 = performance.now();

  function render() {
    renderer.render(scene, camera);
    dirty = false;
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const t = (performance.now() - t0) / 1000;
    if (!reduced) {
      for (const c of clouds) c.o.position.x = c.base + Math.sin(t * 0.15 + c.phase) * 12;
      halo.rotation.z = t * 0.4;
      halo.position.y = 108 + Math.sin(t * 1.2) * 3;
      if (night) for (const gl of glows) if (gl.flicker) gl.mat.color.set(Math.sin(t * 9 + gl.day.length) > 0.97 ? gl.day : gl.night);
      dirty = true;
    }
    if (dirty) render();
  }

  return {
    resize(w, h) {
      size = { w, h };
      renderer.setSize(w, h, false);
      placeCamera();
      dirty = true;
    },
    setView(v) {
      view = v;
      placeCamera();
      dirty = true;
    },
    setNight(n) {
      if (n === night) return;
      night = n;
      applyNight();
      dirty = true;
    },
    project(x, y, height = 0) {
      const p = new Vector3(x, height, y).project(camera);
      return { x: ((p.x + 1) / 2) * size.w, y: ((1 - p.y) / 2) * size.h };
    },
    start(reducedMotion) {
      reduced = reducedMotion;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    },
    dispose() {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        if (o instanceof Mesh) o.geometry.dispose();
      });
      for (const m of toonCache.values()) m.dispose();
      renderer.dispose();
    },
  };
}
