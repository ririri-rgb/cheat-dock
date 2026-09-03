import { itemLabel, sectionLabel, sheetLabel } from './locale.ts';
import type { CheatItem, CheatSheet, LocalizedTitles, SupportedLocale } from './model.ts';

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

function localizedTitleValues(value: LocalizedTitles | undefined): string[] {
  return Object.values(value ?? {}).filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function isLatinAlphanumericToken(token: string): boolean {
  return /^[a-z0-9]+$/u.test(token);
}

export function isShortLatinToken(token: string): boolean {
  const value = normalize(token);
  return value.length > 0 && value.length <= 2 && isLatinAlphanumericToken(value);
}

function weakWords(value: string): string[] {
  return normalize(value).match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function matchWeakProseField(value: string, token: string): boolean {
  const normalizedToken = normalize(token);
  if (!normalizedToken) return false;

  if (isLatinAlphanumericToken(normalizedToken)) {
    const words = weakWords(value);
    if (isShortLatinToken(normalizedToken)) {
      return words.some((word) => word === normalizedToken);
    }
    return words.some((word) => word === normalizedToken || word.startsWith(normalizedToken));
  }

  // CJK and other non-Latin queries keep the existing substring behavior;
  // short queries are meaningful in languages that do not use spaces as word boundaries.
  return normalize(value).includes(normalizedToken);
}

export function searchSheets(sheets: CheatSheet[], query: string, locale: SupportedLocale = 'en'): SearchHit[] {
  const queryTokens = tokens(query);
  if (!queryTokens.length) return [];
  const hits: SearchHit[] = [];

  for (const sheet of sheets) {
    for (const section of sheet.sections) {
      for (const item of section.items) {
        const preferredTitle = normalize(itemLabel(item, locale));
        const titleCandidates = Array.from(new Set([item.title, ...localizedTitleValues(item.localizedTitles)].map(normalize).filter(Boolean)));
        const aliases = item.aliases.map(normalize);
        const tags = item.tags.map(normalize);
        const primaryValues = [item.command, item.shortcut]
          .filter((value): value is string => typeof value === 'string' && value.length > 0)
          .map(normalize);
        const weakFields = [
          item.description,
          item.body,
          sheet.title,
          ...localizedTitleValues(sheet.localizedTitles),
          section.title,
          ...localizedTitleValues(section.localizedTitles)
        ].filter((value): value is string => typeof value === 'string' && value.length > 0);

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
          else if (primaryValues.some((value) => value.includes(token))) score += 4;
          else if (weakFields.some((value) => matchWeakProseField(value, token))) score += 2;
          else { matched = false; break; }
        }

        if (matched) {
          hits.push({
            sheetId: sheet.id,
            sheetTitle: sheetLabel(sheet, locale),
            sectionId: section.id,
            sectionTitle: sectionLabel(section, locale),
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
