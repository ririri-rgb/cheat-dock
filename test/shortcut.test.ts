import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMacShortcut } from '../src/shortcut.ts';

test('formats macOS modifier and key names without confusing Control and Command', () => {
  assert.equal(formatMacShortcut('Command + C'), '⌘ C');
  assert.equal(formatMacShortcut('Cmd + Option + S'), '⌘ ⌥ S');
  assert.equal(formatMacShortcut('Command + Shift + P'), '⌘ ⇧ P');
  assert.equal(formatMacShortcut('Control + Option + Space'), '⌃ ⌥ Space');
  assert.equal(formatMacShortcut('Ctrl + C'), '⌃ C');
  assert.notEqual(formatMacShortcut('Ctrl + C'), '⌘ C');
});

test('formats named navigation keys and preserves already-symbolized shortcuts', () => {
  assert.equal(formatMacShortcut('Enter'), '↩');
  assert.equal(formatMacShortcut('Return'), '↩');
  assert.equal(formatMacShortcut('Backspace'), '⌫');
  assert.equal(formatMacShortcut('Tab'), '⇥');
  assert.equal(formatMacShortcut('Left + Right + Up + Down'), '← → ↑ ↓');
  assert.equal(formatMacShortcut('Escape'), 'Esc');
  assert.equal(formatMacShortcut('⌘C'), '⌘ C');
  assert.equal(formatMacShortcut('⌘ ⇧ P'), '⌘ ⇧ P');
});
