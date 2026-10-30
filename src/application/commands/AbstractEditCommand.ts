import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Command } from '../contracts/Command.js';
import type { UndoableCommand } from '../contracts/UndoableCommand.js';
import type { CommandResult } from '../contracts/CommandResult.js';
import type { EditorSession } from '../EditorSession.js';
import { EditTransaction } from '../history/EditTransaction.js';
import type { HistoryManager } from '../history/HistoryManager.js';

export abstract class AbstractEditCommand implements Command, UndoableCommand {
  private readonly transaction: EditTransaction;
  constructor(session: EditorSession, private readonly history: HistoryManager) { this.transaction = new EditTransaction(session); }
  execute(): CommandResult { return this.history.execute(this); }
  apply(): CommandResult { return this.transaction.apply(document => this.edit(document)); }
  undo(): CommandResult { return this.transaction.undo(); }
  redo(): CommandResult { return this.transaction.redo(); }
  protected abstract edit(document: SvgDocument): CommandResult;
}
