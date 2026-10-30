import type { CommandResult } from './CommandResult.js';
export interface Command { execute(): CommandResult; }
