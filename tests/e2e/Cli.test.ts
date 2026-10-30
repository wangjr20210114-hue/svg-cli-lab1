import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {readFileSync,writeFileSync} from 'node:fs';
import {TemporaryDirectory} from '../support/TemporaryDirectory.js';
import {SvgReader} from '../../src/infrastructure/svg/SvgReader.js';
import {BuiltinShapes} from '../../src/bootstrap/BuiltinShapes.js';

test('real REPL survives errors supports help before init and preserves exact error strings',()=>{
  const input=['help','tree','init','create rect r 1 2 3 4 #abc','move r 10 0','undo','show r','set r bad 1','scale r 0','create box b','unknown','canvas',''].join('\n');
  const result=spawnSync(process.execPath,[resolve('dist/src/main.js')],{input,encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,result.stderr); assert.match(result.stdout,/Commands:/);
  for(const message of ["error: no document. use 'init' or 'read' first",'error: unknown attribute: bad','error: scale factor must be positive','error: unknown shape type: box (is the plugin loaded?)','error: unknown command: unknown']) assert.ok(result.stdout.includes(message),message);
  assert.match(result.stdout,/  x=1\n/); assert.match(result.stdout,/canvas 800x600/);
});
test('assignment flowchart script produces valid nested SVG and Unicode text',()=>{
  const dir=new TemporaryDirectory();
  try {
    const script=readFileSync('examples/flowchart.txt','utf8').replace('save flowchart.svg',`save "${dir.file('flow chart.svg')}"`);
    const result=spawnSync(process.execPath,[resolve('dist/src/main.js')],{input:script,encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0,result.stderr); assert.ok(!result.stdout.includes('error:'),result.stdout);
    const doc=new SvgReader(BuiltinShapes.createFactory()).read(readFileSync(dir.file('flow chart.svg'),'utf8')).document;
    assert.equal(doc.size,8); assert.equal(doc.parent('process-label')!.id,'node2');
    assert.equal(doc.get('process').attributes().y,'100'); assert.equal(doc.get('process-label').textContent(),'处理数据 v2');
  }finally{dir.cleanup();}
});
test('malformed quoted commands leave history intact and reading external SVG assigns IDs',()=>{
  const script=['init','create rect r 0 0 1 1','move r 1 0','undo','set r fill "unclosed','redo','show r','read tests/fixtures/other.svg','undo','tree',''].join('\n');
  const result=spawnSync(process.execPath,[resolve('dist/src/main.js')],{input:script,encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,result.stderr); assert.match(result.stdout,/unterminated double quote/);
  assert.match(result.stdout,/  x=1\n/); assert.match(result.stdout,/warning: assigned id rect1 to unnamed <rect>/);
  assert.match(result.stdout,/error: undo not allowed after io command/); assert.match(result.stdout,/svg \(400x300\)/);
});
test('full assignment transcript has only its two intentional errors and saves the expected document',()=>{
  const dir=new TemporaryDirectory();
  try{
    const script=readFileSync('examples/basic.txt','utf8').replace('save demo.svg',`save "${dir.file('demo.svg')}"`);
    const result=spawnSync(process.execPath,[resolve('dist/src/main.js')],{input:script,encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0,result.stderr); assert.equal((result.stdout.match(/error: /g)??[]).length,2,result.stdout);
    const doc=new SvgReader(BuiltinShapes.createFactory()).read(readFileSync(dir.file('demo.svg'),'utf8')).document;
    assert.equal(doc.size,5); assert.equal(doc.get('c1').attributes().cx,'130');
    assert.equal(doc.get('title').textContent(),'My Diagram'); assert.equal(doc.parent('box')!.id,'markers');
  }finally{dir.cleanup();}
});
test('invalid imported SVG does not emit partial warnings replace the document or discard redo',()=>{
  const dir=new TemporaryDirectory();
  try{
    writeFileSync(dir.file('invalid.svg'),'<svg><rect/><path/></svg>');
    const script=['init','create rect r 0 0 1 1','move r 1 0','undo',`read "${dir.file('invalid.svg')}"`,'redo','show r',''].join('\n');
    const result=spawnSync(process.execPath,[resolve('dist/src/main.js')],{input:script,encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0,result.stderr); assert.ok(!result.stdout.includes('warning:'),result.stdout);
    assert.match(result.stdout,/unknown shape type: path/); assert.match(result.stdout,/  x=1\n/);
  }finally{dir.cleanup();}
});
