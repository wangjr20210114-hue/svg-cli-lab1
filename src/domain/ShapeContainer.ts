import type { Shape } from './Shape.js';

export interface ShapeContainer {
  children(): readonly Shape[];
  /** @internal Tree membership is coordinated exclusively by SvgDocument. */
  replaceChildren(children: readonly Shape[]): void;
}
