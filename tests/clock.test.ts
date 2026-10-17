import assert from "node:assert/strict";
import { test } from "node:test";
import { cityMinutes, nyDate } from "../lib/clock.ts";

test("the city clock runs one day every 2 real hours", () => {
  assert.equal(cityMinutes(0), 0);
  assert.equal(cityMinutes(60 * 60 * 1000), 720, "an hour in, it's city noon");
  assert.equal(cityMinutes(2 * 60 * 60 * 1000), 0, "two hours: midnight again");
});

test("the story calendar is the New York date", () => {
  // 2026-10-18 03:00 UTC is still Oct 17 in New York.
  assert.equal(nyDate(Date.UTC(2026, 9, 18, 3, 0)), "2026-10-17");
});
