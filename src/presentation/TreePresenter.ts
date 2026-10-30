import type { Shape } from '../domain/Shape.js';
import type { SvgDocument } from '../domain/SvgDocument.js';
import { TreeLineVisitor } from './TreeLineVisitor.js';

export class TreePresenter {
  private readonly visitor = new TreeLineVisitor();
  format(document: SvgDocument, id?: string): string {
    const shape = id === undefined ? undefined : document.get(id);
    const lines = [shape ? shape.accept(this.visitor) : `svg (${document.width}x${document.height})`];
    this.append(shape ? shape.container()?.children() ?? [] : document.children(), '', lines);
    return lines.join('\n');
  }
  private append(children: readonly Shape[], prefix: string, lines: string[]): void {
    children.forEach((shape,index)=>{
      const last=index===children.length-1;
      lines.push(prefix+(last?'└── ':'├── ')+shape.accept(this.visitor));
      const container=shape.container();
      if(container) this.append(container.children(),prefix+(last?'    ':'│   '),lines);
    });
  }
}
