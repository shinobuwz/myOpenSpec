import ora from 'ora';
import path from 'path';
import { Validator } from '../core/validation/validator.js';
import { isInteractive, resolveNoInteractive } from '../utils/interactive.js';
import { getActiveChangeIds } from '../utils/item-discovery.js';
import { nearestMatches } from '../utils/match.js';

interface ExecuteOptions {
  all?: boolean;
  changes?: boolean;
  type?: string;
  strict?: boolean;
  json?: boolean;
  noInteractive?: boolean;
  interactive?: boolean;
  concurrency?: string;
}

interface BulkItemResult {
  id: string;
  type: 'change';
  valid: boolean;
  issues: { level: 'ERROR' | 'WARNING' | 'INFO'; path: string; message: string }[];
  durationMs: number;
}

export class ValidateCommand {
  async execute(itemName: string | undefined, options: ExecuteOptions = {}): Promise<void> {
    const interactive = isInteractive(options);

    // Handle bulk flags first
    if (options.all || options.changes) {
      await this.runBulkValidation({ strict: !!options.strict, json: !!options.json, concurrency: options.concurrency, noInteractive: resolveNoInteractive(options) });
      return;
    }

    // No item and no flags
    if (!itemName) {
      if (interactive) {
        await this.runInteractiveSelector({ strict: !!options.strict, json: !!options.json, concurrency: options.concurrency });
        return;
      }
      this.printNonInteractiveHint();
      process.exitCode = 1;
      return;
    }

    // Direct item validation
    await this.validateDirectItem(itemName, { strict: !!options.strict, json: !!options.json });
  }

  private async runInteractiveSelector(opts: { strict: boolean; json: boolean; concurrency?: string }): Promise<void> {
    const { select } = await import('@inquirer/prompts');
    const choice = await select({
      message: '您想要验证什么？',
      choices: [
        { name: '所有更改', value: 'changes' },
        { name: '选择特定更改', value: 'one' },
      ],
    });

    if (choice === 'changes') return this.runBulkValidation(opts);

    // one
    const changes = await getActiveChangeIds();
    const items = changes.map(id => ({ name: `change/${id}`, value: id }));
    if (items.length === 0) {
      console.error('未找到要验证的项目。');
      process.exitCode = 1;
      return;
    }
    const picked = await select<string>({ message: '选择一个变更', choices: items });
    await this.validateChange(picked, opts);
  }

  private printNonInteractiveHint(): void {
    console.error('没有要验证的内容。请尝试以下之一：');
    console.error('  openspec-cn validate --all');
    console.error('  openspec-cn validate --changes');
    console.error('  openspec-cn validate <变更名称>');
    console.error('或在交互式终端中运行。');
  }

  private async validateDirectItem(itemName: string, opts: { strict: boolean; json: boolean }): Promise<void> {
    const changes = await getActiveChangeIds();
    const isChange = changes.includes(itemName);

    if (!isChange) {
      console.error(`未知变更 '${itemName}'`);
      const suggestions = nearestMatches(itemName, changes);
      if (suggestions.length) console.error(`您是否想要：${suggestions.join(', ')}?`);
      process.exitCode = 1;
      return;
    }

    await this.validateChange(itemName, opts);
  }

  private async validateChange(id: string, opts: { strict: boolean; json: boolean }): Promise<void> {
    const validator = new Validator(opts.strict);
    const changeDir = path.join(process.cwd(), 'openspec', 'changes', id);
    const start = Date.now();
    const report = await validator.validateChangeDeltaSpecs(changeDir);
    const durationMs = Date.now() - start;
    this.printReport(id, report, durationMs, opts.json);
    process.exitCode = report.valid ? 0 : 1;
  }

  private printReport(id: string, report: { valid: boolean; issues: any[] }, durationMs: number, json: boolean): void {
    if (json) {
      const out = { items: [{ id, type: 'change', valid: report.valid, issues: report.issues, durationMs }], summary: { totals: { items: 1, passed: report.valid ? 1 : 0, failed: report.valid ? 0 : 1 }, byType: { change: { items: 1, passed: report.valid ? 1 : 0, failed: report.valid ? 0 : 1 } } }, version: '1.0' };
      console.log(JSON.stringify(out, null, 2));
      return;
    }
    if (report.valid) {
      console.log(`变更 '${id}' 验证通过`);
    } else {
      console.error(`变更 '${id}' 存在问题`);
      for (const issue of report.issues) {
        const label = issue.level === 'ERROR' ? 'ERROR' : issue.level;
        const prefix = issue.level === 'ERROR' ? '✗' : issue.level === 'WARNING' ? '⚠' : 'ℹ';
        console.error(`${prefix} [${label}] ${issue.path}: ${issue.message}`);
      }
      this.printNextSteps();
    }
  }

  private printNextSteps(): void {
    const bullets = [
      '- 确保变更在specs/中有增量：使用标题## 新增|修改|移除|重命名需求',
      '- 每个需求必须至少包含一个#### 场景:块',
      '- 为每个新增/修改需求添加 `**Trace**: R<number>`，并在 design.md 的"需求追踪"里映射到实施单元',
      '- 在 tasks.md 中使用 `[R<number>][U<number>][test-first|characterization-first|direct]` 标签建立 plan ↔ task 追踪',
      '- 调试解析的增量：openspec-cn change show <id> --json --deltas-only',
    ];
    console.error('后续步骤：');
    bullets.forEach(b => console.error(`  ${b}`));
  }

  private async runBulkValidation(opts: { strict: boolean; json: boolean; concurrency?: string; noInteractive?: boolean }): Promise<void> {
    const spinner = !opts.json && !opts.noInteractive ? ora('正在验证...').start() : undefined;
    const changeIds = await getActiveChangeIds();

    const DEFAULT_CONCURRENCY = 6;
    const concurrency = normalizeConcurrency(opts.concurrency) ?? normalizeConcurrency(process.env.OPENSPEC_CONCURRENCY) ?? DEFAULT_CONCURRENCY;
    const validator = new Validator(opts.strict);
    const queue: Array<() => Promise<BulkItemResult>> = [];

    for (const id of changeIds) {
      queue.push(async () => {
        const start = Date.now();
        const changeDir = path.join(process.cwd(), 'openspec', 'changes', id);
        const report = await validator.validateChangeDeltaSpecs(changeDir);
        const durationMs = Date.now() - start;
        return { id, type: 'change' as const, valid: report.valid, issues: report.issues, durationMs };
      });
    }

    if (queue.length === 0) {
      spinner?.stop();
      const summary = { totals: { items: 0, passed: 0, failed: 0 }, byType: { change: { items: 0, passed: 0, failed: 0 } } } as const;
      if (opts.json) {
        console.log(JSON.stringify({ items: [] as BulkItemResult[], summary, version: '1.0' }, null, 2));
      } else {
        console.log('未找到要验证的项目。');
      }
      process.exitCode = 0;
      return;
    }

    const results: BulkItemResult[] = [];
    let index = 0;
    let running = 0;
    let passed = 0;
    let failed = 0;

    await new Promise<void>((resolve) => {
      const next = () => {
        while (running < concurrency && index < queue.length) {
          const currentIndex = index++;
          const task = queue[currentIndex];
          running++;
          if (spinner) spinner.text = `Validating (${currentIndex + 1}/${queue.length})...`;
          task()
            .then(res => {
              results.push(res);
              if (res.valid) passed++; else failed++;
            })
            .catch((error: any) => {
              const message = error?.message || 'Unknown error';
              const res: BulkItemResult = { id: changeIds[currentIndex] ?? 'unknown', type: 'change', valid: false, issues: [{ level: 'ERROR', path: 'file', message }], durationMs: 0 };
              results.push(res);
              failed++;
            })
            .finally(() => {
              running--;
              if (index >= queue.length && running === 0) resolve();
              else next();
            });
        }
      };
      next();
    });

    spinner?.stop();

    results.sort((a, b) => a.id.localeCompare(b.id));
    const summary = {
      totals: { items: results.length, passed, failed },
      byType: { change: summarizeType(results) },
    } as const;

    if (opts.json) {
      console.log(JSON.stringify({ items: results, summary, version: '1.0' }, null, 2));
    } else {
      for (const res of results) {
        if (res.valid) console.log(`✓ 变更/${res.id}`);
        else console.error(`✗ 变更/${res.id}`);
      }
      console.log(`汇总：通过 ${summary.totals.passed} 项，失败 ${summary.totals.failed} 项（共 ${summary.totals.items} 项）`);
    }

    process.exitCode = failed > 0 ? 1 : 0;
  }
}

function summarizeType(results: BulkItemResult[]) {
  const items = results.length;
  const passed = results.filter(r => r.valid).length;
  const failed = items - passed;
  return { items, passed, failed };
}

function normalizeConcurrency(value?: string): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return undefined;
  return n;
}
