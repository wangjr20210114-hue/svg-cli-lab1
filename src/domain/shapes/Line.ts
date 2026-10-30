import { GeometryShape } from '../GeometryShape.js';
import type { ShapeVisitor } from '../ShapeVisitor.js';

export class Line extends GeometryShape {
  override readonly tag = 'line';
  constructor(id: string, x1: number, y1: number, x2: number, y2: number) { super(id, {x1, y1, x2, y2}, ['x1', 'x2'], ['y1', 'y2'], []); }
  get x1(): number { return this.value('x1'); }
  get y1(): number { return this.value('y1'); }
  get x2(): number { return this.value('x2'); }
  get y2(): number { return this.value('y2'); }
  override clone(): Line { return this.copyStyleTo(new Line(this.id, this.x1, this.y1, this.x2, this.y2)); }
  override accept<T>(visitor: ShapeVisitor<T>): T { return visitor.visitLine(this); }
}
