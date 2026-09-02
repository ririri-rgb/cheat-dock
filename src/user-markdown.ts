import { sheetTitleKey } from './custom-sheets.ts';
import type { AppState, CheatItem, CheatSection, CheatSheet } from './model.ts';
import { parseCheatSheet } from './parser.ts';
import type { StoredUserDocument, StorageIssue, UserDocumentKind } from './native-storage.ts';

export interface UserDocumentSpec {
  kind: UserDocumentKind;
  id: string;
  content: string;
}

export interface ParsedUserContent {
  userSheets: CheatSheet[];
  overlays: Record<string, CheatSection[]>;
  documents: Map<string, StoredUserDocument>;
  issues: StorageIssue[];
}

export function userDocumentKey(kind: UserDocumentKind, id: string): string {
  return `${kind}:${id}`;
}

function singleLine(value: string): string {
  return value.replace(/\r?\n/g, ' ').trim();
}

function humanLabel(value: string): string {
  return singleLine(value).replace(/\s+/g, ' ');
}

function frontmatter(meta: Array<[string, string | undefined, 'label' | 'raw']>): string {
  const lines = meta.flatMap(([key, value, mode]) => {
    if (value === undefined) return [];
    const normalized = mode === 'label' ? humanLabel(value) : singleLine(value);
    return normalized ? [`${key}: ${normalized}`] : [];
  });
  return `---\n${lines.join('\n')}\n---\n`;
}

function list(value: readonly string[]): string | undefined {
  const values = value.map(humanLabel).filter(Boolean);
  return values.length ? values.join(', ') : undefined;
}

function serializeItem(item: CheatItem): string {
  const fields: Array<[string, string | undefined, 'label' | 'raw']> = [
    ['id', item.id, 'label'],
    ['kind', item.kind, 'label'],
    ['title-ja', item.localizedTitles?.ja, 'label'],
    ['description', item.description, 'raw'],
    ['shortcut', item.shortcut, 'raw'],
    ['command', item.command, 'raw'],
    ['aliases', list(item.aliases), 'label'],
    ['tags', list(item.tags), 'label'],
    ['source', item.source, 'raw']
  ];
  const metadata = fields.flatMap(([key, value, mode]) => {
    if (value === undefined) return [];
    const normalized = mode === 'label' ? humanLabel(value) : singleLine(value);
    return normalized ? [`- ${key}: ${normalized}`] : [];
  });
  const body = item.body?.replace(/\r\n/g, '\n').trim();
  return [`### ${humanLabel(item.title)}`, ...metadata, ...(body ? ['', body] : [])].join('\n');
}

function serializeSection(section: CheatSection): string {
  const lines = [`## ${humanLabel(section.title)}`];
  if (section.localizedTitles?.ja) lines.push(`- title-ja: ${humanLabel(section.localizedTitles.ja)}`);
  for (const item of section.items) lines.push('', serializeItem(item));
  return lines.join('\n');
}

export function serializeUserSheet(sheet: CheatSheet): string {
  const head = frontmatter([
    ['id', sheet.id, 'label'],
    ['title', sheet.title, 'label'],
    ['title-ja', sheet.localizedTitles?.ja, 'label'],
    ['description', sheet.description, 'raw'],
    ['aliases', list(sheet.aliases), 'label'],
    ['applications', list(sheet.applications), 'label'],
    ['related', list(sheet.related), 'label']
  ]);
  return `${head}\n${sheet.sections.map(serializeSection).join('\n\n')}\n`;
}

export function serializeOverlay(builtin: CheatSheet, sections: CheatSection[]): string {
  return serializeUserSheet({
    id: builtin.id,
    title: builtin.title,
    aliases: [],
    applications: [],
    related: [],
    sections
  });
}

function userOwnedItem(item: CheatItem): CheatItem {
  return { ...item, userOwned: true };
}

function userOwnedSection(section: CheatSection): CheatSection {
  return { ...section, userOwned: true, items: section.items.map(userOwnedItem) };
}

function userOwnedSheet(sheet: CheatSheet): CheatSheet {
  return { ...sheet, userOwned: true, sections: sheet.sections.map(userOwnedSection) };
}

export function validateUserMarkdown(document: UserDocumentSpec, builtins: readonly CheatSheet[]): CheatSheet {
  const parsed = parseCheatSheet(document.content);
  if (parsed.id !== document.id) throw new Error(`frontmatter id ${parsed.id} does not match file identity ${document.id}`);
  if (document.kind === 'sheet') {
    if (!parsed.id.startsWith('user-')) throw new Error('custom Sheet IDs must start with user-');
    return userOwnedSheet(parsed);
  }
  const builtin = builtins.find((sheet) => sheet.id === document.id);
  if (!builtin) throw new Error(`overlay target ${document.id} is not a built-in Cheat Sheet`);
  return { ...parsed, sections: parsed.sections.map(userOwnedSection) };
}

export function parseLoadedUserDocuments(
  stored: readonly StoredUserDocument[],
  backendIssues: readonly StorageIssue[],
  builtins: readonly CheatSheet[]
): ParsedUserContent {
  const userSheets: CheatSheet[] = [];
  const overlays: Record<string, CheatSection[]> = {};
  const documents = new Map<string, StoredUserDocument>();
  const issues = [...backendIssues];
  const titleKeys = new Set(builtins.map((sheet) => sheetTitleKey(sheet.title)));

  for (const document of [...stored].sort((a, b) => a.relativePath.localeCompare(b.relativePath))) {
    const key = userDocumentKey(document.kind, document.id);
    if (documents.has(key)) {
      issues.push({ code: 'duplicate-document', message: `Duplicate document identity ${key}.`, relativePath: document.relativePath });
      continue;
    }
    try {
      const parsed = validateUserMarkdown(document, builtins);
      if (document.kind === 'sheet') {
        const titleKey = sheetTitleKey(parsed.title);
        if (titleKeys.has(titleKey)) {
          issues.push({ code: 'duplicate-title', message: `Another Cheat Sheet already uses “${parsed.title}”.`, relativePath: document.relativePath });
          continue;
        }
        titleKeys.add(titleKey);
        userSheets.push(parsed);
      } else {
        if (overlays[document.id]) {
          issues.push({ code: 'duplicate-overlay', message: `Duplicate overlay for ${document.id}.`, relativePath: document.relativePath });
          continue;
        }
        overlays[document.id] = parsed.sections;
      }
      documents.set(key, document);
    } catch (error) {
      issues.push({
        code: 'invalid-markdown',
        message: error instanceof Error ? error.message : String(error),
        relativePath: document.relativePath
      });
    }
  }

  return { userSheets, overlays, documents, issues };
}

export function documentsFromState(state: Pick<AppState, 'userSheets' | 'overlays'>, builtins: readonly CheatSheet[]): UserDocumentSpec[] {
  const documents: UserDocumentSpec[] = [];
  for (const sheet of state.userSheets) {
    documents.push({ kind: 'sheet', id: sheet.id, content: serializeUserSheet(sheet) });
  }
  for (const [sheetId, sections] of Object.entries(state.overlays)) {
    if (!sections.length) continue;
    const builtin = builtins.find((sheet) => sheet.id === sheetId);
    if (!builtin) continue;
    documents.push({ kind: 'overlay', id: sheetId, content: serializeOverlay(builtin, sections) });
  }
  return documents.sort((a, b) => userDocumentKey(a.kind, a.id).localeCompare(userDocumentKey(b.kind, b.id)));
}

export function canonicalDocumentContent(document: UserDocumentSpec, builtins: readonly CheatSheet[]): string {
  const parsed = validateUserMarkdown(document, builtins);
  if (document.kind === 'sheet') return serializeUserSheet(parsed);
  const builtin = builtins.find((sheet) => sheet.id === document.id)!;
  return serializeOverlay(builtin, parsed.sections);
}
