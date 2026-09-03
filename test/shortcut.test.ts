import test from 'node:test';
import assert from 'node:assert/strict';
import {
  captureKeyboardEvent,
  formatExplicitKeyboardChords,
  formatMacShortcut,
  normalizeKeyboardChord,
  parseKeyboardChord
} from '../src/shortcut.ts';

function key(key: string, flags: Partial<{ metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; isComposing: boolean; repeat: boolean }> = {}) {
  return { key, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...flags };
}

test('canonicalizes and formats macOS modifiers without confusing Control and Command', () => {
  assert.equal(normalizeKeyboardChord('Cmd + Option + S'), 'Command + Option + S');
  assert.equal(formatMacShortcut('Command + C'), '⌘ C');
  assert.equal(formatMacShortcut('Command + Shift + P'), '⌘ ⇧ P');
  assert.equal(formatMacShortcut('Control + Option + Space'), '⌃ ⌥ Space');
  assert.equal(formatMacShortcut('Ctrl + C'), '⌃ C');
  assert.notEqual(formatMacShortcut('Ctrl + C'), '⌘ C');
});

test('named keys, arrows and already-symbolized shortcuts remain compatible', () => {
  assert.equal(formatMacShortcut('Enter'), '↩');
  assert.equal(formatMacShortcut('Backspace'), '⌫');
  assert.equal(formatMacShortcut('Delete'), '⌦');
  assert.equal(formatMacShortcut('Tab'), '⇥');
  assert.equal(formatMacShortcut('Option + ArrowUp'), '⌥ ↑');
  assert.equal(formatMacShortcut('Command + Left'), '⌘ ←');
  assert.equal(formatMacShortcut('Escape'), 'Esc');
  assert.equal(formatMacShortcut('⌘C'), '⌘ C');
  assert.equal(formatMacShortcut('⌘ ⇧ P'), '⌘ ⇧ P');
});

test('actual key capture stores author-friendly canonical chords', () => {
  assert.deepEqual(captureKeyboardEvent(key('k', { metaKey: true })), { status: 'commit', value: 'Command + K' });
  assert.deepEqual(captureKeyboardEvent(key('p', { metaKey: true, shiftKey: true })), { status: 'commit', value: 'Command + Shift + P' });
  assert.deepEqual(captureKeyboardEvent(key(' ', { ctrlKey: true, altKey: true })), { status: 'commit', value: 'Control + Option + Space' });
  assert.deepEqual(captureKeyboardEvent(key('ArrowUp', { altKey: true })), { status: 'commit', value: 'Option + Up' });
  assert.deepEqual(captureKeyboardEvent(key('F5')), { status: 'commit', value: 'F5' });
});

test('capture mode ignores modifier-only/composition and Escape cancels', () => {
  assert.deepEqual(captureKeyboardEvent(key('Meta', { metaKey: true })), { status: 'pending' });
  assert.deepEqual(captureKeyboardEvent(key('Shift', { shiftKey: true })), { status: 'pending' });
  assert.deepEqual(captureKeyboardEvent(key('Escape')), { status: 'cancel' });
  assert.deepEqual(captureKeyboardEvent(key('k', { metaKey: true, isComposing: true })), { status: 'ignore' });
});

test('future procedure chord utility remains grammar-based and separate from Command rendering', () => {
  assert.equal(formatExplicitKeyboardChords('Press Command + K to continue'), 'Press ⌘ K to continue');
  assert.equal(formatExplicitKeyboardChords('Control + Option + Space opens it'), '⌃ ⌥ Space opens it');
  assert.equal(formatExplicitKeyboardChords('command -v node'), 'command -v node');
  assert.equal(formatExplicitKeyboardChords('run command'), 'run command');
  assert.equal(formatExplicitKeyboardChords('Git command'), 'Git command');
  assert.equal(formatExplicitKeyboardChords('Command failed'), 'Command failed');
});

test('parser requires a final key and supports future single-chord normalization without multi-chord coupling', () => {
  assert.equal(parseKeyboardChord('Command + Shift'), null);
  assert.equal(parseKeyboardChord('Command + K')?.canonical, 'Command + K');
  assert.equal(parseKeyboardChord('Command + K, Command + S'), null);
});
