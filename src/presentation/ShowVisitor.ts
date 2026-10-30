import type { Shape } from '../domain/Shape.js';
import type { ShapeVisitor } from '../domain/ShapeVisitor.js';
import type { Rect } from '../domain/shapes/Rect.js';
import type { Circle } from '../domain/shapes/Circle.js';
import type { Ellipse } from '../domain/shapes/Ellipse.js';
import type { Line } from '../domain/shapes/Line.js';
import type { Text } from '../domain/shapes/Text.js';
import type { Group } from '../domain/shapes/Group.js';
export class ShowVisitor implements ShapeVisitor<readonly string[]> {
  visitRect(s: Rect): readonly string[] { return this.describe(s); }
  visitCircle(s: Circle): readonly string[] { return this.describe(s); }
  visitEllipse(s: Ellipse): readonly string[] { return this.describe(s); }
  visitLine(s: Line): readonly string[] { return this.describe(s); }
  visitText(s: Text): readonly string[] { return this.describe(s); }
  visitGroup(s: Group): readonly string[] { return this.describe(s); }
  private describe(s: Shape): readonly string[] {
    const lines=Object.entries(s.attributes()).map(([key,value])=>`  ${key}=${value}`);
    const text=s.textContent(); if(text!==undefined) lines.push(`  text=${JSON.stringify(text)}`);
    return lines;
  }
}
