import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorSession} from '../../src/application/EditorSession.js';
import {HistoryManager} from '../../src/application/history/HistoryManager.js';
import {SvgDocument} from '../../src/domain/SvgDocument.js';
import {Rect} from '../../src/domain/shapes/Rect.js';
import {Group} from '../../src/domain/shapes/Group.js';
import {ScaleCommand} from '../../src/application/commands/ScaleCommand.js';
import {MoveCommand} from '../../src/application/commands/MoveCommand.js';
import {TreePresenter} from '../../src/presentation/TreePresenter.js';

test('numeric overflow halfway through a composite edit rolls back earlier descendants and history',()=>{
  const doc=new SvgDocument(1,1,[new Group('g',[new Rect('first',1,2,3,4),new Rect('huge',1e308,1,1,1)])]);
  const session=new EditorSession(); session.replaceDocument(doc); const history=new HistoryManager();
  new MoveCommand(session,history,'first',1,0).execute(); history.undo();
  const before=new TreePresenter().format(doc); const state=history.status();
  assert.throws(()=>new ScaleCommand(session,history,'g',10).execute(),/finite/);
  assert.equal(new TreePresenter().format(doc),before); assert.deepEqual(history.status(),state); doc.assertInvariants();
  history.redo(); assert.equal(doc.get('first').attributes().x,'2');
});
