import { ShapeProvider } from './ShapeProvider.js';
import { Ellipse } from '../shapes/Ellipse.js';

export class EllipseProvider extends ShapeProvider {
  override readonly type = 'ellipse';
  protected override readonly geometry = ["cx","cy","rx","ry"];
  protected override readonly style = 'fill';
  protected override construct(id: string, values: Readonly<Record<string, number>>, text: string): Ellipse {
    return new Ellipse(id, values.cx!, values.cy!, values.rx!, values.ry!);
  }
}
