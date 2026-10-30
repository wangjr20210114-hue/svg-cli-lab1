import { EditorSession } from '../application/EditorSession.js';
import { EditorApplication } from '../application/EditorApplication.js';
import { HistoryManager } from '../application/history/HistoryManager.js';
import type { InputPort } from '../application/ports/InputPort.js';
import type { OutputPort } from '../application/ports/OutputPort.js';
import { BuiltinShapes } from './BuiltinShapes.js';
import { BuiltinCommands } from './BuiltinCommands.js';
import { SvgReader } from '../infrastructure/svg/SvgReader.js';
import { SvgWriter } from '../infrastructure/svg/SvgWriter.js';
import { FileDocumentStore } from '../infrastructure/filesystem/FileDocumentStore.js';
import { CommandRegistry } from '../parsing/CommandRegistry.js';
import { CommandParser } from '../parsing/CommandParser.js';
import { ConsoleInput } from '../cli/ConsoleInput.js';
import { ConsoleOutput } from '../cli/ConsoleOutput.js';
import { CliRepl } from '../cli/CliRepl.js';
export class ApplicationBootstrap {
  static create(input: InputPort = new ConsoleInput(), output: OutputPort = new ConsoleOutput()): CliRepl {
    const session=new EditorSession(); const history=new HistoryManager(); const factory=BuiltinShapes.createFactory();
    const store=new FileDocumentStore(new SvgReader(factory),new SvgWriter());
    const registry=new CommandRegistry(); BuiltinCommands.registerAll(registry,session,history,factory,store);
    return new CliRepl(input,output,new CommandParser(registry),new EditorApplication());
  }
}
