import { describe, it, expect } from 'vitest';

import {
  CORE_WORKFLOWS,
  ALL_WORKFLOWS,
  getProfileWorkflows,
} from '../../src/core/profiles.js';

describe('profiles', () => {
  describe('CORE_WORKFLOWS', () => {
    it('should default to the full workflow set', () => {
      expect(CORE_WORKFLOWS).toEqual(ALL_WORKFLOWS);
    });

    it('should be a subset of ALL_WORKFLOWS', () => {
      for (const workflow of CORE_WORKFLOWS) {
        expect(ALL_WORKFLOWS).toContain(workflow);
      }
    });
  });

  describe('ALL_WORKFLOWS', () => {
    it('should contain all 21 workflows', () => {
      expect(ALL_WORKFLOWS).toHaveLength(21);
    });

    it('should contain expected workflow IDs', () => {
      const expected = [
        'explore', 'bugfix', 'knowledge', 'new', 'continue', 'apply',
        'ff', 'sync', 'archive', 'bulk-archive', 'verify', 'onboard',
        'bootstrap', 'plan', 'plan-review', 'task-analyze', 'tdd',
        'implement', 'verify-enhanced', 'review', 'auto-drive',
      ];
      expect([...ALL_WORKFLOWS]).toEqual(expected);
    });
  });

  describe('getProfileWorkflows', () => {
    it('should return core workflows for core profile', () => {
      const result = getProfileWorkflows('core');
      expect(result).toEqual(CORE_WORKFLOWS);
    });

    it('should return core workflows for core profile even if customWorkflows provided', () => {
      const result = getProfileWorkflows('core', ['new', 'apply']);
      expect(result).toEqual(CORE_WORKFLOWS);
    });

    it('should return custom workflows for custom profile', () => {
      const customWorkflows = ['explore', 'new', 'apply', 'ff', 'tdd'];
      const result = getProfileWorkflows('custom', customWorkflows);
      expect(result).toEqual(customWorkflows);
    });

    it('should return empty array for custom profile with no customWorkflows', () => {
      const result = getProfileWorkflows('custom');
      expect(result).toEqual([]);
    });

    it('should return empty array for custom profile with empty customWorkflows', () => {
      const result = getProfileWorkflows('custom', []);
      expect(result).toEqual([]);
    });
  });
});
