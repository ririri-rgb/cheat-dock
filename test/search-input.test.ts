import test from 'node:test';
import assert from 'node:assert/strict';
import { ImeAwareSearchInput } from '../src/search-input.ts';

test('normal Latin input commits immediately', () => {
  const controller = new ImeAwareSearchInput();
  assert.equal(controller.input('git'), 'git');
});

test('IME composition never commits intermediate romanized text', () => {
  const controller = new ImeAwareSearchInput();
  controller.compositionStart();
  assert.equal(controller.input('k', true), null);
  assert.equal(controller.input('ここp', true), null);
  assert.equal(controller.isComposing(), true);
  const commit = controller.compositionEnd('コピー');
  assert.equal(controller.canCommitDeferred(commit), true);
  assert.equal(commit.value, 'コピー');
});

test('post-composition input supersedes deferred composition commit', () => {
  const controller = new ImeAwareSearchInput();
  controller.compositionStart();
  const deferred = controller.compositionEnd('コピー');
  assert.equal(controller.input('コピー '), 'コピー ');
  assert.equal(controller.canCommitDeferred(deferred), false);
});
