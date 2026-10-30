import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import { CommandResult } from '../contracts/CommandResult.js';
import { AbstractEditCommand } from './AbstractEditCommand.js';
export class AddToCommand extends AbstractEditCommand {
  constructor(session: EditorSession, history: HistoryManager, private readonly containerId: string, private readonly id: string) { super(session, history); }
  protected override edit(document: SvgDocument): CommandResult {
    const shape=document.get(this.id); document.addTo(this.containerId, this.id);
    return new CommandResult(`${shape.tag}#${this.id} moved into g#${this.containerId}`);
  }
}
