import type { InputPort } from '../application/ports/InputPort.js';
import type { OutputPort } from '../application/ports/OutputPort.js';
import type { EditorApplication } from '../application/EditorApplication.js';
import type { CommandParser } from '../parsing/CommandParser.js';
import { ResultPresenter } from '../presentation/ResultPresenter.js';
import { ErrorPresenter } from '../presentation/ErrorPresenter.js';
export class CliRepl {
  private readonly results=new ResultPresenter();
  private readonly errors=new ErrorPresenter();
  constructor(private readonly input: InputPort, private readonly output: OutputPort,
    private readonly parser: CommandParser, private readonly application: EditorApplication) {}
  async run(): Promise<void> {
    this.output.write("svg-editor 0.1 — type 'help' for commands\nsvg> ");
    for await(const line of this.input.lines()){
      let text='';
      try {const command=this.parser.parse(line); if(command) text=this.results.format(this.application.execute(command));}
      catch(error){text=this.errors.format(error);}
      if(text) this.output.write(text+'\n');
      this.output.write('svg> ');
    }
    this.output.write('\n');
  }
}
