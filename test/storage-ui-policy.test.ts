import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const shortcut = readFileSync(new URL('../src/shortcut.ts', import.meta.url), 'utf8');
const uiText = readFileSync(new URL('../src/ui-text.ts', import.meta.url), 'utf8');
const rustLib = readFileSync(new URL('../src-tauri/src/lib.rs', import.meta.url), 'utf8');

test('shortcut Record capture is scoped to its explicit dialog control and ends on terminal states', () => {
  assert.match(main, /data-record-shortcut/);
  assert.match(main, /button\.onkeydown\s*=\s*\(event\)/);
  assert.doesNotMatch(main, /document\.addEventListener\(['"]keydown/);
  assert.match(main, /result\.status === 'cancel'[\s\S]*?stop\(\)/);
  assert.match(main, /input\.value = result\.value;[\s\S]*?stop\(\)/);
  assert.match(main, /button\.addEventListener\('blur',[\s\S]*?stop\(\)/);
});

test('keyboard capture result is a fully discriminated union and Search keeps composition handling', () => {
  assert.match(shortcut, /\| \{ status: 'ignore' \}/);
  assert.match(shortcut, /\| \{ status: 'pending' \}/);
  assert.match(shortcut, /\| \{ status: 'cancel' \}/);
  assert.match(shortcut, /\| \{ status: 'commit'; value: string \}/);
  assert.match(main, /compositionstart/);
  assert.match(main, /compositionend/);
  assert.match(main, /imeSearch\.input/);
});

test('Open Data Folder uses the native Finder command rather than shell execution', () => {
  assert.match(uiText, /dataFolder: 'Open Data Folder'/);
  assert.match(rustLib, /reveal_user_data/);
  assert.doesNotMatch(rustLib, /std::process::Command/);
  assert.doesNotMatch(rustLib, /macos-private-api/);
});

test('storage issues remain visible with reload recovery UI', () => {
  assert.match(main, /storageIssue\.relativePath/);
  assert.match(main, /id=\"reload-files\"/);
  assert.match(main, /reloadUserFiles/);
});
