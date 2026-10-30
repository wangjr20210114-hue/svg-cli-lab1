import { ShapeProvider } from './ShapeProvider.js';
import { Line } from '../shapes/Line.js';

export class LineProvider extends ShapeProvider {
  override readonly type = 'line';
  protected override readonly geometry = ["x1","y1","x2","y2"];
  protected override readonly style = 'stroke';
  protected override construct(id: string, values: Readonly<Record<string, number>>, text: string): Line {
    return new Line(id, values.x1!, values.y1!, values.x2!, values.y2!);
  }
}
