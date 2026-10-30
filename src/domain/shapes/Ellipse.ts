import { GeometryShape } from '../GeometryShape.js';
import type { ShapeVisitor } from '../ShapeVisitor.js';

export class Ellipse extends GeometryShape {
  override readonly tag = 'ellipse';
  constructor(id: string, cx: number, cy: number, rx: number, ry: number) { super(id, {cx, cy, rx, ry}, ['cx'], ['cy'], ['rx', 'ry']); }
  get cx(): number { return this.value('cx'); }
  get cy(): number { return this.value('cy'); }
  get rx(): number { return this.value('rx'); }
  get ry(): number { return this.value('ry'); }
  override clone(): Ellipse { return this.copyStyleTo(new Ellipse(this.id, this.cx, this.cy, this.rx, this.ry)); }
  override accept<T>(visitor: ShapeVisitor<T>): T { return visitor.visitEllipse(this); }
}
