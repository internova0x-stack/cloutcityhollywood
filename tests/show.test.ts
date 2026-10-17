import assert from "node:assert/strict";
import { test } from "node:test";
import { GAME_CONFIG } from "../lib/config.ts";
import { validateChart, type Chart } from "../lib/show/chart.ts";
import { ShowEngine } from "../lib/show/engine.ts";
import { crowdState, gradeFor, maxScore, multiplierFor, starsFor } from "../lib/show/scoring.ts";
import { buildPerformance, SONGS, WARM_UP_LOOP } from "../lib/show/songs.ts";

const S = GAME_CONFIG.show;

test("grades follow the spec's timing windows, either side", () => {
  assert.equal(gradeFor(0), "perfect");
  assert.equal(gradeFor(-45), "perfect");
  assert.equal(gradeFor(46), "great");
  assert.equal(gradeFor(-90), "great");
  assert.equal(gradeFor(135), "good");
  assert.equal(gradeFor(136), null, "outside every window is no grade at all");
});

test("the multiplier steps up at 10, 20 and 30 notes", () => {
  assert.deepEqual([0, 9, 10, 19, 20, 30, 99].map(multiplierFor), [1, 1, 2, 2, 3, 4, 4]);
});

test("stars come from the share of the base maximum", () => {
  assert.equal(starsFor(0, 1000), 1, "finishing earns a star");
  assert.equal(starsFor(400, 1000), 2);
  assert.equal(starsFor(599, 1000), 2);
  assert.equal(starsFor(750, 1000), 4);
  assert.equal(starsFor(900, 1000), 5);
});

test("crowd labels follow the meter's ranges", () => {
  assert.deepEqual([100, 80, 79, 50, 49, 25, 24, 0].map(crowdState), [
    "losing_it", "losing_it", "into_it", "into_it", "restless", "restless", "booing", "booing",
  ]);
});

for (const song of SONGS) {
  for (const speed of S.practiceSpeeds) {
    for (const loop of [null, ...song.loopable]) {
      test(`${song.id} at Open Mic, ${speed * 100}% speed, ${loop ?? "whole song"}: the chart passes validation`, () => {
        const perf = buildPerformance(song, { difficulty: "open_mic", speed, loop });
        assert.deepEqual(validateChart(perf.chart), []);
        assert.ok(perf.chart.notes.some((n) => n.type === "hold"), "has holds");
        assert.equal(new Set(perf.chart.notes.map((n) => n.lane)).size, 3, "uses all three lanes");
      });
    }
  }
}

test("a looped section plays its bars three times and nothing else", () => {
  const perf = buildPerformance(WARM_UP_LOOP, { difficulty: "open_mic", speed: 1, loop: "chorus" });
  assert.equal(perf.bars.length, WARM_UP_LOOP.sections.chorus.chords.length * S.loopPasses);
  assert.equal(perf.chart.sections.length, S.loopPasses);
});

test("75% speed stretches every note's time by 4/3", () => {
  const full = buildPerformance(WARM_UP_LOOP, { difficulty: "open_mic", speed: 1, loop: null });
  const slow = buildPerformance(WARM_UP_LOOP, { difficulty: "open_mic", speed: 0.75, loop: null });
  assert.equal(slow.chart.notes.length, full.chart.notes.length);
  slow.chart.notes.forEach((n, i) => assert.ok(Math.abs(n.t - full.chart.notes[i].t / 0.75) < 1e-6));
});

test("validation catches a crowded lane, a short hold, a chord and too many notes", () => {
  const chart: Chart = {
    songId: "x", difficulty: "open_mic", bpm: 120, offsetMs: 0, sections: [],
    notes: [
      { t: 0, lane: 0, type: "tap" },
      { t: 50, lane: 0, type: "tap" },
      { t: 50, lane: 1, type: "hold", len: 100 },
      { t: 300, lane: 3, type: "tap" },
    ],
  };
  const errors = validateChart(chart).join("\n");
  assert.match(errors, /under 120 ms/);
  assert.match(errors, /at least 400 ms/);
  assert.match(errors, /no chords below Club/);
  assert.match(errors, /notes in one second/);
  assert.match(errors, /outside 3 lanes/);
});

const tiny = (): Chart => ({
  songId: "t", difficulty: "open_mic", bpm: 60, offsetMs: 0, sections: [],
  notes: [
    { t: 1000, lane: 0, type: "tap" },
    { t: 2000, lane: 1, type: "hold", len: 2000 },
    { t: 5000, lane: 2, type: "tap" },
  ],
});

test("a perfect run scores the base maximum and five stars", () => {
  const e = new ShowEngine(tiny(), 1000);
  assert.equal(e.press(0, 1000), "perfect");
  assert.equal(e.press(1, 2010), "perfect");
  for (let t = 2000; t <= 4200; t += 16) e.update(t);
  e.release(1, 4200);
  assert.equal(e.press(2, 4990), "perfect");
  e.update(6000);
  const r = e.results();
  assert.equal(r.max, maxScore(tiny().notes, 1000));
  assert.equal(r.score, r.max, "every note Perfect plus every hold to the end is the maximum");
  assert.equal(r.stars, 5);
  assert.equal(r.fullCombo, true);
  assert.equal(r.accuracy, 1);
});

test("an empty tap costs nothing; a missed note resets the streak and drains the crowd at half rate", () => {
  const e = new ShowEngine(tiny(), 1000);
  assert.equal(e.press(2, 1000), null, "wrong lane: no grade, no penalty");
  assert.equal(e.counts.miss, 0);
  e.update(1200);
  assert.equal(e.counts.miss, 1, "the lane-0 note slid past");
  assert.equal(e.crowd, S.crowd.start + S.crowd.miss * S.difficulties.open_mic.crowdDrain);
  assert.ok(e.events.some((ev) => ev.kind === "miss"));
  assert.equal(e.press(1, 2100), "good");
  assert.equal(e.streak, 1);
});

test("letting go of a hold early stops its points but isn't a miss", () => {
  const e = new ShowEngine(tiny(), 1000);
  e.press(1, 2000);
  e.update(3000);
  e.release(1, 3000);
  const afterRelease = e.score;
  e.update(4500);
  assert.equal(e.score, afterRelease, "no more hold points once released");
  assert.equal(e.counts.miss, 1, "only the untouched first note is a miss");
});

test("the crowd can't boo you off at Open Mic: it bottoms out at 0", () => {
  const notes = Array.from({ length: 40 }, (_, i) => ({ t: 1000 + i * 600, lane: i % 3, type: "tap" as const }));
  const e = new ShowEngine({ ...tiny(), notes }, 500);
  e.update(100000);
  assert.equal(e.crowd, 0);
  assert.equal(e.results().stars, 1, "you still finish");
});
