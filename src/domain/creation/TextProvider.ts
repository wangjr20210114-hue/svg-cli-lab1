import { ShapeProvider } from './ShapeProvider.js';
import { Text } from '../shapes/Text.js';

export class TextProvider extends ShapeProvider {
  override readonly type = 'text';
  protected override readonly geometry = ["x","y"];
  protected override readonly takesText = true;
  protected override construct(id: string, values: Readonly<Record<string, number>>, text: string): Text {
    return new Text(id, values.x!, values.y!, text);
  }
}
