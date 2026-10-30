import type { SvgDocument } from '../domain/SvgDocument.js';
import { ShowVisitor } from './ShowVisitor.js';
export class ShowPresenter {
  private readonly visitor=new ShowVisitor();
  format(document: SvgDocument, id: string): string {
    const shape=document.get(id); const parent=document.parent(id);
    return [`${shape.tag}#${id}  parent=${parent?`${parent.tag}#${parent.id}`:'svg'}`,...shape.accept(this.visitor)].join('\n');
  }
}
