import type { SvgDocument } from '../../domain/SvgDocument.js';
export class CommandResult {
  constructor(readonly summary: string, readonly document?: SvgDocument,
    readonly targetId?: string, readonly detail = false, readonly warnings: readonly string[] = []) {}
}
