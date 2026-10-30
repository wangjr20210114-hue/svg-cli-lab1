import type { CommandResult } from './CommandResult.js';
export interface UndoableCommand {
  apply(): CommandResult;
  undo(): CommandResult;
  redo(): CommandResult;
}
