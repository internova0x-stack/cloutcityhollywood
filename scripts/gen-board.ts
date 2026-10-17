// Writes the illustrated Echo Flats board (lib/map/board.ts) to public/map/ as day and night SVGs.
// Run after changing the board: `npm run gen:board`. tests/board.test.ts checks the files are current.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { boardSvg } from "../lib/map/board.ts";

const out = join(dirname(fileURLToPath(import.meta.url)), "../public/map");
for (const theme of ["day", "night"] as const) {
  writeFileSync(join(out, `echo-flats-${theme}.svg`), boardSvg(theme) + "\n");
  console.log(`wrote public/map/echo-flats-${theme}.svg`);
}
