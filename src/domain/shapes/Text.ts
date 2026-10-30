import { GeometryShape } from '../GeometryShape.js';
import type { ShapeVisitor } from '../ShapeVisitor.js';

export class Text extends GeometryShape {
  override readonly tag = 'text';
  #content: string;
  constructor(id: string, x: number, y: number, content: string) { super(id, {x, y}, ['x'], ['y'], []); this.#content = content; }
  get x(): number { return this.value('x'); }
  get y(): number { return this.value('y'); }
  override textContent(): string { return this.#content; }
  override setAttribute(name: string, value: string): void {
    if (name === 'text') { this.#content = value; return; }
    super.setAttribute(name, value);
  }
  override clone(): Text { return this.copyStyleTo(new Text(this.id, this.x, this.y, this.#content)); }
  override accept<T>(visitor: ShapeVisitor<T>): T { return visitor.visitText(this); }
}
