import type { AppState, CheatSheet } from './model.ts';

export interface SheetMutationResult {
  ok: boolean;
  state: AppState;
  sheet?: CheatSheet;
  error?: string;
}

export function normalizeSheetTitle(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function sheetTitleKey(value: string): string {
  return normalizeSheetTitle(value).toLocaleLowerCase('en-US');
}

export function validateCustomSheetTitle(
  value: string,
  sheets: readonly CheatSheet[],
  selfId?: string
): { ok: true; title: string } | { ok: false; error: string } {
  const title = normalizeSheetTitle(value);
  if (!title) return { ok: false, error: 'Sheet name is required.' };
  const key = sheetTitleKey(title);
  const collision = sheets.some((sheet) => sheet.id !== selfId && sheetTitleKey(sheet.title) === key);
  if (collision) return { ok: false, error: 'A Cheat Sheet with this name already exists.' };
  return { ok: true, title };
}

export function createCustomSheet(
  state: AppState,
  sheets: readonly CheatSheet[],
  rawTitle: string,
  id: string
): SheetMutationResult {
  const validation = validateCustomSheetTitle(rawTitle, sheets);
  if (!validation.ok) return { ok: false, state, error: validation.error };
  const sheet: CheatSheet = {
    id,
    title: validation.title,
    aliases: [],
    applications: [],
    related: [],
    sections: [{ id: 'notes', title: 'Notes', items: [], userOwned: true }],
    userOwned: true
  };
  return { ok: true, state: { ...state, userSheets: [...state.userSheets, sheet] }, sheet };
}

export function renameCustomSheet(
  state: AppState,
  sheets: readonly CheatSheet[],
  sheetId: string,
  rawTitle: string
): SheetMutationResult {
  const target = state.userSheets.find((sheet) => sheet.id === sheetId && sheet.userOwned);
  if (!target) return { ok: false, state, error: 'Built-in Cheat Sheets cannot be renamed.' };
  const validation = validateCustomSheetTitle(rawTitle, sheets, sheetId);
  if (!validation.ok) return { ok: false, state, error: validation.error };
  const sheet = { ...target, title: validation.title };
  return {
    ok: true,
    state: { ...state, userSheets: state.userSheets.map((candidate) => candidate.id === sheetId ? sheet : candidate) },
    sheet
  };
}

function withoutRecordKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

export function deleteCustomSheet(state: AppState, sheetId: string): SheetMutationResult {
  const target = state.userSheets.find((sheet) => sheet.id === sheetId && sheet.userOwned);
  if (!target) return { ok: false, state, error: 'Built-in Cheat Sheets cannot be deleted.' };
  return {
    ok: true,
    state: {
      ...state,
      pinned: state.pinned.filter((id) => id !== sheetId),
      recent: withoutRecordKey(state.recent, sheetId),
      expanded: withoutRecordKey(state.expanded, sheetId),
      overlays: withoutRecordKey(state.overlays, sheetId),
      userSheets: state.userSheets
        .filter((sheet) => sheet.id !== sheetId)
        .map((sheet) => ({ ...sheet, related: sheet.related.filter((id) => id !== sheetId) }))
    },
    sheet: target
  };
}

export function customSheetItemCount(sheet: CheatSheet): number {
  return sheet.sections.reduce((count, section) => count + section.items.length, 0);
}

export function fallbackSheetIdAfterDelete(
  deletedId: string,
  selectedId: string,
  sheetsBeforeDelete: readonly CheatSheet[],
  preferredId = 'my-work'
): string {
  if (selectedId !== deletedId) return selectedId;
  const remaining = sheetsBeforeDelete.filter((sheet) => sheet.id !== deletedId);
  return remaining.find((sheet) => sheet.id === preferredId)?.id ?? remaining[0]?.id ?? preferredId;
}
