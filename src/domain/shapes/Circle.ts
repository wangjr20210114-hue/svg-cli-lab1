import { GeometryShape } from '../GeometryShape.js';
import type { ShapeVisitor } from '../ShapeVisitor.js';

export class Circle extends GeometryShape {
  override readonly tag = 'circle';
  constructor(id: string, cx: number, cy: number, r: number) { super(id, {cx, cy, r}, ['cx'], ['cy'], ['r']); }
  get cx(): number { return this.value('cx'); }
  get cy(): number { return this.value('cy'); }
  get r(): number { return this.value('r'); }
  override clone(): Circle { return this.copyStyleTo(new Circle(this.id, this.cx, this.cy, this.r)); }
  override accept<T>(visitor: ShapeVisitor<T>): T { return visitor.visitCircle(this); }
}
