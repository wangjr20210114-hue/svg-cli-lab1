import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import { CommandResult } from '../contracts/CommandResult.js';
import { AbstractEditCommand } from './AbstractEditCommand.js';
export class MoveCommand extends AbstractEditCommand {
  constructor(session: EditorSession, history: HistoryManager, private readonly id: string, private readonly dx: number, private readonly dy: number) { super(session, history); }
  protected override edit(document: SvgDocument): CommandResult {
    const shape = document.get(this.id); shape.move(this.dx, this.dy);
    return new CommandResult(`${shape.tag}#${shape.id} moved by (${this.dx},${this.dy})`);
  }
}
