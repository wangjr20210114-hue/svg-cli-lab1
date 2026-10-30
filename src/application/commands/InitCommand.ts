import { SvgDocument } from '../../domain/SvgDocument.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import type { Command } from '../contracts/Command.js';
import { CommandResult } from '../contracts/CommandResult.js';
export class InitCommand implements Command {
  constructor(private readonly session: EditorSession, private readonly history: HistoryManager,
    private readonly width = 800, private readonly height = 600) {}
  execute(): CommandResult {
    const document=new SvgDocument(this.width,this.height);
    this.session.replaceDocument(document); this.history.blockAfterIo();
    return new CommandResult(`canvas ${document.width}x${document.height} created`);
  }
}
