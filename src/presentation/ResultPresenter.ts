import type { CommandResult } from '../application/contracts/CommandResult.js';
import { TreePresenter } from './TreePresenter.js';
import { ShowPresenter } from './ShowPresenter.js';
export class ResultPresenter {
  private readonly tree=new TreePresenter();
  private readonly show=new ShowPresenter();
  format(result: CommandResult): string {
    let body=result.summary;
    if(result.document) body=result.detail ? this.show.format(result.document,result.targetId!) : this.tree.format(result.document,result.targetId);
    return [...result.warnings,body].filter(line=>line.length>0).join('\n');
  }
}
