import { itemLabel } from './locale.ts';
import type { CheatItem, CheatSection, CheatSheet, SupportedLocale } from './model.ts';
import { formatMacShortcut } from './shortcut.ts';

export type ItemLayout = 'compact' | 'wide' | 'full';

export interface CompactItemView {
  label: string;
  value?: string;
  rawValue?: string;
  valueKind?: 'shortcut' | 'command';
  layout: ItemLayout;
}

export interface RecentItemView {
  section: CheatSection;
  item: CheatItem;
  view: CompactItemView;
}

export interface PrimaryItemValue {
  valueKind: 'shortcut' | 'command';
  rawValue: string;
  compatibilityFallback: boolean;
}

function presentValue(raw: string | undefined): string | undefined {
  return raw && raw.trim() ? raw : undefined;
}

export function primaryItemValue(item: CheatItem): PrimaryItemValue | undefined {
  const shortcut = presentValue(item.shortcut);
  const command = presentValue(item.command);

  if (item.kind === 'shortcut') {
    if (shortcut) return { valueKind: 'shortcut', rawValue: shortcut, compatibilityFallback: false };
    if (command) return { valueKind: 'command', rawValue: command, compatibilityFallback: true };
    return undefined;
  }

  if (item.kind === 'command') {
    if (command) return { valueKind: 'command', rawValue: command, compatibilityFallback: false };
    if (shortcut) return { valueKind: 'shortcut', rawValue: shortcut, compatibilityFallback: true };
    return undefined;
  }

  // operation/procedure/snippet remain schema-compatible. Their historical value fields are
  // treated as compatibility data; textual command data stays literal if present.
  if (command) return { valueKind: 'command', rawValue: command, compatibilityFallback: true };
  if (shortcut) return { valueKind: 'shortcut', rawValue: shortcut, compatibilityFallback: true };
  return undefined;
}

export function gridColumnsForWidth(width: number): 1 | 2 | 3 {
  if (width <= 440) return 1;
  if (width <= 620) return 2;
  return 3;
}

export function itemLayout(item: CheatItem): ItemLayout {
  const primary = primaryItemValue(item);
  if (primary?.valueKind === 'shortcut') return 'compact';
  const commandLength = primary?.valueKind === 'command' ? primary.rawValue.length : 0;
  if (commandLength >= 58) return 'full';
  if (commandLength >= 24) return 'wide';
  return 'compact';
}

export function compactItemView(item: CheatItem, locale: SupportedLocale): CompactItemView {
  const layout = itemLayout(item);
  const primary = primaryItemValue(item);
  if (!primary) return { label: itemLabel(item, locale), layout };
  if (primary.valueKind === 'shortcut') {
    return {
      label: itemLabel(item, locale),
      value: formatMacShortcut(primary.rawValue),
      rawValue: primary.rawValue,
      valueKind: 'shortcut',
      layout
    };
  }
  return {
    label: itemLabel(item, locale),
    value: primary.rawValue,
    rawValue: primary.rawValue,
    valueKind: 'command',
    layout
  };
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
