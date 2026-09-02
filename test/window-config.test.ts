import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'));
const windowConfig = config.app.windows[0];
const cargo = readFileSync(new URL('../src-tauri/Cargo.toml', import.meta.url), 'utf8');

test('macOS panel uses public overlay titlebar without whole-window transparency', () => {
  assert.equal(windowConfig.titleBarStyle, 'Overlay');
  assert.equal(windowConfig.decorations, true);
  assert.equal(windowConfig.hiddenTitle, true);
  assert.equal(windowConfig.transparent, false);
  assert.equal(windowConfig.shadow, true);
  assert.doesNotMatch(cargo, /macos-private-api/i);
});
