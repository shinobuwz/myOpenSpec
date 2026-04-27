import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("archive skill avoids double date prefixes in archive directories", async () => {
  const skill = await readFile("skills/opsx-archive/SKILL.md", "utf8");

  assert.match(skill, /<archive-dir>/);
  assert.match(skill, /如果 `<archive-slug>` 已经以 `YYYY-MM-DD-` 开头/);
  assert.doesNotMatch(skill, /archive\/YYYY-MM-DD-<archive-slug>/);
});
