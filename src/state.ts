import type { AppState, CheatItem, CheatKind, CheatSection, CheatSheet, LocalizedTitles } from './model.ts';
import { EMPTY_STATE } from './model.ts';

const RECENT_LIMIT = 7;
const STORAGE_KEY = 'cheat-dock-state-v1';
const KINDS = new Set<CheatKind>(['shortcut', 'command', 'operation', 'procedure', 'snippet']);
const ID_RE = /^[\p{L}\p{N}][\p{L}\p{N}-]{0,79}$/u;
const MAX_TEXT = 20_000;
const MAX_LIST = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeText(value: unknown, required = false): string | undefined {
  if (typeof value !== 'string' || value.length > MAX_TEXT) return undefined;
  const trimmed = value.trim();
  if (required && !trimmed) return undefined;
  return trimmed || undefined;
}

function safeId(value: unknown): string | undefined {
  const text = safeText(value, true);
  return text && ID_RE.test(text) ? text : undefined;
}

function safeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.slice(0, MAX_LIST).flatMap((entry) => {
    const text = safeText(entry, true);
    return text ? [text] : [];
  })));
}

function safeLocalizedTitles(value: unknown): LocalizedTitles | undefined {
  if (!isRecord(value)) return undefined;
  const ja = safeText(value.ja, true);
  return ja ? { ja } : undefined;
}

function sanitizeItem(value: unknown, seenIds: Set<string>): CheatItem | undefined {
  if (!isRecord(value)) return undefined;
  const id = safeId(value.id);
  const title = safeText(value.title, true);
  const kind = typeof value.kind === 'string' && KINDS.has(value.kind as CheatKind) ? value.kind as CheatKind : undefined;
  if (!id || !title || !kind || seenIds.has(id)) return undefined;
  seenIds.add(id);

  return {
    id,
    title,
    localizedTitles: safeLocalizedTitles(value.localizedTitles),
    kind,
    description: safeText(value.description),
    shortcut: safeText(value.shortcut),
    command: safeText(value.command),
    aliases: safeStringList(value.aliases),
    tags: safeStringList(value.tags),
    body: safeText(value.body),
    source: safeText(value.source),
    userOwned: true
  };
}

function sanitizeSections(value: unknown): CheatSection[] {
  if (!Array.isArray(value)) return [];
  const sectionIds = new Set<string>();
  const itemIds = new Set<string>();
  const sections: CheatSection[] = [];

  for (const candidate of value.slice(0, MAX_LIST)) {
    if (!isRecord(candidate)) continue;
    const id = safeId(candidate.id);
    const title = safeText(candidate.title, true);
    if (!id || !title || sectionIds.has(id) || !Array.isArray(candidate.items)) continue;
    sectionIds.add(id);
    sections.push({
      id,
      title,
      items: candidate.items.slice(0, MAX_LIST).flatMap((item) => {
        const sanitized = sanitizeItem(item, itemIds);
        return sanitized ? [sanitized] : [];
      }),
      userOwned: true
    });
  }
  return sections;
}

function sanitizeUserSheet(value: unknown): CheatSheet | undefined {
  if (!isRecord(value)) return undefined;
  const id = safeId(value.id);
  const title = safeText(value.title, true);
  if (!id?.startsWith('user-') || !title || !Array.isArray(value.sections)) return undefined;
  return {
    id,
    title,
    localizedTitles: safeLocalizedTitles(value.localizedTitles),
    description: safeText(value.description),
    aliases: safeStringList(value.aliases),
    applications: safeStringList(value.applications),
    related: safeStringList(value.related),
    sections: sanitizeSections(value.sections),
    userOwned: true
  };
}

function sanitizeIdRecord(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {};
  const result: Record<string, string[]> = {};
  for (const [key, candidate] of Object.entries(value).slice(0, MAX_LIST)) {
    const id = safeId(key);
    if (!id || !Array.isArray(candidate)) continue;
    result[id] = Array.from(new Set(candidate.slice(0, MAX_LIST).flatMap((entry) => {
      const entryId = safeId(entry);
      return entryId ? [entryId] : [];
    })));
  }
  return result;
}

function sanitizeOverlays(value: unknown): Record<string, CheatSection[]> {
  if (!isRecord(value)) return {};
  const result: Record<string, CheatSection[]> = {};
  for (const [key, candidate] of Object.entries(value).slice(0, MAX_LIST)) {
    const sheetId = safeId(key);
    if (!sheetId || !Array.isArray(candidate)) continue;
    const sections = sanitizeSections(candidate);
    if (sections.length) result[sheetId] = sections;
  }
  return result;
}

export function sanitizeState(value: unknown): AppState {
  if (!isRecord(value) || value.version !== 1) return structuredClone(EMPTY_STATE);

  const userSheetIds = new Set<string>();
  const userSheets = (Array.isArray(value.userSheets) ? value.userSheets : []).slice(0, MAX_LIST).flatMap((candidate) => {
    const sheet = sanitizeUserSheet(candidate);
    if (!sheet || userSheetIds.has(sheet.id)) return [];
    userSheetIds.add(sheet.id);
    return [sheet];
  });

  return {
    version: 1,
    pinned: safeStringList(value.pinned).flatMap((id) => safeId(id) ? [id] : []),
    recent: sanitizeIdRecord(value.recent),
    expanded: sanitizeIdRecord(value.expanded),
    userSheets,
    overlays: sanitizeOverlays(value.overlays)
  };
}

export function loadState(storage: Pick<Storage, 'getItem'>): AppState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(EMPTY_STATE);
    return sanitizeState(JSON.parse(raw));
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
  const itemIds = new Set(sections.flatMap((section) => section.items.map((item) => item.id)));

  for (const overlay of overlays) {
    const uniqueItems = overlay.items.flatMap((item) => {
      if (itemIds.has(item.id)) return [];
      itemIds.add(item.id);
      return [{ ...item, userOwned: true }];
    });
    if (!uniqueItems.length) continue;

    const existing = sections.find((section) => section.id === overlay.id);
    if (existing) existing.items.push(...uniqueItems);
    else sections.push({ ...overlay, userOwned: true, items: uniqueItems });
  }
  return { ...sheet, sections };
}
