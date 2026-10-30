import { Token } from './Token.js';

export class CommandTokenizer {
  tokenize(line: string): readonly Token[] {
    if (line.trimStart().startsWith('#')) return [];
    const tokens: Token[] = [];
    let i = 0;
    while (i < line.length) {
      if (/\s/.test(line[i]!)) { i++; continue; }
      const quoted = line[i] === '"';
      let value = '';
      if (quoted) {
        i++; let closed = false;
        while (i < line.length) {
          const char = line[i++]!;
          if (char === '"') { closed = true; break; }
          if (char === '\\' && (line[i] === '"' || line[i] === '\\')) value += line[i++]!;
          else value += char;
        }
        if (!closed) throw new Error('unterminated double quote');
        if (i < line.length && !/\s/.test(line[i]!)) throw new Error('expected whitespace after quoted argument');
      } else {
        while (i < line.length && !/\s/.test(line[i]!)) {
          if (line[i] === '"') throw new Error('double quote must start an argument');
          value += line[i++]!;
        }
      }
      tokens.push(new Token(value, quoted));
    }
    return Object.freeze(tokens);
  }
}
