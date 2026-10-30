import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorSession} from '../../src/application/EditorSession.js';
import {HistoryManager} from '../../src/application/history/HistoryManager.js';
import {SvgDocument} from '../../src/domain/SvgDocument.js';
import {Rect} from '../../src/domain/shapes/Rect.js';
import {Group} from '../../src/domain/shapes/Group.js';
import {GroupCommand} from '../../src/application/commands/GroupCommand.js';
import {UngroupCommand} from '../../src/application/commands/UngroupCommand.js';
import {AddToCommand} from '../../src/application/commands/AddToCommand.js';
import {FrontCommand} from '../../src/application/commands/FrontCommand.js';
import {BackCommand} from '../../src/application/commands/BackCommand.js';

test('group preserves original document order rather than argument order and undo is one unit',()=>{
  const session=new EditorSession(); const history=new HistoryManager();
  const doc=new SvgDocument(1,1,[new Group('outer',[new Rect('a',0,0,1,1),new Rect('b',0,0,1,1),new Rect('c',0,0,1,1)])]); session.replaceDocument(doc);
  new GroupCommand(session,history,'inner',['c','a']).execute();
  assert.deepEqual(doc.get('inner').container()!.children().map(s=>s.id),['a','c']);
  assert.deepEqual(doc.get('outer').container()!.children().map(s=>s.id),['inner','b']);
  assert.equal(history.status().undo,1); history.undo();
  assert.deepEqual(doc.get('outer').container()!.children().map(s=>s.id),['a','b','c']); history.redo();
  new UngroupCommand(session,history,'inner').execute();
  assert.deepEqual(doc.get('outer').container()!.children().map(s=>s.id),['a','c','b']); doc.assertInvariants();
});
test('cross-parent group uses closest common ancestor and stable traversal order',()=>{
  const doc=new SvgDocument(1,1,[new Group('left',[new Rect('a',0,0,1,1)]),new Group('right',[new Rect('b',0,0,1,1)])]);
  doc.group('mixed',['b','a']); assert.equal(doc.parent('mixed'),undefined);
  assert.deepEqual(doc.children().map(s=>s.id),['mixed','left','right']);
  assert.deepEqual(doc.get('mixed').container()!.children().map(s=>s.id),['a','b']); doc.assertInvariants();
});
test('ancestor grouping cyclic addto top-level ungroup and duplicate members fail atomically',()=>{
  const session=new EditorSession(); const history=new HistoryManager();
  const doc=new SvgDocument(1,1,[new Group('g',[new Group('nested',[new Rect('r',0,0,1,1)])])]); session.replaceDocument(doc);
  const before=history.status();
  assert.throws(()=>new GroupCommand(session,history,'bad',['r','g']).execute(),/cannot group a container into its own descendant: g/);
  assert.throws(()=>new GroupCommand(session,history,'bad',['r','r']).execute(),/duplicate/);
  assert.throws(()=>new AddToCommand(session,history,'nested','g').execute(),/own descendant/);
  assert.throws(()=>new AddToCommand(session,history,'g','g').execute(),/own descendant/);
  assert.throws(()=>new UngroupCommand(session,history,'g').execute(),/cannot ungroup top-level container: g/);
  assert.deepEqual(history.status(),before); assert.equal(doc.parent('r')!.id,'nested'); doc.assertInvariants();
});
test('addto and front back retain sibling order and recover original positions',()=>{
  const session=new EditorSession(); const history=new HistoryManager();
  const doc=new SvgDocument(1,1,[new Group('g',[new Rect('a',0,0,1,1),new Rect('b',0,0,1,1)]),new Rect('c',0,0,1,1)]); session.replaceDocument(doc);
  new AddToCommand(session,history,'g','c').execute();
  new FrontCommand(session,history,'a').execute(); assert.deepEqual(doc.get('g').container()!.children().map(s=>s.id),['b','c','a']);
  new BackCommand(session,history,'c').execute(); assert.deepEqual(doc.get('g').container()!.children().map(s=>s.id),['c','b','a']);
  history.undo(); history.undo(); history.undo();
  assert.deepEqual(doc.children().map(s=>s.id),['g','c']);
  assert.deepEqual(doc.get('g').container()!.children().map(s=>s.id),['a','b']); doc.assertInvariants();
});
