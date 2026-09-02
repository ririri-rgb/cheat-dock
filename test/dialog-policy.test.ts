import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('menu-bar CRUD avoids browser prompt/confirm modals', () => {
  assert.doesNotMatch(main, /\bprompt\s*\(/);
  assert.doesNotMatch(main, /\bconfirm\s*\(/);
  assert.match(main, /showModal\(\)/);
});

test('item and Sheet delete confirmations use explicit destructive styling', () => {
  assert.match(main, /class=\"danger-action\"/);
  assert.match(styles, /\.actions \.danger-action\s*\{/);
  assert.match(styles, /background:\s*var\(--danger-bg\)/);
  assert.match(styles, /color:\s*white/);
});
