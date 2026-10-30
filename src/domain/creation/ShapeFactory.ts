import { DomainError } from '../DomainError.js';
import type { Shape } from '../Shape.js';
import type { ShapeProvider } from './ShapeProvider.js';

export class ShapeFactory {
  readonly #providers = new Map<string, ShapeProvider>();
  constructor(providers: readonly ShapeProvider[]) {
    for (const provider of providers) {
      if (this.#providers.has(provider.type)) throw new DomainError(`duplicate shape provider: ${provider.type}`);
      this.#providers.set(provider.type, provider);
    }
  }
  create(type: string, id: string, parameters: readonly string[]): Shape {
    return this.provider(type).fromArguments(id, parameters);
  }
  import(type: string, id: string, attributes: Readonly<Record<string, string>>, text = ''): Shape {
    return this.provider(type).fromAttributes(id, attributes, text);
  }
  private provider(type: string): ShapeProvider {
    const provider = this.#providers.get(type);
    if (!provider) throw new DomainError(`unknown shape type: ${type} (is the plugin loaded?)`);
    return provider;
  }
}
