import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { LoadedDocument } from '../contracts/LoadedDocument.js';
export interface DocumentStore {
  read(file: string): LoadedDocument;
  save(document: SvgDocument, file: string): void;
}
