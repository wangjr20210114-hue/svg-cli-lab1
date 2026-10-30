import { ShapeProvider } from './ShapeProvider.js';
import { Rect } from '../shapes/Rect.js';

export class RectProvider extends ShapeProvider {
  override readonly type = 'rect';
  protected override readonly geometry = ["x","y","width","height"];
  protected override readonly style = 'fill';
  protected override construct(id: string, values: Readonly<Record<string, number>>, text: string): Rect {
    return new Rect(id, values.x!, values.y!, values.width!, values.height!);
  }
}
