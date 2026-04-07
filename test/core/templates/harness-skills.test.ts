// test/core/templates/harness-skills.test.ts
import { describe, it, expect } from 'vitest';

import { getBootstrapSkillTemplate } from '../../../src/core/templates/workflows/bootstrap.js';
import { getPlanSkillTemplate } from '../../../src/core/templates/workflows/plan.js';
import { getTddSkillTemplate } from '../../../src/core/templates/workflows/tdd.js';
import { getImplementSkillTemplate } from '../../../src/core/templates/workflows/implement.js';
import { getVerifySkillTemplate } from '../../../src/core/templates/workflows/verify.js';
import { getReviewSkillTemplate } from '../../../src/core/templates/workflows/review.js';
import { getAutoDriveSkillTemplate, getAutoDriveCommandTemplate } from '../../../src/core/templates/workflows/auto-drive.js';
import { getPlanReviewSkillTemplate } from '../../../src/core/templates/workflows/plan-review.js';
import { getTaskAnalyzeSkillTemplate } from '../../../src/core/templates/workflows/task-analyze.js';
import { getBugfixSkillTemplate, getOpsxBugfixCommandTemplate } from '../../../src/core/templates/workflows/bugfix.js';
import { getKnowledgeSkillTemplate, getOpsxKnowledgeCommandTemplate } from '../../../src/core/templates/workflows/knowledge.js';

describe('harness workflow skill templates', () => {
  const templateGetters = [
    { name: 'bootstrap', fn: getBootstrapSkillTemplate },
    { name: 'plan', fn: getPlanSkillTemplate },
    { name: 'tdd', fn: getTddSkillTemplate },
    { name: 'implement', fn: getImplementSkillTemplate },
    { name: 'verify', fn: getVerifySkillTemplate },
    { name: 'review', fn: getReviewSkillTemplate },
    { name: 'auto-drive', fn: getAutoDriveSkillTemplate },
    { name: 'plan-review', fn: getPlanReviewSkillTemplate },
    { name: 'task-analyze', fn: getTaskAnalyzeSkillTemplate },
  ];

  for (const { name, fn } of templateGetters) {
    describe(name, () => {
      it('should return valid SkillTemplate', () => {
        const t = fn();
        expect(t.name).toBe(`openspec-${name}`);
        expect(t.description).toBeTruthy();
        expect(t.instructions).toBeTruthy();
        expect(t.description.length).toBeLessThanOrEqual(1024);
      });

      it('should have Chinese instructions', () => {
        const t = fn();
        expect(t.instructions).toMatch(/[\u4e00-\u9fff]/);
      });

      it('should have instructions under 100 logical sections', () => {
        const t = fn();
        const sectionCount = (t.instructions.match(/^##\s/gm) || []).length;
        expect(sectionCount).toBeLessThanOrEqual(10);
      });
    });
  }

  describe('auto-drive command', () => {
    it('should return valid CommandTemplate', () => {
      const t = getAutoDriveCommandTemplate();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.category).toBe('工作流');
      expect(t.tags).toContain('auto');
      expect(t.content).toBeTruthy();
    });
  });

  describe('bugfix workflow', () => {
    it('should keep bugfix lightweight and knowledge-focused', () => {
      const t = getBugfixSkillTemplate();
      expect(t.name).toBe('openspec-bugfix');
      expect(t.instructions).toContain('定位问题 → 判断是否需要写测试 → 修复 → 验证 → 经验总结');
      expect(t.instructions).toContain('不为简单 bugfix 强行创建 proposal / specs / design / tasks');
      expect(t.instructions).not.toContain('运行 `/opsx:archive` 对应流程');
    });

    it('should describe command flow without archive or change scaffolding', () => {
      const t = getOpsxBugfixCommandTemplate();
      expect(t.description).toContain('经验');
      expect(t.content).toContain('定位问题 → 判断测试策略 → 修复 → 验证 → 经验总结');
      expect(t.content).toContain('不强制创建 OpenSpec change 文档');
      expect(t.content).not.toContain('创建或复用一个 bugfix change');
      expect(t.content).not.toContain('运行验证与归档');
    });
  });

  describe('knowledge workflow', () => {
    it('should provide a standalone knowledge capture skill', () => {
      const t = getKnowledgeSkillTemplate();
      expect(t.name).toBe('openspec-knowledge');
      expect(t.instructions).toContain('收集上下文 → 判断技术领域 → 写入知识条目');
      expect(t.instructions).toContain('.aiknowledge/pitfalls/');
    });

    it('should provide an independent knowledge command', () => {
      const t = getOpsxKnowledgeCommandTemplate();
      expect(t.name).toBe('OPSX: Knowledge');
      expect(t.content).toContain('独立经验沉淀工作流');
      expect(t.content).toContain('.aiknowledge/pitfalls/');
    });
  });
});
