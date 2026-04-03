// test/core/templates/harness-skills.test.ts
import { describe, it, expect } from 'vitest';

import { getBootstrapSkillTemplate } from '../../../src/core/templates/workflows/bootstrap.js';
import { getBrainstormSkillTemplate } from '../../../src/core/templates/workflows/brainstorm.js';
import { getPlanSkillTemplate } from '../../../src/core/templates/workflows/plan.js';
import { getTddSkillTemplate } from '../../../src/core/templates/workflows/tdd.js';
import { getImplementSkillTemplate } from '../../../src/core/templates/workflows/implement.js';
import { getVerifySkillTemplate } from '../../../src/core/templates/workflows/verify.js';
import { getReviewSkillTemplate } from '../../../src/core/templates/workflows/review.js';
import { getShipSkillTemplate } from '../../../src/core/templates/workflows/ship.js';
import { getAutoDriveSkillTemplate, getAutoDriveCommandTemplate } from '../../../src/core/templates/workflows/auto-drive.js';
import { getPlanReviewSkillTemplate } from '../../../src/core/templates/workflows/plan-review.js';

describe('harness workflow skill templates', () => {
  const templateGetters = [
    { name: 'bootstrap', fn: getBootstrapSkillTemplate },
    { name: 'brainstorm', fn: getBrainstormSkillTemplate },
    { name: 'plan', fn: getPlanSkillTemplate },
    { name: 'tdd', fn: getTddSkillTemplate },
    { name: 'implement', fn: getImplementSkillTemplate },
    { name: 'verify', fn: getVerifySkillTemplate },
    { name: 'review', fn: getReviewSkillTemplate },
    { name: 'ship', fn: getShipSkillTemplate },
    { name: 'auto-drive', fn: getAutoDriveSkillTemplate },
    { name: 'plan-review', fn: getPlanReviewSkillTemplate },
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
});
