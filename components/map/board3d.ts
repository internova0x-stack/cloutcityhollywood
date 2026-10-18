// The Echo Flats board as a 3D model in a bright mobile-strategy style (owner, Oct 17 and 18: 3D that still looks
// illustrated, "Clash of Clans inspired"): a diagonal isometric camera, lush grass and paved paths, chunky buildings
// with thick overhanging roofs in saturated colours, soft real shadows, bushy trees. Original models only; same layout
// as the 2D board (lib/map/board.ts). A few gentle animations: drifting clouds, the dome's halo, flickering neon.
// One world unit is one board unit; x runs east and z runs south, like the board's x and y.

import {
  AmbientLight, BoxGeometry, BufferGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry,
  DirectionalLight, DoubleSide, Group, HemisphereLight, IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial,
  Object3D, OrthographicCamera, PCFSoftShadowMap, PlaneGeometry, Scene, SphereGeometry, SRGBColorSpace,
  TorusGeometry, Vector3, WebGLRenderer, type Material,
} from "three";
import { BOARD, BUILDINGS, CLOUTWOOD, DISTRICTS, GRID, HALO_DOME, ROADS, type Building } from "../../lib/map/board.ts";

/** Buildings are deeper in 3D than their foreshortened 2D footprints. */
const DEPTH = 1.5;
/** The camera looks down at this angle (degrees above the ground), turned 45° so the grid reads as diamonds. */
export const PITCH = 35;
export const YAW = 45;
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
    if (!m) toonCache.set(color, (m = new MeshLambertMaterial({ color: new Color(color).offsetHSL(0, 0.14, 0) })));
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
  const ground = new Mesh(new PlaneGeometry(BOARD.w + 400, BOARD.h + 400), toon("#6FB548"));
  ground.rotation.x = -Math.PI / 2;
  at(ground, BOARD.w / 2, 0, BOARD.h / 2);
  scene.add(ground);
  const groundMat = ground.material as MeshLambertMaterial;

  const flat = (w: number, d: number, color: string | Material, x: number, z: number, y = 0.2) => {
    const m = new Mesh(new PlaneGeometry(w, d), typeof color === "string" ? toon(color) : color);
    m.rotation.x = -Math.PI / 2;
    return at(m, x, y, z);
  };
  const roadMat = toon("#E3CFA0");
  for (const [y, x1, x2] of ROADS.h) scene.add(flat(x2 - x1, ROADS.width, roadMat, (x1 + x2) / 2, y, 0.3));
  for (const [x, y1, y2] of ROADS.v) scene.add(flat(ROADS.width, y2 - y1, roadMat, x, (y1 + y2) / 2, 0.3));
  // Each block: a raised sidewalk slab with a lawn inset.
  const kerb = toon("#CDB98C");
  GRID.rows.forEach((by, r) => GRID.cols.forEach((bx, c) => {
    const slab = new Mesh(new BoxGeometry(GRID.block, 3, GRID.block), kerb);
    scene.add(at(slab, bx + GRID.block / 2, 1.5, by + GRID.block / 2));
    const park = r === 0 && c === 0;
    scene.add(flat(GRID.block - 16, GRID.block - 16, park ? "#5FAE3E" : "#7CC453", bx + GRID.block / 2, by + GRID.block / 2, 3.2));
    if (park) {
      scene.add(flat(52, 26, glow("#8FD0E6", "#1E3A55"), bx + 75, by + 80, 3.4));
    }
  }));

  // ---- Trees and palms ----
  const leaf = toon("#4FA635"), leafDark = toon("#3A8A2B"), trunk = toon("#8A5A33");
  const tree = (x: number, z: number) => {
    const g = new Group();
    g.add(at(new Mesh(new CylinderGeometry(1.4, 1.8, 8, 6), trunk), 0, 4, 0));
    g.add(at(new Mesh(new IcosahedronGeometry(9, 1), leaf), 0, 15, 0));
    g.add(at(new Mesh(new IcosahedronGeometry(6.5, 1), leafDark), 5, 11, 3));
    g.add(at(new Mesh(new IcosahedronGeometry(6, 1), leaf), -5, 12, -2));
    return at(g, x, 3, z);
  };
  const palm = (x: number, z: number) => {
    const g = new Group();
    g.add(at(new Mesh(new CylinderGeometry(1.1, 1.6, 26, 6), trunk), 0, 13, 0));
    for (let i = 0; i < 6; i++) {
      const frond = new Mesh(new ConeGeometry(2.6, 15, 4), leafDark);
      frond.rotation.z = Math.PI / 2.4;
      const holder = new Group();
      holder.rotation.y = (i / 6) * Math.PI * 2;
      holder.add(at(frond, 6, 24, 0));
      g.add(holder);
    }
    return at(g, x, 3, z);
  };
  GRID.rows.forEach((by, r) => GRID.cols.forEach((bx) => {
    const boulevard = r === 1 || r === 2;
    for (const [tx, tz] of [[bx + 16, by + 22], [bx + GRID.block - 16, by + 22], [bx + 16, by + GRID.block - 14], [bx + GRID.block - 16, by + GRID.block - 14]]) {
      const front = tz > by + 100;
      if (boulevard && ((r === 1 && front) || (r === 2 && !front))) scene.add(palm(tx, tz));
      else if (!front || r === 0) scene.add(tree(tx, tz));
    }
  }));

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
  for (const b of BUILDINGS) scene.add(building(b));

  // ---- The CLOUTWOOD hill ----
  const hill = new Mesh(new SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon("#79BE52"));
  hill.scale.set(230, 70, 110);
  scene.add(at(hill, CLOUTWOOD.x, 0, CLOUTWOOD.y + 10));
  const hill2 = new Mesh(new SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon("#62A944"));
  hill2.scale.set(130, 50, 80);
  scene.add(at(hill2, CLOUTWOOD.x - 130, 0, CLOUTWOOD.y - 10));
  for (let i = 0; i < 8; i++) scene.add(tree(CLOUTWOOD.x - 190 + i * 52, CLOUTWOOD.y + 88 + (i % 2) * 8));
  {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 160;
    const x = c.getContext("2d")!;
    x.font = "900 120px 'Arial Black', Arial, sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.lineWidth = 10;
    x.strokeStyle = INK;
    x.strokeText("CLOUTWOOD", 512, 84);
    x.fillStyle = "#FFFFFF";
    x.fillText("CLOUTWOOD", 512, 84);
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    const letters = new Mesh(new PlaneGeometry(240, 37.5), new MeshBasicMaterial({ map: tex, transparent: true, side: DoubleSide }));
    // Face the camera, which is turned by YAW.
    letters.rotation.set(-0.35, (YAW * Math.PI) / 180, 0, "YXZ");
    scene.add(at(letters, CLOUTWOOD.x, 86, CLOUTWOOD.y + 44));
    glows.push({ mat: letters.material as MeshBasicMaterial, day: "#FFFFFF", night: "#FFF6E0" });
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
    // A few landmark blocks that poke through the clouds.
    for (let i = 0; i < 4; i++) {
      const bw = 36 + (i % 2) * 14, bh = 50 + ((i * 37) % 70);
      const m = inked(new BoxGeometry(bw, bh, bw), toon(sceneryMats[(i + d.id.length) % sceneryMats.length]));
      districtGroup.add(at(m, x + w * (0.2 + 0.2 * i), bh / 2, y + h * (0.3 + (i % 2) * 0.4)));
    }
    // Clouds: clusters of chunky spheres covering the district.
    const n = Math.max(3, Math.round((w * h) / 7000));
    for (let i = 0; i < n; i++) {
      const puff = new Group();
      for (let k = 0; k < 4; k++) puff.add(at(new Mesh(new IcosahedronGeometry(15 + k * 4, 1), cloudMat), k * 15 - 22, 6 + (k % 2) * 6, (k % 2) * 8));
      const cx = x + 30 + ((i * 0.618) % 1) * (w - 60), cz = y + 40 + (((i * 0.382) + 0.15) % 1) * (h - 60);
      at(puff, cx, 26, cz);
      districtGroup.add(puff);
      clouds.push({ o: puff, base: cx, phase: i * 1.7 });
    }
  }
  // The Pier District's sea.
  scene.add(flat(480, 150, glow("#8FD0E6", "#14304A"), 660, 1225, 0.4));
  scene.add(flat(480, 70, "#F3E3BE", 660, 1115, 0.35));
  scene.add(districtGroup);

  // ---- Lights ----
  const hemi = new HemisphereLight("#CDE8FF", "#7BAA55", 1.5);
  const sun = new DirectionalLight("#FFF1D6", 2.4);
  sun.position.set(BOARD.w / 2 - 520, 900, BOARD.h / 2 + 260);
  sun.target.position.set(BOARD.w / 2, 0, BOARD.h / 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -900, right: 900, top: 900, bottom: -900, near: 10, far: 3000 });
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
  let view: BoardView = { center: { x: BOARD.w / 2, y: BOARD.h / 2 }, scale: 1 };
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
  const greens = ["#7CC453", "#5FAE3E", "#79BE52", "#62A944", "#4FA635", "#3A8A2B"].map((c) => ({ mat: toon(c), day: toon(c).color.clone() }));
  function applyNight() {
    for (const gl of glows) gl.mat.color.set(night ? gl.night : gl.day);
    for (const g of greens) g.mat.color.copy(g.day).multiplyScalar(night ? 0.32 : 1);
    groundMat.color.set(night ? "#1F3326" : "#7CC453");
    roadMat.color.set(night ? "#4A4238" : "#E8D3A2");
    kerb.color.set(night ? "#3E3830" : "#D2BE90");
    cloudMat.color.set(night ? "#4A4258" : "#FFFFFF");
    hemi.color.set(night ? "#4A5A8A" : "#CDE8FF");
    hemi.groundColor.set(night ? "#1A1622" : "#7BAA55");
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
