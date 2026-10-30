import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SvgDocument} from '../../src/domain/SvgDocument.js';
import {Rect} from '../../src/domain/shapes/Rect.js';
import {Circle} from '../../src/domain/shapes/Circle.js';
import {Group} from '../../src/domain/shapes/Group.js';
import {Text} from '../../src/domain/shapes/Text.js';
import {TreePresenter} from '../../src/presentation/TreePresenter.js';
import {ShowPresenter} from '../../src/presentation/ShowPresenter.js';
import {ErrorPresenter} from '../../src/presentation/ErrorPresenter.js';
import {ResultPresenter} from '../../src/presentation/ResultPresenter.js';
import {CommandResult} from '../../src/application/contracts/CommandResult.js';

test('tree renders geometry inline with correct nested branches',()=>{
  const c=new Circle('c',1,2,3); c.setAttribute('fill','red');
  const doc=new SvgDocument(400,300,[new Group('g',[new Rect('r',1,2,3,4),c]),new Text('t',5,6,'中文')]);
  assert.equal(new TreePresenter().format(doc),'svg (400x300)\n├── g#g\n│   ├── rect#r  x=1 y=2 w=3 h=4\n│   └── circle#c  cx=1 cy=2 r=3 fill=red\n└── text#t  (5,6) "中文"');
  const subtree=new TreePresenter().format(doc,'g'); assert.ok(subtree.startsWith('g#g\n')); assert.ok(!subtree.includes('text#t'));
});
test('show includes parent attributes and empty text content',()=>{
  const doc=new SvgDocument(1,1,[new Group('g',[new Text('t',0,0,'')])]);
  assert.equal(new ShowPresenter().format(doc,'t'),'text#t  parent=g#g\n  x=0\n  y=0\n  text=""');
});
test('results display warnings before content and errors remain one line',()=>{
  assert.equal(new ResultPresenter().format(new CommandResult('read ok',undefined,undefined,false,['warning: assigned id rect1'])),'warning: assigned id rect1\nread ok');
  assert.equal(new ErrorPresenter().format(new Error('bad\nsecond')),'error: bad second');
});
