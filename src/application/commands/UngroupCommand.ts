import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import { CommandResult } from '../contracts/CommandResult.js';
import { AbstractEditCommand } from './AbstractEditCommand.js';
export class UngroupCommand extends AbstractEditCommand {
  constructor(session: EditorSession, history: HistoryManager, private readonly id: string) { super(session, history); }
  protected override edit(document: SvgDocument): CommandResult {
    document.ungroup(this.id); return new CommandResult(`g#${this.id} ungrouped`);
  }
}
