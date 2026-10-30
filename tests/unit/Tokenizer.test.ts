import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CommandTokenizer} from '../../src/parsing/CommandTokenizer.js';
import {CommandArguments} from '../../src/parsing/CommandArguments.js';

test('hex colors survive and only whole comment lines are skipped',()=>{
  const tokenizer=new CommandTokenizer();
  assert.deepEqual(tokenizer.tokenize(' # comment'),[]); assert.deepEqual(tokenizer.tokenize(' \t'),[]);
  assert.deepEqual(tokenizer.tokenize('set r fill #4a90d9').map(t=>t.value),['set','r','fill','#4a90d9']);
});
test('quoted Unicode empty text and Windows paths remain intact',()=>{
  const t=new CommandTokenizer();
  assert.deepEqual(t.tokenize('text "My Diagram 中文" "" "D:\\some folder\\a.svg"').map(x=>x.value),['text','My Diagram 中文','','D:\\some folder\\a.svg']);
  assert.equal(t.tokenize('"say \\"hi\\""')[0]!.value,'say "hi"');
  assert.throws(()=>t.tokenize('"unclosed'),/unterminated/);
  assert.throws(()=>t.tokenize('"a"b'),/whitespace/);
});
test('in suffix is distinguished from quoted text',()=>{
  const t=new CommandTokenizer();
  const a=new CommandArguments(t.tokenize('text t 1 2 "in" in node')).splitContainer();
  assert.equal(a.containerId,'node'); assert.deepEqual(a.arguments.values(),['text','t','1','2','in']);
  const b=new CommandArguments(t.tokenize('text t 1 2 "in"')).splitContainer();
  assert.equal(b.containerId,undefined); assert.equal(b.arguments.length,5);
});
test('argument contracts reject missing extra blank and nonfinite numeric values',()=>{
  const t=new CommandTokenizer();
  assert.throws(()=>new CommandArguments(t.tokenize('1 2')).count(1),/expected/);
  assert.throws(()=>new CommandArguments(t.tokenize('""')).number(0,'x'),/finite/);
  assert.throws(()=>new CommandArguments(t.tokenize('Infinity')).number(0,'x'),/finite/);
  assert.equal(new CommandArguments(t.tokenize('-1.5')).number(0,'x'),-1.5);
});
