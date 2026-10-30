import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BuiltinShapes} from '../../src/bootstrap/BuiltinShapes.js';
import {EditorSession} from '../../src/application/EditorSession.js';
import {HistoryManager} from '../../src/application/history/HistoryManager.js';
import {SvgDocument} from '../../src/domain/SvgDocument.js';
import {CreateCommand} from '../../src/application/commands/CreateCommand.js';
import {MoveCommand} from '../../src/application/commands/MoveCommand.js';
import {ScaleCommand} from '../../src/application/commands/ScaleCommand.js';
import {SetCommand} from '../../src/application/commands/SetCommand.js';
import {DeleteCommand} from '../../src/application/commands/DeleteCommand.js';

test('create move scale set delete each form one reversible command',()=>{
  const session=new EditorSession(); session.replaceDocument(new SvgDocument()); const history=new HistoryManager(); const factory=BuiltinShapes.createFactory();
  new CreateCommand(session,history,factory,'g','g',[]).execute();
  new CreateCommand(session,history,factory,'rect','r',['1','2','3','4','#abc'],'g').execute();
  new MoveCommand(session,history,'g',10,20).execute();
  new ScaleCommand(session,history,'g',2).execute();
  assert.equal(session.requireDocument().get('r').attributes().x,'22');
  new SetCommand(session,history,'r','fill','blue').execute();
  new DeleteCommand(session,history,'g').execute(); assert.equal(session.requireDocument().size,0);
  history.undo(); assert.equal(session.requireDocument().parent('r')!.id,'g');
  history.undo(); assert.equal(session.requireDocument().get('r').attributes().fill,'#abc');
  history.undo(); assert.equal(session.requireDocument().get('r').attributes().x,'11');
  history.redo(); assert.equal(session.requireDocument().get('r').attributes().x,'22');
  session.requireDocument().assertInvariants();
});
test('factory supports all builtins without shape-name dispatch in commands',()=>{
  const factory=BuiltinShapes.createFactory();
  const cases=[['rect',['0','0','1','1']],['circle',['0','0','1']],['ellipse',['0','0','1','2']],['line',['0','0','1','1']],['text',['0','0','in']],['g',[]]] as const;
  for(const [type,args] of cases) assert.equal(factory.create(type,type,args).tag,type);
  assert.throws(()=>factory.create('box','b',[]),/unknown shape type: box \(is the plugin loaded\?\)/);
  assert.throws(()=>factory.create('circle','c',['0','0','-1']),/negative/);
  assert.equal(factory.create('rect','r',['0','0','1','1']).attributes().fill,undefined);
});
test('failed edits preserve redo and missing document produces exact message',()=>{
  const session=new EditorSession(); const history=new HistoryManager(); const factory=BuiltinShapes.createFactory();
  assert.throws(()=>new CreateCommand(session,history,factory,'g','g',[]).execute(),/no document\. use 'init' or 'read' first/);
  session.replaceDocument(new SvgDocument()); new CreateCommand(session,history,factory,'rect','r',['1','2','3','4']).execute();
  new MoveCommand(session,history,'r',1,1).execute(); history.undo(); const state=history.status();
  assert.throws(()=>new SetCommand(session,history,'r','bad','x').execute(),/unknown attribute: bad/);
  assert.throws(()=>new ScaleCommand(session,history,'r',0).execute(),/scale factor must be positive/);
  assert.deepEqual(history.status(),state); assert.equal(session.requireDocument().get('r').attributes().x,'1');
});
