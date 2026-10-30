import { Shape } from './Shape.js';
import { NumberValue } from './NumberValue.js';

export abstract class GeometryShape extends Shape {
  readonly #geometry = new Map<string, number>();
  constructor(id: string, geometry: Readonly<Record<string, number>>,
    private readonly horizontal: readonly string[], private readonly vertical: readonly string[],
    private readonly dimensions: readonly string[]) {
    super(id);
    for (const [key, value] of Object.entries(geometry)) this.#geometry.set(key, this.checked(key, value));
  }
  protected value(key: string): number { return this.#geometry.get(key)!; }
  private checked(key: string, value: number): number {
    return this.dimensions.includes(key) ? NumberValue.nonnegative(value, key) : NumberValue.finite(value, key);
  }
  override move(dx: number, dy: number): void {
    NumberValue.finite(dx, 'dx'); NumberValue.finite(dy, 'dy');
    const next = new Map(this.#geometry);
    for (const key of this.horizontal) next.set(key, this.checked(key, this.value(key) + dx));
    for (const key of this.vertical) next.set(key, this.checked(key, this.value(key) + dy));
    for (const [key, value] of next) this.#geometry.set(key, value);
  }
  override scale(factor: number): void {
    NumberValue.positive(factor, 'scale factor');
    const next = [...this.#geometry].map(([key, value]) => [key, this.checked(key, value * factor)] as const);
    for (const [key, value] of next) this.#geometry.set(key, value);
  }
  override setAttribute(name: string, value: string): void {
    if (this.#geometry.has(name)) {
      this.#geometry.set(name, this.checked(name, NumberValue.parse(value, name))); return;
    }
    super.setAttribute(name, value);
  }
  override attributes(): Readonly<Record<string, string>> {
    return Object.freeze({...Object.fromEntries([...this.#geometry].map(([k, v]) => [k, String(v)])), ...super.attributes()});
  }
}
