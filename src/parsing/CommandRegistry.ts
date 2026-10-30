import type { CommandBuilder } from './CommandBuilder.js';
export class CommandRegistry {
  readonly #builders=new Map<string,CommandBuilder>();
  register(name: string, builder: CommandBuilder): void {
    if(this.#builders.has(name)) throw new Error(`duplicate command: ${name}`);
    this.#builders.set(name,builder);
  }
  builder(name: string): CommandBuilder {
    const builder=this.#builders.get(name);
    if(!builder) throw new Error(`unknown command: ${name}`);
    return builder;
  }
  syntaxes(): readonly string[] { return [...this.#builders.values()].map(builder=>builder.syntax); }
}
