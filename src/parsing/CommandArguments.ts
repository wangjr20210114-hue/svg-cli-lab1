import type { Token } from './Token.js';

export class CommandArguments {
  constructor(private readonly tokens: readonly Token[]) {}
  get length(): number { return this.tokens.length; }
  value(index: number): string {
    const token = this.tokens[index];
    if (!token) throw new Error('missing argument');
    return token.value;
  }
  number(index: number, name: string): number {
    const text = this.value(index);
    const value = Number(text);
    if (!text.trim() || !Number.isFinite(value)) throw new Error(`${name} must be a finite number`);
    return value;
  }
  count(min: number, max = min): this {
    if (this.length < min || this.length > max) throw new Error(`expected ${min === max ? min : `${min}..${max}`} arguments, got ${this.length}`);
    return this;
  }
  values(start = 0): readonly string[] { return this.tokens.slice(start).map(token => token.value); }
  splitContainer(): {arguments: CommandArguments; containerId: string | undefined} {
    const suffix = this.tokens[this.length - 2];
    if (suffix?.value === 'in' && !suffix.quoted) {
      return {arguments: new CommandArguments(this.tokens.slice(0, -2)), containerId: this.value(this.length - 1)};
    }
    return {arguments: this, containerId: undefined};
  }
}
