import { createInterface } from 'node:readline';
import type { Readable } from 'node:stream';
import type { InputPort } from '../application/ports/InputPort.js';
export class ConsoleInput implements InputPort {
  constructor(private readonly stream: Readable = process.stdin) {}
  async *lines(): AsyncIterable<string> {
    const input=createInterface({input:this.stream,crlfDelay:Infinity,terminal:false});
    try {for await(const line of input) yield line;} finally {input.close();}
  }
}
