import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLocale, itemLabel, sheetLabel } from '../src/locale.ts';
import type { CheatItem, CheatSheet } from '../src/model.ts';

const item: CheatItem = { id: 'copy', title: 'Copy', localizedTitles: { ja: 'コピー' }, kind: 'shortcut', shortcut: '⌘C', aliases: [], tags: [] };
const sheet: CheatSheet = { id: 'excel', title: 'Excel', localizedTitles: { ja: 'Excel' }, aliases: [], applications: [], related: [], sections: [] };

test('detects Japanese from the primary system language', () => {
  assert.equal(detectLocale(['ja-JP', 'en-US']), 'ja');
  assert.equal(detectLocale(['en-US', 'ja-JP']), 'en');
});

test('localized labels prefer Japanese and safely fall back to English', () => {
  assert.equal(itemLabel(item, 'ja'), 'コピー');
  assert.equal(itemLabel({ ...item, localizedTitles: undefined }, 'ja'), 'Copy');
  assert.equal(itemLabel(item, 'en'), 'Copy');
  assert.equal(sheetLabel(sheet, 'ja'), 'Excel');
});
