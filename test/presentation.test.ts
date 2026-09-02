import test from 'node:test';
import assert from 'node:assert/strict';
import { compactItemView, gridColumnsForWidth, itemLayout, recentItemViews } from '../src/presentation.ts';
import type { CheatItem, CheatSheet } from '../src/model.ts';

const shortcut: CheatItem = { id: 'copy', title: 'Copy', localizedTitles: { ja: 'コピー' }, kind: 'shortcut', shortcut: 'Command + C', aliases: [], tags: [], userOwned: true };
const sheet: CheatSheet = {
  id: 'git', title: 'Git', aliases: [], applications: [], related: [],
  sections: [{ id: 'working-tree', title: 'Working tree', items: [
    { id: 'status', title: 'Working tree status', localizedTitles: { ja: '変更状態を見る' }, kind: 'command', command: 'git status', aliases: [], tags: [] },
    shortcut
  ] }]
};

test('compact view formats user-created shortcuts at presentation time while retaining raw copy/storage value', () => {
  assert.deepEqual(compactItemView(shortcut, 'ja'), { label: 'コピー', value: '⌘ C', rawValue: 'Command + C', valueKind: 'shortcut', layout: 'compact' });
  assert.equal(shortcut.shortcut, 'Command + C');
});

test('command presentation formats explicit keyboard chords without changing raw command text', () => {
  const item: CheatItem = { id: 'palette', title: 'Palette', kind: 'procedure', command: 'Press Command + K to continue', aliases: [], tags: [] };
  const view = compactItemView(item, 'en');
  assert.equal(view.value, 'Press ⌘ K to continue');
  assert.equal(view.rawValue, 'Press Command + K to continue');
  const shell: CheatItem = { ...item, id: 'which', command: 'command -v node' };
  assert.equal(compactItemView(shell, 'en').value, 'command -v node');
});

test('layout intent keeps short items compact and gives long commands more width', () => {
  assert.equal(itemLayout(shortcut), 'compact');
  assert.equal(itemLayout({ ...shortcut, shortcut: undefined, command: 'git status', kind: 'command' }), 'compact');
  assert.equal(itemLayout({ ...shortcut, shortcut: undefined, command: 'docker logs --since 30m --tail 200 my-container', kind: 'command' }), 'wide');
  assert.equal(itemLayout({ ...shortcut, shortcut: undefined, command: 'ssh -o StrictHostKeyChecking=yes -i ~/.ssh/production_ed25519 user@example.internal', kind: 'command' }), 'full');
});

test('responsive grid intent is three columns by default, two at medium width, one when narrow', () => {
  assert.equal(gridColumnsForWidth(680), 3);
  assert.equal(gridColumnsForWidth(620), 2);
  assert.equal(gridColumnsForWidth(560), 2);
  assert.equal(gridColumnsForWidth(440), 1);
  assert.equal(gridColumnsForWidth(390), 1);
});

test('recent view uses localized label and formatted shortcut with raw value preserved', () => {
  const recent = recentItemViews(sheet, ['copy'], 'ja');
  assert.equal(recent[0]?.view.label, 'コピー');
  assert.equal(recent[0]?.view.value, '⌘ C');
  assert.equal(recent[0]?.view.rawValue, 'Command + C');
  assert.equal(recent[0]?.section.id, 'working-tree');
});
