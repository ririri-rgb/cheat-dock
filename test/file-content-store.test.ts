import test from 'node:test';
import assert from 'node:assert/strict';
import type { AppState, CheatSheet } from '../src/model.ts';
import { EMPTY_STATE } from '../src/model.ts';
import { createCustomSheet, renameCustomSheet, deleteCustomSheet } from '../src/custom-sheets.ts';
import { LEGACY_BACKUP_KEY, MIGRATION_MARKER_KEY } from '../src/migration.ts';
import type { LoadUserDocumentsResult, StoredUserDocument, UserDocumentKind } from '../src/native-storage.ts';
import { initializeFileContent, persistAuthoredState, reloadFileContent, type UserStorageBackend } from '../src/file-content-store.ts';
import { STORAGE_KEY } from '../src/state.ts';

const builtins: CheatSheet[] = [{ id: 'my-work', title: 'My Work', aliases: [], applications: [], related: [], sections: [{ id: 'notes', title: 'Notes', items: [] }] }, { id: 'git', title: 'Git', aliases: [], applications: [], related: [], sections: [{ id: 'basic', title: 'Basic', items: [] }] }];

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

class MemoryBackend implements UserStorageBackend {
  docs = new Map<string, StoredUserDocument>();
  writes: string[] = [];
  failNextWrite = false;
  root = '/tmp/cheat-dock-test/user-data';
  key(kind: UserDocumentKind, id: string) { return `${kind}:${id}`; }
  async load(): Promise<LoadUserDocumentsResult> {
    return { rootPath: this.root, documents: [...this.docs.values()], issues: [] };
  }
  async write(kind: UserDocumentKind, id: string, content: string, expectedContent: string | null) {
    if (this.failNextWrite) { this.failNextWrite = false; throw { code: 'io', message: 'simulated write failure' }; }
    const key = this.key(kind, id);
    const current = this.docs.get(key);
    if ((current?.content ?? null) !== expectedContent && current?.content !== content) throw { code: 'conflict', message: 'external edit', relativePath: `${kind === 'sheet' ? 'cheats' : 'overlays'}/${id}.md` };
    const document = { kind, id, content, relativePath: `${kind === 'sheet' ? 'cheats' : 'overlays'}/${id}.md` } as StoredUserDocument;
    this.docs.set(key, document);
    this.writes.push(key);
    return document;
  }
  async delete(kind: UserDocumentKind, id: string, expectedContent: string | null) {
    const key = this.key(kind, id);
    const current = this.docs.get(key);
    if (current && current.content !== expectedContent) throw { code: 'conflict', message: 'external edit' };
    this.docs.delete(key);
  }
  async path() { return this.root; }
}

function legacyState(): AppState {
  return {
    ...structuredClone(EMPTY_STATE),
    userSheets: [{ id: 'user-alpha', title: 'Alpha', aliases: [], applications: [], related: [], userOwned: true, sections: [{ id: 'notes', title: 'Notes', userOwned: true, items: [{ id: 'user-one', title: 'One', kind: 'shortcut', shortcut: 'Command + K', aliases: [], tags: [], userOwned: true }] }] }],
    overlays: { git: [{ id: 'personal', title: 'Personal', userOwned: true, items: [{ id: 'user-status', title: 'Status', kind: 'command', command: 'git status --short', aliases: [], tags: [], userOwned: true }] }] }
  };
}

async function migrated() {
  const storage = new MemoryStorage();
  const backend = new MemoryBackend();
  const legacy = legacyState();
  storage.setItem(STORAGE_KEY, JSON.stringify(legacy));
  const session = await initializeFileContent(legacy, builtins, storage, backend);
  return { storage, backend, session };
}

test('successful migration writes Markdown, verifies reload, backs up legacy JSON, then stores UI-only localStorage', async () => {
  const storage = new MemoryStorage();
  const backend = new MemoryBackend();
  const legacy = legacyState();
  const legacyRaw = JSON.stringify(legacy);
  storage.setItem(STORAGE_KEY, legacyRaw);
  const session = await initializeFileContent(legacy, builtins, storage, backend);
  assert.equal(session.mode, 'files');
  assert.equal(session.state.userSheets[0]?.title, 'Alpha');
  assert.equal(backend.docs.size, 2);
  assert.equal(storage.getItem(LEGACY_BACKUP_KEY), legacyRaw);
  assert.match(storage.getItem(MIGRATION_MARKER_KEY) ?? '', /verifiedAt/);
  const persisted = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as AppState;
  assert.deepEqual(persisted.userSheets, []);
  assert.deepEqual(persisted.overlays, {});
});

test('migration write failure retains legacy localStorage and remains retryable', async () => {
  const storage = new MemoryStorage();
  const backend = new MemoryBackend();
  const legacy = legacyState();
  const raw = JSON.stringify(legacy);
  storage.setItem(STORAGE_KEY, raw);
  backend.failNextWrite = true;
  const failed = await initializeFileContent(legacy, builtins, storage, backend);
  assert.equal(failed.mode, 'legacy');
  assert.equal(storage.getItem(STORAGE_KEY), raw);
  assert.equal(storage.getItem(MIGRATION_MARKER_KEY), null);
  const retry = await initializeFileContent(legacy, builtins, storage, backend);
  assert.equal(retry.mode, 'files');
});

test('GUI rename updates the same stable-ID file instead of creating a second file', async () => {
  const { storage, backend, session } = await migrated();
  const beforeKeys = [...backend.docs.keys()];
  const renamed = renameCustomSheet(session.state, [...builtins, ...session.state.userSheets], 'user-alpha', 'Renamed Alpha');
  assert.equal(renamed.ok, true);
  const saved = await persistAuthoredState(session, renamed.state, builtins, storage, backend);
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.deepEqual([...backend.docs.keys()], beforeKeys);
  assert.match(backend.docs.get('sheet:user-alpha')?.content ?? '', /title: Renamed Alpha/);
  assert.equal(saved.session.state.userSheets[0]?.title, 'Renamed Alpha');
});

test('custom Sheet item add, edit and delete all persist to its Markdown file', async () => {
  const { storage, backend, session } = await migrated();
  const added: AppState = structuredClone(session.state);
  added.userSheets[0]!.sections[0]!.items.push({ id: 'user-two', title: 'Two', kind: 'command', command: 'printf "a  b"', aliases: [], tags: [], userOwned: true });
  const savedAdd = await persistAuthoredState(session, added, builtins, storage, backend);
  assert.equal(savedAdd.ok, true);
  if (!savedAdd.ok) return;
  assert.match(backend.docs.get('sheet:user-alpha')?.content ?? '', /user-two/);
  assert.match(backend.docs.get('sheet:user-alpha')?.content ?? '', /printf "a  b"/);

  const edited: AppState = structuredClone(savedAdd.session.state);
  edited.userSheets[0]!.sections[0]!.items.find((item) => item.id === 'user-two')!.command = 'printf "c  d"';
  const savedEdit = await persistAuthoredState(savedAdd.session, edited, builtins, storage, backend);
  assert.equal(savedEdit.ok, true);
  if (!savedEdit.ok) return;
  assert.match(backend.docs.get('sheet:user-alpha')?.content ?? '', /printf "c  d"/);

  const deleted: AppState = structuredClone(savedEdit.session.state);
  deleted.userSheets[0]!.sections[0]!.items = deleted.userSheets[0]!.sections[0]!.items.filter((item) => item.id !== 'user-two');
  const savedDelete = await persistAuthoredState(savedEdit.session, deleted, builtins, storage, backend);
  assert.equal(savedDelete.ok, true);
  assert.doesNotMatch(backend.docs.get('sheet:user-alpha')?.content ?? '', /user-two/);
});

test('built-in overlay item add, edit and delete persist without mutating built-in Markdown', async () => {
  const { storage, backend, session } = await migrated();
  const originalBuiltin = JSON.stringify(builtins[1]);
  const added: AppState = structuredClone(session.state);
  added.overlays.git![0]!.items.push({ id: 'user-log', title: 'Log', kind: 'command', command: 'git log --oneline', aliases: [], tags: [], userOwned: true });
  const savedAdd = await persistAuthoredState(session, added, builtins, storage, backend);
  assert.equal(savedAdd.ok, true);
  if (!savedAdd.ok) return;
  assert.match(backend.docs.get('overlay:git')?.content ?? '', /git log --oneline/);

  const edited: AppState = structuredClone(savedAdd.session.state);
  edited.overlays.git![0]!.items.find((item) => item.id === 'user-log')!.command = 'git log  --oneline';
  const savedEdit = await persistAuthoredState(savedAdd.session, edited, builtins, storage, backend);
  assert.equal(savedEdit.ok, true);
  if (!savedEdit.ok) return;
  assert.match(backend.docs.get('overlay:git')?.content ?? '', /git log  --oneline/);

  const deleted: AppState = structuredClone(savedEdit.session.state);
  deleted.overlays.git![0]!.items = deleted.overlays.git![0]!.items.filter((item) => item.id !== 'user-log');
  const savedDelete = await persistAuthoredState(savedEdit.session, deleted, builtins, storage, backend);
  assert.equal(savedDelete.ok, true);
  assert.doesNotMatch(backend.docs.get('overlay:git')?.content ?? '', /user-log/);
  assert.equal(JSON.stringify(builtins[1]), originalBuiltin);
});

test('external modification conflict cannot be overwritten by simply pressing Save again', async () => {
  const { storage, backend, session } = await migrated();
  const disk = backend.docs.get('sheet:user-alpha')!;
  const external = { ...disk, content: disk.content.replace('title: Alpha', 'title: External') };
  backend.docs.set('sheet:user-alpha', external);
  const renamed = renameCustomSheet(session.state, [...builtins, ...session.state.userSheets], 'user-alpha', 'GUI Edit');
  assert.equal(renamed.ok, true);

  const first = await persistAuthoredState(session, renamed.state, builtins, storage, backend);
  assert.equal(first.ok, false);
  if (first.ok) return;
  assert.equal(first.error.code, 'conflict');
  assert.equal(first.session.state.userSheets[0]?.title, 'Alpha');
  assert.doesNotMatch(backend.docs.get('sheet:user-alpha')?.content ?? '', /GUI Edit/);

  const second = await persistAuthoredState(first.session, renamed.state, builtins, storage, backend);
  assert.equal(second.ok, false);
  assert.equal(backend.docs.get('sheet:user-alpha')?.content, external.content);

  const reloaded = await reloadFileContent(first.session, builtins, storage, backend);
  assert.equal(reloaded.state.userSheets[0]?.title, 'External');
});

test('external formatting is not canonicalized when another document changes', async () => {
  const { storage, backend, session } = await migrated();
  const sheet = backend.docs.get('sheet:user-alpha')!;
  const externallyFormatted = { ...sheet, content: sheet.content.replace('## Notes\n', '## Notes\n\n') };
  backend.docs.set('sheet:user-alpha', externallyFormatted);
  backend.writes = [];

  const next: AppState = structuredClone(session.state);
  next.overlays.git![0]!.items[0]!.command = 'git status  --short';
  const saved = await persistAuthoredState(session, next, builtins, storage, backend);
  assert.equal(saved.ok, true);
  assert.deepEqual(backend.writes, ['overlay:git']);
  assert.equal(backend.docs.get('sheet:user-alpha')?.content, externallyFormatted.content);
});

test('custom Sheet delete removes its file only after state mutation is accepted', async () => {
  const { storage, backend, session } = await migrated();
  const deleted = deleteCustomSheet(session.state, 'user-alpha');
  assert.equal(deleted.ok, true);
  const saved = await persistAuthoredState(session, deleted.state, builtins, storage, backend);
  assert.equal(saved.ok, true);
  assert.equal(backend.docs.has('sheet:user-alpha'), false);
});

test('new custom Sheet persists as a new Markdown file with a stable safe ID despite Unicode title', async () => {
  const storage = new MemoryStorage();
  const backend = new MemoryBackend();
  storage.setItem(STORAGE_KEY, JSON.stringify(structuredClone(EMPTY_STATE)));
  const session = await initializeFileContent(structuredClone(EMPTY_STATE), builtins, storage, backend);
  const created = createCustomSheet(session.state, [...builtins, ...session.state.userSheets], '日本語 Project', 'user-unicode');
  assert.equal(created.ok, true);
  const saved = await persistAuthoredState(session, created.state, builtins, storage, backend);
  assert.equal(saved.ok, true);
  assert.match(backend.docs.get('sheet:user-unicode')?.content ?? '', /title: 日本語 Project/);
});
