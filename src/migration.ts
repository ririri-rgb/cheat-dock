import { sheetTitleKey } from './custom-sheets.ts';
import type { AppState, CheatSheet } from './model.ts';
import type { ParsedUserContent, UserDocumentSpec } from './user-markdown.ts';
import { canonicalDocumentContent, documentsFromState, userDocumentKey } from './user-markdown.ts';

export const MIGRATION_MARKER_KEY = 'cheat-dock-file-migration-v1';
export const LEGACY_BACKUP_KEY = 'cheat-dock-legacy-content-backup-v1';

export interface MigrationPlan {
  ok: boolean;
  desired: UserDocumentSpec[];
  writes: UserDocumentSpec[];
  errors: string[];
}

export function legacyHasUserContent(state: Pick<AppState, 'userSheets' | 'overlays'>): boolean {
  return state.userSheets.length > 0 || Object.values(state.overlays).some((sections) => sections.length > 0);
}

export function migrationCompleted(storage: Pick<Storage, 'getItem'>): boolean {
  try {
    const raw = storage.getItem(MIGRATION_MARKER_KEY);
    if (!raw) return false;
    const value = JSON.parse(raw) as { version?: unknown };
    return value.version === 1;
  } catch {
    return false;
  }
}

export function markMigrationCompleted(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  legacyRaw: string | null,
  now = new Date().toISOString()
): void {
  if (legacyRaw && !storage.getItem(LEGACY_BACKUP_KEY)) {
    storage.setItem(LEGACY_BACKUP_KEY, legacyRaw);
  }
  storage.setItem(MIGRATION_MARKER_KEY, JSON.stringify({ version: 1, verifiedAt: now }));
}

export function planLegacyMigration(
  legacy: Pick<AppState, 'userSheets' | 'overlays'>,
  builtins: readonly CheatSheet[],
  currentFiles: ParsedUserContent
): MigrationPlan {
  const desired = documentsFromState(legacy, builtins);
  const errors: string[] = [];
  const writes: UserDocumentSpec[] = [];
  const builtinTitles = new Map(builtins.map((sheet) => [sheetTitleKey(sheet.title), sheet.id]));
  const currentFileTitles = new Map(currentFiles.userSheets.map((sheet) => [sheetTitleKey(sheet.title), sheet.id]));
  const seenLegacyTitles = new Map<string, string>();

  for (const sheet of legacy.userSheets) {
    const key = sheetTitleKey(sheet.title);
    const builtinId = builtinTitles.get(key);
    if (builtinId) errors.push(`Legacy custom Sheet “${sheet.title}” conflicts with built-in ${builtinId}. Rename or delete it before migration.`);
    const existingId = currentFileTitles.get(key);
    if (existingId && existingId !== sheet.id) errors.push(`Legacy custom Sheet “${sheet.title}” conflicts with an existing user Markdown Sheet.`);
    const previous = seenLegacyTitles.get(key);
    if (previous && previous !== sheet.id) errors.push(`Legacy custom Sheets ${previous} and ${sheet.id} have the same normalized title.`);
    seenLegacyTitles.set(key, sheet.id);
  }

  for (const document of desired) {
    try {
      const expected = canonicalDocumentContent(document, builtins);
      const current = currentFiles.documents.get(userDocumentKey(document.kind, document.id));
      if (!current) {
        writes.push({ ...document, content: expected });
        continue;
      }
      const actual = canonicalDocumentContent({ kind: current.kind, id: current.id, content: current.content }, builtins);
      if (actual !== expected) {
        errors.push(`Existing ${current.relativePath} differs from legacy localStorage data. Nothing was overwritten.`);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return { ok: errors.length === 0, desired, writes: errors.length ? [] : writes, errors };
}

export function verifyMigratedDocuments(
  desired: readonly UserDocumentSpec[],
  loaded: ParsedUserContent,
  builtins: readonly CheatSheet[]
): { ok: true } | { ok: false; error: string } {
  for (const document of desired) {
    const current = loaded.documents.get(userDocumentKey(document.kind, document.id));
    if (!current) return { ok: false, error: `Migrated document ${userDocumentKey(document.kind, document.id)} is missing after reload.` };
    try {
      const expected = canonicalDocumentContent(document, builtins);
      const actual = canonicalDocumentContent({ kind: current.kind, id: current.id, content: current.content }, builtins);
      if (actual !== expected) return { ok: false, error: `${current.relativePath} did not round-trip to the migrated content.` };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
  return { ok: true };
}
