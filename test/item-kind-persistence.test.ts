import test from 'node:test';
import assert from 'node:assert/strict';
import type { AppState, CheatSheet } from '../src/model.ts';
import { EMPTY_STATE } from '../src/model.ts';
import { editPersonalItem, itemFromDraft } from '../src/personal-items.ts';
import { initializeFileContent, persistAuthoredState, reloadFileContent, type UserStorageBackend } from '../src/file-content-store.ts';
import { MIGRATION_MARKER_KEY } from '../src/migration.ts';
import type { LoadUserDocumentsResult, StoredUserDocument, UserDocumentKind } from '../src/native-storage.ts';

const builtins: CheatSheet[] = [{
  id: 'my-work', title: 'My Work', aliases: [], applications: [], related: [],
  sections: [{ id: 'notes', title: 'Notes', items: [] }]
}];

class MemoryStorage {
  values = new Map<string, string>([[MIGRATION_MARKER_KEY, JSON.stringify({ version: 1, verifiedAt: 'test' })]]);
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

class MemoryBackend implements UserStorageBackend {
  docs = new Map<string, StoredUserDocument>();
  key(kind: UserDocumentKind, id: string) { return `${kind}:${id}`; }
  async load(): Promise<LoadUserDocumentsResult> {
    return { rootPath: '/tmp/cheat-dock-test/user-data', documents: [...this.docs.values()], issues: [] };
  }
  async write(kind: UserDocumentKind, id: string, content: string, expectedContent: string | null) {
    const key = this.key(kind, id);
    const current = this.docs.get(key);
    if ((current?.content ?? null) !== expectedContent && current?.content !== content) throw { code: 'conflict', message: 'external edit' };
    const document: StoredUserDocument = { kind, id, relativePath: `${kind === 'sheet' ? 'cheats' : 'overlays'}/${id}.md`, content };
    this.docs.set(key, document);
    return document;
  }
  async delete(kind: UserDocumentKind, id: string, expectedContent: string | null) {
    const key = this.key(kind, id);
    const current = this.docs.get(key);
    if (current && current.content !== expectedContent) throw { code: 'conflict', message: 'external edit' };
    this.docs.delete(key);
  }
  async path() { return '/tmp/cheat-dock-test/user-data'; }
}

function stateWithSheet(): AppState {
  return {
    ...structuredClone(EMPTY_STATE),
    userSheets: [{
      id: 'user-alpha', title: 'Alpha', aliases: [], applications: [], related: [], userOwned: true,
      sections: [{ id: 'notes', title: 'Notes', userOwned: true, items: [] }]
    }]
  };
}

async function fileSession() {
  const storage = new MemoryStorage();
  const backend = new MemoryBackend();
  const initial = stateWithSheet();
  const sheetMarkdown = `---\nid: user-alpha\ntitle: Alpha\n---\n\n## Notes\n`;
  backend.docs.set('sheet:user-alpha', { kind: 'sheet', id: 'user-alpha', relativePath: 'cheats/user-alpha.md', content: sheetMarkdown });
  const session = await initializeFileContent(initial, builtins, storage, backend);
  return { storage, backend, session };
}

test('GUI Shortcut persists to Markdown with no command and survives reload', async () => {
  const { storage, backend, session } = await fileSession();
  const item = itemFromDraft('user-shortcut', {
    title: 'Open Palette', section: 'Notes', kind: 'shortcut', shortcut: 'Command + Shift + P', command: 'should be ignored', description: ''
  });
  assert.ok(item);
  const next = structuredClone(session.state);
  next.userSheets[0]!.sections[0]!.items.push(item!);
  const saved = await persistAuthoredState(session, next, builtins, storage, backend);
  assert.equal(saved.ok, true);
  const markdown = backend.docs.get('sheet:user-alpha')?.content ?? '';
  assert.match(markdown, /kind: shortcut/);
  assert.match(markdown, /shortcut: Command \+ Shift \+ P/);
  assert.doesNotMatch(markdown, /- command:/);
  const reloaded = await reloadFileContent(saved.session, builtins, storage, backend);
  const loaded = reloaded.state.userSheets[0]?.sections[0]?.items[0];
  assert.equal(loaded?.kind, 'shortcut');
  assert.equal(loaded?.shortcut, 'Command + Shift + P');
  assert.equal(loaded?.command, undefined);
});

test('GUI Command persists literal repeated spaces with no shortcut and survives reload', async () => {
  const { storage, backend, session } = await fileSession();
  const raw = `printf '%s  %s' "$A" "$B"`;
  const item = itemFromDraft('user-command', {
    title: 'Print values', section: 'Notes', kind: 'command', shortcut: 'Command + K', command: raw, description: ''
  });
  assert.ok(item);
  const next = structuredClone(session.state);
  next.userSheets[0]!.sections[0]!.items.push(item!);
  const saved = await persistAuthoredState(session, next, builtins, storage, backend);
  assert.equal(saved.ok, true);
  const markdown = backend.docs.get('sheet:user-alpha')?.content ?? '';
  assert.match(markdown, /kind: command/);
  assert.match(markdown, /command: printf '%s  %s'/);
  assert.doesNotMatch(markdown, /- shortcut:/);
  const reloaded = await reloadFileContent(saved.session, builtins, storage, backend);
  assert.equal(reloaded.state.userSheets[0]?.sections[0]?.items[0]?.command, raw);
});

test('explicit type change rewrites only the edited item to selected-kind semantics', async () => {
  const { storage, backend, session } = await fileSession();
  const seeded = structuredClone(session.state);
  seeded.userSheets[0]!.sections[0]!.items.push({
    id: 'user-mixed', title: 'Mixed', kind: 'shortcut', shortcut: 'Command + K', command: 'git status', aliases: [], tags: [], userOwned: true
  });
  const first = await persistAuthoredState(session, seeded, builtins, storage, backend);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const changed = editPersonalItem(first.session.state, 'user-alpha', 'notes', 'user-mixed', {
    title: 'Mixed', section: 'Notes', kind: 'command', shortcut: 'Command + K', command: 'git status', description: ''
  });
  const saved = await persistAuthoredState(first.session, changed, builtins, storage, backend);
  assert.equal(saved.ok, true);
  const markdown = backend.docs.get('sheet:user-alpha')?.content ?? '';
  assert.match(markdown, /kind: command/);
  assert.match(markdown, /command: git status/);
  assert.doesNotMatch(markdown, /shortcut: Command \+ K/);
});
