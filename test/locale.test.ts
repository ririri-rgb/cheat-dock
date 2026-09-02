import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLocale, itemLabel, sectionLabel, sheetLabel } from '../src/locale.ts';
import { uiText } from '../src/ui-text.ts';
import type { CheatItem, CheatSection, CheatSheet } from '../src/model.ts';

const item: CheatItem = { id: 'copy', title: 'Copy', localizedTitles: { ja: 'コピー' }, kind: 'shortcut', shortcut: '⌘C', aliases: [], tags: [] };

test('detects Japanese from the primary system language', () => {
  assert.equal(detectLocale(['ja-JP', 'en-US']), 'ja');
  assert.equal(detectLocale(['en-US', 'ja-JP']), 'en');
});

test('localized item and section labels use explicit Japanese text and English fallback', () => {
  const basic: CheatSection = { id: 'basic', title: 'Basic', localizedTitles: { ja: '基本' }, items: [] };
  assert.equal(itemLabel(item, 'ja'), 'コピー');
  assert.equal(itemLabel({ ...item, localizedTitles: undefined }, 'ja'), 'Copy');
  assert.equal(sectionLabel(basic, 'ja'), '基本');
  assert.equal(sectionLabel({ ...basic, localizedTitles: undefined }, 'ja'), 'Basic');
});

test('tool and user sheet names stay canonical instead of being transliterated', () => {
  const myWork: CheatSheet = { id: 'my-work', title: 'My Work', localizedTitles: { ja: 'マイワーク' }, aliases: [], applications: [], related: [], sections: [] };
  const terminal: CheatSheet = { id: 'terminal', title: 'Terminal', localizedTitles: { ja: 'ターミナル' }, aliases: [], applications: [], related: [], sections: [] };
  const user: CheatSheet = { id: 'user-demo', title: 'Build Notes', localizedTitles: { ja: 'ビルドノート' }, aliases: [], applications: [], related: [], sections: [], userOwned: true };
  assert.equal(sheetLabel(myWork, 'ja'), 'My Work');
  assert.equal(sheetLabel(terminal, 'ja'), 'Terminal');
  assert.equal(sheetLabel(user, 'ja'), 'Build Notes');
});

test('Japanese UI localization is selective', () => {
  const text = uiText('ja');
  assert.equal(text.recent, '最近見た項目');
  assert.equal(text.search, 'すべてのチートシートを検索');
  assert.equal(text.edit, 'Edit');
  assert.equal(text.delete, 'Delete');
  assert.equal(text.addItem, '＋ Item');
  assert.equal(text.addSheet, '＋ Sheet');
});
