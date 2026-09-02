import test from 'node:test';
import assert from 'node:assert/strict';
import { groupSearchHits } from '../src/search-groups.ts';
import type { SearchHit } from '../src/search.ts';

function hit(sheetId: string, itemId: string, score: number): SearchHit {
  return {
    sheetId,
    sheetTitle: sheetId === 'git' ? 'Git' : sheetId === 'excel' ? 'Excel' : 'Terminal',
    sectionId: 'basic',
    sectionTitle: 'Basic',
    item: { id: itemId, title: itemId, kind: 'command', aliases: [], tags: [] },
    score
  };
}

test('separates current Sheet results while preserving ranked order', () => {
  const grouped = groupSearchHits([
    hit('excel', 'copy', 12),
    hit('git', 'reset', 10),
    hit('git', 'revert', 8),
    hit('terminal', 'undo', 6)
  ], 'git');
  assert.deepEqual(grouped.current.map((entry) => entry.item.id), ['reset', 'revert']);
  assert.deepEqual(grouped.other.map((group) => group.sheetId), ['excel', 'terminal']);
});

test('keeps Other Sheets results when current Sheet has zero hits', () => {
  const grouped = groupSearchHits([hit('excel', 'copy', 10), hit('terminal', 'copy-file', 8)], 'git');
  assert.equal(grouped.current.length, 0);
  assert.equal(grouped.other.length, 2);
  assert.equal(grouped.other.flatMap((group) => group.hits).length, 2);
});

test('keeps every matching item in each Other Sheet group', () => {
  const grouped = groupSearchHits([
    hit('excel', 'copy', 10),
    hit('excel', 'copy-format', 9),
    hit('terminal', 'copy-file', 8)
  ], 'git');
  assert.deepEqual(grouped.other[0]?.hits.map((entry) => entry.item.id), ['copy', 'copy-format']);
  assert.equal(grouped.other.flatMap((group) => group.hits).length, 3);
});
