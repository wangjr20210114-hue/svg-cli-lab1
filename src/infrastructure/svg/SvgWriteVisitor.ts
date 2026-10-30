import type { Shape } from '../../domain/Shape.js';
import type { ShapeVisitor } from '../../domain/ShapeVisitor.js';
import type { Rect } from '../../domain/shapes/Rect.js';
import type { Circle } from '../../domain/shapes/Circle.js';
import type { Ellipse } from '../../domain/shapes/Ellipse.js';
import type { Line } from '../../domain/shapes/Line.js';
import type { Text } from '../../domain/shapes/Text.js';
import type { Group } from '../../domain/shapes/Group.js';
export class SvgWriteVisitor implements ShapeVisitor<Element> {
  constructor(private readonly document: Document) {}
  visitRect(s: Rect): Element { return this.element(s); }
  visitCircle(s: Circle): Element { return this.element(s); }
  visitEllipse(s: Ellipse): Element { return this.element(s); }
  visitLine(s: Line): Element { return this.element(s); }
  visitText(s: Text): Element { return this.element(s); }
  visitGroup(s: Group): Element {
    const element=this.element(s);
    for(const child of s.children()) element.appendChild(child.accept(this));
    return element;
  }
  private element(shape: Shape): Element {
    const element=this.document.createElementNS('http://www.w3.org/2000/svg',shape.tag);
    element.setAttribute('id',shape.id);
    for(const [name,value] of Object.entries(shape.attributes())) element.setAttribute(name,value);
    const text=shape.textContent(); if(text!==undefined) element.appendChild(this.document.createTextNode(text));
    return element;
  }
}
