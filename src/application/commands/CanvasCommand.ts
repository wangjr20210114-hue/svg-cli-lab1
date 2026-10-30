import { DomainError } from '../../domain/DomainError.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import type { Command } from '../contracts/Command.js';
import { CommandResult } from '../contracts/CommandResult.js';
export class CanvasCommand implements Command {
  constructor(private readonly session: EditorSession, private readonly history: HistoryManager,
    private readonly width?: number, private readonly height?: number) {}
  execute(): CommandResult {
    const document=this.session.requireDocument();
    if(this.width!==undefined || this.height!==undefined){
      if(this.width===undefined || this.height===undefined) throw new DomainError('canvas requires both width and height');
      document.resize(this.width,this.height); this.history.blockAfterIo();
    }
    return new CommandResult(`canvas ${document.width}x${document.height}`);
  }
}
