import type { EditorSession } from '../application/EditorSession.js';
import type { HistoryManager } from '../application/history/HistoryManager.js';
import type { DocumentStore } from '../application/ports/DocumentStore.js';
import type { ShapeFactory } from '../domain/creation/ShapeFactory.js';
import { CommandBuilder } from '../parsing/CommandBuilder.js';
import type { CommandRegistry } from '../parsing/CommandRegistry.js';
import { HelpPresenter } from '../presentation/HelpPresenter.js';
import { InitCommand } from '../application/commands/InitCommand.js';
import { ReadCommand } from '../application/commands/ReadCommand.js';
import { SaveCommand } from '../application/commands/SaveCommand.js';
import { CanvasCommand } from '../application/commands/CanvasCommand.js';
import { CreateCommand } from '../application/commands/CreateCommand.js';
import { MoveCommand } from '../application/commands/MoveCommand.js';
import { ScaleCommand } from '../application/commands/ScaleCommand.js';
import { SetCommand } from '../application/commands/SetCommand.js';
import { DeleteCommand } from '../application/commands/DeleteCommand.js';
import { GroupCommand } from '../application/commands/GroupCommand.js';
import { UngroupCommand } from '../application/commands/UngroupCommand.js';
import { AddToCommand } from '../application/commands/AddToCommand.js';
import { FrontCommand } from '../application/commands/FrontCommand.js';
import { BackCommand } from '../application/commands/BackCommand.js';
import { TreeCommand } from '../application/commands/TreeCommand.js';
import { ShowCommand } from '../application/commands/ShowCommand.js';
import { HelpCommand } from '../application/commands/HelpCommand.js';
import { UndoCommand } from '../application/commands/UndoCommand.js';
import { RedoCommand } from '../application/commands/RedoCommand.js';

export class BuiltinCommands {
  static registerAll(registry: CommandRegistry, session: EditorSession, history: HistoryManager, factory: ShapeFactory, store: DocumentStore): void {
    registry.register('init',new CommandBuilder('init [w] [h]',0,2,a=>new InitCommand(session,history,a.length>0?a.number(0,'width'):800,a.length>1?a.number(1,'height'):600)));
    registry.register('read',new CommandBuilder('read <file.svg>',1,1,a=>new ReadCommand(session,history,store,a.value(0))));
    registry.register('save',new CommandBuilder('save [file.svg]',0,1,a=>new SaveCommand(session,history,store,a.length?a.value(0):undefined)));
    registry.register('canvas',new CommandBuilder('canvas [w h]',0,2,a=>{
      if(a.length===1) throw new Error('canvas requires both width and height');
      return new CanvasCommand(session,history,a.length?a.number(0,'width'):undefined,a.length?a.number(1,'height'):undefined);
    }));
    registry.register('create',new CommandBuilder('create <type> <id> [params...] [in <containerId>]',2,Infinity,a=>{
      const split=a.splitContainer(); const args=split.arguments.count(2,Infinity);
      return new CreateCommand(session,history,factory,args.value(0),args.value(1),args.values(2),split.containerId);
    }));
    registry.register('delete',new CommandBuilder('delete <id>',1,1,a=>new DeleteCommand(session,history,a.value(0))));
    registry.register('move',new CommandBuilder('move <id> <dx> <dy>',3,3,a=>new MoveCommand(session,history,a.value(0),a.number(1,'dx'),a.number(2,'dy'))));
    registry.register('scale',new CommandBuilder('scale <id> <factor>',2,2,a=>new ScaleCommand(session,history,a.value(0),a.number(1,'scale factor'))));
    registry.register('set',new CommandBuilder('set <id> <attr> <value>',3,3,a=>new SetCommand(session,history,a.value(0),a.value(1),a.value(2))));
    registry.register('group',new CommandBuilder('group <newGid> <id1> <id2>...',3,Infinity,a=>new GroupCommand(session,history,a.value(0),a.values(1))));
    registry.register('ungroup',new CommandBuilder('ungroup <gid>',1,1,a=>new UngroupCommand(session,history,a.value(0))));
    registry.register('addto',new CommandBuilder('addto <gid> <id>',2,2,a=>new AddToCommand(session,history,a.value(0),a.value(1))));
    registry.register('front',new CommandBuilder('front <id>',1,1,a=>new FrontCommand(session,history,a.value(0))));
    registry.register('back',new CommandBuilder('back <id>',1,1,a=>new BackCommand(session,history,a.value(0))));
    registry.register('tree',new CommandBuilder('tree [id]',0,1,a=>new TreeCommand(session,a.length?a.value(0):undefined)));
    registry.register('show',new CommandBuilder('show <id>',1,1,a=>new ShowCommand(session,a.value(0))));
    registry.register('help',new CommandBuilder('help',0,0,()=>new HelpCommand(new HelpPresenter().format(registry.syntaxes()))));
    registry.register('undo',new CommandBuilder('undo',0,0,()=>new UndoCommand(history)));
    registry.register('redo',new CommandBuilder('redo',0,0,()=>new RedoCommand(history)));
  }
}
