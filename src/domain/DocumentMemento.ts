import type { Shape } from './Shape.js';
import type { SvgDocument } from './SvgDocument.js';

export class DocumentMemento {
  readonly #roots: readonly Shape[];
  constructor(private readonly width: number, private readonly height: number, roots: readonly Shape[]) {
    this.#roots = roots.map(shape => shape.clone());
  }
  restoreInto(document: SvgDocument): void {
    document.replaceState(this.width, this.height, this.#roots.map(shape => shape.clone()));
  }
}
