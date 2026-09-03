import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_STATE } from '../src/model.ts';
import {
  deletePersonalItem,
  editPersonalItem,
  editorKindForItem,
  inactiveItemValueWarning,
  itemFromDraft,
  normalizeItemDraft
} from '../src/personal-items.ts';
import type { AppState, CheatItem, CheatSheet } from '../src/model.ts';
import { loadState, saveState } from '../src/state.ts';

const shortcutDraft = {
  title: '  Deploy   prod  ', section: ' Ops ', kind: 'shortcut' as const,
  shortcut: ' Command + Enter ', command: '', description: ' ship it '
};

const commandDraft = {
  title: '  Show   status  ', section: ' Ops ', kind: 'command' as const,
  shortcut: '', command: `printf '%s  %s' "$A" "$B"`, description: ' literal command '
};

test('shortcut draft normalizes labels while keeping shortcut as the only primary value', () => {
  const item = itemFromDraft('user-1', shortcutDraft);
  assert.equal(item?.id, 'user-1');
  assert.equal(item?.title, 'Deploy prod');
  assert.equal(item?.kind, 'shortcut');
  assert.equal(item?.shortcut, 'Command + Enter');
  assert.equal(item?.command, undefined);
  assert.equal(item?.description, 'ship it');
});

test('command draft keeps literal internal whitespace and removes inactive shortcut data', () => {
  const base: CheatItem = {
    id: 'user-command', title: 'Legacy mixed', kind: 'command', shortcut: 'Command + K', command: 'git status', aliases: [], tags: [], userOwned: true
  };
  const item = itemFromDraft(base.id, commandDraft, base);
  assert.equal(item?.kind, 'command');
  assert.equal(item?.command, `printf '%s  %s' "$A" "$B"`);
  assert.equal(item?.shortcut, undefined);
});

test('selected kind primary value is required for new GUI items', () => {
  assert.equal(normalizeItemDraft({ ...shortcutDraft, shortcut: '' }), null);
  assert.equal(normalizeItemDraft({ ...commandDraft, command: '' }), null);
});

test('editor kind follows authoritative kind even when both legacy fields exist', () => {
  const shortcutMixed: CheatItem = { id: 'mixed-shortcut', title: 'Mixed', kind: 'shortcut', shortcut: 'Command + K', command: 'git status', aliases: [], tags: [] };
  const commandMixed: CheatItem = { ...shortcutMixed, id: 'mixed-command', kind: 'command' };
  assert.equal(editorKindForItem(shortcutMixed), 'shortcut');
  assert.equal(editorKindForItem(commandMixed), 'command');
});

test('inactive legacy or switched value produces a compact data-loss warning', () => {
  assert.match(inactiveItemValueWarning('shortcut', 'Command + K', 'git status') ?? '', /remove the Command value/);
  assert.match(inactiveItemValueWarning('command', 'Command + K', 'git status') ?? '', /remove the Shortcut value/);
  assert.equal(inactiveItemValueWarning('shortcut', 'Command + K', ''), undefined);
});

function userState(): AppState {
  const sheet: CheatSheet = {
    id: 'user-sheet', title: 'My Sheet', aliases: [], applications: [], related: [], userOwned: true,
    sections: [{ id: 'notes', title: 'Notes', userOwned: true, items: [
      { id: 'user-1', title: 'Old', kind: 'shortcut', shortcut: 'Command + C', aliases: [], tags: [], userOwned: true }
    ] }]
  };
  return { ...structuredClone(EMPTY_STATE), userSheets: [sheet], recent: { 'user-sheet': ['user-1'] } };
}

test('user shortcut edit updates fields and can move sections', () => {
  const next = editPersonalItem(userState(), 'user-sheet', 'notes', 'user-1', shortcutDraft);
  const moved = next.userSheets[0]?.sections.find((section) => section.id === 'ops')?.items[0];
  assert.equal(moved?.title, 'Deploy prod');
  assert.equal(moved?.kind, 'shortcut');
  assert.equal(moved?.shortcut, 'Command + Enter');
  assert.equal(moved?.command, undefined);
  assert.equal(moved?.id, 'user-1');
});

test('explicit type switch from Shortcut to Command persists the new invariant', () => {
  const next = editPersonalItem(userState(), 'user-sheet', 'notes', 'user-1', commandDraft);
  const moved = next.userSheets[0]?.sections.find((section) => section.id === 'ops')?.items[0];
  assert.equal(moved?.kind, 'command');
  assert.equal(moved?.shortcut, undefined);
  assert.equal(moved?.command, `printf '%s  %s' "$A" "$B"`);
});

test('user item delete removes it and its recent reference', () => {
  const next = deletePersonalItem(userState(), 'user-sheet', 'notes', 'user-1');
  assert.equal(next.userSheets[0]?.sections[0]?.items.length, 0);
  assert.deepEqual(next.recent['user-sheet'], []);
});

test('built-in item IDs cannot be edited or deleted through personal state mutations', () => {
  const state = structuredClone(EMPTY_STATE);
  assert.equal(editPersonalItem(state, 'git', 'working-tree', 'status', shortcutDraft), state);
  assert.equal(deletePersonalItem(state, 'git', 'working-tree', 'status'), state);
});

class MemoryStorage {
  value: string | null = null;
  getItem() { return this.value; }
  setItem(_key: string, value: string) { this.value = value; }
}

test('edited personal item survives save/load persistence', () => {
  const storage = new MemoryStorage();
  const edited = editPersonalItem(userState(), 'user-sheet', 'notes', 'user-1', commandDraft);
  saveState(storage, edited);
  const loaded = loadState(storage);
  const item = loaded.userSheets[0]?.sections.find((section) => section.id === 'ops')?.items[0];
  assert.equal(item?.kind, 'command');
  assert.equal(item?.command, `printf '%s  %s' "$A" "$B"`);
  assert.equal(item?.shortcut, undefined);
});

test('deleted personal item stays deleted after save/load persistence', () => {
  const storage = new MemoryStorage();
  const deleted = deletePersonalItem(userState(), 'user-sheet', 'notes', 'user-1');
  saveState(storage, deleted);
  const loaded = loadState(storage);
  assert.equal(loaded.userSheets[0]?.sections[0]?.items.length, 0);
});
