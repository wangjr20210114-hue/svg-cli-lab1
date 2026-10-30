import { DOMImplementation, XMLSerializer } from '@xmldom/xmldom';
import type { SvgDocument } from '../../domain/SvgDocument.js';
import { SvgWriteVisitor } from './SvgWriteVisitor.js';
export class SvgWriter {
  write(document: SvgDocument): string {
    document.assertInvariants();
    const xml=new DOMImplementation().createDocument('http://www.w3.org/2000/svg','svg',null);
    const root=xml.documentElement;
    root.setAttribute('width',String(document.width)); root.setAttribute('height',String(document.height));
    root.setAttribute('viewBox',`0 0 ${document.width} ${document.height}`);
    const visitor=new SvgWriteVisitor(xml);
    for(const shape of document.children()) root.appendChild(shape.accept(visitor));
    return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(xml,false,undefined,{requireWellFormed:true})+'\n';
  }
}
