import { Shape } from '../Shape.js';
import { NumberValue } from '../NumberValue.js';
import type { ShapeContainer } from '../ShapeContainer.js';
import type { ShapeVisitor } from '../ShapeVisitor.js';

export class Group extends Shape implements ShapeContainer {
  override readonly tag = 'g';
  #children: Shape[];
  constructor(id: string, children: readonly Shape[] = []) { super(id); this.#children = [...children]; }
  children(): readonly Shape[] { return Object.freeze([...this.#children]); }
  replaceChildren(children: readonly Shape[]): void { this.#children = [...children]; }
  override container(): ShapeContainer { return this; }
  override move(dx: number, dy: number): void {
    NumberValue.finite(dx, 'dx'); NumberValue.finite(dy, 'dy');
    for (const child of this.#children) child.move(dx, dy);
  }
  override scale(factor: number): void {
    NumberValue.positive(factor, 'scale factor');
    for (const child of this.#children) child.scale(factor);
  }
  override clone(): Group { return this.copyStyleTo(new Group(this.id, this.#children.map(child => child.clone()))); }
  override accept<T>(visitor: ShapeVisitor<T>): T { return visitor.visitGroup(this); }
}
