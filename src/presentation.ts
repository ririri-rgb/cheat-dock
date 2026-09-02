import { itemLabel } from './locale.ts';
import type { CheatItem, CheatSection, CheatSheet, SupportedLocale } from './model.ts';

export interface CompactItemView {
  label: string;
  value?: string;
  valueKind?: 'shortcut' | 'command';
}

export interface RecentItemView {
  section: CheatSection;
  item: CheatItem;
  view: CompactItemView;
}

export function compactItemView(item: CheatItem, locale: SupportedLocale): CompactItemView {
  if (item.shortcut) return { label: itemLabel(item, locale), value: item.shortcut, valueKind: 'shortcut' };
  if (item.command) return { label: itemLabel(item, locale), value: item.command, valueKind: 'command' };
  return { label: itemLabel(item, locale) };
}

export function recentItemViews(sheet: CheatSheet, recentIds: readonly string[], locale: SupportedLocale): RecentItemView[] {
  const byId = new Map<string, { section: CheatSection; item: CheatItem }>();
  for (const section of sheet.sections) {
    for (const item of section.items) {
      if (!byId.has(item.id)) byId.set(item.id, { section, item });
    }
  }
  return recentIds.flatMap((id) => {
    const found = byId.get(id);
    return found ? [{ ...found, view: compactItemView(found.item, locale) }] : [];
  });
}
