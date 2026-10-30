import { readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { dirname, basename, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { DomainError } from '../../domain/DomainError.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { DocumentStore } from '../../application/ports/DocumentStore.js';
import type { LoadedDocument } from '../../application/contracts/LoadedDocument.js';
import type { SvgReader } from '../svg/SvgReader.js';
import type { SvgWriter } from '../svg/SvgWriter.js';
export class FileDocumentStore implements DocumentStore {
  constructor(private readonly reader: SvgReader, private readonly writer: SvgWriter) {}
  read(file: string): LoadedDocument {
    let source: string;
    try {source=readFileSync(file,'utf8');} catch {throw new DomainError(`cannot read file: ${file}`);}
    return this.reader.read(source);
  }
  save(document: SvgDocument, file: string): void {
    const source=this.writer.write(document);
    const temporary=join(dirname(file),`.${basename(file)}.${randomUUID()}.tmp`);
    try {writeFileSync(temporary,source,{encoding:'utf8',flag:'wx'}); renameSync(temporary,file);}
    catch (error) {try{rmSync(temporary,{force:true});}catch{} throw new DomainError(`cannot write file: ${file}`,{cause:error});}
  }
}
