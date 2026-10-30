import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative, dirname, basename } from 'node:path';
import ts from 'typescript';

class ArchitectureCheck {
  private readonly root=resolve('src');
  private readonly graph=new Map<string,string[]>();
  private readonly allowed: Readonly<Record<string,readonly string[]>>={
    domain:['domain'], contracts:['domain','contracts'], ports:['domain','contracts','ports'],
    history:['domain','contracts','history'],
    application:['domain','contracts','ports','history','application'],
    parsing:['parsing','contracts'], presentation:['presentation','domain','contracts'],
    infrastructure:['infrastructure','domain','ports','contracts'],
    cli:['cli','parsing','application','ports','contracts','presentation'],
    entry:['bootstrap'],
  };
  run(): void {
    for(const file of this.files(this.root)) this.inspect(file);
    for(const file of this.graph.keys()) this.visit(file,new Set(),new Set());
    console.log(`Architecture checks passed: ${this.graph.size} source files; import boundaries, runtime acyclicity, and class/file naming.`);
  }
  private files(directory: string): string[] {
    return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
      const path=resolve(directory,entry.name);
      return entry.isDirectory()?this.files(path):entry.name.endsWith('.ts')?[path]:[];
    });
  }
  private module(file: string): string {
    const path=relative(this.root,file).replaceAll('\\','/');
    if(path.startsWith('application/history/')) return 'history';
    if(path.startsWith('application/contracts/')) return 'contracts';
    if(path.startsWith('application/ports/')) return 'ports';
    return path.includes('/')?path.split('/')[0]!:'entry';
  }
  private inspect(file: string): void {
    const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    const module=this.module(file); const runtime: string[]=[];
    const classes=source.statements.filter(ts.isClassDeclaration);
    if(classes.length>1 || (classes.length===1 && classes[0]!.name?.text!==basename(file,'.ts'))) throw new Error(`class/file naming violation: ${file}`);
    for(const statement of source.statements){
      if(ts.isFunctionDeclaration(statement)) throw new Error(`top-level procedural function: ${file}`);
      if(!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const name=statement.moduleSpecifier.text;
      if(!name.startsWith('.')){
        if(!['cli','infrastructure','bootstrap'].includes(module)) throw new Error(`external dependency in ${file}: ${name}`);
        continue;
      }
      const target=resolve(dirname(file),name.replace(/\.js$/,'.ts'));
      const destination=this.module(target);
      if(module!=='bootstrap' && !this.allowed[module]?.includes(destination)) throw new Error(`forbidden import: ${relative(this.root,file)} -> ${relative(this.root,target)}`);
      if(!statement.importClause?.isTypeOnly) runtime.push(target);
    }
    this.graph.set(file,runtime);
  }
  private visit(file: string, visiting: Set<string>, done: Set<string>): void {
    if(visiting.has(file)) throw new Error(`runtime dependency cycle: ${file}`);
    if(done.has(file)) return;
    visiting.add(file);
    for(const target of this.graph.get(file)??[]) this.visit(target,visiting,done);
    visiting.delete(file); done.add(file);
  }
}

new ArchitectureCheck().run();
