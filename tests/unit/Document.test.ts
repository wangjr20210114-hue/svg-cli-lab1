import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SvgDocument} from '../../src/domain/SvgDocument.js';
import {Rect} from '../../src/domain/shapes/Rect.js';
import {Group} from '../../src/domain/shapes/Group.js';

test('IDs are unique case-sensitive and nested inserts retain parents',()=>{
  const doc=new SvgDocument(); doc.add(new Group('g'));
  doc.add(new Rect('r',0,0,1,1),'g'); doc.add(new Rect('R',0,0,1,1));
  assert.equal(doc.parent('r')!.id,'g'); assert.equal(doc.parent('R'),undefined);
  assert.throws(()=>doc.add(new Rect('r',0,0,1,1)),/id already exists: r/);
  assert.throws(()=>doc.add(new Rect('x',0,0,1,1),'missing'),/no such container/);
  assert.throws(()=>doc.add(new Group('x'),'r'),/not a container/);
  assert.equal(doc.size,3); doc.assertInvariants();
});
test('deleting a subtree removes all descendants from the index',()=>{
  const doc=new SvgDocument(400,300,[new Group('g',[new Group('nested',[new Rect('r',0,0,1,1)])])]);
  doc.delete('g'); assert.equal(doc.size,0); assert.equal(doc.has('r'),false); doc.assertInvariants();
});
test('memento restores classes dimensions parentage order and detached state',()=>{
  const doc=new SvgDocument(400,300,[new Group('g',[new Rect('r',1,2,3,4)]),new Rect('last',0,0,1,1)]);
  const before=doc.capture(); doc.get('r').move(100,100); doc.delete('g'); doc.resize(1,1);
  doc.restore(before); assert.equal(doc.width,400); assert.equal(doc.height,300);
  assert.deepEqual(doc.children().map(s=>s.id),['g','last']); assert.ok(doc.get('r') instanceof Rect);
  assert.equal(doc.get('r').attributes().x,'1'); assert.equal(doc.parent('r')!.id,'g');
  doc.get('r').move(1,1); doc.restore(before); assert.equal(doc.get('r').attributes().x,'1'); doc.assertInvariants();
});
test('invalid input trees cannot introduce shared nodes duplicate IDs or cycles',()=>{
  const rect=new Rect('r',0,0,1,1);
  assert.throws(()=>new SvgDocument(1,1,[new Group('a',[rect]),new Group('b',[rect])]),/shared/);
  assert.throws(()=>new SvgDocument(1,1,[rect,new Rect('r',1,1,1,1)]),/id already exists/);
  const group=new Group('g'); group.replaceChildren([group]); assert.throws(()=>new SvgDocument(1,1,[group]),/cyclic/);
});
test('invalid resize and failed subtree insertion leave document unchanged',()=>{
  const doc=new SvgDocument(); doc.add(new Rect('r',0,0,1,1));
  assert.throws(()=>doc.resize(400,0)); assert.equal(doc.width,800);
  assert.throws(()=>doc.add(new Group('g',[new Rect('r',1,1,1,1)])));
  assert.equal(doc.has('g'),false); assert.equal(doc.size,1); doc.assertInvariants();
});
