import test from 'node:test';
import assert from 'node:assert/strict';
import { searchSheets } from '../src/search.ts';
import type { CheatSheet } from '../src/model.ts';

const sheets: CheatSheet[] = [{ id:'git', title:'Git', aliases:[], applications:[], related:[], sections:[{ id:'history', title:'History', items:[{ id:'reset', title:'Reset commit', localizedTitles:{ ja:'コミットを戻す' }, kind:'command', command:'git reset', description:'Move HEAD', aliases:['undo commit','戻す'], tags:['commit'] }] }] }];

test('search is case and whitespace normalized', () => {
  assert.equal(searchSheets(sheets, '  RESET ')[0]?.item.id, 'reset');
});

test('search handles mixed Japanese and English tokens predictably', () => {
  assert.equal(searchSheets(sheets, 'commit 戻す', 'ja')[0]?.item.id, 'reset');
});

test('search indexes localized labels without losing English search', () => {
  assert.equal(searchSheets(sheets, 'コミット 戻す', 'ja')[0]?.item.id, 'reset');
  assert.equal(searchSheets(sheets, 'Reset', 'ja')[0]?.item.id, 'reset');
});
