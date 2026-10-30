import { DomainError } from '../DomainError.js';
import { NumberValue } from '../NumberValue.js';
import type { Shape } from '../Shape.js';

export abstract class ShapeProvider {
  abstract readonly type: string;
  protected abstract readonly geometry: readonly string[];
  protected readonly style: string | undefined = undefined;
  protected readonly takesText: boolean = false;
  protected abstract construct(id: string, values: Readonly<Record<string, number>>, text: string): Shape;
  fromArguments(id: string, args: readonly string[]): Shape {
    const count = this.geometry.length + (this.takesText ? 1 : 0);
    if (args.length < count || args.length > count + (this.style ? 1 : 0)) {
      throw new DomainError(`invalid parameters for ${this.type}`);
    }
    const values = Object.fromEntries(this.geometry.map((name, index) => [name, NumberValue.parse(args[index]!, name)]));
    const shape = this.construct(id, values, this.takesText ? args[this.geometry.length]! : '');
    if (this.style && args[count] !== undefined) shape.setAttribute(this.style, args[count]!);
    return shape;
  }
  fromAttributes(id: string, attributes: Readonly<Record<string, string>>, text: string): Shape {
    const values = Object.fromEntries(this.geometry.map(name => [name, NumberValue.parse(attributes[name] ?? '0', name)]));
    const shape = this.construct(id, values, text);
    for (const [name, value] of Object.entries(attributes)) shape.setAttribute(name, value);
    return shape;
  }
}
