import { test } from "node:test";
import assert from "node:assert/strict";
import { crewProgress, inviteUrl, normalizeInviteCode } from "../lib/invite.ts";

test("invite codes: normalized, look-alikes rejected", () => {
  assert.equal(normalizeInviteCode(" k7m4qx "), "K7M4QX");
  assert.equal(normalizeInviteCode("K7M4Q0"), null, "zero is not in the alphabet");
  assert.equal(normalizeInviteCode("K7M4QXX"), null);
  assert.equal(normalizeInviteCode(null), null);
});

test("invite link and crew progress", () => {
  assert.equal(inviteUrl("https://music.example/", "K7M4QX"), "https://music.example/i/K7M4QX");
  assert.deepEqual(crewProgress(2, 5), { joined: 2, shown: 2, ratio: 0.4, complete: false });
  assert.deepEqual(crewProgress(7, 5), { joined: 7, shown: 5, ratio: 1, complete: true });
});
