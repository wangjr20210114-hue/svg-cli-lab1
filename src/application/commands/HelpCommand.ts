import type { Command } from '../contracts/Command.js';
import { CommandResult } from '../contracts/CommandResult.js';
export class HelpCommand implements Command {
  constructor(private readonly text: string) {}
  execute(): CommandResult { return new CommandResult(this.text); }
}
