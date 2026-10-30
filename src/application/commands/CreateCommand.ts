import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { ShapeFactory } from '../../domain/creation/ShapeFactory.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import { CommandResult } from '../contracts/CommandResult.js';
import { AbstractEditCommand } from './AbstractEditCommand.js';

export class CreateCommand extends AbstractEditCommand {
  constructor(session: EditorSession, history: HistoryManager, private readonly factory: ShapeFactory,
    private readonly type: string, private readonly id: string, private readonly parameters: readonly string[], private readonly parentId?: string) { super(session, history); }
  protected override edit(document: SvgDocument): CommandResult {
    const shape = this.factory.create(this.type, this.id, this.parameters); document.add(shape, this.parentId);
    return new CommandResult(`${shape.tag}#${shape.id} created${this.parentId === undefined ? '' : ` in g#${this.parentId}`}`);
  }
}
