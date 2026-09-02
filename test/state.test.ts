import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_STATE } from '../src/model.ts';
import { loadState, mergeSheet, recordRecent, togglePin } from '../src/state.ts';
import type { CheatSheet } from '../src/model.ts';

test('recent history is per sheet, deduplicated, and capped', () => {
  let state = structuredClone(EMPTY_STATE);
  for (let i = 0; i < 9; i++) state = recordRecent(state, 'git', `i${i}`);
  state = recordRecent(state, 'excel', 'x');
  assert.equal(state.recent.git?.length, 7);
  assert.deepEqual(state.recent.excel, ['x']);
});

test('corrupted storage falls back safely', () => {
  const state = loadState({ getItem: () => '{bad json' });
  assert.equal(state.version, 1);
});

test('pin toggles without duplicates', () => {
  const initial = { ...structuredClone(EMPTY_STATE), pinned: ['git'] };
  assert.deepEqual(togglePin(initial, 'git').pinned, []);
  assert.deepEqual(togglePin(togglePin(initial, 'git'), 'git').pinned, ['git']);
});

test('user overlays do not mutate built-in sheet', () => {
  const sheet: CheatSheet = { id:'git', title:'Git', aliases:[], applications:[], related:[], sections:[{ id:'base', title:'Base', items:[] }] };
  const merged = mergeSheet(sheet, [{ id:'base', title:'Base', items:[{ id:'u', title:'Mine', kind:'command', aliases:[], tags:[] }] }]);
  assert.equal(merged.sections[0]?.items.length, 1);
  assert.equal(sheet.sections[0]?.items.length, 0);
});
