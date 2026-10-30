import { AbstractEditCommand } from '../../src/application/commands/AbstractEditCommand.js';
import { CommandResult } from '../../src/application/contracts/CommandResult.js';
import type { EditorSession } from '../../src/application/EditorSession.js';
import type { HistoryManager } from '../../src/application/history/HistoryManager.js';
import type { SvgDocument } from '../../src/domain/SvgDocument.js';
export class ShiftCommand extends AbstractEditCommand {
  constructor(session: EditorSession, history: HistoryManager, private readonly fail = false) { super(session, history); }
  protected override edit(document: SvgDocument): CommandResult {
    document.get('r').move(1,0);
    if (this.fail) throw new Error('deliberate failure after mutation');
    return new CommandResult('shifted');
  }
}
