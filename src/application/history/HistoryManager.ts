import { DomainError } from '../../domain/DomainError.js';
import type { UndoableCommand } from '../contracts/UndoableCommand.js';
import type { CommandResult } from '../contracts/CommandResult.js';

export class HistoryManager {
  #undo: UndoableCommand[] = [];
  #redo: UndoableCommand[] = [];
  #blocked = true;
  execute(command: UndoableCommand): CommandResult {
    const result = command.apply();
    this.#undo.push(command); this.#redo = []; this.#blocked = false;
    return result;
  }
  undo(): CommandResult {
    this.checkBarrier(); const command = this.#undo.at(-1);
    if (!command) throw new DomainError('nothing to undo');
    const result = command.undo(); this.#undo.pop(); this.#redo.push(command); return result;
  }
  redo(): CommandResult {
    this.checkBarrier(); const command = this.#redo.at(-1);
    if (!command) throw new DomainError('nothing to redo');
    const result = command.redo(); this.#redo.pop(); this.#undo.push(command); return result;
  }
  blockAfterIo(): void { this.#undo = []; this.#redo = []; this.#blocked = true; }
  status(): Readonly<{undo: number; redo: number; blocked: boolean}> {
    return Object.freeze({undo: this.#undo.length, redo: this.#redo.length, blocked: this.#blocked});
  }
  private checkBarrier(): void {
    if (this.#blocked) throw new DomainError('undo not allowed after io command');
  }
}
