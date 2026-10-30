import type { Command } from './contracts/Command.js';
import type { CommandResult } from './contracts/CommandResult.js';
export class EditorApplication {
  execute(command: Command): CommandResult { return command.execute(); }
}
