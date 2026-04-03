import { createRequire } from 'module';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';

const require = createRequire(import.meta.url);

/**
 * Get OpenSpec version from package.json
 */
function getVersion(): string {
  try {
    const { version } = require('../../package.json');
    return version;
  } catch {
    return 'unknown';
  }
}

/**
 * Get platform name
 */
function getPlatform(): string {
  return os.platform();
}

/**
 * Get current timestamp in ISO format
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate metadata footer for feedback
 */
function generateMetadata(): string {
  const version = getVersion();
  const platform = getPlatform();
  const timestamp = getTimestamp();

  return `---
通过 OpenSpec CLI 提交
- 版本: ${version}
- 平台: ${platform}
- 时间戳: ${timestamp}`;
}

/**
 * Format the feedback title
 */
function formatTitle(message: string): string {
  return `反馈: ${message}`;
}

/**
 * Format the full feedback body
 */
function formatBody(bodyText?: string): string {
  const parts: string[] = [];

  if (bodyText) {
    parts.push(bodyText);
    parts.push(''); // Empty line before metadata
  }

  parts.push(generateMetadata());

  return parts.join('\n');
}

/**
 * Resolve a local directory for storing feedback files
 */
function resolveFeedbackDir(): string {
  const cwd = process.cwd();
  const projectOpenSpecDir = path.join(cwd, 'openspec');
  if (existsSync(projectOpenSpecDir)) {
    return path.join(projectOpenSpecDir, 'feedback');
  }
  return path.join(cwd, '.openspec', 'feedback');
}

/**
 * Generate a filesystem-safe slug from the title
 */
function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return slug || 'feedback';
}

/**
 * Persist feedback to a local markdown file
 */
function writeFeedbackFile(title: string, body: string): string {
  const feedbackDir = resolveFeedbackDir();
  mkdirSync(feedbackDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${slugifyTitle(title)}.md`;
  const outputPath = path.join(feedbackDir, filename);

  const content = `# ${title}

${body}
`;

  writeFileSync(outputPath, content, 'utf-8');
  return outputPath;
}

/**
 * Feedback command implementation
 */
export class FeedbackCommand {
  async execute(message: string, options?: { body?: string }): Promise<void> {
    const title = formatTitle(message);
    const body = formatBody(options?.body);
    const outputPath = writeFeedbackFile(title, body);
    console.log(`\n✓ 反馈已写入本地文件`);
    console.log(`路径: ${outputPath}\n`);
  }
}
