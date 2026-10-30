import { DomainError } from './DomainError.js';
import { DocumentMemento } from './DocumentMemento.js';
import { NumberValue } from './NumberValue.js';
import type { Shape } from './Shape.js';
import type { ShapeContainer } from './ShapeContainer.js';

export class SvgDocument implements ShapeContainer {
  #width: number;
  #height: number;
  #roots: Shape[];
  #index = new Map<string, {shape: Shape; parent: Shape | undefined}>();
  constructor(width = 800, height = 600, roots: readonly Shape[] = []) {
    this.#width = NumberValue.positive(width, 'canvas width');
    this.#height = NumberValue.positive(height, 'canvas height');
    this.#roots = [...roots]; this.reindex();
  }
  get width(): number { return this.#width; }
  get height(): number { return this.#height; }
  get size(): number { return this.#index.size; }
  resize(width: number, height: number): void {
    NumberValue.positive(width, 'canvas width'); NumberValue.positive(height, 'canvas height');
    this.#width = width; this.#height = height;
  }
  children(): readonly Shape[] { return Object.freeze([...this.#roots]); }
  replaceChildren(children: readonly Shape[]): void { this.#roots = [...children]; }
  has(id: string): boolean { return this.#index.has(id); }
  get(id: string): Shape {
    const entry = this.#index.get(id);
    if (!entry) throw new DomainError(`no such shape: ${id}`);
    return entry.shape;
  }
  parent(id: string): Shape | undefined { this.get(id); return this.#index.get(id)!.parent; }
  all(): readonly Shape[] { return Object.freeze([...this.#index.values()].map(entry => entry.shape)); }
  requireContainer(id: string): ShapeContainer {
    if (!this.has(id)) throw new DomainError(`no such container: ${id}`);
    return this.asContainer(this.get(id));
  }
  private asContainer(shape: Shape): ShapeContainer {
    const container = shape.container();
    if (!container) throw new DomainError(`not a container: ${shape.id}`);
    return container;
  }
  private parentContainer(shape: Shape): ShapeContainer {
    const parent = this.parent(shape.id);
    return parent ? this.asContainer(parent) : this;
  }
  add(shape: Shape, parentId?: string): void {
    const local = this.collect([shape]);
    for (const id of local.keys()) if (this.has(id)) throw new DomainError(`id already exists: ${id}`);
    const container = parentId === undefined ? this : this.requireContainer(parentId);
    container.replaceChildren([...container.children(), shape]); this.reindex();
  }
  delete(id: string): void {
    const shape = this.get(id); const parent = this.parentContainer(shape);
    parent.replaceChildren(parent.children().filter(child => child !== shape)); this.reindex();
  }
  capture(): DocumentMemento { return new DocumentMemento(this.#width, this.#height, this.#roots); }
  restore(memento: DocumentMemento): void { memento.restoreInto(this); }
  /** @internal Used by DocumentMemento after cloning all nodes. */
  replaceState(width: number, height: number, roots: readonly Shape[]): void {
    const index = this.collect(roots);
    this.#width = width; this.#height = height; this.#roots = [...roots]; this.#index = index;
  }
  assertInvariants(): void {
    const rebuilt = this.collect(this.#roots);
    if (rebuilt.size !== this.#index.size) throw new DomainError('invalid document index');
    for (const [id, entry] of rebuilt) {
      const cached = this.#index.get(id);
      if (cached?.shape !== entry.shape || cached.parent !== entry.parent) throw new DomainError('invalid document index');
    }
  }
  private reindex(): void { this.#index = this.collect(this.#roots); }
  private collect(roots: readonly Shape[]): Map<string, {shape: Shape; parent: Shape | undefined}> {
    const index = new Map<string, {shape: Shape; parent: Shape | undefined}>();
    const visited = new Set<Shape>();
    this.visitChildren(roots, undefined, index, visited);
    return index;
  }
  private visitChildren(children: readonly Shape[], parent: Shape | undefined,
    index: Map<string, {shape: Shape; parent: Shape | undefined}>, visited: Set<Shape>): void {
    for (const shape of children) {
      if (visited.has(shape)) throw new DomainError('cyclic or shared shape tree');
      if (index.has(shape.id)) throw new DomainError(`id already exists: ${shape.id}`);
      visited.add(shape); index.set(shape.id, {shape, parent});
      const container = shape.container();
      if (container) this.visitChildren(container.children(), shape, index, visited);
    }
  }
}
