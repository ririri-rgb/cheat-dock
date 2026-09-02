import type { AppState, CheatSheet } from './model.ts';
import {
  deleteUserDocument,
  loadUserDocuments,
  storageError,
  userDataPath,
  writeUserDocument,
  type LoadUserDocumentsResult,
  type StorageCommandError,
  type StorageIssue,
  type StoredUserDocument,
  type UserDocumentKind
} from './native-storage.ts';
import {
  legacyHasUserContent,
  markMigrationCompleted,
  migrationCompleted,
  planLegacyMigration,
  verifyMigratedDocuments
} from './migration.ts';
import { rawState, saveState, saveUiState } from './state.ts';
import {
  documentsFromState,
  parseLoadedUserDocuments,
  userDocumentKey,
  type ParsedUserContent,
  type UserDocumentSpec
} from './user-markdown.ts';

export interface UserStorageBackend {
  load(): Promise<LoadUserDocumentsResult>;
  write(kind: UserDocumentKind, id: string, content: string, expectedContent: string | null): Promise<StoredUserDocument>;
  delete(kind: UserDocumentKind, id: string, expectedContent: string | null): Promise<void>;
  path(): Promise<string>;
}

export const nativeUserStorage: UserStorageBackend = {
  load: loadUserDocuments,
  write: writeUserDocument,
  delete: deleteUserDocument,
  path: userDataPath
};

export type FileContentMode = 'files' | 'legacy';

export interface FileContentSession {
  mode: FileContentMode;
  state: AppState;
  documents: Map<string, StoredUserDocument>;
  rootPath?: string;
  issues: StorageIssue[];
}

function issue(code: string, message: string, relativePath?: string): StorageIssue {
  return { code, message, relativePath };
}

function stateWithFiles(uiState: AppState, parsed: ParsedUserContent): AppState {
  return { ...uiState, userSheets: parsed.userSheets, overlays: parsed.overlays };
}

async function safeLoad(backend: UserStorageBackend): Promise<LoadUserDocumentsResult | StorageCommandError> {
  try {
    return await backend.load();
  } catch (error) {
    return storageError(error);
  }
}

function isLoadResult(value: LoadUserDocumentsResult | StorageCommandError): value is LoadUserDocumentsResult {
  return Array.isArray((value as LoadUserDocumentsResult).documents);
}

export async function initializeFileContent(
  legacyState: AppState,
  builtins: readonly CheatSheet[],
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  backend: UserStorageBackend = nativeUserStorage
): Promise<FileContentSession> {
  const loaded = await safeLoad(backend);
  if (!isLoadResult(loaded)) {
    return {
      mode: 'legacy',
      state: legacyState,
      documents: new Map(),
      issues: [issue(loaded.code, loaded.message, loaded.relativePath)]
    };
  }

  let parsed = parseLoadedUserDocuments(loaded.documents, loaded.issues, builtins);
  if (migrationCompleted(storage)) {
    const state = stateWithFiles(legacyState, parsed);
    saveUiState(storage, state);
    return { mode: 'files', state, documents: parsed.documents, rootPath: loaded.rootPath, issues: parsed.issues };
  }

  const legacyRaw = rawState(storage);
  const plan = planLegacyMigration(legacyState, builtins, parsed);
  if (!plan.ok) {
    return {
      mode: 'legacy',
      state: legacyState,
      documents: parsed.documents,
      rootPath: loaded.rootPath,
      issues: [...parsed.issues, ...plan.errors.map((message) => issue('migration-blocked', message))]
    };
  }

  try {
    for (const document of plan.writes) {
      await backend.write(document.kind, document.id, document.content, null);
    }
  } catch (error) {
    const failure = storageError(error);
    return {
      mode: 'legacy',
      state: legacyState,
      documents: parsed.documents,
      rootPath: loaded.rootPath,
      issues: [...parsed.issues, issue('migration-write-failed', failure.message, failure.relativePath)]
    };
  }

  const reloaded = await safeLoad(backend);
  if (!isLoadResult(reloaded)) {
    return {
      mode: 'legacy', state: legacyState, documents: parsed.documents, rootPath: loaded.rootPath,
      issues: [...parsed.issues, issue('migration-reload-failed', reloaded.message, reloaded.relativePath)]
    };
  }
  parsed = parseLoadedUserDocuments(reloaded.documents, reloaded.issues, builtins);
  const verified = verifyMigratedDocuments(plan.desired, parsed, builtins);
  if (!verified.ok) {
    return {
      mode: 'legacy', state: legacyState, documents: parsed.documents, rootPath: reloaded.rootPath,
      issues: [...parsed.issues, issue('migration-verification-failed', verified.error)]
    };
  }

  markMigrationCompleted(storage, legacyRaw);
  const state = stateWithFiles(legacyState, parsed);
  saveUiState(storage, state);
  return { mode: 'files', state, documents: parsed.documents, rootPath: reloaded.rootPath, issues: parsed.issues };
}

export async function reloadFileContent(
  session: FileContentSession,
  builtins: readonly CheatSheet[],
  storage: Pick<Storage, 'setItem'>,
  backend: UserStorageBackend = nativeUserStorage
): Promise<FileContentSession> {
  if (session.mode === 'legacy') return session;
  const loaded = await safeLoad(backend);
  if (!isLoadResult(loaded)) {
    return { ...session, issues: [issue(loaded.code, loaded.message, loaded.relativePath), ...session.issues] };
  }
  const parsed = parseLoadedUserDocuments(loaded.documents, loaded.issues, builtins);
  const state = stateWithFiles(session.state, parsed);
  saveUiState(storage, state);
  return { mode: 'files', state, documents: parsed.documents, rootPath: loaded.rootPath, issues: parsed.issues };
}

function mapDocuments(specs: readonly UserDocumentSpec[]): Map<string, UserDocumentSpec> {
  return new Map(specs.map((document) => [userDocumentKey(document.kind, document.id), document]));
}

export async function persistAuthoredState(
  session: FileContentSession,
  nextState: AppState,
  builtins: readonly CheatSheet[],
  storage: Pick<Storage, 'setItem'>,
  backend: UserStorageBackend = nativeUserStorage
): Promise<{ ok: true; session: FileContentSession } | { ok: false; session: FileContentSession; error: StorageCommandError }> {
  if (session.mode === 'legacy') {
    saveState(storage, nextState);
    return { ok: true, session: { ...session, state: nextState } };
  }

  const previousSemantic = mapDocuments(documentsFromState(session.state, builtins));
  const nextDocuments = mapDocuments(documentsFromState(nextState, builtins));
  const documents = new Map(session.documents);
  const changed: UserDocumentSpec[] = [];
  for (const [key, document] of nextDocuments) {
    if (previousSemantic.get(key)?.content !== document.content) changed.push(document);
  }
  const removed = [...previousSemantic.keys()].filter((key) => !nextDocuments.has(key));

  try {
    for (const document of changed) {
      const key = userDocumentKey(document.kind, document.id);
      const existing = documents.get(key);
      const written = await backend.write(document.kind, document.id, document.content, existing?.content ?? null);
      documents.set(key, written);
    }
    for (const key of removed) {
      const existing = documents.get(key);
      if (!existing) continue;
      await backend.delete(existing.kind, existing.id, existing.content);
      documents.delete(key);
    }
  } catch (error) {
    const failure = storageError(error);
    const refreshed = await reloadFileContent({ ...session, documents }, builtins, storage, backend);
    return { ok: false, session: refreshed, error: failure };
  }

  saveUiState(storage, nextState);
  return { ok: true, session: { ...session, state: nextState, documents, issues: session.issues.filter((entry) => entry.code !== 'conflict') } };
}

export function sessionHasLegacyContent(session: FileContentSession): boolean {
  return session.mode === 'legacy' && legacyHasUserContent(session.state);
}
