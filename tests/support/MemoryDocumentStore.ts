import { DomainError } from '../../src/domain/DomainError.js';
import { SvgDocument } from '../../src/domain/SvgDocument.js';
import type { DocumentMemento } from '../../src/domain/DocumentMemento.js';
import type { DocumentStore } from '../../src/application/ports/DocumentStore.js';
import { LoadedDocument } from '../../src/application/contracts/LoadedDocument.js';
export class MemoryDocumentStore implements DocumentStore {
  readonly #files=new Map<string,DocumentMemento>();
  #failRead=false; #failWrite=false;
  setFailure(read: boolean, write: boolean): void {this.#failRead=read; this.#failWrite=write;}
  read(file: string): LoadedDocument {
    const state=this.#files.get(file);
    if(this.#failRead || !state) throw new DomainError(`cannot read file: ${file}`);
    const doc=new SvgDocument(); doc.restore(state); return new LoadedDocument(doc);
  }
  save(doc: SvgDocument,file: string): void {
    if(this.#failWrite) throw new DomainError(`cannot write file: ${file}`);
    this.#files.set(file,doc.capture());
  }
}
