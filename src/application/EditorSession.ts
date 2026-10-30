import { DomainError } from '../domain/DomainError.js';
import type { SvgDocument } from '../domain/SvgDocument.js';

export class EditorSession {
  #document: SvgDocument | undefined;
  #path: string | undefined;
  get path(): string | undefined { return this.#path; }
  requireDocument(): SvgDocument {
    if (!this.#document) throw new DomainError("no document. use 'init' or 'read' first");
    return this.#document;
  }
  replaceDocument(document: SvgDocument, path?: string): void { this.#document = document; this.#path = path; }
  markSaved(path: string): void { this.#path = path; }
}
