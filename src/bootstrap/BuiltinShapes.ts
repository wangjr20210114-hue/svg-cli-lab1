import { ShapeFactory } from '../domain/creation/ShapeFactory.js';
import { RectProvider } from '../domain/creation/RectProvider.js';
import { CircleProvider } from '../domain/creation/CircleProvider.js';
import { EllipseProvider } from '../domain/creation/EllipseProvider.js';
import { LineProvider } from '../domain/creation/LineProvider.js';
import { TextProvider } from '../domain/creation/TextProvider.js';
import { GroupProvider } from '../domain/creation/GroupProvider.js';

export class BuiltinShapes {
  static createFactory(): ShapeFactory {
    return new ShapeFactory([new RectProvider(), new CircleProvider(), new EllipseProvider(), new LineProvider(), new TextProvider(), new GroupProvider()]);
  }
}
