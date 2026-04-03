import { z, ZodError } from 'zod';
import { existsSync, readFileSync, promises as fs } from 'fs';
import path from 'path';
import { SpecSchema, ChangeSchema, Spec, Change } from '../schemas/index.js';
import { MarkdownParser } from '../parsers/markdown-parser.js';
import { ChangeParser } from '../parsers/change-parser.js';
import { ValidationReport, ValidationIssue, ValidationLevel } from './types.js';
import {
  MIN_PURPOSE_LENGTH,
  MAX_REQUIREMENT_TEXT_LENGTH,
  VALIDATION_MESSAGES
} from './constants.js';
import { parseDeltaSpec, normalizeRequirementName } from '../parsers/requirement-blocks.js';
import { FileSystemUtils } from '../../utils/file-system.js';

export class Validator {
  private strictMode: boolean;

  constructor(strictMode: boolean = false) {
    this.strictMode = strictMode;
  }

  async validateSpec(filePath: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const specName = this.extractNameFromPath(filePath);
    try {
      const content = readFileSync(filePath, 'utf-8');
      const parser = new MarkdownParser(content);
      
      const spec = parser.parseSpec(specName);
      
      const result = SpecSchema.safeParse(spec);
      
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }
      
      issues.push(...this.applySpecRules(spec, content));
      
    } catch (error) {
      const baseMessage = error instanceof Error ? error.message : '未知错误';
      const enriched = this.enrichTopLevelError(specName, baseMessage);
      issues.push({
        level: 'ERROR',
        path: 'file',
        message: enriched,
      });
    }
    
    return this.createReport(issues);
  }

  /**
   * Validate spec content from a string (used for pre-write validation of rebuilt specs)
   */
  async validateSpecContent(specName: string, content: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    try {
      const parser = new MarkdownParser(content);
      const spec = parser.parseSpec(specName);
      const result = SpecSchema.safeParse(spec);
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }
      issues.push(...this.applySpecRules(spec, content));
    } catch (error) {
      const baseMessage = error instanceof Error ? error.message : '未知错误';
      const enriched = this.enrichTopLevelError(specName, baseMessage);
      issues.push({ level: 'ERROR', path: 'file', message: enriched });
    }
    return this.createReport(issues);
  }

  async validateChange(filePath: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const changeName = this.extractNameFromPath(filePath);
    try {
      const content = readFileSync(filePath, 'utf-8');
      const changeDir = path.dirname(filePath);
      const parser = new ChangeParser(content, changeDir);
      
      const change = await parser.parseChangeWithDeltas(changeName);
      
      const result = ChangeSchema.safeParse(change);
      
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }
      
      issues.push(...this.applyChangeRules(change, content));
      
    } catch (error) {
      const baseMessage = error instanceof Error ? error.message : '未知错误';
      const enriched = this.enrichTopLevelError(changeName, baseMessage);
      issues.push({
        level: 'ERROR',
        path: 'file',
        message: enriched,
      });
    }
    
    return this.createReport(issues);
  }

  /**
   * 验证变更目录下的增量格式规范文件。
   * 强制要求：
   * - 所有文件中至少有一个增量
   * - 新增/修改需求：每个需求必须包含 SHALL/MUST/必须/禁止 并且至少有一个场景
   * - 移除需求：仅需名称；不需要场景/描述
   * - 重命名需求：配对格式正确
   * - 每个部分内无重复；每个规范文件内无跨部分冲突
   */
  async validateChangeDeltaSpecs(changeDir: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const specsDir = path.join(changeDir, 'specs');
    let totalDeltas = 0;
    const missingHeaderSpecs: string[] = [];
    const emptySectionSpecs: Array<{ path: string; sections: string[] }> = [];
    const specTraceIds = new Set<string>();

    try {
      const entries = await fs.readdir(specsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const specName = entry.name;
        const specFile = path.join(specsDir, specName, 'spec.md');
        const missingTraceLevel = this.getMissingTraceLevel(changeDir);
        let content: string | undefined;
        try {
          content = await fs.readFile(specFile, 'utf-8');
        } catch {
          continue;
        }

        const plan = parseDeltaSpec(content);
        const entryPath = `${specName}/spec.md`;
        const sectionNames: string[] = [];
        if (plan.sectionPresence.added) sectionNames.push('## 新增需求');
        if (plan.sectionPresence.modified) sectionNames.push('## 修改需求');
        if (plan.sectionPresence.removed) sectionNames.push('## 移除需求');
        if (plan.sectionPresence.renamed) sectionNames.push('## 重命名需求');
        const hasSections = sectionNames.length > 0;
        const hasEntries = plan.added.length + plan.modified.length + plan.removed.length + plan.renamed.length > 0;
        if (!hasEntries) {
          if (hasSections) emptySectionSpecs.push({ path: entryPath, sections: sectionNames });
          else missingHeaderSpecs.push(entryPath);
        }

        const addedNames = new Set<string>();
        const modifiedNames = new Set<string>();
        const removedNames = new Set<string>();
        const renamedFrom = new Set<string>();
        const renamedTo = new Set<string>();

        // 验证新增需求
        for (const block of plan.added) {
          const key = normalizeRequirementName(block.name);
          totalDeltas++;
          if (addedNames.has(key)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `新增需求中存在重复: "${block.name}"` });
          } else {
            addedNames.add(key);
          }
          const requirementText = this.extractRequirementText(block.raw);
          if (!requirementText) {
            issues.push({ level: 'ERROR', path: entryPath, message: `新增需求 "${block.name}" 缺少需求文本` });
          } else if (!this.containsShallOrMust(requirementText)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `新增需求 "${block.name}" 必须包含 SHALL、MUST、必须 或 禁止` });
          }
          const scenarioCount = this.countScenarios(block.raw);
          if (scenarioCount < 1) {
            issues.push({ level: 'ERROR', path: entryPath, message: `新增需求 "${block.name}" 必须至少包含一个场景` });
          } else if (scenarioCount > 3) {
            issues.push({ level: 'WARNING', path: entryPath, message: `新增需求 "${block.name}" 包含 ${scenarioCount} 个场景，建议继续拆分为更细的需求切片` });
          }
          const traceId = this.extractTraceId(block.raw);
          if (!traceId) {
            if (missingTraceLevel) {
              issues.push({ level: missingTraceLevel, path: entryPath, message: `新增需求 "${block.name}" 缺少 Trace ID。请添加一行 \`**Trace**: R<number>\` 以支持 spec ↔ plan ↔ task 追踪` });
            }
          } else {
            specTraceIds.add(traceId);
          }
        }

        // 验证修改需求
        for (const block of plan.modified) {
          const key = normalizeRequirementName(block.name);
          totalDeltas++;
          if (modifiedNames.has(key)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求中存在重复: "${block.name}"` });
          } else {
            modifiedNames.add(key);
          }
          const requirementText = this.extractRequirementText(block.raw);
          if (!requirementText) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求 "${block.name}" 缺少需求文本` });
          } else if (!this.containsShallOrMust(requirementText)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求 "${block.name}" 必须包含 SHALL、MUST、必须 或 禁止` });
          }
          const scenarioCount = this.countScenarios(block.raw);
          if (scenarioCount < 1) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求 "${block.name}" 必须至少包含一个场景` });
          } else if (scenarioCount > 3) {
            issues.push({ level: 'WARNING', path: entryPath, message: `修改需求 "${block.name}" 包含 ${scenarioCount} 个场景，建议继续拆分为更细的需求切片` });
          }
          const traceId = this.extractTraceId(block.raw);
          if (!traceId) {
            if (missingTraceLevel) {
              issues.push({ level: missingTraceLevel, path: entryPath, message: `修改需求 "${block.name}" 缺少 Trace ID。请添加一行 \`**Trace**: R<number>\` 以支持 spec ↔ plan ↔ task 追踪` });
            }
          } else {
            specTraceIds.add(traceId);
          }
        }

        // 验证移除需求（仅名称）
        for (const name of plan.removed) {
          const key = normalizeRequirementName(name);
          totalDeltas++;
          if (removedNames.has(key)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `移除需求中存在重复: "${name}"` });
          } else {
            removedNames.add(key);
          }
        }

        // 验证重命名需求配对
        for (const { from, to } of plan.renamed) {
          const fromKey = normalizeRequirementName(from);
          const toKey = normalizeRequirementName(to);
          totalDeltas++;
          if (renamedFrom.has(fromKey)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `重命名需求中 FROM 存在重复: "${from}"` });
          } else {
            renamedFrom.add(fromKey);
          }
          if (renamedTo.has(toKey)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `重命名需求中 TO 存在重复: "${to}"` });
          } else {
            renamedTo.add(toKey);
          }
        }

        // 跨部分冲突检查（同一规范文件内）
        for (const n of modifiedNames) {
          if (removedNames.has(n)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `需求同时出现在修改需求和移除需求中: "${n}"` });
          }
          if (addedNames.has(n)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `需求同时出现在修改需求和新增需求中: "${n}"` });
          }
        }
        for (const n of addedNames) {
          if (removedNames.has(n)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `需求同时出现在新增需求和移除需求中: "${n}"` });
          }
        }
        for (const { from, to } of plan.renamed) {
          const fromKey = normalizeRequirementName(from);
          const toKey = normalizeRequirementName(to);
          if (modifiedNames.has(fromKey)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `修改需求引用了重命名需求的旧名称。请使用新标题 "${to}"` });
          }
          if (addedNames.has(toKey)) {
            issues.push({ level: 'ERROR', path: entryPath, message: `重命名需求的 TO 与新增需求冲突: "${to}"` });
          }
        }
      }
    } catch {
      // If no specs dir, treat as no deltas
    }

    for (const { path: specPath, sections } of emptySectionSpecs) {
      issues.push({
        level: 'ERROR',
        path: specPath,
        message: `找到了增量部分 ${this.formatSectionList(sections)}，但未解析到任何需求条目。请确保每个部分至少包含一个 "### 需求:" 块（移除需求部分可以使用项目符号列表语法）。`,
      });
    }
    for (const path of missingHeaderSpecs) {
      issues.push({
        level: 'ERROR',
        path,
        message: '未找到增量部分。请添加标题如 "## 新增需求" 或将非增量说明移到 specs/ 目录外。',
      });
    }

    if (totalDeltas === 0) {
      issues.push({ level: 'ERROR', path: 'file', message: this.enrichTopLevelError('change', VALIDATION_MESSAGES.CHANGE_NO_DELTAS) });
    }

    issues.push(...this.validateChangeTraceability(changeDir, specTraceIds));

    return this.createReport(issues);
  }

  private convertZodErrors(error: ZodError): ValidationIssue[] {
    return error.issues.map(err => {
      let message = err.message;
      if (message === VALIDATION_MESSAGES.CHANGE_NO_DELTAS) {
        message = `${message}. ${VALIDATION_MESSAGES.GUIDE_NO_DELTAS}`;
      }
      return {
        level: 'ERROR' as ValidationLevel,
        path: err.path.join('.'),
        message,
      };
    });
  }

  private applySpecRules(spec: Spec, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    if (spec.overview.length < MIN_PURPOSE_LENGTH) {
      issues.push({
        level: 'WARNING',
        path: 'overview',
        message: VALIDATION_MESSAGES.PURPOSE_TOO_BRIEF,
      });
    }
    
    spec.requirements.forEach((req, index) => {
      if (req.text.length > MAX_REQUIREMENT_TEXT_LENGTH) {
        issues.push({
          level: 'INFO',
          path: `requirements[${index}]`,
          message: VALIDATION_MESSAGES.REQUIREMENT_TOO_LONG,
        });
      }
      
      if (req.scenarios.length === 0) {
        issues.push({
          level: 'WARNING',
          path: `requirements[${index}].scenarios`,
          message: `${VALIDATION_MESSAGES.REQUIREMENT_NO_SCENARIOS}. ${VALIDATION_MESSAGES.GUIDE_SCENARIO_FORMAT}`,
        });
      }
    });
    
    return issues;
  }

  private applyChangeRules(change: Change, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    const MIN_DELTA_DESCRIPTION_LENGTH = 10;
    
    change.deltas.forEach((delta, index) => {
      if (!delta.description || delta.description.length < MIN_DELTA_DESCRIPTION_LENGTH) {
        issues.push({
          level: 'WARNING',
          path: `deltas[${index}].description`,
          message: VALIDATION_MESSAGES.DELTA_DESCRIPTION_TOO_BRIEF,
        });
      }
      
      if ((delta.operation === 'ADDED' || delta.operation === 'MODIFIED') && 
          (!delta.requirements || delta.requirements.length === 0)) {
        const operationText = delta.operation === 'ADDED' ? '新增' : '修改';
        issues.push({
          level: 'WARNING',
          path: `deltas[${index}].requirements`,
          message: `${operationText}${VALIDATION_MESSAGES.DELTA_MISSING_REQUIREMENTS}`,
        });
      }
    });
    
    return issues;
  }

  private enrichTopLevelError(itemId: string, baseMessage: string): string {
    const msg = baseMessage.trim();
    if (msg === VALIDATION_MESSAGES.CHANGE_NO_DELTAS) {
      return `${msg}. ${VALIDATION_MESSAGES.GUIDE_NO_DELTAS}`;
    }
    if (msg.includes('规范必须有目的部分') || msg.includes('规范必须有需求部分')) {
      return `${msg}. ${VALIDATION_MESSAGES.GUIDE_MISSING_SPEC_SECTIONS}`;
    }
    if (msg.includes('变更必须有为什么部分') || msg.includes('变更必须有变更内容部分')) {
      return `${msg}. ${VALIDATION_MESSAGES.GUIDE_MISSING_CHANGE_SECTIONS}`;
    }
    return msg;
  }

  private extractNameFromPath(filePath: string): string {
    const normalizedPath = FileSystemUtils.toPosixPath(filePath);
    const parts = normalizedPath.split('/');
    
    // Look for the directory name after 'specs' or 'changes'
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] === 'specs' || parts[i] === 'changes') {
        if (i < parts.length - 1) {
          return parts[i + 1];
        }
      }
    }
    
    // Fallback to filename without extension if not in expected structure
    const fileName = parts[parts.length - 1] ?? '';
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  }

  private createReport(issues: ValidationIssue[]): ValidationReport {
    const errors = issues.filter(i => i.level === 'ERROR').length;
    const warnings = issues.filter(i => i.level === 'WARNING').length;
    const info = issues.filter(i => i.level === 'INFO').length;
    
    const valid = this.strictMode 
      ? errors === 0 && warnings === 0
      : errors === 0;
    
    return {
      valid,
      issues,
      summary: {
        errors,
        warnings,
        info,
      },
    };
  }

  isValid(report: ValidationReport): boolean {
    return report.valid;
  }

  private extractRequirementText(blockRaw: string): string | undefined {
    const lines = blockRaw.split('\n');
    // Skip header line (index 0)
    let i = 1;

    // Find the first substantial text line, skipping metadata and blank lines
    for (; i < lines.length; i++) {
      const line = lines[i];

      // Stop at scenario headers
      if (/^####\s+/.test(line)) break;

      const trimmed = line.trim();

      // Skip blank lines
      if (trimmed.length === 0) continue;

      // Skip metadata lines (lines starting with ** like **ID**, **Priority**, etc.)
      if (/^\*\*[^*]+\*\*:/.test(trimmed)) continue;

      // Found first non-metadata, non-blank line - this is the requirement text
      return trimmed;
    }

    // No requirement text found
    return undefined;
  }

  private containsShallOrMust(text: string): boolean {
    return /\b(SHALL|MUST|必须|禁止)\b/.test(text) || /(?:必须|禁止)/.test(text);
  }

  private extractTraceId(blockRaw: string): string | undefined {
    const match = blockRaw.match(/^\*\*(?:Trace|Trace ID|追踪|追踪ID)\*\*:\s*(R\d+)\s*$/im);
    return match?.[1];
  }

  private countScenarios(blockRaw: string): number {
    const matches = blockRaw.match(/^####\s+/gm);
    return matches ? matches.length : 0;
  }

  private validateChangeTraceability(changeDir: string, specTraceIds: ReadonlySet<string>): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const designPath = path.join(changeDir, 'design.md');
    const tasksPath = path.join(changeDir, 'tasks.md');

    const designExists = existsSync(designPath);
    const tasksExists = existsSync(tasksPath);

    const designContent = designExists ? readFileSync(designPath, 'utf-8') : '';
    const tasksContent = tasksExists ? readFileSync(tasksPath, 'utf-8') : '';

    const requirementToUnits = this.extractRequirementToUnitMappings(designContent);
    const mappedRequirementIds = new Set(requirementToUnits.map((mapping) => mapping.requirementId));
    const unitIds = new Set(this.extractUnitIds(designContent));
    const taskTrace = this.extractTaskTrace(tasksContent);

      if (designExists) {
      if (!/^##\s+(Requirements Trace|需求追踪)(?:\s|$)/m.test(designContent)) {
        issues.push({
          level: 'WARNING',
          path: 'design.md',
          message: 'design.md 缺少 `## 需求追踪` 章节。建议使用 `- [R1] -> [U1]` 形式建立 spec ↔ plan 映射',
        });
      }

      for (const traceId of specTraceIds) {
        if (!mappedRequirementIds.has(traceId)) {
          issues.push({
            level: 'WARNING',
            path: 'design.md',
            message: `需求 ${traceId} 尚未映射到任何实施单元。请在 \`## 需求追踪\` 中添加如 \`- [${traceId}] -> [U1]\` 的条目`,
          });
        }
      }
    }

    if (tasksExists) {
      if (taskTrace.taskCount === 0) {
        issues.push({
          level: 'WARNING',
          path: 'tasks.md',
          message: 'tasks.md 中未解析到任何任务条目。请使用 `- [ ] X.Y ...` 复选框格式',
        });
      }

      if (taskTrace.tasksWithoutRequirement.length > 0) {
        issues.push({
          level: 'WARNING',
          path: 'tasks.md',
          message: `以下任务缺少需求追踪标签 [R<number>]：${taskTrace.tasksWithoutRequirement.join('、')}`,
        });
      }

      if (taskTrace.tasksWithoutUnit.length > 0) {
        issues.push({
          level: 'WARNING',
          path: 'tasks.md',
          message: `以下任务缺少实施单元标签 [U<number>]：${taskTrace.tasksWithoutUnit.join('、')}`,
        });
      }

      if (taskTrace.tasksWithoutMode.length > 0) {
        issues.push({
          level: 'WARNING',
          path: 'tasks.md',
          message: `以下任务缺少执行方式标签 [test-first] / [characterization-first] / [direct]：${taskTrace.tasksWithoutMode.join('、')}`,
        });
      }

      for (const traceId of specTraceIds) {
        if (!taskTrace.requirementIds.has(traceId)) {
          issues.push({
            level: 'WARNING',
            path: 'tasks.md',
            message: `需求 ${traceId} 没有任何 task 覆盖。请至少添加一个带 [${traceId}] 标签的任务`,
          });
        }
      }

      for (const unitId of unitIds) {
        if (!taskTrace.unitIds.has(unitId)) {
          issues.push({
            level: 'WARNING',
            path: 'tasks.md',
            message: `实施单元 ${unitId} 尚未落到 tasks.md。请添加至少一个带 [${unitId}] 标签的任务`,
          });
        }
      }
    }

    return issues;
  }

  private getMissingTraceLevel(changeDir: string): ValidationLevel | undefined {
    const designPath = path.join(changeDir, 'design.md');
    const tasksPath = path.join(changeDir, 'tasks.md');
    return existsSync(designPath) || existsSync(tasksPath) ? 'WARNING' : undefined;
  }

  private extractRequirementToUnitMappings(content: string): Array<{ requirementId: string; unitId: string }> {
    const mappings: Array<{ requirementId: string; unitId: string }> = [];
    const regex = /-\s*\[(R\d+)\]\s*->\s*\[(U\d+)\]/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      mappings.push({ requirementId: match[1], unitId: match[2] });
    }

    return mappings;
  }

  private extractUnitIds(content: string): string[] {
    const matches = content.match(/\[(U\d+)\]/g);
    if (!matches) return [];
    return [...new Set(matches.map((match) => match.slice(1, -1)))];
  }

  private extractTaskTrace(content: string): {
    taskCount: number;
    requirementIds: Set<string>;
    unitIds: Set<string>;
    tasksWithoutRequirement: string[];
    tasksWithoutUnit: string[];
    tasksWithoutMode: string[];
  } {
    const requirementIds = new Set<string>();
    const unitIds = new Set<string>();
    const tasksWithoutRequirement: string[] = [];
    const tasksWithoutUnit: string[] = [];
    const tasksWithoutMode: string[] = [];
    let taskCount = 0;

    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*-\s+\[(?: |x|X)\]\s+([0-9.]+)\s+(.*)$/);
      if (!match) continue;

      taskCount++;
      const taskId = match[1];
      const body = match[2];
      const requirementMatches = body.match(/\[(R\d+)\]/g) ?? [];
      const unitMatches = body.match(/\[(U\d+)\]/g) ?? [];
      const hasMode = /\[(test-first|characterization-first|direct)\]/.test(body);

      if (requirementMatches.length === 0) tasksWithoutRequirement.push(taskId);
      if (unitMatches.length === 0) tasksWithoutUnit.push(taskId);
      if (!hasMode) tasksWithoutMode.push(taskId);

      requirementMatches.forEach((token) => requirementIds.add(token.slice(1, -1)));
      unitMatches.forEach((token) => unitIds.add(token.slice(1, -1)));
    }

    return {
      taskCount,
      requirementIds,
      unitIds,
      tasksWithoutRequirement,
      tasksWithoutUnit,
      tasksWithoutMode,
    };
  }

  private formatSectionList(sections: string[]): string {
    if (sections.length === 0) return '';
    if (sections.length === 1) return sections[0];
    const head = sections.slice(0, -1);
    const last = sections[sections.length - 1];
    return `${head.join('、')} 和 ${last}`;
  }
}
