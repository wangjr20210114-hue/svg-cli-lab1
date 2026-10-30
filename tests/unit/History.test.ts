import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorSession} from '../../src/application/EditorSession.js';
import {HistoryManager} from '../../src/application/history/HistoryManager.js';
import {SvgDocument} from '../../src/domain/SvgDocument.js';
import {Rect} from '../../src/domain/shapes/Rect.js';
import {ShiftCommand} from '../support/ShiftCommand.js';

test('commands recover before and after states across consecutive undo redo',()=>{
  const session=new EditorSession(); const history=new HistoryManager();
  session.replaceDocument(new SvgDocument(1,1,[new Rect('r',0,0,1,1)]));
  new ShiftCommand(session,history).execute(); new ShiftCommand(session,history).execute();
  history.undo(); history.undo(); assert.equal(session.requireDocument().get('r').attributes().x,'0');
  history.redo(); history.redo(); assert.equal(session.requireDocument().get('r').attributes().x,'2');
  assert.deepEqual(history.status(),{undo:2,redo:0,blocked:false});
});
test('failed partial edits roll back and preserve redo whereas successful edits clear redo',()=>{
  const session=new EditorSession(); const history=new HistoryManager();
  session.replaceDocument(new SvgDocument(1,1,[new Rect('r',0,0,1,1)]));
  new ShiftCommand(session,history).execute(); history.undo();
  const before=history.status(); assert.throws(()=>new ShiftCommand(session,history,true).execute(),/deliberate/);
  assert.deepEqual(history.status(),before); assert.equal(session.requireDocument().get('r').attributes().x,'0');
  new ShiftCommand(session,history).execute(); assert.equal(history.status().redo,0);
});
test('IO barrier blocks undo and redo until a successful edit and removes older history',()=>{
  const session=new EditorSession(); const history=new HistoryManager();
  session.replaceDocument(new SvgDocument(1,1,[new Rect('r',0,0,1,1)]));
  new ShiftCommand(session,history).execute(); history.blockAfterIo();
  assert.throws(()=>history.undo(),/^DomainError: undo not allowed after io command$/);
  assert.throws(()=>history.redo(),/undo not allowed/);
  assert.throws(()=>new ShiftCommand(session,history,true).execute()); assert.equal(history.status().blocked,true);
  new ShiftCommand(session,history).execute(); history.undo(); assert.throws(()=>history.undo(),/nothing to undo/);
});
