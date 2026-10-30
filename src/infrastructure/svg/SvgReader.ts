import { DOMParser } from '@xmldom/xmldom';
import { DomainError } from '../../domain/DomainError.js';
import { NumberValue } from '../../domain/NumberValue.js';
import { SvgDocument } from '../../domain/SvgDocument.js';
import type { Shape } from '../../domain/Shape.js';
import type { ShapeFactory } from '../../domain/creation/ShapeFactory.js';
import { LoadedDocument } from '../../application/contracts/LoadedDocument.js';

export class SvgReader {
  constructor(private readonly factory: ShapeFactory) {}
  read(source: string): LoadedDocument {
    const xml=new DOMParser({errorHandler:()=>{throw new DomainError('invalid SVG XML');}}).parseFromString(source,'image/svg+xml');
    const root=xml.documentElement;
    if(!root || root.localName!=='svg') throw new DomainError('invalid SVG root');
    if(xml.doctype) throw new DomainError('unsupported SVG DOCTYPE');
    const elements=this.descendants(root);
    const used=new Set<string>();
    for(const element of elements){
      const id=element.getAttribute('id');
      if(id){ if(used.has(id)) throw new DomainError(`id already exists: ${id}`); used.add(id); }
    }
    const warnings: string[]=[];
    const counters=new Map<string,number>();
    const width=this.dimension(root.getAttribute('width') || '800','canvas width');
    const height=this.dimension(root.getAttribute('height') || '600','canvas height');
    const viewBox=root.getAttribute('viewBox');
    if(viewBox){
      const values=viewBox.trim().split(/[\s,]+/).map(Number);
      if(values.length!==4 || values[0]!==0 || values[1]!==0 || values[2]!==width || values[3]!==height) {
        throw new DomainError('unsupported SVG viewBox: expected 0 0 width height');
      }
    }
    for(let i=0;i<root.attributes.length;i++){
      const name=root.attributes.item(i)!.name;
      if(!['xmlns','width','height','viewBox','version'].includes(name)) throw new DomainError(`unsupported SVG root attribute: ${name}`);
    }
    const roots=this.childElements(root).map(element=>this.shape(element,used,counters,warnings));
    return new LoadedDocument(new SvgDocument(width,height,roots),Object.freeze(warnings));
  }
  private shape(element: Element, used: Set<string>, counters: Map<string,number>, warnings: string[]): Shape {
    if(element.namespaceURI && element.namespaceURI!=='http://www.w3.org/2000/svg') throw new DomainError('unsupported SVG namespace');
    const type=element.localName || element.tagName;
    let id=element.getAttribute('id');
    if(!id){
      let count=counters.get(type)??0;
      do {id=type+(++count);} while(used.has(id));
      counters.set(type,count); used.add(id); warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
    }
    const attrs: Record<string,string>={};
    for(let i=0;i<element.attributes.length;i++){
      const attribute=element.attributes.item(i)!;
      if(attribute.name!=='id' && attribute.name!=='xmlns') attrs[attribute.name]=attribute.value;
    }
    const shape=this.factory.import(type,id,attrs,element.textContent??'');
    const children=this.childElements(element); const container=shape.container();
    if(container) container.replaceChildren(children.map(child=>this.shape(child,used,counters,warnings)));
    else if(children.length) throw new DomainError(`unsupported child element in <${type}>`);
    if(shape.textContent()===undefined){
      for(let i=0;i<element.childNodes.length;i++){
        const node=element.childNodes.item(i)!;
        if((node.nodeType===3 || node.nodeType===4) && node.nodeValue?.trim()) throw new DomainError(`unexpected text in <${type}>`);
      }
    }
    return shape;
  }
  private dimension(text: string, name: string): number { return NumberValue.positive(NumberValue.parse(text.replace(/px$/,''),name),name); }
  private childElements(element: Element): Element[] {
    const children: Element[]=[];
    for(let i=0;i<element.childNodes.length;i++){const node=element.childNodes.item(i)!; if(node.nodeType===1) children.push(node as Element);}
    return children;
  }
  private descendants(element: Element): Element[] { return this.childElements(element).flatMap(child=>[child,...this.descendants(child)]); }
}
