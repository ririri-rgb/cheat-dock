import './styles.css';
import { listen } from '@tauri-apps/api/event';
import { loadBuiltins } from './builtins.ts';
import { sheetForApplication, type ForegroundApplication } from './native.ts';
import { searchSheets } from './search.ts';
import { loadState, mergeSheet, recordRecent, saveState, togglePin } from './state.ts';
import type { AppState, CheatItem, CheatSection, CheatSheet } from './model.ts';

const root = document.querySelector<HTMLDivElement>('#app')!;
const builtins = loadBuiltins();
let state = loadState(localStorage);
let selectedId = builtins.find((sheet) => sheet.id === 'my-work')?.id ?? builtins[0]?.id ?? 'my-work';
let manualSelection = false;
let query = '';

function allSheets(): CheatSheet[] { return [...builtins.map((sheet) => mergeSheet(sheet, state.overlays[sheet.id])), ...state.userSheets]; }
function selected(): CheatSheet | undefined { return allSheets().find((sheet) => sheet.id === selectedId) ?? allSheets()[0]; }
function persist(next: AppState) { state = next; saveState(localStorage, state); render(); }
function escapeHtml(value: string) { const el = document.createElement('div'); el.textContent = value; return el.innerHTML; }
function field(label: string, value = '') { return `<label>${label}<input data-field="${label.toLowerCase()}" value="${escapeHtml(value)}"></label>`; }

function addItem(sheet: CheatSheet, sectionTitle: string, item: CheatItem) {
  const sectionId = sectionTitle.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'personal';
  if (sheet.userOwned) {
    persist({ ...state, userSheets: state.userSheets.map((value) => {
      if (value.id !== sheet.id) return value;
      const sections = value.sections.map((section) => ({ ...section, items: [...section.items] }));
      const section = sections.find((value) => value.id === sectionId);
      if (section) section.items.push(item); else sections.push({ id: sectionId, title: sectionTitle, items: [item], userOwned: true });
      return { ...value, sections };
    }) });
    return;
  }
  const overlays = (state.overlays[sheet.id] ?? []).map((section) => ({ ...section, items: [...section.items] }));
  const section = overlays.find((value) => value.id === sectionId);
  if (section) section.items.push(item); else overlays.push({ id: sectionId, title: sectionTitle, items: [item], userOwned: true });
  persist({ ...state, overlays: { ...state.overlays, [sheet.id]: overlays } });
}

function openEditor(sheet: CheatSheet) {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = `<form method="dialog" class="editor"><h2>Add personal item</h2>${field('Title')}${field('Section', 'Personal')}${field('Shortcut')}${field('Command')}${field('Description')}<div class="actions"><button value="cancel">Cancel</button><button value="default">Add</button></div></form>`;
  document.body.append(dialog); dialog.showModal();
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'default') {
      const get = (name: string) => (dialog.querySelector<HTMLInputElement>(`[data-field="${name}"]`)?.value ?? '').trim();
      const title = get('title'); const sectionTitle = get('section') || 'Personal';
      if (title) addItem(sheet, sectionTitle, { id: `user-${crypto.randomUUID()}`, title, kind: get('command') ? 'command' : get('shortcut') ? 'shortcut' : 'operation', shortcut: get('shortcut') || undefined, command: get('command') || undefined, description: get('description') || undefined, aliases: [], tags: [], userOwned: true });
    }
    dialog.remove();
  });
}

function createSheet() {
  const title = prompt('Cheat Sheet name'); if (!title?.trim()) return;
  const sheet: CheatSheet = { id: `user-${crypto.randomUUID()}`, title: title.trim(), aliases: [], applications: [], related: [], sections: [{ id: 'notes', title: 'Notes', items: [], userOwned: true }], userOwned: true };
  state = { ...state, userSheets: [...state.userSheets, sheet] }; saveState(localStorage, state); selectedId = sheet.id; manualSelection = true; render();
}

function updateUserItem(sheet: CheatSheet, sectionId: string, itemId: string, updater: (item: CheatItem) => CheatItem) {
  if (sheet.userOwned) {
    persist({ ...state, userSheets: state.userSheets.map((value) => value.id !== sheet.id ? value : { ...value, sections: value.sections.map((section) => section.id !== sectionId ? section : { ...section, items: section.items.map((item) => item.id === itemId ? updater(item) : item) }) }) });
    return;
  }
  persist({ ...state, overlays: { ...state.overlays, [sheet.id]: (state.overlays[sheet.id] ?? []).map((section) => section.id !== sectionId ? section : { ...section, items: section.items.map((item) => item.id === itemId ? updater(item) : item) }) } });
}

function removeUserItem(sheet: CheatSheet, sectionId: string, itemId: string) {
  if (sheet.userOwned) {
    persist({ ...state, userSheets: state.userSheets.map((value) => value.id !== sheet.id ? value : { ...value, sections: value.sections.map((section) => section.id !== sectionId ? section : { ...section, items: section.items.filter((item) => item.id !== itemId) }) }) });
    return;
  }
  const overlays = (state.overlays[sheet.id] ?? []).map((section) => section.id !== sectionId ? section : { ...section, items: section.items.filter((item) => item.id !== itemId) }).filter((section) => section.items.length > 0);
  persist({ ...state, overlays: { ...state.overlays, [sheet.id]: overlays } });
}

function renderItem(sheet: CheatSheet, section: CheatSection, item: CheatItem) {
  return `<article class="item" data-view="${escapeHtml(`${sheet.id}:${item.id}`)}"><div class="item-head"><strong>${escapeHtml(item.title)}</strong><span class="kind">${item.kind}</span></div>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}${item.shortcut ? `<button class="copy" data-copy="${escapeHtml(item.shortcut)}"><kbd>${escapeHtml(item.shortcut)}</kbd></button>` : ''}${item.command ? `<button class="copy command" data-copy="${escapeHtml(item.command)}"><code>${escapeHtml(item.command)}</code></button>` : ''}${item.body ? `<p>${escapeHtml(item.body)}</p>` : ''}${item.userOwned ? `<div class="user-actions"><button data-edit="${escapeHtml(section.id)}:${escapeHtml(item.id)}">Edit</button><button class="danger" data-delete="${escapeHtml(section.id)}:${escapeHtml(item.id)}">Delete</button></div>` : ''}</article>`;
}

function render() {
  const sheets = allSheets(); const sheet = selected();
  if (!sheet) { root.innerHTML = '<main class="empty">No valid Cheat Sheets found.</main>'; return; }
  const visibleNav = Array.from(new Set([selectedId, ...state.pinned])).map((id) => sheets.find((value) => value.id === id)).filter((value): value is CheatSheet => Boolean(value)).slice(0, 6);
  const hits = query ? searchSheets(sheets, query) : [];
  root.innerHTML = `<main><header><div class="nav">${visibleNav.map((s) => `<button class="sheet-tab ${s.id === sheet.id ? 'active' : ''}" data-sheet="${s.id}">${escapeHtml(s.title)}</button>`).join('')}<select id="all-sheets"><option value="">All Sheets…</option>${sheets.map((s) => `<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('')}</select></div><div class="toolbar"><input id="search" type="search" placeholder="Search all Cheat Sheets" value="${escapeHtml(query)}"><button id="pin">${state.pinned.includes(sheet.id) ? 'Unpin' : 'Pin'}</button><button id="add">＋ Item</button><button id="create">＋ Sheet</button></div></header><section class="content">${query ? `<div class="search-label">${hits.length} results across all sheets</div>${hits.map((hit) => `<div class="search-context">${escapeHtml(hit.sheetTitle)} › ${escapeHtml(hit.sectionTitle)}</div>${renderItem(sheets.find((s) => s.id === hit.sheetId)!, { id: hit.sectionId, title: hit.sectionTitle, items: [] }, hit.item)}`).join('') || '<p class="muted">No matches.</p>'}` : `${(state.recent[sheet.id]?.length ?? 0) ? `<details open><summary>Recently viewed</summary>${state.recent[sheet.id]!.map((id) => sheet.sections.flatMap((section) => section.items).find((item) => item.id === id)).filter((item): item is CheatItem => Boolean(item)).map((item) => `<div class="recent">${escapeHtml(item.title)}</div>`).join('')}</details>` : ''}${sheet.sections.map((section) => `<details ${state.expanded[sheet.id]?.includes(section.id) ? 'open' : ''} data-section="${section.id}"><summary>${escapeHtml(section.title)} <span>${section.items.length}</span></summary>${section.items.map((item) => renderItem(sheet, section, item)).join('') || '<p class="muted">No items yet.</p>'}</details>`).join('')}`}</section></main>`;
  root.querySelectorAll<HTMLButtonElement>('[data-sheet]').forEach((button) => button.onclick = () => { selectedId = button.dataset.sheet!; manualSelection = true; query = ''; render(); });
  root.querySelector<HTMLSelectElement>('#all-sheets')!.onchange = (event) => { const id = (event.currentTarget as HTMLSelectElement).value; if (id) { selectedId = id; manualSelection = true; query = ''; render(); } };
  root.querySelector<HTMLInputElement>('#search')!.oninput = (event) => { query = (event.currentTarget as HTMLInputElement).value; render(); queueMicrotask(() => { const input = root.querySelector<HTMLInputElement>('#search'); input?.focus(); input?.setSelectionRange(query.length, query.length); }); };
  root.querySelector<HTMLButtonElement>('#pin')!.onclick = () => persist(togglePin(state, sheet.id));
  root.querySelector<HTMLButtonElement>('#add')!.onclick = () => openEditor(sheet);
  root.querySelector<HTMLButtonElement>('#create')!.onclick = createSheet;
  root.querySelectorAll<HTMLDetailsElement>('details[data-section]').forEach((details) => details.ontoggle = () => { const current = new Set(state.expanded[sheet.id] ?? []); details.open ? current.add(details.dataset.section!) : current.delete(details.dataset.section!); state = { ...state, expanded: { ...state.expanded, [sheet.id]: [...current] } }; saveState(localStorage, state); });
  root.querySelectorAll<HTMLElement>('[data-view]').forEach((element) => element.onclick = () => { const [, itemId] = element.dataset.view!.split(':'); if (itemId) { state = recordRecent(state, sheet.id, itemId); saveState(localStorage, state); } });
  root.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => button.onclick = (event) => { event.stopPropagation(); void navigator.clipboard.writeText(button.dataset.copy!); });
  root.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((button) => button.onclick = (event) => { event.stopPropagation(); const [sectionId, itemId] = button.dataset.edit!.split(':'); const item = sheet.sections.find((section) => section.id === sectionId)?.items.find((value) => value.id === itemId); if (!sectionId || !itemId || !item) return; const title = prompt('Item title', item.title); if (title?.trim()) updateUserItem(sheet, sectionId, itemId, (value) => ({ ...value, title: title.trim() })); });
  root.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((button) => button.onclick = (event) => { event.stopPropagation(); const [sectionId, itemId] = button.dataset.delete!.split(':'); if (sectionId && itemId && confirm('Delete this personal item?')) removeUserItem(sheet, sectionId, itemId); });
}

render();
void listen<ForegroundApplication>('foreground-app', ({ payload }) => {
  manualSelection = false;
  query = '';
  selectedId = sheetForApplication(payload.bundleId, allSheets()) ?? (builtins.find((sheet) => sheet.id === 'my-work')?.id ?? selectedId);
  render();
});
