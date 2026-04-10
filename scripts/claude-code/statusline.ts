#!/usr/bin/env bun
/**
 * Claude Code 状态行脚本
 * 基于 robbyrussell 主题风格，使用 Bun TypeScript 重写
 * 用法: bun /Users/hangox/.claude/statusline.ts
 */

import { execSync, spawnSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, statSync } from "fs";

// ─── 类型定义 ───────────────────────────────────────────────────────────────

interface StdinData {
  cwd?: string;
  transcript_path?: string;
  model?: { id?: string; display_name?: string };
  context_window?: {
    context_window_size?: number;
    used_percentage?: number | null;
    remaining_percentage?: number | null;
    current_usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    } | null;
  };
}

interface OAuthUsage {
  five_hour?: { utilization?: number; resets_at?: string };
  seven_day?: { utilization?: number; resets_at?: string };
}

// ─── ANSI 颜色 ──────────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  green: "\x1b[1;32m",
  cyan: "\x1b[36m",
  blue: "\x1b[1;34m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
  morandiPurple: "\x1b[38;2;155;144;168m",
  morandiBlue: "\x1b[38;2;138;150;166m",
};

// ─── 缓存工具 ────────────────────────────────────────────────────────────────

function readCache(file: string, maxAge: number): string | null {
  try {
    if (!existsSync(file)) return null;
    const age = (Date.now() - statSync(file).mtimeMs) / 1000;
    if (age >= maxAge) return null;
    return readFileSync(file, "utf8").trim() || null;
  } catch {
    return null;
  }
}

function writeCache(file: string, content: string): void {
  try {
    writeFileSync(file, content, "utf8");
  } catch {}
}

// ─── 命令执行（带超时）──────────────────────────────────────────────────────

function runCmd(cmd: string, args: string[], timeoutMs = 5000): string | null {
  const result = spawnSync(cmd, args, {
    encoding: "utf8",
    timeout: timeoutMs,
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (result.status !== 0 || result.error) return null;
  return result.stdout?.trim() || null;
}

// ─── Stdin 读取 ───────────────────────────────────────────────────────────────

async function readStdin(): Promise<StdinData> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// ─── 从 transcript 读取实际使用的模型 ──────────────────────────────────────

const MODEL_DISPLAY: Record<string, string> = {
  "claude-opus-4-6":             "Opus 4.6",
  "claude-opus-4-5":             "Opus 4.5",
  "claude-sonnet-4-6":           "Sonnet 4.6",
  "claude-sonnet-4-5":           "Sonnet 4.5",
  "claude-haiku-4-5":            "Haiku 4.5",
  "claude-haiku-4-5-20251001":   "Haiku 4.5",
};

function modelDisplayName(id: string): string {
  return MODEL_DISPLAY[id] ?? id.replace(/^claude-/, "");
}

function getActualModel(transcriptPath: string | undefined, fallback: string): string {
  if (!transcriptPath || !existsSync(transcriptPath)) return fallback;
  try {
    // 只读末尾 8KB，避免大文件性能问题
    const { size } = statSync(transcriptPath);
    const offset = Math.max(0, size - 8192);
    const fd = require("fs").openSync(transcriptPath, "r");
    const buf = Buffer.alloc(Math.min(8192, size));
    require("fs").readSync(fd, buf, 0, buf.length, offset);
    require("fs").closeSync(fd);

    // 从末尾往前找最近一条包含 model 的 assistant 消息
    const lines = buf.toString("utf8").split("\n").reverse();
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj?.type === "assistant") {
          const modelId: string | undefined = obj?.message?.model;
          if (modelId) return modelDisplayName(modelId);
        }
      } catch {}
    }
  } catch {}
  return fallback;
}

// ─── Context Window 百分比 ──────────────────────────────────────────────────

function getContextPercent(data: StdinData): number | null {
  const cw = data.context_window;
  if (!cw) return null;

  // 优先使用 Claude Code 直接提供的百分比
  if (cw.used_percentage != null) return Math.round(cw.used_percentage);

  // 备选：从 token 数计算
  const size = cw.context_window_size;
  const usage = cw.current_usage;
  if (!size || !usage) return null;

  const total =
    (usage.input_tokens ?? 0) +
    (usage.output_tokens ?? 0) +
    (usage.cache_creation_input_tokens ?? 0) +
    (usage.cache_read_input_tokens ?? 0);

  return Math.round((total / size) * 100);
}

// ─── Token 详细用量（从 transcript 累计会话总量）─────────────────────────────

interface TokenDetails {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreate: number;
  cacheHitRate: number | null; // 百分比 0-100
}

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getTokenDetailsFromTranscript(transcriptPath: string | undefined): TokenDetails | null {
  if (!transcriptPath || !existsSync(transcriptPath)) return null;

  try {
    const content = readFileSync(transcriptPath, "utf8");
    const lines = content.split("\n");

    let input = 0, output = 0, cacheRead = 0, cacheCreate = 0;
    const seenIds = new Set<string>();

    for (const line of lines) {
      if (!line.trim()) continue;
      let obj: any;
      try { obj = JSON.parse(line); } catch { continue; }

      if (obj?.type !== "assistant") continue;
      const msg = obj.message;
      if (!msg?.usage) continue;
      // 跳过流式中间态
      if (msg.stop_reason === null || msg.stop_reason === undefined) continue;
      // 按 message.id 去重
      if (msg.id) {
        if (seenIds.has(msg.id)) continue;
        seenIds.add(msg.id);
      }

      input += msg.usage.input_tokens ?? 0;
      output += msg.usage.output_tokens ?? 0;
      cacheRead += msg.usage.cache_read_input_tokens ?? 0;
      cacheCreate += msg.usage.cache_creation_input_tokens ?? 0;
    }

    if (input + output + cacheRead + cacheCreate === 0) return null;

    const totalInput = cacheRead + cacheCreate + input;
    const cacheHitRate = (cacheRead + cacheCreate > 0) && totalInput > 0
      ? Math.round((cacheRead / totalInput) * 100)
      : null;

    return { input, output, cacheRead, cacheCreate, cacheHitRate };
  } catch {
    return null;
  }
}

// ─── OAuth 缓存 ──────────────────────────────────────────────────────────────

const CACHE_OAUTH   = "/tmp/cl_status_oauth.txt";
const CACHE_OAUTH_FAIL = "/tmp/cl_status_oauth_fail.txt";

// ─── OAuth 配额（仅订阅模式）────────────────────────────────────────────────

function getOAuthToken(): string | null {
  // 优先从 macOS Keychain 读取
  try {
    const raw = execSync(
      'security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null',
      { encoding: "utf8", timeout: 3000 }
    ).trim();
    const creds = JSON.parse(raw);
    return creds?.claudeAiOauth?.accessToken ?? null;
  } catch {}

  // 备选：读取凭据文件
  try {
    const credFile = `${process.env.HOME}/.claude/.credentials.json`;
    if (existsSync(credFile)) {
      const creds = JSON.parse(readFileSync(credFile, "utf8"));
      return creds?.claudeAiOauth?.accessToken ?? null;
    }
  } catch {}

  return null;
}

async function getOAuthQuota(): Promise<OAuthUsage | null> {
  // 成功缓存有效期 6 分钟
  const cached = readCache(CACHE_OAUTH, 360);
  if (cached) {
    try {
      return JSON.parse(cached) as OAuthUsage;
    } catch {}
  }

  // 失败后 6 分钟内不重试，用旧缓存降级
  const recentFail = readCache(CACHE_OAUTH_FAIL, 360);
  if (recentFail) {
    const stale = readCache(CACHE_OAUTH, 86400);
    if (stale) {
      try { return JSON.parse(stale) as OAuthUsage; } catch {}
    }
    return null;
  }

  const token = getOAuthToken();
  if (!token) return null;

  try {
    // Haiku probe: 发送 max_tokens=1 的最小请求，从响应 headers 提取 rate limit 数据
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "anthropic-beta": "oauth-2025-04-20",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "h" }],
      }),
      signal: controller.signal,
    });
    clearTimeout(tid);

    // 从响应 headers 提取 rate limit（即使 API 返回错误也可能有 headers）
    const h5Util = res.headers.get("anthropic-ratelimit-unified-5h-utilization");
    const h5Reset = res.headers.get("anthropic-ratelimit-unified-5h-reset");
    const h7Util = res.headers.get("anthropic-ratelimit-unified-7d-utilization");
    const h7Reset = res.headers.get("anthropic-ratelimit-unified-7d-reset");

    if (!h5Util && !h7Util) {
      writeCache(CACHE_OAUTH_FAIL, String(Date.now()));
      const stale = readCache(CACHE_OAUTH, 86400);
      if (stale) {
        try { return JSON.parse(stale) as OAuthUsage; } catch {}
      }
      return null;
    }

    // 将 utilization 从 0.0-1.0 转换为百分比整数
    const data: OAuthUsage = {};
    if (h5Util) {
      data.five_hour = {
        utilization: Math.round(parseFloat(h5Util) * 100),
        resets_at: h5Reset ? new Date(parseInt(h5Reset) * 1000).toISOString() : undefined,
      };
    }
    if (h7Util) {
      data.seven_day = {
        utilization: Math.round(parseFloat(h7Util) * 100),
        resets_at: h7Reset ? new Date(parseInt(h7Reset) * 1000).toISOString() : undefined,
      };
    }

    writeCache(CACHE_OAUTH, JSON.stringify(data));
    return data;
  } catch {
    writeCache(CACHE_OAUTH_FAIL, String(Date.now()));
    const stale = readCache(CACHE_OAUTH, 86400);
    if (stale) {
      try { return JSON.parse(stale) as OAuthUsage; } catch {}
    }
    return null;
  }
}

// ─── 活跃 OpenSpec 变更 ──────────────────────────────────────────────────────

function getActiveChange(dir: string): string | null {
  const changesDir = `${dir}/openspec/changes`;
  try {
    if (!existsSync(changesDir)) return null;
    const entries = require("fs").readdirSync(changesDir, { withFileTypes: true });
    const active = entries
      .filter((e: any) => e.isDirectory() && e.name !== "archive")
      .map((e: any) => e.name)
      .sort();
    if (active.length === 0) return null;
    // 去掉 YYYY-MM-DD- 日期前缀
    const name = active[0].replace(/^\d{4}-\d{2}-\d{2}-/, "");
    return active.length > 1 ? `${name}+${active.length - 1}` : name;
  } catch {
    return null;
  }
}

// ─── Git 信息 ────────────────────────────────────────────────────────────────

function getGitInfo(dir: string): string {
  const check = spawnSync("git", ["--no-optional-locks", "-C", dir, "rev-parse", "--git-dir"], {
    stdio: "ignore",
  });
  if (check.status !== 0) return "";

  const branch =
    runCmd("git", ["--no-optional-locks", "-C", dir, "branch", "--show-current"]) || "HEAD";

  const hasDiff =
    spawnSync("git", ["--no-optional-locks", "-C", dir, "diff", "--quiet"], { stdio: "ignore" }).status !== 0 ||
    spawnSync("git", ["--no-optional-locks", "-C", dir, "diff", "--cached", "--quiet"], { stdio: "ignore" }).status !== 0;

  const branchStr = `${c.blue}git:(${c.red}${branch}${c.blue})${c.reset}`;
  return hasDiff ? `${branchStr} ${c.yellow}✗${c.reset}` : branchStr;
}

// ─── 时间格式化（UTC ISO -> 本地 HH:MM）────────────────────────────────────

function formatResetTime(isoTime: string): string {
  try {
    return new Date(isoTime).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

// ─── 主函数 ───────────────────────────────────────────────────────────────────

async function main() {
  const input = await readStdin();

  const currentDir = input.cwd ?? process.cwd();
  const fallbackModel = input.model?.display_name ?? "";
  const modelName  = getActualModel(input.transcript_path, fallbackModel);
  const isApiMode  = !!process.env.ANTHROPIC_BASE_URL;

  // OAuth 配额（仅订阅模式）
  const oauthData = isApiMode ? null : await getOAuthQuota();

  const gitInfo = getGitInfo(currentDir);
  const dirName = currentDir.split("/").at(-1) ?? currentDir;
  const ctxPct  = getContextPercent(input);

  // ── 组装各段内容（用 segments 数组，最终 join(" | ")）──

  const segments: string[] = [];

  // 第一段：提示符 + 目录 + git
  const prompt = `${c.green}➜${c.reset}  ${c.cyan}${dirName}${c.reset}`;
  segments.push(gitInfo ? `${prompt} ${gitInfo}` : prompt);

  // 活跃 OpenSpec 变更名
  const activeChange = getActiveChange(currentDir);
  if (activeChange) {
    segments.push(`${c.morandiPurple}📋${activeChange}${c.reset}`);
  }

  // Context 使用率（≥90% 才变黄，否则灰色）
  if (ctxPct !== null) {
    const color = ctxPct >= 90 ? c.yellow : c.gray;
    segments.push(`${color}ctx:${ctxPct}%${c.reset}`);
  }

  // Token 累计用量（从 transcript 解析会话总量）
  const tokens = getTokenDetailsFromTranscript(input.transcript_path);
  if (tokens) {
    const inStr = formatTokenCount(tokens.input);
    const outStr = formatTokenCount(tokens.output);
    const crStr = formatTokenCount(tokens.cacheRead);
    const cwStr = formatTokenCount(tokens.cacheCreate);
    let tokenSeg = `${c.gray}↑${inStr} ↓${outStr} cr:${crStr} cw:${cwStr}${c.reset}`;

    // 缓存命中率：≥80% 绿色（高效），<50% 黄色（偏低），其他灰色
    if (tokens.cacheHitRate !== null) {
      const hitColor =
        tokens.cacheHitRate >= 80 ? c.green :
        tokens.cacheHitRate < 50 ? c.yellow : c.gray;
      tokenSeg += ` ${hitColor}⚡${tokens.cacheHitRate}%${c.reset}`;
    }

    segments.push(tokenSeg);
  }

  // 模型名称
  if (modelName) {
    segments.push(`${c.gray}${modelName}${c.reset}`);
  }

  // ── 配额组（5h / 7d，放最后）──

  if (!isApiMode && oauthData) {
    const fh = oauthData.five_hour;
    if (fh?.utilization !== undefined) {
      const timeStr = fh.resets_at ? `@${formatResetTime(fh.resets_at)}` : "";
      segments.push(`${c.morandiBlue}5h:${fh.utilization}%${timeStr}${c.reset}`);
    }

    const sd = oauthData.seven_day;
    if (sd?.utilization !== undefined) {
      const daysLeft = sd.resets_at
        ? ((new Date(sd.resets_at).getTime() - Date.now()) / 86400000).toFixed(1)
        : null;
      const timeStr = daysLeft ? `@${daysLeft}d` : "";
      segments.push(`${c.morandiBlue}7d:${sd.utilization}%${timeStr}${c.reset}`);
    }
  }

  process.stdout.write(segments.join(" | "));
}

main().catch(() => process.exit(1));
