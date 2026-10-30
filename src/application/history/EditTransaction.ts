import type { DocumentMemento } from '../../domain/DocumentMemento.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { DocumentAccess } from '../contracts/DocumentAccess.js';
import { CommandResult } from '../contracts/CommandResult.js';

export class EditTransaction {
  #before: DocumentMemento | undefined;
  #after: DocumentMemento | undefined;
  #summary = '';
  constructor(private readonly session: DocumentAccess) {}
  apply(operation: (document: SvgDocument) => CommandResult): CommandResult {
    const document = this.session.requireDocument(); const before = document.capture();
    try {
      const result = operation(document); document.assertInvariants();
      const after = document.capture();
      this.#before = before; this.#after = after; this.#summary = result.summary;
      return result;
    } catch (error) { document.restore(before); throw error; }
  }
  undo(): CommandResult {
    if (!this.#before) throw new Error('command has not executed');
    this.session.requireDocument().restore(this.#before);
    return new CommandResult(`undone: ${this.#summary}`);
  }
  redo(): CommandResult {
    if (!this.#after) throw new Error('command has not executed');
    this.session.requireDocument().restore(this.#after);
    return new CommandResult(`redone: ${this.#summary}`);
  }
}
