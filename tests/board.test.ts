import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BOARD, boardSvg, DISTRICTS, SPOTS } from "../lib/map/board.ts";
import { PLACE_PINS } from "../lib/places.ts";

test("the board files in public/map are current (run npm run gen:board after changing the board)", () => {
  for (const theme of ["day", "night"] as const) {
    const file = readFileSync(new URL(`../public/map/echo-flats-${theme}.svg`, import.meta.url), "utf8");
    assert.equal(file, boardSvg(theme) + "\n", `echo-flats-${theme}.svg is out of date`);
  }
});

test("every place on the map has a spot on the board, inside its edges", () => {
  for (const p of PLACE_PINS) {
    const s = SPOTS.find((x) => x.id === p.id);
    assert.ok(s, `${p.id} has no spot`);
    assert.ok(s.x > 0 && s.x < BOARD.w && s.y > 0 && s.y < BOARD.h, `${p.id} is off the board`);
  }
});

test("the five locked districts are on the board", () => {
  assert.deepEqual(DISTRICTS.map((d) => d.name), ["Starline Boulevard", "Neon Row", "Canyon Heights", "Studio Lot", "Pier District"]);
  for (const d of DISTRICTS) {
    const [x, y, w, h] = d.rect;
    assert.ok(x >= 0 && y >= 0 && x + w <= BOARD.w && y + h <= BOARD.h, `${d.name} spills off the board`);
  }
});

test("the board is dark at night and never uses gold", () => {
  assert.match(boardSvg("night"), /#25202D/);
  for (const theme of ["day", "night"] as const) assert.doesNotMatch(boardSvg(theme), /#(FEF3C0|E1BC85|AD8759|7E5932)/i);
});

test("every place has a spot in the 3D city, inside the city", async () => {
  const { BOUNDS, SPOTS_3D } = await import("../components/map/board3d.ts");
  for (const p of PLACE_PINS) {
    const s = SPOTS_3D.find((x) => x.id === p.id);
    assert.ok(s, `${p.id} has no 3D spot`);
    assert.ok(s.x > BOUNDS.x0 && s.x < BOUNDS.x1 && s.y > BOUNDS.y0 && s.y < BOUNDS.y1, `${p.id} is outside the 3D city`);
  }
});
