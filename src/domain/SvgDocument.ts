import { DomainError } from './DomainError.js';
import { DocumentMemento } from './DocumentMemento.js';
import { NumberValue } from './NumberValue.js';
import type { Shape } from './Shape.js';
import type { ShapeContainer } from './ShapeContainer.js';
import { Group } from './shapes/Group.js';

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
  group(id: string, memberIds: readonly string[]): Group {
    if (this.has(id)) throw new DomainError(`id already exists: ${id}`);
    if (memberIds.length < 2) throw new DomainError('group requires at least two shapes');
    if (new Set(memberIds).size !== memberIds.length) throw new DomainError('duplicate group member');
    const selected = memberIds.map(member => this.get(member));
    for (const ancestor of selected) for (const child of selected) {
      if (ancestor !== child && this.isAncestor(ancestor, child)) {
        throw new DomainError(`cannot group a container into its own descendant: ${ancestor.id}`);
      }
    }
    const members = new Set(memberIds);
    const ordered = this.all().filter(shape => members.has(shape.id));
    const chains = selected.map(shape => this.ancestors(shape));
    const common = chains[0]!.find(candidate => chains.every(chain => chain.includes(candidate)));
    const parent: ShapeContainer = common ? this.asContainer(common) : this;
    const original = parent.children();
    const branches = ordered.map(shape => {
      let branch = shape;
      while (this.parent(branch.id) !== common) branch = this.parent(branch.id)!;
      return branch;
    });
    const anchor = Math.min(...branches.map(branch => original.indexOf(branch)));
    const group = new Group(id, ordered);
    for (const shape of ordered) {
      const oldParent = this.parentContainer(shape);
      oldParent.replaceChildren(oldParent.children().filter(child => child !== shape));
    }
    const remaining = [...parent.children()];
    const position = original.slice(0, anchor).filter(child => remaining.includes(child)).length;
    remaining.splice(position, 0, group); parent.replaceChildren(remaining); this.reindex(); return group;
  }
  ungroup(id: string): void {
    const shape = this.get(id); const container = this.asContainer(shape);
    const parent = this.parent(id);
    if (!parent) throw new DomainError(`cannot ungroup top-level container: ${id}`);
    const siblings = [...this.asContainer(parent).children()];
    siblings.splice(siblings.indexOf(shape), 1, ...container.children());
    this.asContainer(parent).replaceChildren(siblings); this.reindex();
  }
  addTo(containerId: string, id: string): void {
    const target = this.get(containerId); const container = this.asContainer(target); const shape = this.get(id);
    if (target === shape || this.isAncestor(shape, target)) throw new DomainError(`cannot move a container into its own descendant: ${id}`);
    const oldParent = this.parentContainer(shape);
    oldParent.replaceChildren(oldParent.children().filter(child => child !== shape));
    container.replaceChildren([...container.children(), shape]); this.reindex();
  }
  reorder(id: string, front: boolean): void {
    const shape = this.get(id); const container = this.parentContainer(shape);
    const siblings = container.children().filter(child => child !== shape);
    container.replaceChildren(front ? [...siblings, shape] : [shape, ...siblings]); this.reindex();
  }
  private ancestors(shape: Shape): (Shape | undefined)[] {
    const ancestors: (Shape | undefined)[] = [];
    let parent = this.parent(shape.id);
    while (parent) { ancestors.push(parent); parent = this.parent(parent.id); }
    ancestors.push(undefined); return ancestors;
  }
  private isAncestor(ancestor: Shape, child: Shape): boolean { return this.ancestors(child).includes(ancestor); }
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
