import type { SvgDocument } from '../../domain/SvgDocument.js';
export class LoadedDocument {
  constructor(readonly document: SvgDocument, readonly warnings: readonly string[] = []) {}
}
