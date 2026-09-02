import test from 'node:test';
import assert from 'node:assert/strict';
import type { AppState, CheatSheet } from '../src/model.ts';
import { EMPTY_STATE } from '../src/model.ts';
import {
  LEGACY_BACKUP_KEY,
  MIGRATION_MARKER_KEY,
  legacyHasUserContent,
  markMigrationCompleted,
  migrationCompleted,
  planLegacyMigration,
  verifyMigratedDocuments
} from '../src/migration.ts';
import { documentsFromState, parseLoadedUserDocuments } from '../src/user-markdown.ts';

const builtins: CheatSheet[] = [{ id: 'my-work', title: 'My Work', aliases: [], applications: [], related: [], sections: [{ id: 'notes', title: 'Notes', items: [] }] }, { id: 'git', title: 'Git', aliases: [], applications: [], related: [], sections: [{ id: 'basic', title: 'Basic', items: [] }] }];

function legacyState(): AppState {
  return {
    ...structuredClone(EMPTY_STATE),
    pinned: ['git', 'user-project'],
    recent: { git: ['user-status'] },
    userSheets: [{
      id: 'user-project', title: 'Project A', aliases: [], applications: [], related: [], userOwned: true,
      sections: [{ id: 'notes', title: 'Notes', userOwned: true, items: [{ id: 'user-build', title: 'Build', kind: 'command', command: 'make build', aliases: [], tags: [], userOwned: true }] }]
    }],
    overlays: {
      git: [{ id: 'personal', title: 'Personal', userOwned: true, items: [{ id: 'user-status', title: 'Short status', kind: 'command', command: 'git status --short', aliases: [], tags: [], userOwned: true }] }]
    }
  };
}

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

test('empty legacy state has no authored content and produces no writes', () => {
  const empty = structuredClone(EMPTY_STATE);
  const files = parseLoadedUserDocuments([], [], builtins);
  assert.equal(legacyHasUserContent(empty), false);
  const plan = planLegacyMigration(empty, builtins, files);
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.writes, []);
});

test('migration plans custom Sheet and built-in overlay without touching UI state', () => {
  const legacy = legacyState();
  const files = parseLoadedUserDocuments([], [], builtins);
  const plan = planLegacyMigration(legacy, builtins, files);
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.writes.map((doc) => `${doc.kind}:${doc.id}`), ['overlay:git', 'sheet:user-project']);
  assert.deepEqual(legacy.pinned, ['git', 'user-project']);
  assert.deepEqual(legacy.recent.git, ['user-status']);
});

test('interrupted migration is idempotent when an already-written file matches', () => {
  const legacy = legacyState();
  const desired = documentsFromState(legacy, builtins);
  const first = desired[0]!;
  const files = parseLoadedUserDocuments([{ kind: first.kind, id: first.id, relativePath: `${first.kind === 'sheet' ? 'cheats' : 'overlays'}/${first.id}.md`, content: first.content }], [], builtins);
  const retry = planLegacyMigration(legacy, builtins, files);
  assert.equal(retry.ok, true);
  assert.equal(retry.writes.length, desired.length - 1);
});

test('migration refuses to overwrite a conflicting existing file and remains retryable', () => {
  const legacy = legacyState();
  const desired = documentsFromState(legacy, builtins);
  const custom = desired.find((doc) => doc.kind === 'sheet')!;
  const conflicting = custom.content.replace('title: Project A', 'title: Project B');
  const files = parseLoadedUserDocuments([{ kind: 'sheet', id: custom.id, relativePath: `cheats/${custom.id}.md`, content: conflicting }], [], builtins);
  const plan = planLegacyMigration(legacy, builtins, files);
  assert.equal(plan.ok, false);
  assert.equal(plan.writes.length, 0);
  assert.match(plan.errors.join('\n'), /differs from legacy/);
});

test('legacy duplicate built-in title blocks migration instead of losing historical data', () => {
  const legacy = legacyState();
  legacy.userSheets[0] = { ...legacy.userSheets[0]!, title: ' Ｍｙ　Ｗｏｒｋ ' };
  const plan = planLegacyMigration(legacy, builtins, parseLoadedUserDocuments([], [], builtins));
  assert.equal(plan.ok, false);
  assert.match(plan.errors[0] ?? '', /conflicts with built-in/);
});

test('migration is only marked complete after reloaded documents verify', () => {
  const legacy = legacyState();
  const desired = documentsFromState(legacy, builtins);
  const loaded = parseLoadedUserDocuments(desired.map((doc) => ({
    kind: doc.kind,
    id: doc.id,
    relativePath: `${doc.kind === 'sheet' ? 'cheats' : 'overlays'}/${doc.id}.md`,
    content: doc.content
  })), [], builtins);
  assert.deepEqual(verifyMigratedDocuments(desired, loaded, builtins), { ok: true });
  const storage = new MemoryStorage();
  const legacyRaw = JSON.stringify(legacy);
  markMigrationCompleted(storage, legacyRaw, '2026-09-02T00:00:00.000Z');
  assert.equal(migrationCompleted(storage), true);
  assert.equal(storage.getItem(LEGACY_BACKUP_KEY), legacyRaw);
  assert.match(storage.getItem(MIGRATION_MARKER_KEY) ?? '', /verifiedAt/);
});

test('failed verification leaves migration marker absent and legacy recoverable', () => {
  const legacy = legacyState();
  const desired = documentsFromState(legacy, builtins);
  const loaded = parseLoadedUserDocuments([], [], builtins);
  assert.equal(verifyMigratedDocuments(desired, loaded, builtins).ok, false);
  const storage = new MemoryStorage();
  storage.setItem('cheat-dock-state-v1', JSON.stringify(legacy));
  assert.equal(migrationCompleted(storage), false);
  assert.equal(storage.getItem('cheat-dock-state-v1'), JSON.stringify(legacy));
});
