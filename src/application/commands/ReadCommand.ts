import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import type { DocumentStore } from '../ports/DocumentStore.js';
import type { Command } from '../contracts/Command.js';
import { CommandResult } from '../contracts/CommandResult.js';
export class ReadCommand implements Command {
  constructor(private readonly session: EditorSession, private readonly history: HistoryManager,
    private readonly store: DocumentStore, private readonly file: string) {}
  execute(): CommandResult {
    const loaded=this.store.read(this.file); loaded.document.assertInvariants();
    this.session.replaceDocument(loaded.document,this.file); this.history.blockAfterIo();
    return new CommandResult(`read ${this.file} (${loaded.document.size} elements)`,undefined,undefined,false,loaded.warnings);
  }
}
