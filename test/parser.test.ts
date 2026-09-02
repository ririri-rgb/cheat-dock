import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCheatSheet } from '../src/parser.ts';

const valid = `---\nid: git\ntitle: Git\ntitle-ja: Git\naliases: version control\napplications:\nrelated: terminal\n---\n\n## Working tree\n\n### Status\n- id: status\n- title-ja: 変更状態を見る\n- kind: command\n- command: git status\n- aliases: changes, state\n- tags: inspect\nShows the working tree state.\n`;

test('parses constrained markdown and optional Japanese labels', () => {
  const sheet = parseCheatSheet(valid);
  assert.equal(sheet.id, 'git');
  assert.equal(sheet.localizedTitles?.ja, 'Git');
  assert.equal(sheet.sections[0]?.items[0]?.localizedTitles?.ja, '変更状態を見る');
  assert.equal(sheet.sections[0]?.items[0]?.command, 'git status');
  assert.deepEqual(sheet.sections[0]?.items[0]?.aliases, ['changes', 'state']);
});

test('rejects duplicate item IDs across sections', () => {
  assert.throws(() => parseCheatSheet(valid + `\n## History\n\n### Again\n- id: status\n- kind: command\n- command: git status --short\n`), /duplicate item id/);
});

test('rejects unknown item fields', () => {
  assert.throws(() => parseCheatSheet(valid.replace('- tags: inspect', '- magic: yes')), /unknown item field/);
});

test('rejects unknown frontmatter fields', () => {
  assert.throws(() => parseCheatSheet(valid.replace('related: terminal', 'mystery: yes')), /unknown frontmatter field/);
});
