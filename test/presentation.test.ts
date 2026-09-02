import test from 'node:test';
import assert from 'node:assert/strict';
import { compactItemView, recentItemViews } from '../src/presentation.ts';
import type { CheatSheet } from '../src/model.ts';

const sheet: CheatSheet = {
  id: 'git', title: 'Git', aliases: [], applications: [], related: [],
  sections: [{ id: 'working-tree', title: 'Working tree', items: [
    { id: 'status', title: 'Working tree status', localizedTitles: { ja: '変更状態を見る' }, kind: 'command', command: 'git status', aliases: [], tags: [] }
  ] }]
};

test('compact item view contains label and primary shortcut or command only', () => {
  assert.deepEqual(compactItemView(sheet.sections[0]!.items[0]!, 'ja'), { label: '変更状態を見る', value: 'git status', valueKind: 'command' });
});

test('recent view resolves localized label with the unchanged command', () => {
  const recent = recentItemViews(sheet, ['status'], 'ja');
  assert.equal(recent[0]?.view.label, '変更状態を見る');
  assert.equal(recent[0]?.view.value, 'git status');
  assert.equal(recent[0]?.section.id, 'working-tree');
});
