import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import { CommandResult } from '../contracts/CommandResult.js';
import { AbstractEditCommand } from './AbstractEditCommand.js';
export class SetCommand extends AbstractEditCommand {
  constructor(session: EditorSession, history: HistoryManager, private readonly id: string, private readonly attribute: string, private readonly value: string) { super(session, history); }
  protected override edit(document: SvgDocument): CommandResult {
    const shape = document.get(this.id); shape.setAttribute(this.attribute, this.value);
    return new CommandResult(`${shape.tag}#${shape.id} updated: ${this.attribute}=${JSON.stringify(this.value)}`);
  }
}
