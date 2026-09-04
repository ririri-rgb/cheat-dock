import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { parseCheatSheet } from '../src/parser.ts';

const cheatsDir = new URL('../cheats/', import.meta.url);

test('all bundled cheat sheets parse with stable content invariants', async () => {
  const files = (await readdir(cheatsDir))
    .filter((name) => name.endsWith('.md'))
    .sort();

  assert.ok(files.length > 0, 'expected bundled cheat sheets');

  const sheetIds = new Set<string>();

  for (const file of files) {
    const markdown = await readFile(new URL(file, cheatsDir), 'utf8');
    const sheet = parseCheatSheet(markdown);

    assert.ok(!sheetIds.has(sheet.id), `duplicate bundled sheet id: ${sheet.id}`);
    sheetIds.add(sheet.id);

    for (const section of sheet.sections) {
      for (const item of section.items) {
        assert.ok(item.source?.startsWith('https://'), `${file}:${item.id} must have an authoritative source URL`);
        assert.ok(item.aliases.length > 0, `${file}:${item.id} should have search aliases`);
        assert.ok(item.tags.length > 0, `${file}:${item.id} should have tags`);

        if (item.kind === 'shortcut') {
          assert.ok(item.shortcut?.trim(), `${file}:${item.id} shortcut item must have shortcut`);
          assert.equal(item.command, undefined, `${file}:${item.id} shortcut item must not also have command`);
        }

        if (item.kind === 'command') {
          assert.ok(item.command?.trim(), `${file}:${item.id} command item must have command`);
          assert.equal(item.shortcut, undefined, `${file}:${item.id} command item must not also have shortcut`);
        }

        if (item.kind === 'operation') {
          assert.ok(item.shortcut?.trim() || item.command?.trim() || item.body?.trim(), `${file}:${item.id} operation must have an actionable value or body`);
        }
      }
    }
  }
});
