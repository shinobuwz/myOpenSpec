import { describe, it, expect } from 'vitest';
import { CommandAdapterRegistry } from '../../../src/core/command-generation/registry.js';

describe('command-generation/registry', () => {
  describe('get', () => {
    it('should return Claude adapter for "claude"', () => {
      const adapter = CommandAdapterRegistry.get('claude');
      expect(adapter).toBeDefined();
      expect(adapter?.toolId).toBe('claude');
    });

    it('should return Codex adapter for "codex"', () => {
      const adapter = CommandAdapterRegistry.get('codex');
      expect(adapter).toBeDefined();
      expect(adapter?.toolId).toBe('codex');
    });

    it('should return undefined for unregistered tool', () => {
      const adapter = CommandAdapterRegistry.get('unknown-tool');
      expect(adapter).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const adapter = CommandAdapterRegistry.get('');
      expect(adapter).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return array of all registered adapters', () => {
      const adapters = CommandAdapterRegistry.getAll();
      expect(Array.isArray(adapters)).toBe(true);
      expect(adapters.length).toBeGreaterThanOrEqual(2); // At least Claude, Codex
    });

    it('should include Claude and Codex adapters', () => {
      const adapters = CommandAdapterRegistry.getAll();
      const toolIds = adapters.map((a) => a.toolId);

      expect(toolIds).toContain('claude');
      expect(toolIds).toContain('codex');
    });
  });

  describe('has', () => {
    it('should return true for registered tools', () => {
      expect(CommandAdapterRegistry.has('claude')).toBe(true);
      expect(CommandAdapterRegistry.has('codex')).toBe(true);
    });

    it('should return false for unregistered tools', () => {
      expect(CommandAdapterRegistry.has('unknown')).toBe(false);
      expect(CommandAdapterRegistry.has('')).toBe(false);
    });
  });

  describe('adapter functionality', () => {
    it('registered adapters should have working getFilePath', () => {
      const claudeAdapter = CommandAdapterRegistry.get('claude');
      const codexAdapter = CommandAdapterRegistry.get('codex');

      expect(claudeAdapter?.getFilePath('test')).toContain('.claude');
      // Codex uses global ~/.codex path (absolute), just verify it contains the filename pattern
      expect(codexAdapter?.getFilePath('test')).toContain('opsx-test.md');
    });

    it('registered adapters should have working formatFile', () => {
      const content = {
        id: 'test',
        name: 'Test',
        description: 'Test desc',
        category: 'Test',
        tags: ['tag1'],
        body: 'Body content',
      };

      const adapters = CommandAdapterRegistry.getAll();
      for (const adapter of adapters) {
        const output = adapter.formatFile(content);
        // All adapters should include the body content
        expect(output).toContain('Body content');
        expect(output).toContain('---');
      }
    });
  });
});
