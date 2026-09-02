import type { CheatItem, CheatKind, CheatSection, CheatSheet } from './model.ts';

const ID_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;
const KINDS = new Set<CheatKind>(['shortcut', 'command', 'operation', 'procedure', 'snippet']);

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((part) => part.trim()).filter(Boolean);
}

function parseFrontmatter(markdown: string): { meta: Record<string, string>; body: string } {
  if (!markdown.startsWith('---\n')) throw new Error('missing frontmatter');
  const end = markdown.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('unterminated frontmatter');
  const meta: Record<string, string> = {};
  for (const line of markdown.slice(4, end).split('\n')) {
    if (!line.trim()) continue;
    const colon = line.indexOf(':');
    if (colon < 1) throw new Error(`invalid frontmatter line: ${line}`);
    meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return { meta, body: markdown.slice(end + 5) };
}

function slug(value: string): string {
  return value.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 64) || 'item';
}

export function parseCheatSheet(markdown: string): CheatSheet {
  const { meta, body } = parseFrontmatter(markdown.replace(/\r\n/g, '\n'));
  const id = meta.id;
  const title = meta.title;
  if (!id || !ID_RE.test(id)) throw new Error('invalid or missing sheet id');
  if (!title) throw new Error('missing sheet title');

  const sections: CheatSection[] = [];
  let section: CheatSection | undefined;
  let item: CheatItem | undefined;
  let bodyLines: string[] = [];

  const flushItem = () => {
    if (!item || !section) return;
    const text = bodyLines.join('\n').trim();
    if (text) item.body = text;
    if (section.items.some((existing) => existing.id === item!.id)) throw new Error(`duplicate item id: ${item.id}`);
    section.items.push(item);
    item = undefined;
    bodyLines = [];
  };

  for (const raw of body.split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('## ')) {
      flushItem();
      const title = line.slice(3).trim();
      section = { id: slug(title), title, items: [] };
      if (sections.some((existing) => existing.id === section!.id)) throw new Error(`duplicate section id: ${section.id}`);
      sections.push(section);
      continue;
    }
    if (line.startsWith('### ')) {
      flushItem();
      if (!section) throw new Error('item appears before a section');
      const title = line.slice(4).trim();
      item = { id: slug(title), title, kind: 'operation', aliases: [], tags: [] };
      continue;
    }
    if (!item) {
      if (line.trim()) throw new Error(`content outside item: ${line}`);
      continue;
    }
    const field = line.match(/^- ([a-z]+):\s*(.*)$/);
    if (field) {
      const key = field[1];
      const value = field[2]?.trim() ?? '';
      if (key === 'id') {
        if (!ID_RE.test(value)) throw new Error(`invalid item id: ${value}`);
        item.id = value;
      } else if (key === 'kind') {
        if (!KINDS.has(value as CheatKind)) throw new Error(`invalid item kind: ${value}`);
        item.kind = value as CheatKind;
      } else if (key === 'description' || key === 'shortcut' || key === 'command' || key === 'source') {
        item[key] = value;
      } else if (key === 'aliases' || key === 'tags') {
        item[key] = parseList(value);
      } else {
        throw new Error(`unknown item field: ${key}`);
      }
      continue;
    }
    bodyLines.push(line);
  }
  flushItem();
  if (!sections.length) throw new Error('sheet must contain at least one section');

  return {
    id,
    title,
    description: meta.description,
    aliases: parseList(meta.aliases),
    applications: parseList(meta.applications),
    related: parseList(meta.related),
    sections
  };
}
