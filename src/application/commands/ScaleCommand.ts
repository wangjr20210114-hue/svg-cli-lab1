import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import { CommandResult } from '../contracts/CommandResult.js';
import { AbstractEditCommand } from './AbstractEditCommand.js';
export class ScaleCommand extends AbstractEditCommand {
  constructor(session: EditorSession, history: HistoryManager, private readonly id: string, private readonly factor: number) { super(session, history); }
  protected override edit(document: SvgDocument): CommandResult {
    const shape = document.get(this.id); shape.scale(this.factor);
    return new CommandResult(`${shape.tag}#${shape.id} scaled by ${this.factor}`);
  }
}
