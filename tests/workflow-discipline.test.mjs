import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function skill(name) {
  return readFile(`skills/${name}/SKILL.md`, "utf8");
}

test("bugfix skill requires root cause before fixes", async () => {
  const text = await skill("opsx-bugfix");

  assert.match(text, /没有根因，不允许修复/);
  assert.match(text, /形成单一假设/);
  assert.match(text, /连续 3 次修复失败/);
});

test("verify and lite require fresh verification evidence before completion claims", async () => {
  const verify = await skill("opsx-verify");
  const lite = await skill("opsx-lite");

  assert.match(verify, /没有当前轮验证证据/);
  assert.match(verify, /不允许宣称完成、通过、已修复或可归档/);
  assert.match(lite, /没有当前轮验证证据/);
  assert.match(lite, /已修改但未验证/);
});

test("tasks skill requires bite-sized executable tasks", async () => {
  const text = await skill("opsx-tasks");

  assert.match(text, /Task 不是意图清单/);
  assert.match(text, /标题行用于扫读进度/);
  assert.match(text, /验证命令 \/ 方法/);
  assert.match(text, /处理边界情况/);
  assert.match(text, /不是 bite-sized/);
});

test("tasks template keeps trace mapping in detail fields only", async () => {
  const text = await readFile("runtime/schemas/spec-driven/templates/tasks.md", "utf8");

  assert.match(text, /\*\*需求追踪\*\*：\[R1\] → \[U1\]/);
  assert.match(text, /任务标题行只保留执行方式标签/);
  assert.doesNotMatch(text, /^- \[ \] \d+\.\d+ \[R\d+\]\[U\d+\]/m);
});

test("verify owns spec compliance and review owns release risk", async () => {
  const verify = await skill("opsx-verify");
  const review = await skill("opsx-review");

  assert.match(verify, /Spec Compliance Review/);
  assert.match(verify, /VERIFY_SPEC_COMPLIANCE/);
  assert.match(review, /opsx-verify.*负责 Spec Compliance Review/);
  assert.match(review, /code quality \/ release risk review/);
  assert.match(review, /VERIFY_DRIFT/);
  assert.doesNotMatch(review, /两段审查顺序/);
});

test("touched skill descriptions avoid workflow step summaries", async () => {
  const touched = [
    "opsx-bugfix",
    "opsx-verify",
    "opsx-lite",
    "opsx-tasks",
    "opsx-review",
    "opsx-explore",
  ];

  for (const name of touched) {
    const text = await skill(name);
    const description = text.match(/^description:\s*(.+)$/m)?.[1] ?? "";

    assert.doesNotMatch(description, /→/);
    assert.doesNotMatch(description, /先.*再/);
    assert.ok(description.length <= 220, `${name} description is too long`);
  }
});
