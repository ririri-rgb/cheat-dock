import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_STATE } from '../src/model.ts';
import { deletePersonalItem, editPersonalItem, itemFromDraft } from '../src/personal-items.ts';
import type { AppState, CheatSheet } from '../src/model.ts';
import { loadState, saveState } from '../src/state.ts';

const draft = { title: '  Deploy   prod  ', section: ' Ops ', shortcut: ' Command + Enter ', command: '', description: ' ship it ' };

test('item draft normalizes user input without changing its ID', () => {
  const item = itemFromDraft('user-1', draft);
  assert.equal(item?.id, 'user-1');
  assert.equal(item?.title, 'Deploy prod');
  assert.equal(item?.shortcut, 'Command + Enter');
  assert.equal(item?.description, 'ship it');
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

test('user item edit updates fields and can move sections', () => {
  const next = editPersonalItem(userState(), 'user-sheet', 'notes', 'user-1', draft);
  const moved = next.userSheets[0]?.sections.find((section) => section.id === 'ops')?.items[0];
  assert.equal(moved?.title, 'Deploy prod');
  assert.equal(moved?.shortcut, 'Command + Enter');
  assert.equal(moved?.id, 'user-1');
});

test('user item delete removes it and its recent reference', () => {
  const next = deletePersonalItem(userState(), 'user-sheet', 'notes', 'user-1');
  assert.equal(next.userSheets[0]?.sections[0]?.items.length, 0);
  assert.deepEqual(next.recent['user-sheet'], []);
});

test('built-in item IDs cannot be edited or deleted through personal state mutations', () => {
  const state = structuredClone(EMPTY_STATE);
  assert.equal(editPersonalItem(state, 'git', 'working-tree', 'status', draft), state);
  assert.equal(deletePersonalItem(state, 'git', 'working-tree', 'status'), state);
});

class MemoryStorage {
  value: string | null = null;
  getItem() { return this.value; }
  setItem(_key: string, value: string) { this.value = value; }
}

test('edited personal item survives save/load persistence', () => {
  const storage = new MemoryStorage();
  const edited = editPersonalItem(userState(), 'user-sheet', 'notes', 'user-1', draft);
  saveState(storage, edited);
  const loaded = loadState(storage);
  assert.equal(loaded.userSheets[0]?.sections.find((section) => section.id === 'ops')?.items[0]?.title, 'Deploy prod');
});

test('deleted personal item stays deleted after save/load persistence', () => {
  const storage = new MemoryStorage();
  const deleted = deletePersonalItem(userState(), 'user-sheet', 'notes', 'user-1');
  saveState(storage, deleted);
  const loaded = loadState(storage);
  assert.equal(loaded.userSheets[0]?.sections[0]?.items.length, 0);
});
