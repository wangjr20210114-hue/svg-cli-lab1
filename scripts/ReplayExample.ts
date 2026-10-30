import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

class ReplayExample {
  run(file: string): void {
    const child=spawnSync(process.execPath,[resolve('dist/src/main.js')],{
      input:readFileSync(file,'utf8'),encoding:'utf8',windowsHide:true,
    });
    process.stdout.write(child.stdout??''); process.stderr.write(child.stderr??'');
    if(child.error) throw child.error;
    process.exitCode=child.status??1;
  }
}

new ReplayExample().run(process.argv[2]??'examples/flowchart.txt');
