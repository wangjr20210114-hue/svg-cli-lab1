import type { Command } from '../contracts/Command.js';
import type { CommandResult } from '../contracts/CommandResult.js';
import type { HistoryManager } from '../history/HistoryManager.js';
export class UndoCommand implements Command {
  constructor(private readonly history: HistoryManager) {}
  execute(): CommandResult { return this.history.undo(); }
}
