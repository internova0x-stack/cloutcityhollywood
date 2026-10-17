import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanName, handle, nameError } from "../lib/validation.ts";

test("stage names follow the database's username rule", () => {
  assert.equal(nameError("riffqueen"), null);
  assert.equal(nameError("@lofi.lou"), null, "a leading @ is fine");
  assert.equal(cleanName("  @dez_drums "), "dez_drums");
  assert.match(nameError("riff queen")!, /No spaces/);
  assert.match(nameError("ab")!, /At least 3/);
  assert.match(nameError("a".repeat(21))!, /20 characters max/);
  assert.match(nameError("riff!")!, /Letters, numbers/);
  assert.equal(handle("riffqueen"), "@riffqueen");
});
