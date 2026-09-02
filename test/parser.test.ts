import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCheatSheet } from '../src/parser.ts';

const valid = `---\nid: git\ntitle: Git\naliases: version control\napplications:\nrelated: terminal\n---\n\n## Working tree\n\n### Status\n- id: status\n- kind: command\n- command: git status\n- aliases: changes, state\n- tags: inspect\nShows the working tree state.\n`;

test('parses constrained markdown', () => {
  const sheet = parseCheatSheet(valid);
  assert.equal(sheet.id, 'git');
  assert.equal(sheet.sections[0]?.items[0]?.command, 'git status');
  assert.deepEqual(sheet.sections[0]?.items[0]?.aliases, ['changes', 'state']);
});

test('rejects duplicate item IDs', () => {
  assert.throws(() => parseCheatSheet(valid + `\n### Again\n- id: status\n- kind: command\n- command: git status --short\n`), /duplicate item id/);
});

test('rejects unknown fields', () => {
  assert.throws(() => parseCheatSheet(valid.replace('- tags: inspect', '- magic: yes')), /unknown item field/);
});
