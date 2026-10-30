import type { Shape } from '../domain/Shape.js';
import type { ShapeVisitor } from '../domain/ShapeVisitor.js';
import type { Rect } from '../domain/shapes/Rect.js';
import type { Circle } from '../domain/shapes/Circle.js';
import type { Ellipse } from '../domain/shapes/Ellipse.js';
import type { Line } from '../domain/shapes/Line.js';
import type { Text } from '../domain/shapes/Text.js';
import type { Group } from '../domain/shapes/Group.js';

export class TreeLineVisitor implements ShapeVisitor<string> {
  visitRect(s: Rect): string { return `rect#${s.id}  x=${s.x} y=${s.y} w=${s.width} h=${s.height}${this.styles(s)}`; }
  visitCircle(s: Circle): string { return `circle#${s.id}  cx=${s.cx} cy=${s.cy} r=${s.r}${this.styles(s)}`; }
  visitEllipse(s: Ellipse): string { return `ellipse#${s.id}  cx=${s.cx} cy=${s.cy} rx=${s.rx} ry=${s.ry}${this.styles(s)}`; }
  visitLine(s: Line): string { return `line#${s.id}  (${s.x1},${s.y1}) -> (${s.x2},${s.y2})${this.styles(s)}`; }
  visitText(s: Text): string { return `text#${s.id}  (${s.x},${s.y}) ${JSON.stringify(s.textContent())}${this.styles(s)}`; }
  visitGroup(s: Group): string { return `g#${s.id}${this.styles(s)}`; }
  private styles(s: Shape): string {
    const attrs=s.attributes();
    return ['fill','stroke','stroke-width'].filter(name=>attrs[name]!==undefined).map(name=>` ${name}=${attrs[name]}`).join('');
  }
}
