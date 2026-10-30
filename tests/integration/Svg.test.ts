import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {BuiltinShapes} from '../../src/bootstrap/BuiltinShapes.js';
import {SvgReader} from '../../src/infrastructure/svg/SvgReader.js';
import {SvgWriter} from '../../src/infrastructure/svg/SvgWriter.js';
import {FileDocumentStore} from '../../src/infrastructure/filesystem/FileDocumentStore.js';
import {SvgDocument} from '../../src/domain/SvgDocument.js';
import {TreePresenter} from '../../src/presentation/TreePresenter.js';
import {TemporaryDirectory} from '../support/TemporaryDirectory.js';

test('SVG round trip retains six types hierarchy order styles decimals and text',()=>{
  const factory=BuiltinShapes.createFactory(); const doc=new SvgDocument(400,300);
  doc.add(factory.create('g','g',[]));
  const inputs=[['rect',['1.5','2','3','4','#abc']],['circle',['1','2','3']],['ellipse',['1','2','3','4']],['line',['1','2','3','4','black']],['text',['1','2','中文 & <hello> "quotes"']]] as const;
  for(const [type,args] of inputs) doc.add(factory.create(type,type,args),'g');
  doc.get('g').setAttribute('fill','red'); doc.get('rect').setAttribute('stroke-width','1.2');
  const xml=new SvgWriter().write(doc); const loaded=new SvgReader(factory).read(xml);
  assert.match(xml,/&amp;/); assert.match(xml,/&lt;/);
  assert.equal(new TreePresenter().format(loaded.document),new TreePresenter().format(doc));
  assert.equal(loaded.document.get('circle').attributes().fill,undefined); loaded.document.assertInvariants();
});
test('generated IDs reserve all explicit IDs before assigning missing IDs',()=>{
  const loaded=new SvgReader(BuiltinShapes.createFactory()).read('<svg width="10" height="20"><rect/><rect id="rect1"/><g><text>你好</text></g></svg>');
  assert.deepEqual(loaded.document.children().map(s=>s.id),['rect2','rect1','g1']);
  assert.deepEqual(loaded.warnings,['warning: assigned id rect2 to unnamed <rect>','warning: assigned id g1 to unnamed <g>','warning: assigned id text1 to unnamed <text>']);
});
test('malformed XML duplicate IDs unsupported transforms types and viewBox fail explicitly',()=>{
  const reader=new SvgReader(BuiltinShapes.createFactory());
  for(const xml of ['<svg><rect></svg>','<svg><rect id="r"/><circle id="r"/></svg>','<svg><g transform="translate(1,2)"/></svg>','<svg><path/></svg>','<svg width="10" height="10" viewBox="1 0 10 10"/>']) assert.throws(()=>reader.read(xml));
});
test('file adapter replaces existing files cleans temporary files and maps read write failures',()=>{
  const dir=new TemporaryDirectory();
  try {
    const store=new FileDocumentStore(new SvgReader(BuiltinShapes.createFactory()),new SvgWriter());
    const file=dir.file('中文 drawing.svg'); writeFileSync(file,'old');
    store.save(new SvgDocument(20,30),file); assert.match(readFileSync(file,'utf8'),/width="20"/);
    assert.equal(store.read(file).document.height,30);
    assert.throws(()=>store.read(dir.file('missing.svg')),/cannot read file/);
    assert.throws(()=>store.save(new SvgDocument(),dir.path),/cannot write file/);
    assert.deepEqual(readdirSync(dir.path),['中文 drawing.svg']);
  } finally {dir.cleanup();}
});
