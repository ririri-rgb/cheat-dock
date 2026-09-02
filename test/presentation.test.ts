import test from 'node:test';
import assert from 'node:assert/strict';
import { compactItemView, itemLayout, recentItemViews } from '../src/presentation.ts';
import type { CheatItem, CheatSheet } from '../src/model.ts';

const shortcut: CheatItem = { id: 'copy', title: 'Copy', localizedTitles: { ja: 'コピー' }, kind: 'shortcut', shortcut: 'Command + C', aliases: [], tags: [], userOwned: true };
const sheet: CheatSheet = {
  id: 'git', title: 'Git', aliases: [], applications: [], related: [],
  sections: [{ id: 'working-tree', title: 'Working tree', items: [
    { id: 'status', title: 'Working tree status', localizedTitles: { ja: '変更状態を見る' }, kind: 'command', command: 'git status', aliases: [], tags: [] },
    shortcut
  ] }]
};

test('compact view formats user-created shortcuts at presentation time', () => {
  assert.deepEqual(compactItemView(shortcut, 'ja'), { label: 'コピー', value: '⌘ C', valueKind: 'shortcut', layout: 'compact' });
  assert.equal(shortcut.shortcut, 'Command + C');
});

test('layout intent keeps short items compact and gives long commands more width', () => {
  assert.equal(itemLayout(shortcut), 'compact');
  assert.equal(itemLayout({ ...shortcut, shortcut: undefined, command: 'git status', kind: 'command' }), 'compact');
  assert.equal(itemLayout({ ...shortcut, shortcut: undefined, command: 'docker logs --since 30m --tail 200 my-container', kind: 'command' }), 'wide');
  assert.equal(itemLayout({ ...shortcut, shortcut: undefined, command: 'ssh -o StrictHostKeyChecking=yes -i ~/.ssh/production_ed25519 user@example.internal', kind: 'command' }), 'full');
});

test('recent view uses localized label and formatted shortcut', () => {
  const recent = recentItemViews(sheet, ['copy'], 'ja');
  assert.equal(recent[0]?.view.label, 'コピー');
  assert.equal(recent[0]?.view.value, '⌘ C');
  assert.equal(recent[0]?.section.id, 'working-tree');
});
