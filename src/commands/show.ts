import { isInteractive } from '../utils/interactive.js';
import { getActiveChangeIds } from '../utils/item-discovery.js';
import { ChangeCommand } from './change.js';
import { nearestMatches } from '../utils/match.js';

export class ShowCommand {
  async execute(itemName?: string, options: { json?: boolean; type?: string; noInteractive?: boolean; [k: string]: any } = {}): Promise<void> {
    const interactive = isInteractive(options);

    if (!itemName) {
      if (interactive) {
        const { select } = await import('@inquirer/prompts');
        const changes = await getActiveChangeIds();
        if (changes.length === 0) {
          console.error('未找到更改。');
          process.exitCode = 1;
          return;
        }
        const picked = await select<string>({ message: '选择一个变更', choices: changes.map(id => ({ name: id, value: id })) });
        const cmd = new ChangeCommand();
        await cmd.show(picked, options as any);
        return;
      }
      this.printNonInteractiveHint();
      process.exitCode = 1;
      return;
    }

    const changes = await getActiveChangeIds();
    const isChange = changes.includes(itemName);

    if (!isChange) {
      console.error(`未知变更 '${itemName}'`);
      const suggestions = nearestMatches(itemName, changes);
      if (suggestions.length) console.error(`您是否想要：${suggestions.join(', ')}?`);
      process.exitCode = 1;
      return;
    }

    const cmd = new ChangeCommand();
    await cmd.show(itemName, options as any);
  }

  private printNonInteractiveHint(): void {
    console.error('没有可显示的内容。请尝试以下方式之一：');
    console.error('  openspec-cn show <change>');
    console.error('  openspec-cn change show');
    console.error('或在交互式终端中运行。');
  }
}
