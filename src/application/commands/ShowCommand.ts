import type { Command } from '../contracts/Command.js';
import { CommandResult } from '../contracts/CommandResult.js';
import type { EditorSession } from '../EditorSession.js';
export class ShowCommand implements Command {
  constructor(private readonly session: EditorSession, private readonly id: string) {}
  execute(): CommandResult {
    const document=this.session.requireDocument(); document.get(this.id);
    return new CommandResult('',document,this.id,true);
  }
}
