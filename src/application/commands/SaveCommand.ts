import { DomainError } from '../../domain/DomainError.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import type { DocumentStore } from '../ports/DocumentStore.js';
import type { Command } from '../contracts/Command.js';
import { CommandResult } from '../contracts/CommandResult.js';
export class SaveCommand implements Command {
  constructor(private readonly session: EditorSession, private readonly history: HistoryManager,
    private readonly store: DocumentStore, private readonly file?: string) {}
  execute(): CommandResult {
    const document=this.session.requireDocument(); const file=this.file??this.session.path;
    if(!file) throw new DomainError("no file path. use 'save <file.svg>'");
    this.store.save(document,file); this.session.markSaved(file); this.history.blockAfterIo();
    return new CommandResult(`saved to ${file} (${document.size} elements)`);
  }
}
