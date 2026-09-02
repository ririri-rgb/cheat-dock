import type { CheatItem, CheatSheet } from './model.ts';

export interface SearchHit {
  sheetId: string;
  sheetTitle: string;
  sectionId: string;
  sectionTitle: string;
  item: CheatItem;
  score: number;
}

export function normalize(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}
function tokens(value: string): string[] { return normalize(value).split(/[\s,;:/]+/).filter(Boolean); }

export function searchSheets(sheets: CheatSheet[], query: string): SearchHit[] {
  const queryTokens = tokens(query);
  if (!queryTokens.length) return [];
  const hits: SearchHit[] = [];
  for (const sheet of sheets) {
    for (const section of sheet.sections) {
      for (const item of section.items) {
        const title = normalize(item.title);
        const aliases = item.aliases.map(normalize);
        const tags = item.tags.map(normalize);
        const rest = normalize([item.description, item.command, item.shortcut, item.body, sheet.title, section.title].filter(Boolean).join(' '));
        let score = 0;
        let matched = true;
        for (const token of queryTokens) {
          if (title === token) score += 12;
          else if (title.includes(token)) score += 8;
          else if (aliases.some((value) => value === token)) score += 7;
          else if (aliases.some((value) => value.includes(token))) score += 5;
          else if (tags.some((value) => value.includes(token))) score += 4;
          else if (rest.includes(token)) score += 2;
          else { matched = false; break; }
        }
        if (matched) hits.push({ sheetId: sheet.id, sheetTitle: sheet.title, sectionId: section.id, sectionTitle: section.title, item, score });
      }
    }
  }
  return hits.sort((a, b) => b.score - a.score || a.sheetTitle.localeCompare(b.sheetTitle) || a.item.title.localeCompare(b.item.title));
}
