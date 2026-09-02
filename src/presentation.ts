import { itemLabel } from './locale.ts';
import type { CheatItem, CheatSection, CheatSheet, SupportedLocale } from './model.ts';
import { formatMacShortcut } from './shortcut.ts';

export type ItemLayout = 'compact' | 'wide' | 'full';

export interface CompactItemView {
  label: string;
  value?: string;
  valueKind?: 'shortcut' | 'command';
  layout: ItemLayout;
}

export interface RecentItemView {
  section: CheatSection;
  item: CheatItem;
  view: CompactItemView;
}

export function itemLayout(item: CheatItem): ItemLayout {
  if (item.shortcut) return 'compact';
  const commandLength = item.command?.trim().length ?? 0;
  if (commandLength >= 58) return 'full';
  if (commandLength >= 24) return 'wide';
  return 'compact';
}

export function compactItemView(item: CheatItem, locale: SupportedLocale): CompactItemView {
  const layout = itemLayout(item);
  if (item.shortcut) return { label: itemLabel(item, locale), value: formatMacShortcut(item.shortcut), valueKind: 'shortcut', layout };
  if (item.command) return { label: itemLabel(item, locale), value: item.command, valueKind: 'command', layout };
  return { label: itemLabel(item, locale), layout };
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
