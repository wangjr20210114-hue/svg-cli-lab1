import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorSession} from '../../src/application/EditorSession.js';
import {HistoryManager} from '../../src/application/history/HistoryManager.js';
import {InitCommand} from '../../src/application/commands/InitCommand.js';
import {ReadCommand} from '../../src/application/commands/ReadCommand.js';
import {SaveCommand} from '../../src/application/commands/SaveCommand.js';
import {CanvasCommand} from '../../src/application/commands/CanvasCommand.js';
import {TreeCommand} from '../../src/application/commands/TreeCommand.js';
import {CreateCommand} from '../../src/application/commands/CreateCommand.js';
import {MoveCommand} from '../../src/application/commands/MoveCommand.js';
import {BuiltinShapes} from '../../src/bootstrap/BuiltinShapes.js';
import {MemoryDocumentStore} from '../support/MemoryDocumentStore.js';

test('init save read and modifying canvas establish barriers while queries preserve history',()=>{
  const session=new EditorSession(); const history=new HistoryManager(); const store=new MemoryDocumentStore();
  new InitCommand(session,history).execute(); assert.equal(session.requireDocument().width,800);
  assert.throws(()=>new SaveCommand(session,history,store).execute(),/no file path/);
  new CreateCommand(session,history,BuiltinShapes.createFactory(),'rect','r',['1','2','3','4']).execute();
  const editing=history.status(); new CanvasCommand(session,history).execute(); new TreeCommand(session).execute(); assert.deepEqual(history.status(),editing);
  new SaveCommand(session,history,store,'a.svg').execute(); assert.equal(session.path,'a.svg'); assert.throws(()=>history.undo(),/not allowed/);
  new MoveCommand(session,history,'r',1,0).execute(); history.undo(); assert.equal(session.requireDocument().get('r').attributes().x,'1');
  new ReadCommand(session,history,store,'a.svg').execute(); assert.equal(history.status().blocked,true);
  new MoveCommand(session,history,'r',1,0).execute(); new CanvasCommand(session,history,400,300).execute();
  assert.equal(session.requireDocument().width,400); assert.equal(history.status().blocked,true);
  new SaveCommand(session,history,store).execute(); assert.equal(store.read('a.svg').document.width,400);
});
test('failed init read save and resize retain document path and both history stacks',()=>{
  const session=new EditorSession(); const history=new HistoryManager(); const store=new MemoryDocumentStore();
  new InitCommand(session,history).execute(); new CreateCommand(session,history,BuiltinShapes.createFactory(),'rect','r',['1','2','3','4']).execute();
  new SaveCommand(session,history,store,'a.svg').execute(); new MoveCommand(session,history,'r',1,1).execute(); history.undo();
  const state=history.status(); const doc=session.requireDocument(); store.setFailure(true,true);
  assert.throws(()=>new ReadCommand(session,history,store,'bad.svg').execute(),/cannot read/);
  assert.throws(()=>new SaveCommand(session,history,store,'bad.svg').execute(),/cannot write/);
  assert.throws(()=>new InitCommand(session,history,1,0).execute());
  assert.throws(()=>new CanvasCommand(session,history,1,-1).execute());
  assert.equal(session.requireDocument(),doc); assert.equal(doc.width,800); assert.equal(session.path,'a.svg'); assert.deepEqual(history.status(),state);
});
