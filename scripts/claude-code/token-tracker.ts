#!/usr/bin/env bun
/**
 * Token Usage Tracker for OpenSpec changes
 * 解析 Claude Code transcript JSONL，按 session 归属到指定 change，
 * 以 append-only 方式写入 token-usage.jsonl 时间轴明细。
 *
 * 用法: bun ~/.claude/token-tracker.ts <transcript-path> <change-dir>
 */

import { existsSync, readFileSync, appendFileSync, writeFileSync } from "fs";

interface TranscriptRecord {
  type?: string;
  sessionId?: string;
  timestamp?: string;
  message?: {
    id?: string;
    model?: string;
    stop_reason?: string | null;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };
}

interface TokenRecord {
  ts: string;
  sid: string;
  model: string;
  in: number;
  out: number;
  cr: number;
  cw: number;
}

// ─── 参数解析 ────────────────────────────────────────────────────────────────

const transcriptPath = process.argv[2];
const changeDir = process.argv[3];

if (!transcriptPath || !changeDir) {
  console.error("用法: bun token-tracker.ts <transcript-path> <change-dir>");
  process.exit(1);
}

if (!existsSync(transcriptPath)) {
  console.error(`错误: transcript 文件不存在: ${transcriptPath}`);
  process.exit(1);
}

if (!existsSync(changeDir)) {
  console.error(`错误: change 目录不存在: ${changeDir}`);
  process.exit(1);
}

// ─── 解析 transcript ─────────────────────────────────────────────────────────

const content = readFileSync(transcriptPath, "utf8");
const lines = content.split("\n").filter((l) => l.trim());

const records: TokenRecord[] = [];
const seenMessageIds = new Set<string>();

for (const line of lines) {
  let rec: TranscriptRecord;
  try {
    rec = JSON.parse(line);
  } catch {
    continue;
  }

  // 只处理 assistant 类型
  if (rec.type !== "assistant") continue;

  const msg = rec.message;
  if (!msg) continue;

  // 跳过流式中间态（stop_reason 为 null）
  if (msg.stop_reason === null || msg.stop_reason === undefined) continue;

  // 按 message.id 去重（同一 API 调用可能有多条记录）
  if (msg.id) {
    if (seenMessageIds.has(msg.id)) continue;
    seenMessageIds.add(msg.id);
  }

  const usage = msg.usage;
  if (!usage) continue;

  records.push({
    ts: rec.timestamp ?? new Date().toISOString(),
    sid: rec.sessionId ?? "unknown",
    model: msg.model ?? "unknown",
    in: usage.input_tokens ?? 0,
    out: usage.output_tokens ?? 0,
    cr: usage.cache_read_input_tokens ?? 0,
    cw: usage.cache_creation_input_tokens ?? 0,
  });
}

// 按 ts 排序
records.sort((a, b) => a.ts.localeCompare(b.ts));

// ─── 幂等去重 + 写入 ────────────────────────────────────────────────────────

const outputPath = `${changeDir}/token-usage.jsonl`;

// 读取已有记录的 sid+ts 集合 + 累计已有 token
const existingKeys = new Set<string>();
const existingRecords: TokenRecord[] = [];
if (existsSync(outputPath)) {
  const existing = readFileSync(outputPath, "utf8");
  for (const line of existing.split("\n").filter((l) => l.trim())) {
    try {
      const obj = JSON.parse(line) as TokenRecord;
      existingKeys.add(`${obj.sid}|${obj.ts}`);
      existingRecords.push(obj);
    } catch {}
  }
}

// 筛选新记录
const newRecords = records.filter((r) => !existingKeys.has(`${r.sid}|${r.ts}`));

// ─── 输出总 token 消耗汇总 ──────────────────────────────────────────────────

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const allRecords = [...existingRecords, ...newRecords];
const totals = allRecords.reduce(
  (acc, r) => {
    acc.in += r.in;
    acc.out += r.out;
    acc.cr += r.cr;
    acc.cw += r.cw;
    return acc;
  },
  { in: 0, out: 0, cr: 0, cw: 0 }
);
const totalAll = totals.in + totals.out + totals.cr + totals.cw;
console.log(
  `Token 总消耗: ${fmtCount(totalAll)} (in:${fmtCount(totals.in)} out:${fmtCount(totals.out)} cr:${fmtCount(totals.cr)} cw:${fmtCount(totals.cw)}) | ${allRecords.length} 条记录`
);

if (newRecords.length === 0) {
  console.log(`无新记录需要写入 (已有 ${existingKeys.size} 条记录)`);
  process.exit(0);
}

// Append 写入
const payload = newRecords.map((r) => JSON.stringify(r)).join("\n") + "\n";

if (existingKeys.size === 0) {
  writeFileSync(outputPath, payload, "utf8");
} else {
  appendFileSync(outputPath, payload, "utf8");
}

console.log(`写入 ${newRecords.length} 条新记录到 ${outputPath} (总计 ${existingKeys.size + newRecords.length} 条)`);
