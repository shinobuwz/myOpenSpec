import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ArchiveCommand } from '../../src/core/archive.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Mock @inquirer/prompts
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  confirm: vi.fn()
}));

describe('ArchiveCommand', () => {
  let tempDir: string;
  let archiveCommand: ArchiveCommand;
  const originalConsoleLog = console.log;

  beforeEach(async () => {
    // Create temp directory
    tempDir = path.join(os.tmpdir(), `openspec-archive-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Change to temp directory
    process.chdir(tempDir);

    // Create OpenSpec structure
    const openspecDir = path.join(tempDir, 'openspec');
    await fs.mkdir(path.join(openspecDir, 'changes'), { recursive: true });
    await fs.mkdir(path.join(openspecDir, 'changes', 'archive'), { recursive: true });

    // Suppress console.log during tests
    console.log = vi.fn();

    archiveCommand = new ArchiveCommand();
  });

  afterEach(async () => {
    // Restore console.log
    console.log = originalConsoleLog;

    // Clear mocks
    vi.clearAllMocks();

    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('execute', () => {
    it('should archive a change successfully', async () => {
      // Create a test change
      const changeName = 'test-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });

      // Create tasks.md with completed tasks
      const tasksContent = '- [x] Task 1\n- [x] Task 2';
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasksContent);

      // Execute archive with --yes flag
      await archiveCommand.execute(changeName, { yes: true });

      // Check that change was moved to archive
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);

      expect(archives.length).toBe(1);
      expect(archives[0]).toMatch(new RegExp(`\\d{4}-\\d{2}-\\d{2}-${changeName}`));

      // Verify original change directory no longer exists
      await expect(fs.access(changeDir)).rejects.toThrow();
    });

    it('should warn about incomplete tasks', async () => {
      const changeName = 'incomplete-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });

      // Create tasks.md with incomplete tasks
      const tasksContent = '- [x] Task 1\n- [ ] Task 2\n- [ ] Task 3';
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasksContent);

      // Execute archive with --yes flag
      await archiveCommand.execute(changeName, { yes: true });

      // Verify warning was logged
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('警告：发现 2 个未完成任务')
      );
    });

    it('should throw error if change does not exist', async () => {
      await expect(
        archiveCommand.execute('non-existent-change', { yes: true })
      ).rejects.toThrow("未找到更改 'non-existent-change'。");
    });

    it('should throw error if archive already exists', async () => {
      const changeName = 'duplicate-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });

      // Create existing archive with same date
      const date = new Date().toISOString().split('T')[0];
      const archivePath = path.join(tempDir, 'openspec', 'changes', 'archive', `${date}-${changeName}`);
      await fs.mkdir(archivePath, { recursive: true });

      // Try to archive
      await expect(
        archiveCommand.execute(changeName, { yes: true })
      ).rejects.toThrow(`归档 '${date}-${changeName}' 已存在。`);
    });

    it('should handle changes without tasks.md', async () => {
      const changeName = 'no-tasks-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });

      // Execute archive without tasks.md
      await archiveCommand.execute(changeName, { yes: true });

      // Should complete without warnings
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('未完成任务')
      );

      // Verify change was archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.length).toBe(1);
    });

    it('should handle changes without specs dir', async () => {
      const changeName = 'no-specs-feature';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });

      // Execute archive without specs
      await archiveCommand.execute(changeName, { yes: true });

      // Verify change was archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives.length).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should throw error when openspec directory does not exist', async () => {
      // Remove openspec directory
      await fs.rm(path.join(tempDir, 'openspec'), { recursive: true });

      await expect(
        archiveCommand.execute('any-change', { yes: true })
      ).rejects.toThrow("未找到OpenSpec更改目录。请先运行 'openspec-cn init'。");
    });
  });

  describe('interactive mode', () => {
    it('should use select prompt for change selection', async () => {
      const { select } = await import('@inquirer/prompts');
      const mockSelect = select as unknown as ReturnType<typeof vi.fn>;

      // Create test changes
      const change1 = 'feature-a';
      const change2 = 'feature-b';
      await fs.mkdir(path.join(tempDir, 'openspec', 'changes', change1), { recursive: true });
      await fs.mkdir(path.join(tempDir, 'openspec', 'changes', change2), { recursive: true });

      // Mock select to return first change
      mockSelect.mockResolvedValueOnce(change1);

      // Execute without change name
      await archiveCommand.execute(undefined, { yes: true });

      // Verify select was called with correct options (values matter, names may include progress)
      expect(mockSelect).toHaveBeenCalledWith(expect.objectContaining({
        message: '选择要归档的更改',
        choices: expect.arrayContaining([
          expect.objectContaining({ value: change1 }),
          expect.objectContaining({ value: change2 })
        ])
      }));

      // Verify the selected change was archived
      const archiveDir = path.join(tempDir, 'openspec', 'changes', 'archive');
      const archives = await fs.readdir(archiveDir);
      expect(archives[0]).toContain(change1);
    });

    it('should use confirm prompt for task warnings', async () => {
      const { confirm } = await import('@inquirer/prompts');
      const mockConfirm = confirm as unknown as ReturnType<typeof vi.fn>;

      const changeName = 'incomplete-interactive';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });

      // Create tasks.md with incomplete tasks
      const tasksContent = '- [ ] Task 1';
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasksContent);

      // Mock confirm to return true (proceed)
      mockConfirm.mockResolvedValueOnce(true);

      // Execute without --yes flag
      await archiveCommand.execute(changeName);

      // Verify confirm was called
      expect(mockConfirm).toHaveBeenCalledWith({
        message: expect.stringContaining('未完成任务'),
        default: false
      });
    });

    it('should cancel when user declines task warning', async () => {
      const { confirm } = await import('@inquirer/prompts');
      const mockConfirm = confirm as unknown as ReturnType<typeof vi.fn>;

      const changeName = 'cancel-test';
      const changeDir = path.join(tempDir, 'openspec', 'changes', changeName);
      await fs.mkdir(changeDir, { recursive: true });

      // Create tasks.md with incomplete tasks
      const tasksContent = '- [ ] Task 1';
      await fs.writeFile(path.join(changeDir, 'tasks.md'), tasksContent);

      // Mock confirm to return false (cancel) for validation skip
      mockConfirm.mockResolvedValueOnce(false);
      // Mock another false for task warning
      mockConfirm.mockResolvedValueOnce(false);

      // Execute without --yes flag but skip validation to test task warning
      await archiveCommand.execute(changeName, { noValidate: true });

      // Verify archive was cancelled
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('已取消'));

      // Verify change was not archived
      await expect(fs.access(changeDir)).resolves.not.toThrow();
    });
  });
});
