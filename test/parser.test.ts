import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCheatSheet } from '../src/parser.ts';

const valid = `---\nid: git\ntitle: Git\ntitle-ja: Git\naliases: version control\napplications:\nrelated: terminal\n---\n\n## Basic\n- title-ja: 基本\n\n### Status\n- id: status\n- title-ja: 変更状態を見る\n- kind: command\n- command: git status\n- aliases: changes, state\n- tags: inspect\nShows the working tree state.\n`;

test('parses constrained markdown with optional item and section Japanese labels', () => {
  const sheet = parseCheatSheet(valid);
  assert.equal(sheet.id, 'git');
  assert.equal(sheet.localizedTitles?.ja, 'Git');
  assert.equal(sheet.sections[0]?.localizedTitles?.ja, '基本');
  assert.equal(sheet.sections[0]?.items[0]?.localizedTitles?.ja, '変更状態を見る');
  assert.equal(sheet.sections[0]?.items[0]?.command, 'git status');
  assert.deepEqual(sheet.sections[0]?.items[0]?.aliases, ['changes', 'state']);
});

test('existing markdown without section localization remains compatible', () => {
  const sheet = parseCheatSheet(valid.replace('- title-ja: 基本\n', ''));
  assert.equal(sheet.sections[0]?.title, 'Basic');
  assert.equal(sheet.sections[0]?.localizedTitles, undefined);
});

test('rejects duplicate item IDs across sections', () => {
  assert.throws(() => parseCheatSheet(valid + `\n## History\n\n### Again\n- id: status\n- kind: command\n- command: git status --short\n`), /duplicate item id/);
});

test('rejects unknown item and section fields', () => {
  assert.throws(() => parseCheatSheet(valid.replace('- tags: inspect', '- magic: yes')), /unknown item field/);
  assert.throws(() => parseCheatSheet(valid.replace('- title-ja: 基本', '- magic: yes')), /unknown section field/);
});

test('rejects unknown frontmatter fields', () => {
  assert.throws(() => parseCheatSheet(valid.replace('related: terminal', 'mystery: yes')), /unknown frontmatter field/);
});
