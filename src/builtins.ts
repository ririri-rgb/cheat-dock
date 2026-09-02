import { parseCheatSheet } from './parser.ts';
import type { CheatSheet } from './model.ts';

const modules = import.meta.glob('../cheats/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function loadBuiltins(): CheatSheet[] {
  const sheets: CheatSheet[] = [];
  for (const [path, markdown] of Object.entries(modules)) {
    try { sheets.push(parseCheatSheet(markdown)); }
    catch (error) { console.error(`Skipping malformed built-in sheet ${path}`, error); }
  }
  return sheets.sort((a, b) => a.title.localeCompare(b.title));
}
