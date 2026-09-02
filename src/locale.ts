import type { CheatItem, CheatSheet, LocalizedTitles, SupportedLocale } from './model.ts';

export function detectLocale(languages: readonly string[] | undefined): SupportedLocale {
  const primary = languages?.[0]?.trim().toLowerCase() ?? '';
  return primary === 'ja' || primary.startsWith('ja-') ? 'ja' : 'en';
}

export function resolveLocalizedTitle(title: string, localizedTitles: LocalizedTitles | undefined, locale: SupportedLocale): string {
  if (locale === 'en') return title;
  const localized = localizedTitles?.[locale]?.trim();
  return localized || title;
}

export function itemLabel(item: CheatItem, locale: SupportedLocale): string {
  return resolveLocalizedTitle(item.title, item.localizedTitles, locale);
}

export function sheetLabel(sheet: CheatSheet, locale: SupportedLocale): string {
  return resolveLocalizedTitle(sheet.title, sheet.localizedTitles, locale);
}
