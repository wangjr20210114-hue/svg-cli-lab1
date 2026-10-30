import type { Writable } from 'node:stream';
import type { OutputPort } from '../application/ports/OutputPort.js';
export class ConsoleOutput implements OutputPort {
  constructor(private readonly stream: Writable = process.stdout) {}
  write(text: string): void {this.stream.write(text);}
}
