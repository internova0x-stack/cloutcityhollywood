// Low-poly landmark models for the Echo Flats map (lib/map/landmarks.ts), ported from Clout City NYC. Built in meters: x east,
// y up, z south, the front facing +z. Monument Valley colors by day; at night windows light up,
// signs glow and monuments are uplit. Everything that changes at night registers in a Themed.

import {
  AdditiveBlending, BoxGeometry, CanvasTexture, CapsuleGeometry, CircleGeometry, Color, ConeGeometry, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group,
  IcosahedronGeometry, Vector3,
  type Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, type Object3D, PlaneGeometry, RepeatWrapping,
  SphereGeometry, SRGBColorSpace, TorusGeometry,
} from "three";
import type { LandmarkKind } from "@/lib/map/landmarks";

/** What day and night change: glow strengths, night-only pieces, and things that move. */
export interface Themed {
  glows: { mat: MeshStandardMaterial; day: number; night: number }[];
  nightOnly: Object3D[];
  sweep: { o: Object3D; base: number; amp: number; speed: number; phase: number }[];
}

export const newThemed = (): Themed => ({ glows: [], nightOnly: [], sweep: [] });

export function applyTheme(t: Themed, night: boolean) {
  for (const g of t.glows) g.mat.emissiveIntensity = night ? g.night : g.day;
  for (const o of t.nightOnly) o.visible = night;
}

/** Whether an object and all its parents are shown (a landmark off screen is hidden). */
function shown(o: Object3D | null): boolean {
  for (let p = o; p; p = p.parent) if (!p.visible) return false;
  return true;
}

/** Searchlights and the like, only those on screen; returns whether anything moved. */
export function animate(t: Themed, seconds: number, night: boolean): boolean {
  if (!night || !t.sweep.length) return false;
  let moved = false;
  for (const s of t.sweep) {
    if (!shown(s.o.parent)) continue;
    s.o.rotation.z = s.base + Math.sin(seconds * s.speed + s.phase) * s.amp;
    moved = true;
  }
  return moved;
}

// ---------------------------------------------------------------------------
// Materials and textures
// ---------------------------------------------------------------------------
function rand(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function solid(color: string, opts: { rough?: number; metal?: number; glow?: string } = {}): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, roughness: opts.rough ?? 0.85, metalness: opts.metal ?? 0, flatShading: true, emissive: opts.glow ?? "#000000", emissiveIntensity: 0 });
}

/** A material that glows at night (and a little, or not at all, by day). */
function glowing(t: Themed, color: string, glow: string, night = 1, day = 0): MeshStandardMaterial {
  const m = solid(color, { glow });
  t.glows.push({ mat: m, day, night });
  m.emissiveIntensity = day;
  return m;
}

const CELL = 4; // meters per window cell (one floor, one bay)
const CELLS = 8; // cells per texture side

type FacadeStyle = "curtain" | "punched" | "storefront" | "industrial";

interface FacadeOpts { wall: string; glass: string; style: FacadeStyle; lit: number; seed: number; frame?: string }

const facadeCache = new Map<string, { map: CanvasTexture; glow: CanvasTexture }>();

/** A window texture (one cell per floor and bay) and its night-lights mask. */
function facadeTextures(o: FacadeOpts) {
  const key = JSON.stringify(o);
  const hit = facadeCache.get(key);
  if (hit) return hit;
  const px = 32;
  const size = px * CELLS;
  const day = document.createElement("canvas");
  const night = document.createElement("canvas");
  day.width = day.height = night.width = night.height = size;
  const d = day.getContext("2d")!;
  const n = night.getContext("2d")!;
  const r = rand(o.seed);
  d.fillStyle = o.wall;
  d.fillRect(0, 0, size, size);
  // Walls glow faintly at night, as if floodlit; windows glow much brighter.
  n.fillStyle = "#2B2118";
  n.fillRect(0, 0, size, size);
  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) {
      const x = cx * px, y = cy * px;
      // Window rectangle inside the cell, by style.
      const [wx, wy, ww, wh] =
        o.style === "curtain" ? [x + 1, y + 2, px - 2, px - 5]
        : o.style === "storefront" ? [x + 2, y + 6, px - 4, px - 8]
        : o.style === "industrial" ? [x + 6, y + 4, px - 12, px * 0.42]
        : [x + 8, y + 7, px - 16, px - 13];
      d.fillStyle = o.glass;
      d.fillRect(wx, wy, ww, wh);
      if (o.frame) {
        d.strokeStyle = o.frame;
        d.lineWidth = 2;
        d.strokeRect(wx, wy, ww, wh);
      }
      // A highlight stripe so glass reads as glass by day.
      d.fillStyle = "rgba(255,255,255,.18)";
      d.fillRect(wx, wy, ww * 0.35, wh);
      if (r() < o.lit) {
        n.fillStyle = r() < 0.75 ? "#FFD58A" : "#CFE8FF";
        n.globalAlpha = 0.65 + r() * 0.35;
        n.fillRect(wx, wy, ww, wh);
        n.globalAlpha = 1;
      }
    }
  }
  const wrap = (c: HTMLCanvasElement) => {
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(1 / CELLS, 1 / CELLS);
    t.anisotropy = 4;
    return t;
  };
  const out = { map: wrap(day), glow: wrap(night) };
  facadeCache.set(key, out);
  return out;
}

function facade(t: Themed, o: FacadeOpts, nightStrength = 1.15): MeshStandardMaterial {
  const tex = facadeTextures(o);
  const m = new MeshStandardMaterial({ map: tex.map, emissiveMap: tex.glow, emissive: "#FFFFFF", emissiveIntensity: 0, roughness: 0.7, flatShading: true });
  t.glows.push({ mat: m, day: 0, night: nightStrength });
  return m;
}

/** A box whose side faces carry the facade at real scale (windows don't stretch), roof plain. */
function facadeBox(w: number, h: number, d: number, side: Material, roof: Material): Mesh {
  const g = new BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  for (let f = 0; f < 6; f++) {
    if (f === 2 || f === 3) continue;
    const fw = f < 2 ? d : w;
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, (uv.getX(i) * fw) / CELL, (uv.getY(i) * h) / CELL);
    }
  }
  return new Mesh(g, [side, side, roof, roof, side, side]);
}

let washTex: CanvasTexture | null = null;
const HIDDEN = new MeshBasicMaterial({ visible: false });

/**
 * Night glow on a building: a shell just outside its walls, bright at the foot and fading up,
 * like floodlights washing the facade, plus a lit outline along the roof edge.
 */
function nightGlow(t: Themed, w: number, h: number, d: number, color: string, strength = 0.55): Group {
  if (!washTex) {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 128;
    const x = c.getContext("2d")!;
    const grd = x.createLinearGradient(0, 128, 0, 0);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.45, "rgba(255,255,255,.28)");
    grd.addColorStop(0.92, "rgba(255,255,255,.12)");
    grd.addColorStop(1, "rgba(255,255,255,.6)");
    x.fillStyle = grd;
    x.fillRect(0, 0, 4, 128);
    washTex = new CanvasTexture(c);
  }
  const g = new Group();
  const wash = new MeshBasicMaterial({ map: washTex, color, transparent: true, opacity: strength, blending: AdditiveBlending, depthWrite: false });
  const shell = new Mesh(new BoxGeometry(w + 0.6, h, d + 0.6), [wash, wash, HIDDEN, HIDDEN, wash, wash]);
  shell.renderOrder = 2;
  g.add(shell);
  const edge = new MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false });
  for (const z of [-d / 2, d / 2]) g.add(at(new Mesh(new BoxGeometry(w + 0.7, 0.35, 0.35), edge), 0, h / 2, z));
  for (const x of [-w / 2, w / 2]) g.add(at(new Mesh(new BoxGeometry(0.35, 0.35, d + 0.7), edge), x, h / 2, 0));
  t.nightOnly.push(g);
  return g;
}

/** A facade box with its night glow, centered like facadeBox. */
function litBox(t: Themed, w: number, h: number, d: number, side: Material, roof: Material, glow: string, strength?: number): Group {
  const g = new Group();
  g.add(facadeBox(w, h, d, side, roof));
  g.add(nightGlow(t, w, h, d, glow, strength));
  return g;
}

/** A sign: text on a board, glowing at night. */
function sign(t: Themed, text: string, w: number, h: number, colors: { bg: string; fg: string }, night = 1.6): Mesh {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = Math.round((512 * h) / w);
  const x = c.getContext("2d")!;
  x.fillStyle = colors.bg;
  x.fillRect(0, 0, c.width, c.height);
  x.font = `800 ${Math.round(c.height * 0.62)}px system-ui, sans-serif`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  const fit = Math.min(1, (c.width * 0.9) / x.measureText(text).width);
  x.font = `800 ${Math.round(c.height * 0.62 * fit)}px system-ui, sans-serif`;
  x.fillStyle = colors.fg;
  x.fillText(text, c.width / 2, c.height / 2 + 2);
  const glow = document.createElement("canvas");
  glow.width = c.width;
  glow.height = c.height;
  const g = glow.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, c.width, c.height);
  g.font = x.font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = colors.fg;
  g.fillText(text, c.width / 2, c.height / 2 + 2);
  const map = new CanvasTexture(c);
  const em = new CanvasTexture(glow);
  map.colorSpace = em.colorSpace = SRGBColorSpace;
  const m = new MeshStandardMaterial({ map, emissiveMap: em, emissive: "#FFFFFF", emissiveIntensity: 0.15, roughness: 0.6 });
  t.glows.push({ mat: m, day: 0.15, night });
  // Text on both faces, so it reads from either side.
  return new Mesh(new BoxGeometry(w, h, 0.3), [solid(colors.bg), solid(colors.bg), solid(colors.bg), solid(colors.bg), m, m]);
}

/** A soft pool of light on the ground (night only). */
function lightPool(t: Themed, radius: number, color: string, opacity = 0.35): Mesh {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const grd = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = grd;
  x.fillRect(0, 0, 128, 128);
  const tex = new CanvasTexture(c);
  const m = new Mesh(
    new PlaneGeometry(radius * 2, radius * 2),
    new MeshBasicMaterial({ map: tex, color, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.15;
  m.renderOrder = 2;
  t.nightOnly.push(m);
  return m;
}

function at<T extends Object3D>(o: T, x: number, y: number, z: number): T {
  o.position.set(x, y, z);
  return o;
}

/** Searchlights sweeping the sky from these spots (night only). */
function searchlights(t: Themed, g: Group, spots: [number, number, number][], length = 90) {
  spots.forEach(([x, y, z], i) => {
    const pivot = at(new Group(), x, y, z);
    const beam = new Mesh(
      new ConeGeometry(length * 0.08, length, 16, 1, true),
      new MeshBasicMaterial({ color: "#E6F4FF", transparent: true, opacity: 0.12, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
    );
    beam.position.y = length / 2;
    beam.rotation.x = Math.PI;
    beam.renderOrder = 3;
    pivot.add(beam);
    pivot.rotation.x = -0.25;
    t.nightOnly.push(pivot);
    t.sweep.push({ o: pivot, base: i % 2 ? -0.35 : 0.35, amp: 0.35, speed: 0.6, phase: i * 1.7 });
    g.add(pivot);
  });
}

/** A beam (box) from a to b, for trusses. */
const tmpV = new Vector3();
function strut(a: [number, number, number], b: [number, number, number], thick: number, m: Material): Mesh {
  const va = new Vector3(...a), vb = new Vector3(...b);
  const mesh = new Mesh(new BoxGeometry(thick, thick, va.distanceTo(vb)), m);
  mesh.position.copy(tmpV.copy(va).add(vb).multiplyScalar(0.5));
  mesh.lookAt(vb);
  return mesh;
}

// Monument Valley palette (docs/05): warm stone, coral, teal, sky. Never purple.
const C = {
  stone: "#E3D6C2", stoneDark: "#C9B79C", steel: "#B9C6CF", steelLight: "#D7E1E7", water: "#7FC8E8",
  coral: "#E8735A", terracotta: "#C46A4E", cream: "#FFF3DE", teal: "#2F8F8A", tealLight: "#5FD4C9",
  sky: "#9ED8F7", ink: "#2A2F3A", charcoal: "#3B3A44", amber: "#FFB347", pink: "#FF6B9A",
};

// ---------------------------------------------------------------------------
// The Grind (café open mic): a brick building with a striped awning and a rooftop water tower
// ---------------------------------------------------------------------------
function cafe(t: Themed): Group {
  const g = new Group();
  const brick = facade(t, { wall: C.terracotta, glass: "#4E6B7A", style: "punched", lit: 0.85, seed: 3, frame: C.cream });
  const store = facade(t, { wall: C.cream, glass: "#F6D7A8", style: "storefront", lit: 1, seed: 9, frame: "#6B4A3A" }, 1.5);
  const roof = solid("#9A5A46");
  g.add(at(facadeBox(12, 4.5, 14, store, roof), 0, 2.25, 0));
  g.add(at(facadeBox(12, 8.5, 14, brick, roof), 0, 4.5 + 4.25, 0));
  g.add(at(nightGlow(t, 12, 13, 14, C.amber, 0.7), 0, 6.5, 0));
  g.add(at(new Mesh(new BoxGeometry(12.8, 0.8, 14.8), solid(C.cream)), 0, 13.2, 0));
  // Striped awning.
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 16;
  const x = c.getContext("2d")!;
  for (let i = 0; i < 8; i++) {
    x.fillStyle = i % 2 ? C.cream : C.coral;
    x.fillRect(i * 16, 0, 16, 16);
  }
  const stripes = new CanvasTexture(c);
  stripes.colorSpace = SRGBColorSpace;
  const awning = new Mesh(new PlaneGeometry(11.5, 3), new MeshStandardMaterial({ map: stripes, side: DoubleSide, roughness: 0.9 }));
  awning.position.set(0, 4.6, 8.1);
  awning.rotation.x = -0.9;
  g.add(awning);
  g.add(at(sign(t, "THE GRIND", 9, 1.6, { bg: C.cream, fg: "#6B4A3A" }, 1.4), 0, 6.6, 7.2));
  // Water tower.
  const wood = solid("#8B5E3C");
  const tower = at(new Group(), 3, 13.6, -3);
  for (const [lx, lz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) tower.add(at(new Mesh(new BoxGeometry(0.3, 3, 0.3), solid(C.ink)), lx, 1.5, lz));
  tower.add(at(new Mesh(new CylinderGeometry(2.1, 2.1, 3.6, 10), wood), 0, 4.8, 0));
  tower.add(at(new Mesh(new ConeGeometry(2.4, 1.6, 10), solid(C.ink)), 0, 7.4, 0));
  g.add(tower);
  g.add(at(lightPool(t, 12, C.amber, 0.7), 0, 0, 9));
  g.add(lightPool(t, 16, C.amber, 0.3));
  return g;
}

// The Basement (club): a sawtooth warehouse with a neon roofline
function club(t: Themed): Group {
  const g = new Group();
  const brick = facade(t, { wall: C.charcoal, glass: "#5A6170", style: "industrial", lit: 0.55, seed: 7 }, 1.3);
  const roof = solid("#55545E");
  g.add(at(litBox(t, 32, 10, 20, brick, roof, C.pink, 0.6), 0, 5, 0));
  // Sawtooth roof.
  for (let i = 0; i < 4; i++) {
    const tooth = new Mesh(new CylinderGeometry(3.4, 3.4, 20, 3, 1, false), roof);
    tooth.rotation.x = Math.PI / 2;
    tooth.rotation.z = Math.PI / 2;
    tooth.position.set(-12 + i * 8, 11.3, 0);
    g.add(tooth);
  }
  g.add(at(sign(t, "THE BASEMENT", 22, 3.6, { bg: "#1B1A22", fg: C.pink }, 2.4), 0, 7.6, 10.2));
  // Neon strips along the roofline.
  const neon = glowing(t, C.tealLight, C.tealLight, 2.2, 0.25);
  for (const z of [-10, 10]) g.add(at(new Mesh(new BoxGeometry(32.4, 0.35, 0.35), neon), 0, 10.1, z));
  for (const x of [-16, 16]) g.add(at(new Mesh(new BoxGeometry(0.35, 0.35, 20.4), neon), x, 10.1, 0));
  // Entrance canopy and door.
  g.add(at(new Mesh(new BoxGeometry(9, 0.6, 3.5), solid(C.ink)), 0, 4.2, 11.6));
  g.add(at(new Mesh(new BoxGeometry(3.4, 3.8, 0.3), glowing(t, "#1B1A22", C.pink, 1.4, 0)), 0, 1.9, 10.1));
  g.add(at(lightPool(t, 14, C.pink, 0.7), 0, 0, 14));
  g.add(lightPool(t, 30, C.tealLight, 0.25));
  searchlights(t, g, [[-10, 12, 2], [10, 12, 2]]);
  return g;
}

function fireEscape(g: Group, x: number, z: number, y0: number, floors: number, m: Material) {
  for (let f = 0; f < floors; f++) {
    const y = y0 + f * 3.6;
    g.add(at(new Mesh(new BoxGeometry(5, 0.25, 1.4), m), x, y, z + 0.7));
    g.add(at(new Mesh(new BoxGeometry(5, 1, 0.1), m), x, y + 0.5, z + 1.4));
    if (f < floors - 1) g.add(strut([x + (f % 2 ? 2 : -2), y, z + 0.9], [x + (f % 2 ? -2 : 2), y + 3.6, z + 0.9], 0.2, m));
  }
}

/** A sign that hangs off a facade (blade sign), text on both faces. */
function blade(t: Themed, text: string, h: number, colors: { bg: string; fg: string }, night = 2.4): Mesh {
  const m = sign(t, text, h, h / 4.2, colors, night);
  m.rotation.z = Math.PI / 2;
  m.rotation.y = Math.PI / 2;
  return m;
}

function gable(w: number, h: number, d: number, m: Material): Mesh {
  const roof = new Mesh(new CylinderGeometry(1, 1, d, 3, 1, false), m);
  roof.rotation.x = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.scale.set(h / 1.5, 1, w / 1.732);
  return roof;
}

// The Rusty Amp (dive bar): a low box with a painted mural and a disco ball
function diveClub(t: Themed): Group {
  const g = new Group();
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const x = c.getContext("2d")!;
  const bands = [C.coral, C.amber, C.tealLight, C.sky, C.pink];
  bands.forEach((col, i) => {
    x.fillStyle = col;
    x.beginPath();
    x.moveTo(i * 60 - 20, 64);
    x.lineTo(i * 60 + 30, 0);
    x.lineTo(i * 60 + 60, 0);
    x.lineTo(i * 60 + 10, 64);
    x.fill();
  });
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  const mural = new MeshStandardMaterial({ map: tex, roughness: 0.8, emissive: "#FFFFFF", emissiveMap: tex, emissiveIntensity: 0 });
  t.glows.push({ mat: mural, day: 0, night: 0.5 });
  const wall = solid(C.charcoal);
  g.add(at(new Mesh(new BoxGeometry(24, 7, 16), [wall, wall, solid("#55545E"), wall, mural, wall]), 0, 3.5, 0));
  g.add(at(nightGlow(t, 24, 7, 16, C.pink, 0.5), 0, 3.5, 0));
  // The disco ball, sparkling at night.
  const ball = new Mesh(new IcosahedronGeometry(2.6, 1), glowing(t, "#D7E1E7", "#FFFFFF", 1.2, 0));
  (ball.material as MeshStandardMaterial).metalness = 0.6;
  g.add(at(ball, 0, 11, 0));
  g.add(at(new Mesh(new CylinderGeometry(0.1, 0.1, 1.6, 4), solid(C.ink)), 0, 13.9, 0));
  g.add(at(new Mesh(new BoxGeometry(0.3, 4, 0.3), solid(C.ink)), 0, 9, 0));
  searchlights(t, g, [[-9, 7.2, -4], [9, 7.2, -4]], 70);
  g.add(at(sign(t, "THE RUSTY AMP", 14, 1.6, { bg: C.ink, fg: C.amber }, 2.2), 0, 5.6, 8.2));
  g.add(at(lightPool(t, 12, C.pink, 0.55), 0, 0, 10));
  return g;
}

// The Marquee (theater): a deco front with a chasing-bulb marquee
function cinema(t: Themed): Group {
  const g = new Group();
  const deco = facade(t, { wall: C.cream, glass: "#4E6B7A", style: "punched", lit: 0.6, seed: 191, frame: "#2F8F8A" });
  g.add(at(litBox(t, 22, 12, 26, deco, solid("#C9B79C"), C.amber, 0.4), 0, 6, 0));
  // Stepped deco crown on the front.
  for (let i = 0; i < 3; i++) g.add(at(new Mesh(new BoxGeometry(12 - i * 3.5, 2, 2), solid(i % 2 ? "#2F8F8A" : C.cream)), 0, 13 + i * 2, 12));
  // Marquee: a deep box with chasing bulbs and today's title.
  g.add(at(new Mesh(new BoxGeometry(16, 3, 4), solid(C.ink)), 0, 5.5, 15));
  g.add(at(sign(t, "TONIGHT: YOU?", 14, 1.8, { bg: C.cream, fg: "#C8352B" }, 2), 0, 5.5, 17.05));
  const bulb = glowing(t, C.cream, "#FFE27A", 2.8, 0.15);
  const bulbGeo = new SphereGeometry(0.25, 5, 4);
  for (let i = 0; i < 20; i++) {
    g.add(at(new Mesh(bulbGeo, bulb), -7.6 + i * 0.8, 7.2, 17.05));
    g.add(at(new Mesh(bulbGeo, bulb), -7.6 + i * 0.8, 3.8, 17.05));
  }
  g.add(at(blade(t, "MARQUEE", 12, { bg: "#C8352B", fg: "#FFE27A" }, 2.8), 0, 13, 14.5));
  // Poster boxes by the doors.
  for (const x of [-9, 9]) g.add(at(new Mesh(new BoxGeometry(2.4, 3.4, 0.3), glowing(t, "#3A4A5A", C.sky, 1.4, 0)), x, 2.2, 13.1));
  g.add(at(lightPool(t, 13, "#FFE27A", 0.6), 0, 0, 17));
  return g;
}

// ---------------------------------------------------------------------------
// Homes (Clarifications 3): a studio over a laundromat, a shared band house, a garage bungalow
// ---------------------------------------------------------------------------
function loft(t: Themed): Group {
  const g = new Group();
  const store = facade(t, { wall: "#F2E6D0", glass: "#BFE3F0", style: "storefront", lit: 1, seed: 301, frame: C.teal }, 1.4);
  const upper = facade(t, { wall: "#E8A27C", glass: "#FFD9A0", style: "punched", lit: 0.9, seed: 303, frame: C.cream });
  const roof = solid("#B9765A");
  g.add(at(facadeBox(12, 4.5, 12, store, roof), 0, 2.25, 0));
  g.add(at(facadeBox(12, 7, 12, upper, roof), 0, 4.5 + 3.5, 0));
  g.add(at(nightGlow(t, 12, 11.5, 12, C.amber, 0.6), 0, 5.75, 0));
  g.add(at(sign(t, "SUDS & SONGS LAUNDROMAT", 10, 1.4, { bg: C.teal, fg: C.cream }, 1.8), 0, 5.2, 6.15));
  // Round dryer windows along the front, glowing at night.
  const dryer = glowing(t, "#D7E1E7", C.tealLight, 1.6, 0.1);
  for (let i = 0; i < 4; i++) {
    const d = new Mesh(new CylinderGeometry(0.8, 0.8, 0.2, 14), dryer);
    d.rotation.x = Math.PI / 2;
    g.add(at(d, -3.6 + i * 2.4, 2, 6.1));
  }
  g.add(at(lightPool(t, 8, C.tealLight, 0.5), 0, 0, 8));
  return g;
}

function bandHouse(t: Themed): Group {
  const g = new Group();
  const wall = facade(t, { wall: "#7FB8B0", glass: "#FFD9A0", style: "punched", lit: 1, seed: 311, frame: C.cream });
  g.add(at(facadeBox(12, 8, 11, wall, solid("#5A8F88")), 0, 4, 0));
  g.add(at(gable(13, 4, 12, solid("#C46A4E")), 0, 10, 0));
  g.add(at(nightGlow(t, 12, 8, 11, C.amber, 0.65), 0, 4, 0));
  // A porch with a couch and a drum kit on it (it's that kind of house).
  g.add(at(new Mesh(new BoxGeometry(12, 0.5, 3), solid("#8B5E3C")), 0, 0.25, 7));
  g.add(at(new Mesh(new BoxGeometry(12, 0.3, 3.2), solid(C.cream)), 0, 3.6, 7));
  for (const x of [-5.6, 5.6]) g.add(at(new Mesh(new BoxGeometry(0.3, 3.3, 0.3), solid(C.cream)), x, 1.9, 8.4));
  g.add(at(new Mesh(new BoxGeometry(3.6, 1, 1.2), solid(C.coral)), -2.5, 1, 7));
  const drum = solid(C.pink);
  g.add(at(new Mesh(new CylinderGeometry(0.7, 0.7, 0.9, 12), drum), 3, 1, 7));
  g.add(at(new Mesh(new CylinderGeometry(0.45, 0.45, 0.5, 12), drum), 4.2, 1.4, 7));
  // String lights along the porch roof.
  const bulb = glowing(t, C.cream, "#FFE27A", 2.4, 0.1);
  const bulbGeo = new SphereGeometry(0.2, 5, 4);
  for (let i = 0; i < 14; i++) g.add(at(new Mesh(bulbGeo, bulb), -5.6 + i * 0.86, 3.3 - Math.sin((i / 13) * Math.PI) * 0.5, 8.5));
  g.add(at(lightPool(t, 9, C.amber, 0.5), 0, 0, 9));
  return g;
}

function bungalow(t: Themed): Group {
  const g = new Group();
  const wall = facade(t, { wall: C.cream, glass: "#FFD9A0", style: "punched", lit: 1, seed: 321, frame: C.terracotta });
  g.add(at(facadeBox(11, 5, 10, wall, solid("#B9765A")), -2, 2.5, 0));
  g.add(at(gable(12, 3, 11, solid(C.terracotta)), -2, 6.5, 0));
  // The garage: door half open, a warm light and an amp inside.
  const garage = solid("#E3D6C2");
  g.add(at(new Mesh(new BoxGeometry(7, 4.2, 9), garage), 7, 2.1, 0.5));
  g.add(at(new Mesh(new BoxGeometry(5.6, 1.8, 0.2), solid("#C9B79C")), 7, 3.2, 5.05));
  g.add(at(new Mesh(new BoxGeometry(5.6, 1.8, 0.2), glowing(t, "#3A2E3A", "#FF8A4C", 2, 0.2)), 7, 1.1, 5.05));
  g.add(at(new Mesh(new BoxGeometry(1.4, 1.6, 0.9), solid(C.ink)), 6, 0.9, 3.8));
  // A palm in the yard.
  const trunk = solid("#9A7A5A");
  for (let i = 0; i < 6; i++) g.add(at(new Mesh(new CylinderGeometry(0.32 - i * 0.02, 0.36 - i * 0.02, 1.6, 6), trunk), -8 + i * 0.12, 0.8 + i * 1.5, 5));
  const frond = solid("#4E8F5A");
  for (let i = 0; i < 7; i++) {
    const f = new Mesh(new BoxGeometry(4, 0.12, 0.9), frond);
    f.rotation.y = (i / 7) * Math.PI * 2;
    f.rotation.z = -0.45;
    f.position.set(-7.3 + Math.cos((i / 7) * Math.PI * 2) * 1.6, 9.4, 5 - Math.sin((i / 7) * Math.PI * 2) * 1.6);
    g.add(f);
  }
  g.add(at(lightPool(t, 9, "#FF8A4C", 0.45), 4, 0, 7));
  return g;
}

// ---------------------------------------------------------------------------
// The Halo Dome (map flavor, Clarifications 3): a stadium bowl under a glowing ring roof, always lit
// ---------------------------------------------------------------------------
function haloDome(t: Themed): Group {
  const g = new Group();
  const r = 95;
  const h = 26;
  const wall = glowing(t, "#3E5C7A", C.sky, 0.6, 0.15);
  wall.side = DoubleSide;
  g.add(at(new Mesh(new CylinderGeometry(r, r, h, 48, 1, true), wall), 0, h / 2, 0));
  const seats = solid("#E8735A");
  seats.side = DoubleSide;
  g.add(at(new Mesh(new CylinderGeometry(r - 4, r * 0.45, h - 5, 48, 1, true), seats), 0, (h - 5) / 2 + 1, 0));
  g.add(at(new Mesh(new CylinderGeometry(r * 0.45, r * 0.45, 0.4, 32), solid("#3F8F5E")), 0, 0.6, 0));
  // The halo: a floating ring of light over the bowl, lit day and night.
  // Lit the same day and night (basic materials ignore the scene's light), as the spec says: always lit.
  const halo = new Mesh(new TorusGeometry(r * 0.85, 5, 12, 72), new MeshBasicMaterial({ color: "#FFE27A" }));
  halo.rotation.x = Math.PI / 2;
  g.add(at(halo, 0, h + 34, 0));
  const glowRing = new Mesh(new TorusGeometry(r * 0.85, 14, 8, 72), new MeshBasicMaterial({ color: "#FFE27A", transparent: true, opacity: 0.22, blending: AdditiveBlending, depthWrite: false }));
  glowRing.rotation.x = Math.PI / 2;
  g.add(at(glowRing, 0, h + 34, 0));
  const mast = solid("#EEF2F5");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(at(new Mesh(new CylinderGeometry(1, 1.5, 34, 6), mast), Math.cos(a) * r * 0.85, h + 17, Math.sin(a) * r * 0.85));
  }
  searchlights(t, g, [[-r * 0.6, h, 0], [r * 0.6, h, 0], [0, h, -r * 0.6]], 160);
  g.add(lightPool(t, r * 1.4, "#FFE27A", 0.35));
  return g;
}

// ---------------------------------------------------------------------------
// The CLOUTWOOD letters: giant white block letters on the hillside (original lettering, never the real sign)
// ---------------------------------------------------------------------------
const LETTERS: Record<string, string[]> = {
  C: ["0111", "1000", "1000", "1000", "1000", "1000", "0111"],
  L: ["1000", "1000", "1000", "1000", "1000", "1000", "1111"],
  O: ["0110", "1001", "1001", "1001", "1001", "1001", "0110"],
  U: ["1001", "1001", "1001", "1001", "1001", "1001", "0110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  D: ["1110", "1001", "1001", "1001", "1001", "1001", "1110"],
};

function cloutwoodSign(t: Themed): Group {
  const g = new Group();
  // The hill: a tall green ridge, scrubby on top, the letters on its front slope.
  const hill = new Mesh(new SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), solid("#8DBF76"));
  hill.scale.set(80, 34, 40);
  g.add(at(hill, 0, 0, -14));
  const scrub = solid("#5E9A58");
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    g.add(at(new Mesh(new IcosahedronGeometry(3 + (i % 3) * 1.5, 0), scrub), Math.cos(a) * 62, 10 + (i % 4) * 2, Math.sin(a) * 26 - 18));
  }
  // The letters: white by day; at night bright as a lit sign (basic glow), so they read across the dark hills.
  const white = glowing(t, "#FFFFFF", "#FFFFFF", 2.6, 0.35);
  const cell = 2.4;
  const word = "CLOUTWOOD";
  const gap = cell * 1.2;
  const total = [...word].reduce((acc, ch) => acc + LETTERS[ch][0].length * cell + gap, -gap);
  let x = -total / 2;
  const letters = new Group();
  for (const ch of word) {
    const rows = LETTERS[ch];
    rows.forEach((row, ri) => {
      [...row].forEach((on, ci) => {
        if (on !== "1") return;
        letters.add(at(new Mesh(new BoxGeometry(cell, cell, 1.2), white), x + ci * cell + cell / 2, (rows.length - ri - 0.5) * cell, 0));
      });
    });
    x += rows[0].length * cell + gap;
  }
  // Upright on the slope, facing the camera, raised on short legs like a real hillside sign.
  // Clear of the slope (the hill's surface is about 20 m up here), so no row sinks into it.
  g.add(at(letters, 0, 24, 18));
  const leg = solid("#9AA4AE");
  for (let i = 0; i < 10; i++) g.add(at(new Mesh(new BoxGeometry(0.5, 8, 0.5), leg), -total / 2 + (i + 0.5) * (total / 10), 20, 17.5));
  // Floodlights in front of the letters at night: a warm pool and upward beams.
  g.add(at(lightPool(t, 55, "#FFF3DE", 0.55), 0, 12, 30));
  searchlights(t, g, [[-total / 3, 14, 26], [total / 3, 14, 26]], 70);
  return g;
}

const BUILDERS: Record<LandmarkKind, (t: Themed) => Group> = {
  cafe, "dive-bar": diveClub, club, theater: cinema, loft, "band-house": bandHouse, bungalow,
  "halo-dome": haloDome, "cloutwood-sign": cloutwoodSign,
};

export function buildLandmark(kind: LandmarkKind, t: Themed): Group {
  return BUILDERS[kind](t);
}
