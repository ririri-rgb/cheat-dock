import test from 'node:test';
import assert from 'node:assert/strict';
import { isShortLatinToken, matchWeakProseField, searchSheets } from '../src/search.ts';
import { compactItemView } from '../src/presentation.ts';
import type { CheatSheet } from '../src/model.ts';

const sheets: CheatSheet[] = [{
  id: 'git', title: 'Git', aliases: [], applications: [], related: [], sections: [{ id: 'history', title: 'History', items: [
    { id: 'reset', title: 'Reset commit', localizedTitles: { ja: 'コミットを戻す' }, kind: 'command', command: 'git reset', description: 'Move HEAD', aliases: ['undo commit', '戻す', 'rb'], tags: ['commit'] },
    { id: 'palette', title: 'Open palette', kind: 'shortcut', shortcut: 'Command + Shift + P', aliases: ['command palette'], tags: ['keyboard'] },
    { id: 'save-note', title: 'Write note', kind: 'operation', description: '設定を保存して閉じる', aliases: [], tags: [] }
  ] }]
}, {
  id: 'terminal', title: 'Terminal', aliases: [], applications: [], related: [], sections: [{ id: 'basic', title: 'Basic', items: [
    { id: 'pwd', title: 'Show current directory', localizedTitles: { ja: '現在のディレクトリを表示' }, kind: 'command', command: 'pwd', description: 'Print the absolute pathname of the current working directory.', aliases: [], tags: [] }
  ] }]
}, {
  id: 'my-work', title: 'My Work', aliases: [], applications: [], related: [], sections: [{ id: 'personal', title: 'Personal', items: [
    { id: 'ab', title: 'Ab', kind: 'operation', aliases: [], tags: [] }
  ] }]
}];

test('search is case, whitespace and NFKC normalized', () => {
  assert.equal(searchSheets(sheets, '  ＲＥＳＥＴ  ')[0]?.item.id, 'reset');
});

test('search handles mixed Japanese and English tokens predictably', () => {
  assert.equal(searchSheets(sheets, 'commit 戻す', 'ja')[0]?.item.id, 'reset');
  assert.equal(searchSheets(sheets, 'コミット 戻す', 'ja')[0]?.item.id, 'reset');
});

test('search indexes localized labels without losing English search', () => {
  assert.equal(searchSheets(sheets, 'コミット 戻す', 'ja')[0]?.item.id, 'reset');
  assert.equal(searchSheets(sheets, 'Reset', 'ja')[0]?.item.id, 'reset');
});

test('two-letter Latin query does not prefix-match weak prose words', () => {
  const hits = searchSheets(sheets, 'Ab', 'ja');
  assert.ok(hits.some((hit) => hit.item.id === 'ab'));
  assert.ok(!hits.some((hit) => hit.item.id === 'pwd'));
  assert.equal(matchWeakProseField('Print the absolute pathname.', 'ab'), false);
  assert.equal(isShortLatinToken('Ab'), true);
});

test('longer Latin weak-field prefixes and full words remain searchable', () => {
  assert.equal(searchSheets(sheets, 'abs')[0]?.item.id, 'pwd');
  assert.equal(searchSheets(sheets, 'absolute')[0]?.item.id, 'pwd');
});

test('short Latin tokens still match strong title and alias fields', () => {
  assert.equal(searchSheets(sheets, 'Re')[0]?.item.id, 'reset');
  assert.equal(searchSheets(sheets, 'rb')[0]?.item.id, 'reset');
});

test('short Japanese queries remain useful in weak prose fields', () => {
  assert.equal(searchSheets(sheets, '保存', 'ja')[0]?.item.id, 'save-note');
});

test('search indexes canonical raw shortcut and command values while presentation stays kind-aware', () => {
  const shortcutHit = searchSheets(sheets, 'Command Shift P')[0];
  assert.equal(shortcutHit?.item.id, 'palette');
  assert.equal(compactItemView(shortcutHit!.item, 'en').value, '⌘ ⇧ P');

  const commandHit = searchSheets(sheets, 'git res')[0];
  assert.equal(commandHit?.item.id, 'reset');
  assert.equal(compactItemView(commandHit!.item, 'en').value, 'git reset');
});
