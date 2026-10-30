import { ShapeProvider } from './ShapeProvider.js';
import { Group } from '../shapes/Group.js';

export class GroupProvider extends ShapeProvider {
  override readonly type = 'g';
  protected override readonly geometry = [];
  protected override construct(id: string, values: Readonly<Record<string, number>>, text: string): Group {
    return new Group(id);
  }
}
