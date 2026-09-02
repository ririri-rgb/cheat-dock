import type { AppState, CheatSection, CheatSheet } from './model.ts';
import { EMPTY_STATE } from './model.ts';

const RECENT_LIMIT = 7;
const STORAGE_KEY = 'cheat-dock-state-v1';

export function loadState(storage: Pick<Storage, 'getItem'>): AppState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(EMPTY_STATE);
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.version !== 1) return structuredClone(EMPTY_STATE);
    return {
      version: 1,
      pinned: Array.isArray(parsed.pinned) ? parsed.pinned.filter((v): v is string => typeof v === 'string') : [...EMPTY_STATE.pinned],
      recent: parsed.recent && typeof parsed.recent === 'object' ? parsed.recent as Record<string, string[]> : {},
      expanded: parsed.expanded && typeof parsed.expanded === 'object' ? parsed.expanded as Record<string, string[]> : {},
      userSheets: Array.isArray(parsed.userSheets) ? parsed.userSheets : [],
      overlays: parsed.overlays && typeof parsed.overlays === 'object' ? parsed.overlays as Record<string, CheatSection[]> : {}
    };
  } catch {
    return structuredClone(EMPTY_STATE);
  }
}

export function saveState(storage: Pick<Storage, 'setItem'>, state: AppState): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordRecent(state: AppState, sheetId: string, itemId: string): AppState {
  const current = state.recent[sheetId] ?? [];
  return { ...state, recent: { ...state.recent, [sheetId]: [itemId, ...current.filter((id) => id !== itemId)].slice(0, RECENT_LIMIT) } };
}

export function togglePin(state: AppState, sheetId: string): AppState {
  const pinned = state.pinned.includes(sheetId) ? state.pinned.filter((id) => id !== sheetId) : [...state.pinned, sheetId];
  return { ...state, pinned };
}

export function mergeSheet(sheet: CheatSheet, overlays: CheatSection[] | undefined): CheatSheet {
  if (!overlays?.length) return sheet;
  const sections = sheet.sections.map((section) => ({ ...section, items: [...section.items] }));
  for (const overlay of overlays) {
    const existing = sections.find((section) => section.id === overlay.id);
    if (existing) existing.items.push(...overlay.items.map((item) => ({ ...item, userOwned: true })));
    else sections.push({ ...overlay, userOwned: true, items: overlay.items.map((item) => ({ ...item, userOwned: true })) });
  }
  return { ...sheet, sections };
}
