import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_STATE, type CheatSheet } from '../src/model.ts';
import {
  createCustomSheet,
  deleteCustomSheet,
  fallbackSheetIdAfterDelete,
  renameCustomSheet,
  sheetTitleKey,
  validateCustomSheetTitle
} from '../src/custom-sheets.ts';
import { loadState, saveState } from '../src/state.ts';

const builtins: CheatSheet[] = [
  { id: 'my-work', title: 'My Work', aliases: [], applications: [], related: [], sections: [] },
  { id: 'git', title: 'Git', aliases: [], applications: [], related: [], sections: [] }
];

function createOne() {
  return createCustomSheet(structuredClone(EMPTY_STATE), builtins, 'Project Notes', 'user-project');
}

test('creates a custom Sheet with normalized title', () => {
  const result = createCustomSheet(structuredClone(EMPTY_STATE), builtins, '  Project   Notes  ', 'user-project');
  assert.equal(result.ok, true);
  assert.equal(result.sheet?.title, 'Project Notes');
  assert.equal(result.state.userSheets[0]?.userOwned, true);
});

test('rejects built-in and user duplicate titles with case, whitespace and NFKC normalization', () => {
  assert.equal(validateCustomSheetTitle('my work', builtins).ok, false);
  assert.equal(validateCustomSheetTitle(' My   Work ', builtins).ok, false);
  assert.equal(validateCustomSheetTitle('Ｍｙ　Ｗｏｒｋ', builtins).ok, false);
  const created = createOne();
  const all = [...builtins, ...created.state.userSheets];
  assert.equal(validateCustomSheetTitle('project notes', all).ok, false);
  assert.equal(sheetTitleKey(' Ｇｉｔ '), 'git');
});

test('renames only custom Sheets and rejects duplicate rename', () => {
  const created = createOne();
  const all = [...builtins, ...created.state.userSheets];
  const renamed = renameCustomSheet(created.state, all, 'user-project', 'Release Notes');
  assert.equal(renamed.ok, true);
  assert.equal(renamed.state.userSheets[0]?.title, 'Release Notes');
  assert.equal(renameCustomSheet(created.state, all, 'user-project', 'Git').ok, false);
  assert.equal(renameCustomSheet(created.state, all, 'git', 'Other').ok, false);
});

test('delete custom Sheet cleans all local references and related links', () => {
  const created = createOne();
  const state = {
    ...created.state,
    pinned: ['git', 'user-project'],
    recent: { 'user-project': ['x'], git: ['status'] },
    expanded: { 'user-project': ['notes'], git: ['base'] },
    overlays: { 'user-project': [{ id: 'extra', title: 'Extra', items: [] }], git: [] },
    userSheets: [
      ...created.state.userSheets,
      { id: 'user-other', title: 'Other', aliases: [], applications: [], related: ['user-project'], sections: [], userOwned: true }
    ]
  };
  const deleted = deleteCustomSheet(state, 'user-project');
  assert.equal(deleted.ok, true);
  assert.deepEqual(deleted.state.pinned, ['git']);
  assert.equal(deleted.state.recent['user-project'], undefined);
  assert.equal(deleted.state.expanded['user-project'], undefined);
  assert.equal(deleted.state.overlays['user-project'], undefined);
  assert.equal(deleted.state.userSheets.some((sheet) => sheet.id === 'user-project'), false);
  assert.deepEqual(deleted.state.userSheets.find((sheet) => sheet.id === 'user-other')?.related, []);
});

test('built-in Sheet cannot be deleted and deleting current custom Sheet falls back to built-in My Work', () => {
  const created = createOne();
  assert.equal(deleteCustomSheet(created.state, 'my-work').ok, false);
  const all = [...builtins, ...created.state.userSheets];
  assert.equal(fallbackSheetIdAfterDelete('user-project', 'user-project', all), 'my-work');
  assert.equal(fallbackSheetIdAfterDelete('user-project', 'git', all), 'git');
});

test('rename and delete survive storage round-trips', () => {
  const created = createOne();
  const renamed = renameCustomSheet(created.state, [...builtins, ...created.state.userSheets], 'user-project', 'Renamed');
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value); }
  };
  saveState(storage, renamed.state);
  const loaded = loadState(storage);
  assert.equal(loaded.userSheets[0]?.title, 'Renamed');
  const deleted = deleteCustomSheet(loaded, 'user-project');
  saveState(storage, deleted.state);
  assert.equal(loadState(storage).userSheets.length, 0);
});
