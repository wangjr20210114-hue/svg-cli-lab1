import { GeometryShape } from '../GeometryShape.js';
import type { ShapeVisitor } from '../ShapeVisitor.js';

export class Rect extends GeometryShape {
  override readonly tag = 'rect';
  constructor(id: string, x: number, y: number, width: number, height: number) {
    super(id, {x, y, width, height}, ['x'], ['y'], ['width', 'height']);
  }
  get x(): number { return this.value('x'); }
  get y(): number { return this.value('y'); }
  get width(): number { return this.value('width'); }
  get height(): number { return this.value('height'); }
  override clone(): Rect { return this.copyStyleTo(new Rect(this.id, this.x, this.y, this.width, this.height)); }
  override accept<T>(visitor: ShapeVisitor<T>): T { return visitor.visitRect(this); }
}
