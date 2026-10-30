import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
export class TemporaryDirectory {
  readonly path=mkdtempSync(join(tmpdir(),'svg-cli-test-'));
  file(name: string): string { return join(this.path,name); }
  cleanup(): void {
    const absolute=resolve(this.path);
    if(dirname(absolute)!==resolve(tmpdir()) || !basename(absolute).startsWith('svg-cli-test-')) throw new Error('unsafe test cleanup path');
    rmSync(absolute,{recursive:true,force:true});
  }
}
