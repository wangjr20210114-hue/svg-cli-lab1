import type { Command } from '../application/contracts/Command.js';
import type { CommandRegistry } from './CommandRegistry.js';
import { CommandTokenizer } from './CommandTokenizer.js';
export class CommandParser {
  private readonly tokenizer=new CommandTokenizer();
  constructor(private readonly registry: CommandRegistry) {}
  parse(line: string): Command | undefined {
    const tokens=this.tokenizer.tokenize(line); const first=tokens[0];
    return first ? this.registry.builder(first.value).build(tokens.slice(1)) : undefined;
  }
}
