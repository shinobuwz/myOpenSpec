import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("archive skill avoids double date prefixes in archive directories", async () => {
  const skill = await readFile("skills/opsx-archive/SKILL.md", "utf8");

  assert.match(skill, /<archive-dir>/);
  assert.match(skill, /如果 `<archive-slug>` 已经以 `YYYY-MM-DD-` 开头/);
  assert.doesNotMatch(skill, /archive\/YYYY-MM-DD-<archive-slug>/);
});

test("archive skill documents fast archive root separately from changes archive", async () => {
  const skill = await readFile("skills/opsx-archive/SKILL.md", "utf8");
  const routing = await readFile("skills/opsx-archive/references/archive-routing.md", "utf8");
  const followUp = await readFile("skills/opsx-archive/references/follow-up-workers.md", "utf8");

  assert.match(skill, /target_kind: fast|fast item/);
  assert.match(routing, /openspec\/fast\/archive\/<archive-dir>/);
  assert.match(routing, /target_kind: fast/);
  assert.match(followUp, /真实归档路径/);
  assert.match(followUp, /fast:<id>/);
});

test("archive skill allows no-review fast items after verify gate", async () => {
  const skill = await readFile("skills/opsx-archive/SKILL.md", "utf8");

  assert.match(skill, /review_required: false/);
  assert.match(skill, /只校验 `gates\.verify`/);
  assert.match(skill, /不要求 `gates\.review`/);
});
