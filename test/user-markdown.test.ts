import test from 'node:test';
import assert from 'node:assert/strict';
import type { AppState, CheatSheet } from '../src/model.ts';
import {
  canonicalDocumentContent,
  documentsFromState,
  parseLoadedUserDocuments,
  serializeOverlay,
  serializeUserSheet,
  validateUserMarkdown
} from '../src/user-markdown.ts';

const builtins: CheatSheet[] = [{
  id: 'excel', title: 'Excel', aliases: [], applications: ['com.microsoft.Excel'], related: [],
  sections: [{ id: 'basic', title: 'Basic', items: [] }]
}, {
  id: 'my-work', title: 'My Work', aliases: [], applications: [], related: [],
  sections: [{ id: 'notes', title: 'Notes', items: [] }]
}];

const custom: CheatSheet = {
  id: 'user-project-a', title: 'Project A', aliases: [], applications: [], related: [], userOwned: true,
  sections: [{
    id: 'deploy', title: 'Deploy', localizedTitles: { ja: 'デプロイ' }, userOwned: true,
    items: [{
      id: 'user-deploy', title: 'Production deploy', localizedTitles: { ja: '本番デプロイ' },
      kind: 'command', command: `printf '%s  %s' "$A" "$B"`, shortcut: 'Command + Shift + P',
      description: 'Production  deploy command.', aliases: ['deploy'], tags: ['prod'], userOwned: true
    }]
  }]
};

test('legacy mixed Markdown round-trips both fields without glyph persistence or command whitespace loss', () => {
  const markdown = serializeUserSheet(custom);
  assert.match(markdown, /title: Project A/);
  assert.match(markdown, /shortcut: Command \+ Shift \+ P/);
  assert.match(markdown, /command: printf '%s  %s' "\$A" "\$B"/);
  assert.match(markdown, /description: Production  deploy command\./);
  assert.doesNotMatch(markdown, /⌘/);
  const parsed = validateUserMarkdown({ kind: 'sheet', id: custom.id, content: markdown }, builtins);
  assert.equal(parsed.sections[0]?.localizedTitles?.ja, 'デプロイ');
  assert.equal(parsed.sections[0]?.items[0]?.kind, 'command');
  assert.equal(parsed.sections[0]?.items[0]?.shortcut, 'Command + Shift + P');
  assert.equal(parsed.sections[0]?.items[0]?.command, `printf '%s  %s' "$A" "$B"`);
  assert.equal(parsed.sections[0]?.items[0]?.description, 'Production  deploy command.');
  const serializedAgain = serializeUserSheet(parsed);
  const parsedAgain = validateUserMarkdown({ kind: 'sheet', id: custom.id, content: serializedAgain }, builtins);
  assert.equal(parsedAgain.sections[0]?.items[0]?.command, parsed.sections[0]?.items[0]?.command);
  assert.equal(parsedAgain.sections[0]?.items[0]?.shortcut, parsed.sections[0]?.items[0]?.shortcut);
  assert.equal(canonicalDocumentContent({ kind: 'sheet', id: custom.id, content: markdown }, builtins), markdown);
});

test('loading a mixed legacy item does not delete the inactive field', () => {
  const raw = `---\nid: user-mixed\ntitle: Mixed\n---\n\n## Notes\n\n### Palette\n- id: user-palette\n- kind: shortcut\n- shortcut: Command + K\n- command: Press Command + K\n`;
  const loaded = parseLoadedUserDocuments([
    { kind: 'sheet', id: 'user-mixed', relativePath: 'cheats/user-mixed.md', content: raw }
  ], [], builtins);
  const item = loaded.userSheets[0]?.sections[0]?.items[0];
  assert.equal(item?.kind, 'shortcut');
  assert.equal(item?.shortcut, 'Command + K');
  assert.equal(item?.command, 'Press Command + K');
  assert.equal(loaded.documents.get('sheet:user-mixed')?.content, raw);
});

test('built-in overlays reuse the same constrained Markdown schema', () => {
  const overlaySections = [{
    id: 'personal', title: 'Personal', userOwned: true,
    items: [{ id: 'user-copy-special', title: 'Copy special', kind: 'shortcut' as const, shortcut: 'Command + Option + C', aliases: [], tags: [], userOwned: true }]
  }];
  const markdown = serializeOverlay(builtins[0]!, overlaySections);
  const parsed = validateUserMarkdown({ kind: 'overlay', id: 'excel', content: markdown }, builtins);
  assert.equal(parsed.id, 'excel');
  assert.equal(parsed.sections[0]?.items[0]?.shortcut, 'Command + Option + C');
});

test('one corrupt Markdown file is isolated while valid files still load', () => {
  const valid = serializeUserSheet(custom);
  const parsed = parseLoadedUserDocuments([
    { kind: 'sheet', id: custom.id, relativePath: `cheats/${custom.id}.md`, content: valid },
    { kind: 'sheet', id: 'user-broken', relativePath: 'cheats/user-broken.md', content: 'not markdown' }
  ], [], builtins);
  assert.equal(parsed.userSheets.length, 1);
  assert.equal(parsed.userSheets[0]?.id, custom.id);
  assert.equal(parsed.issues.length, 1);
  assert.equal(parsed.issues[0]?.code, 'invalid-markdown');
});

test('duplicate title created by external editing is isolated instead of shadowing a built-in', () => {
  const duplicate = { ...custom, id: 'user-excel', title: 'Ｅｘｃｅｌ' };
  const parsed = parseLoadedUserDocuments([
    { kind: 'sheet', id: duplicate.id, relativePath: 'cheats/user-excel.md', content: serializeUserSheet(duplicate) }
  ], [], builtins);
  assert.equal(parsed.userSheets.length, 0);
  assert.equal(parsed.issues[0]?.code, 'duplicate-title');
});

test('state maps deterministically to stable ID-based file documents', () => {
  const state: Pick<AppState, 'userSheets' | 'overlays'> = {
    userSheets: [custom],
    overlays: { excel: [{ id: 'personal', title: 'Personal', items: [], userOwned: true }] }
  };
  const docs = documentsFromState(state, builtins);
  assert.deepEqual(docs.map((doc) => `${doc.kind}:${doc.id}`), ['overlay:excel', 'sheet:user-project-a']);
});
