import { DomainError } from './DomainError.js';
import { NumberValue } from './NumberValue.js';
import type { ShapeContainer } from './ShapeContainer.js';
import type { ShapeVisitor } from './ShapeVisitor.js';

export abstract class Shape {
  readonly #id: string;
  readonly #styles = new Map<string, string>();
  abstract readonly tag: string;
  constructor(id: string) {
    if (!id || /\s/.test(id)) throw new DomainError('id must be nonempty and contain no whitespace');
    this.#id = id;
  }
  get id(): string { return this.#id; }
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
  abstract accept<T>(visitor: ShapeVisitor<T>): T;
  container(): ShapeContainer | undefined { return undefined; }
  attributes(): Readonly<Record<string, string>> { return Object.freeze(Object.fromEntries(this.#styles)); }
  textContent(): string | undefined { return undefined; }
  setAttribute(name: string, value: string): void {
    if (name === 'fill' || name === 'stroke') { this.#styles.set(name, value); return; }
    if (name === 'stroke-width') {
      this.#styles.set(name, String(NumberValue.nonnegative(NumberValue.parse(value, name), name))); return;
    }
    throw new DomainError(`unknown attribute: ${name}`);
  }
  protected copyStyleTo<T extends Shape>(target: T): T {
    for (const [name, value] of this.#styles) target.setAttribute(name, value);
    return target;
  }
}
