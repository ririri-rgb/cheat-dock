import test from 'node:test';
import assert from 'node:assert/strict';
import { fitNavigation } from '../src/navigation.ts';

const tabs = [
  { id: 'excel', width: 58 },
  { id: 'git', width: 42 },
  { id: 'vim', width: 42 },
  { id: 'docker', width: 64 },
  { id: 'my-work', width: 76 }
];

test('uses available width instead of an arbitrary visible Sheet count', () => {
  assert.deepEqual(fitNavigation(tabs, 320), ['excel', 'git', 'vim', 'docker', 'my-work']);
});

test('hides overflow candidates while keeping the current-first tab visible', () => {
  const visible = fitNavigation(tabs, 130);
  assert.deepEqual(visible, ['excel', 'git']);
  assert.equal(visible[0], 'excel');
  assert.equal(visible.includes('my-work'), false);
});

test('keeps one current tab visible even in extremely constrained width', () => {
  assert.deepEqual(fitNavigation(tabs, 10), ['excel']);
});
