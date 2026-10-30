import { ShapeProvider } from './ShapeProvider.js';
import { Circle } from '../shapes/Circle.js';

export class CircleProvider extends ShapeProvider {
  override readonly type = 'circle';
  protected override readonly geometry = ["cx","cy","r"];
  protected override readonly style = 'fill';
  protected override construct(id: string, values: Readonly<Record<string, number>>, text: string): Circle {
    return new Circle(id, values.cx!, values.cy!, values.r!);
  }
}
