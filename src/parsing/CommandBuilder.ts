import type { Command } from '../application/contracts/Command.js';
import { CommandArguments } from './CommandArguments.js';
import type { Token } from './Token.js';
export class CommandBuilder {
  constructor(readonly syntax: string, private readonly min: number, private readonly max: number,
    private readonly construct: (args: CommandArguments) => Command) {}
  build(tokens: readonly Token[]): Command {
    const args=new CommandArguments(tokens).count(this.min,this.max); return this.construct(args);
  }
}
