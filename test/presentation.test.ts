import test from 'node:test';
import assert from 'node:assert/strict';
import { compactItemView, gridColumnsForWidth, itemLayout, primaryItemValue, recentItemViews } from '../src/presentation.ts';
import type { CheatItem, CheatSheet } from '../src/model.ts';

const shortcut: CheatItem = { id: 'copy', title: 'Copy', localizedTitles: { ja: 'コピー' }, kind: 'shortcut', shortcut: 'Command + C', aliases: [], tags: [], userOwned: true };
const command: CheatItem = { id: 'status', title: 'Working tree status', localizedTitles: { ja: '変更状態を見る' }, kind: 'command', command: 'git status', aliases: [], tags: [] };
const sheet: CheatSheet = {
  id: 'git', title: 'Git', aliases: [], applications: [], related: [],
  sections: [{ id: 'working-tree', title: 'Working tree', items: [command, shortcut] }]
};

test('kind=shortcut displays shortcut even when a legacy command field also exists', () => {
  const mixed: CheatItem = { ...shortcut, command: 'git status' };
  assert.deepEqual(primaryItemValue(mixed), { valueKind: 'shortcut', rawValue: 'Command + C', compatibilityFallback: false });
  assert.deepEqual(compactItemView(mixed, 'ja'), { label: 'コピー', value: '⌘ C', rawValue: 'Command + C', valueKind: 'shortcut', layout: 'compact' });
});

test('kind=command displays literal command even when a legacy shortcut field also exists', () => {
  const mixed: CheatItem = { ...command, shortcut: 'Command + K', command: 'Press Command + K' };
  const view = compactItemView(mixed, 'en');
  assert.equal(view.valueKind, 'command');
  assert.equal(view.value, 'Press Command + K');
  assert.equal(view.rawValue, 'Press Command + K');
});

test('command presentation is literal and never applies macOS chord formatting', () => {
  for (const raw of ['git status', 'command -v node', 'Press Command + K', 'Command failed', `printf '%s  %s' "$A" "$B"`]) {
    const item: CheatItem = { id: 'literal', title: 'Literal', kind: 'command', command: raw, aliases: [], tags: [] };
    const view = compactItemView(item, 'en');
    assert.equal(view.value, raw);
    assert.equal(view.rawValue, raw);
  }
});

test('malformed legacy kind/field mismatch falls back without changing the source item', () => {
  const shortcutMissing: CheatItem = { id: 'fallback-command', title: 'Fallback', kind: 'shortcut', command: 'git status', aliases: [], tags: [] };
  const commandMissing: CheatItem = { id: 'fallback-shortcut', title: 'Fallback', kind: 'command', shortcut: 'Control + Option + Space', aliases: [], tags: [] };
  assert.deepEqual(primaryItemValue(shortcutMissing), { valueKind: 'command', rawValue: 'git status', compatibilityFallback: true });
  assert.equal(compactItemView(shortcutMissing, 'en').value, 'git status');
  assert.deepEqual(primaryItemValue(commandMissing), { valueKind: 'shortcut', rawValue: 'Control + Option + Space', compatibilityFallback: true });
  assert.equal(compactItemView(commandMissing, 'en').value, '⌃ ⌥ Space');
  assert.equal(shortcutMissing.kind, 'shortcut');
  assert.equal(commandMissing.kind, 'command');
});

test('operation/procedure/snippet compatibility prefers literal command data when present', () => {
  const item: CheatItem = { id: 'procedure', title: 'Procedure', kind: 'procedure', shortcut: 'Command + K', command: 'Press Command + K', aliases: [], tags: [] };
  assert.equal(compactItemView(item, 'en').value, 'Press Command + K');
});

test('layout intent follows the resolved primary kind', () => {
  assert.equal(itemLayout(shortcut), 'compact');
  assert.equal(itemLayout({ ...command, command: 'git status' }), 'compact');
  assert.equal(itemLayout({ ...command, command: 'docker logs --since 30m --tail 200 my-container' }), 'wide');
  assert.equal(itemLayout({ ...command, command: 'ssh -o StrictHostKeyChecking=yes -i ~/.ssh/production_ed25519 user@example.internal' }), 'full');
  assert.equal(itemLayout({ ...command, shortcut: 'Command + K' }), 'compact');
});

test('responsive grid intent is three columns by default, two at medium width, one when narrow', () => {
  assert.equal(gridColumnsForWidth(680), 3);
  assert.equal(gridColumnsForWidth(620), 2);
  assert.equal(gridColumnsForWidth(560), 2);
  assert.equal(gridColumnsForWidth(440), 1);
  assert.equal(gridColumnsForWidth(390), 1);
});

test('recent view is kind-aware for shortcut and command values', () => {
  const recent = recentItemViews(sheet, ['copy', 'status'], 'ja');
  assert.equal(recent[0]?.view.label, 'コピー');
  assert.equal(recent[0]?.view.value, '⌘ C');
  assert.equal(recent[0]?.view.rawValue, 'Command + C');
  assert.equal(recent[0]?.view.valueKind, 'shortcut');
  assert.equal(recent[1]?.view.value, 'git status');
  assert.equal(recent[1]?.view.rawValue, 'git status');
  assert.equal(recent[1]?.view.valueKind, 'command');
});
