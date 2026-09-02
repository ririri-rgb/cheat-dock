import { itemLabel, sheetLabel } from './locale.ts';
import type { CheatItem, CheatSheet, SupportedLocale } from './model.ts';

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

function tokens(value: string): string[] {
  return normalize(value).split(/[\s,;:/]+/).filter(Boolean);
}

function localizedTitles(item: CheatItem): string[] {
  return Object.values(item.localizedTitles ?? {}).filter((value): value is string => typeof value === 'string' && value.length > 0);
}

export function searchSheets(sheets: CheatSheet[], query: string, locale: SupportedLocale = 'en'): SearchHit[] {
  const queryTokens = tokens(query);
  if (!queryTokens.length) return [];
  const hits: SearchHit[] = [];

  for (const sheet of sheets) {
    for (const section of sheet.sections) {
      for (const item of section.items) {
        const preferredTitle = normalize(itemLabel(item, locale));
        const titleCandidates = Array.from(new Set([item.title, ...localizedTitles(item)].map(normalize).filter(Boolean)));
        const aliases = item.aliases.map(normalize);
        const tags = item.tags.map(normalize);
        const rest = normalize([
          item.description,
          item.command,
          item.shortcut,
          item.body,
          sheet.title,
          ...Object.values(sheet.localizedTitles ?? {}),
          section.title
        ].filter((value): value is string => typeof value === 'string' && value.length > 0).join(' '));

        let score = 0;
        let matched = true;
        for (const token of queryTokens) {
          if (preferredTitle === token) score += 12;
          else if (preferredTitle.includes(token)) score += 9;
          else if (titleCandidates.some((value) => value === token)) score += 8;
          else if (titleCandidates.some((value) => value.includes(token))) score += 6;
          else if (aliases.some((value) => value === token)) score += 7;
          else if (aliases.some((value) => value.includes(token))) score += 5;
          else if (tags.some((value) => value.includes(token))) score += 4;
          else if (rest.includes(token)) score += 2;
          else { matched = false; break; }
        }

        if (matched) {
          hits.push({
            sheetId: sheet.id,
            sheetTitle: sheetLabel(sheet, locale),
            sectionId: section.id,
            sectionTitle: section.title,
            item,
            score
          });
        }
      }
    }
  }

  return hits.sort((a, b) =>
    b.score - a.score
    || a.sheetTitle.localeCompare(b.sheetTitle, locale)
    || itemLabel(a.item, locale).localeCompare(itemLabel(b.item, locale), locale)
  );
}
