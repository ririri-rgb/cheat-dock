import type { AppState, CheatItem, CheatKind, CheatSection } from './model.ts';

export type EditableItemKind = Extract<CheatKind, 'shortcut' | 'command'>;

export interface ItemDraft {
  title: string;
  section: string;
  kind: EditableItemKind;
  shortcut: string;
  command: string;
  description: string;
}

function normalizeLabel(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function optionalShortcut(value: string): string | undefined {
  const trimmed = value.normalize('NFKC').trim();
  return trimmed || undefined;
}

function optionalLiteral(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function isEditableItemKind(kind: CheatKind): kind is EditableItemKind {
  return kind === 'shortcut' || kind === 'command';
}

export function editorKindForItem(item?: CheatItem): EditableItemKind {
  if (!item) return 'shortcut';
  if (isEditableItemKind(item.kind)) return item.kind;
  if (item.command && !item.shortcut) return 'command';
  return 'shortcut';
}

export function inactiveItemValueWarning(
  kind: EditableItemKind,
  shortcut: string,
  command: string
): string | undefined {
  const inactiveLabel = kind === 'shortcut' ? 'Command' : 'Shortcut';
  const inactiveValue = kind === 'shortcut' ? command : shortcut;
  if (!inactiveValue.trim()) return undefined;
  return `Saving as ${kind === 'shortcut' ? 'Shortcut' : 'Command'} will remove the ${inactiveLabel} value.`;
}

export function normalizeItemDraft(draft: ItemDraft): ItemDraft | null {
  const title = normalizeLabel(draft.title);
  const section = normalizeLabel(draft.section) || 'Personal';
  const shortcut = optionalShortcut(draft.shortcut) ?? '';
  const command = optionalLiteral(draft.command) ?? '';
  const description = optionalLiteral(draft.description) ?? '';
  if (!title) return null;
  if (draft.kind === 'shortcut' && !shortcut) return null;
  if (draft.kind === 'command' && !command) return null;
  return { title, section, kind: draft.kind, shortcut, command, description };
}

export function sectionIdForTitle(title: string): string {
  return normalizeLabel(title).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80) || 'personal';
}

export function itemFromDraft(id: string, draft: ItemDraft, base?: CheatItem): CheatItem | null {
  const normalized = normalizeItemDraft(draft);
  if (!normalized) return null;
  const { shortcut: _oldShortcut, command: _oldCommand, ...baseWithoutPrimaryValues } = base ?? {} as CheatItem;
  return {
    ...baseWithoutPrimaryValues,
    id,
    title: normalized.title,
    kind: normalized.kind,
    shortcut: normalized.kind === 'shortcut' ? normalized.shortcut : undefined,
    command: normalized.kind === 'command' ? normalized.command : undefined,
    description: normalized.description || undefined,
    aliases: base?.aliases ?? [],
    tags: base?.tags ?? [],
    userOwned: true
  };
}

function editSections(
  sections: CheatSection[],
  sourceSectionId: string,
  itemId: string,
  draft: ItemDraft,
  removeEmptySource: boolean
): { sections: CheatSection[]; changed: boolean } {
  const source = sections.find((section) => section.id === sourceSectionId);
  const existing = source?.items.find((item) => item.id === itemId);
  if (!source || !existing) return { sections, changed: false };
  const updated = itemFromDraft(existing.id, draft, existing);
  const normalized = normalizeItemDraft(draft);
  if (!updated || !normalized) return { sections, changed: false };
  const targetId = sectionIdForTitle(normalized.section);

  let next = sections.map((section) => ({ ...section, items: section.items.filter((item) => !(section.id === sourceSectionId && item.id === itemId)) }));
  if (removeEmptySource) next = next.filter((section) => section.id !== sourceSectionId || section.items.length > 0 || section.id === targetId);

  const targetIndex = next.findIndex((section) => section.id === targetId);
  if (targetIndex >= 0) {
    const target = next[targetIndex]!;
    next[targetIndex] = {
      ...target,
      title: target.id === sourceSectionId && target.userOwned ? normalized.section : target.title,
      items: [...target.items, updated]
    };
  } else {
    next.push({ id: targetId, title: normalized.section, items: [updated], userOwned: true });
  }
  return { sections: next, changed: true };
}

export function editPersonalItem(state: AppState, sheetId: string, sectionId: string, itemId: string, draft: ItemDraft): AppState {
  let changed = false;
  const userSheets = state.userSheets.map((sheet) => {
    if (sheet.id !== sheetId || !sheet.userOwned) return sheet;
    const edited = editSections(sheet.sections, sectionId, itemId, draft, false);
    changed ||= edited.changed;
    return edited.changed ? { ...sheet, sections: edited.sections } : sheet;
  });
  if (changed) return { ...state, userSheets };

  const overlay = state.overlays[sheetId];
  if (!overlay) return state;
  const edited = editSections(overlay, sectionId, itemId, draft, true);
  if (!edited.changed) return state;
  return { ...state, overlays: { ...state.overlays, [sheetId]: edited.sections } };
}

function withoutRecentItem(state: AppState, sheetId: string, itemId: string): AppState {
  const current = state.recent[sheetId];
  if (!current?.includes(itemId)) return state;
  return { ...state, recent: { ...state.recent, [sheetId]: current.filter((id) => id !== itemId) } };
}

export function deletePersonalItem(state: AppState, sheetId: string, sectionId: string, itemId: string): AppState {
  let changed = false;
  const userSheets = state.userSheets.map((sheet) => {
    if (sheet.id !== sheetId || !sheet.userOwned) return sheet;
    const sections = sheet.sections.map((section) => {
      if (section.id !== sectionId) return section;
      const items = section.items.filter((item) => item.id !== itemId);
      if (items.length !== section.items.length) changed = true;
      return { ...section, items };
    });
    return changed ? { ...sheet, sections } : sheet;
  });
  if (changed) return withoutRecentItem({ ...state, userSheets }, sheetId, itemId);

  const overlay = state.overlays[sheetId];
  if (!overlay) return state;
  const sections = overlay
    .map((section) => {
      if (section.id !== sectionId) return section;
      const items = section.items.filter((item) => item.id !== itemId);
      if (items.length !== section.items.length) changed = true;
      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
  return changed ? withoutRecentItem({ ...state, overlays: { ...state.overlays, [sheetId]: sections } }, sheetId, itemId) : state;
}
