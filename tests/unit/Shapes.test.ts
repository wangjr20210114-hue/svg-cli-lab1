import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Rect} from '../../src/domain/shapes/Rect.js';
import {Circle} from '../../src/domain/shapes/Circle.js';
import {Ellipse} from '../../src/domain/shapes/Ellipse.js';
import {Line} from '../../src/domain/shapes/Line.js';
import {Text} from '../../src/domain/shapes/Text.js';
import {Group} from '../../src/domain/shapes/Group.js';

test('all five leaves scale positions and dimensions and keep styles',()=>{
  const shapes=[new Rect('r',1,2,3,4),new Circle('c',1,2,3),new Ellipse('e',1,2,3,4),new Line('l',1,2,3,4),new Text('t',1,2,'中文 in text')];
  for(const shape of shapes){
    const original=shape.attributes(); shape.setAttribute('stroke-width','3'); shape.scale(2);
    for(const [key,value] of Object.entries(original)) assert.equal(shape.attributes()[key],String(Number(value)*2));
    assert.equal(shape.attributes()['stroke-width'],'3');
  }
  assert.equal(shapes[4]!.textContent(),'中文 in text');
});
test('nested composites move every descendant exactly once',()=>{
  const rect=new Rect('r',1,2,3,4); const line=new Line('l',1,2,5,6);
  const group=new Group('a',[new Group('b',[new Group('c',[rect]),line])]);
  group.move(10,-2); group.scale(0.5);
  assert.deepEqual(rect.attributes(),{x:'5.5',y:'0',width:'1.5',height:'2'});
  assert.deepEqual(line.attributes(),{x1:'5.5',y1:'0',x2:'7.5',y2:'2'});
});
test('whitelists, nonfinite values, negative dimensions and scale are enforced',()=>{
  const rect=new Rect('r',1,2,3,4);
  assert.throws(()=>rect.setAttribute('r','2'),/unknown attribute: r/);
  assert.throws(()=>rect.setAttribute('width','-1'),/must not be negative/);
  assert.throws(()=>rect.setAttribute('x','NaN'),/finite/);
  for(const factor of [0,-1,Infinity,NaN]) assert.throws(()=>rect.scale(factor));
  assert.deepEqual(rect.attributes(),{x:'1',y:'2',width:'3',height:'4'});
  assert.throws(()=>new Group('g').setAttribute('x','1'),/unknown attribute/);
});
test('clones retain behavior and do not share mutable descendants or styles',()=>{
  const rect=new Rect('r',1,2,3,4); rect.setAttribute('fill','red');
  const source=new Group('g',[rect]); const copy=source.clone();
  copy.move(10,10); copy.children()[0]!.setAttribute('fill','blue');
  assert.equal(rect.x,1); assert.equal(rect.attributes().fill,'red');
  assert.ok(copy.children()[0] instanceof Rect);
  assert.equal(source.attributes().fill,undefined);
});
test('group style stays on group and text is child content rather than an attribute',()=>{
  const text=new Text('t',0,0,''); const group=new Group('g',[text]);
  group.setAttribute('fill','red'); text.setAttribute('text','a & <b>');
  assert.equal(group.attributes().fill,'red'); assert.equal(text.attributes().fill,undefined);
  assert.equal(text.textContent(),'a & <b>'); assert.equal(text.attributes().text,undefined);
});
