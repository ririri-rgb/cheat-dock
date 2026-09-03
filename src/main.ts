import './styles.css';
import { listen } from '@tauri-apps/api/event';
import { loadBuiltins } from './builtins.ts';
import {
  createCustomSheet,
  customSheetItemCount,
  deleteCustomSheet,
  fallbackSheetIdAfterDelete,
  renameCustomSheet
} from './custom-sheets.ts';
import {
  initializeFileContent,
  nativeUserStorage,
  persistAuthoredState,
  reloadFileContent,
  type FileContentSession
} from './file-content-store.ts';
import { detectLocale, sectionLabel, sheetLabel } from './locale.ts';
import { fitNavigation } from './navigation.ts';
import { sheetForApplication, type ForegroundApplication } from './native.ts';
import {
  deletePersonalItem,
  editPersonalItem,
  editorKindForItem,
  inactiveItemValueWarning,
  isEditableItemKind,
  itemFromDraft,
  normalizeItemDraft,
  sectionIdForTitle,
  type EditableItemKind,
  type ItemDraft
} from './personal-items.ts';
import { compactItemView, recentItemViews } from './presentation.ts';
import { groupSearchHits } from './search-groups.ts';
import { searchSheets } from './search.ts';
import { ImeAwareSearchInput } from './search-input.ts';
import { captureKeyboardEvent, formatMacShortcut } from './shortcut.ts';
import { loadState, mergeSheet, recordRecent, saveState, saveUiState, togglePin } from './state.ts';
import { uiText } from './ui-text.ts';
import type { AppState, CheatItem, CheatSection, CheatSheet } from './model.ts';

const root = document.querySelector<HTMLDivElement>('#app')!;
const builtins = loadBuiltins();
const locale = detectLocale(navigator.languages);
const imeSearch = new ImeAwareSearchInput();
let state = loadState(localStorage);
let fileSession: FileContentSession = { mode: 'legacy', state, documents: new Map(), issues: [] };
let selectedId = builtins.find((sheet) => sheet.id === 'my-work')?.id ?? builtins[0]?.id ?? 'my-work';
let query = '';
let navObserver: ResizeObserver | undefined;
let storageInitializing = true;
let transientNotice: string | undefined;

const text = uiText(locale);

function allSheets(): CheatSheet[] {
  return [...builtins.map((sheet) => mergeSheet(sheet, state.overlays[sheet.id])), ...state.userSheets];
}

function selected(): CheatSheet | undefined {
  return allSheets().find((sheet) => sheet.id === selectedId) ?? allSheets()[0];
}

function setSession(session: FileContentSession) {
  fileSession = session;
  state = session.state;
}

function persistUi(next: AppState, shouldRender = true) {
  state = next;
  fileSession = { ...fileSession, state: next };
  if (fileSession.mode === 'files') saveUiState(localStorage, next);
  else saveState(localStorage, next);
  if (shouldRender) render();
}

async function initializeStorage() {
  storageInitializing = true;
  try {
    const session = await initializeFileContent(loadState(localStorage), builtins, localStorage);
    setSession(session);
  } catch (error) {
    transientNotice = `User data initialization failed: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    storageInitializing = false;
    render();
  }
}

async function reloadUserFiles() {
  storageInitializing = true;
  render();
  try {
    const session = fileSession.mode === 'files'
      ? await reloadFileContent(fileSession, builtins, localStorage)
      : await initializeFileContent(loadState(localStorage), builtins, localStorage);
    setSession(session);
    transientNotice = session.issues.length ? undefined : 'User Markdown reloaded.';
  } catch (error) {
    transientNotice = `Reload failed: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    storageInitializing = false;
    render();
  }
}

async function persistAuthored(next: AppState, dialog?: HTMLDialogElement): Promise<boolean> {
  const result = await persistAuthoredState(fileSession, next, builtins, localStorage);
  setSession(result.session);
  if (!result.ok) {
    const location = result.error.relativePath ? `${result.error.relativePath}: ` : '';
    const message = `${location}${result.error.message}`;
    transientNotice = message;
    if (dialog) setDialogError(dialog, message);
    return false;
  }
  transientNotice = undefined;
  render();
  if (result.session.mode === 'legacy') window.setTimeout(() => { void initializeStorage(); }, 0);
  return true;
}

function escapeHtml(value: string) {
  const el = document.createElement('div');
  el.textContent = value;
  return el.innerHTML;
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
}

function field(name: string, label: string, value = '', required = false) {
  return `<label>${label}<input data-field="${escapeAttr(name)}" value="${escapeAttr(value)}"${required ? ' required' : ''}></label>`;
}

function typeField(kind: EditableItemKind) {
  return `<label>Type<select data-field="kind"><option value="shortcut"${kind === 'shortcut' ? ' selected' : ''}>Shortcut</option><option value="command"${kind === 'command' ? ' selected' : ''}>Command</option></select></label>`;
}

function shortcutField(value = '') {
  const preview = formatMacShortcut(value);
  return `<label>Shortcut<div class="shortcut-field"><input data-field="shortcut" value="${escapeAttr(value)}" autocomplete="off" spellcheck="false"><button type="button" data-record-shortcut>Record</button></div><span class="shortcut-preview" data-shortcut-preview>${escapeHtml(preview)}</span></label>`;
}

function setDialogError(dialog: HTMLDialogElement, message: string) {
  const error = dialog.querySelector<HTMLElement>('.form-error');
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
}

function setupShortcutCapture(dialog: HTMLDialogElement) {
  const input = dialog.querySelector<HTMLInputElement>('[data-field="shortcut"]');
  const button = dialog.querySelector<HTMLButtonElement>('[data-record-shortcut]');
  const preview = dialog.querySelector<HTMLElement>('[data-shortcut-preview]');
  if (!input || !button || !preview) return;
  let recording = false;

  const updatePreview = () => {
    preview.textContent = input.value.trim() ? formatMacShortcut(input.value) : '';
  };
  const stop = () => {
    recording = false;
    button.classList.remove('recording');
    button.textContent = 'Record';
  };
  const start = () => {
    recording = true;
    button.classList.add('recording');
    button.textContent = 'Press shortcut…';
    button.focus();
  };

  input.addEventListener('input', updatePreview);
  button.onclick = () => recording ? stop() : start();
  button.onkeydown = (event) => {
    if (!recording) return;
    const result = captureKeyboardEvent({
      key: event.key,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      isComposing: event.isComposing,
      repeat: event.repeat
    });
    if (result.status === 'ignore') return;
    event.preventDefault();
    event.stopPropagation();
    if (result.status === 'pending') return;
    if (result.status === 'cancel') {
      stop();
      input.focus();
      return;
    }
    input.value = result.value;
    updatePreview();
    stop();
    input.focus();
  };
  button.addEventListener('blur', () => {
    if (recording) stop();
  });
  updatePreview();
}

function setupItemTypeControls(dialog: HTMLDialogElement) {
  const type = dialog.querySelector<HTMLSelectElement>('[data-field="kind"]');
  const shortcutPanel = dialog.querySelector<HTMLElement>('[data-kind-panel="shortcut"]');
  const commandPanel = dialog.querySelector<HTMLElement>('[data-kind-panel="command"]');
  const shortcut = dialog.querySelector<HTMLInputElement>('[data-field="shortcut"]');
  const command = dialog.querySelector<HTMLInputElement>('[data-field="command"]');
  const warning = dialog.querySelector<HTMLElement>('[data-type-warning]');
  if (!type || !shortcutPanel || !commandPanel || !shortcut || !command || !warning) return;

  const refresh = () => {
    const kind: EditableItemKind = type.value === 'command' ? 'command' : 'shortcut';
    shortcutPanel.hidden = kind !== 'shortcut';
    commandPanel.hidden = kind !== 'command';
    const message = inactiveItemValueWarning(kind, shortcut.value, command.value);
    warning.textContent = message ?? '';
    warning.hidden = !message;
  };

  type.addEventListener('change', refresh);
  shortcut.addEventListener('input', refresh);
  command.addEventListener('input', refresh);
  refresh();
}

function stateWithAddedItem(sheet: CheatSheet, sectionTitle: string, item: CheatItem): AppState {
  const sectionId = sectionIdForTitle(sectionTitle);
  if (sheet.userOwned) {
    return {
      ...state,
      userSheets: state.userSheets.map((value) => {
        if (value.id !== sheet.id) return value;
        const sections = value.sections.map((section) => ({ ...section, items: [...section.items] }));
        const section = sections.find((value) => value.id === sectionId);
        if (section) section.items.push(item);
        else sections.push({ id: sectionId, title: sectionTitle, items: [item], userOwned: true });
        return { ...value, sections };
      })
    };
  }
  const overlays = (state.overlays[sheet.id] ?? []).map((section) => ({ ...section, items: [...section.items] }));
  const section = overlays.find((value) => value.id === sectionId);
  if (section) section.items.push(item);
  else overlays.push({ id: sectionId, title: sectionTitle, items: [item], userOwned: true });
  return { ...state, overlays: { ...state.overlays, [sheet.id]: overlays } };
}

function readItemDraft(dialog: HTMLDialogElement): ItemDraft {
  const get = (name: string) => dialog.querySelector<HTMLInputElement>(`[data-field="${name}"]`)?.value ?? '';
  const kind = dialog.querySelector<HTMLSelectElement>('[data-field="kind"]')?.value === 'command' ? 'command' : 'shortcut';
  return { title: get('title'), section: get('section'), kind, shortcut: get('shortcut'), command: get('command'), description: get('description') };
}

function openItemEditor(sheet: CheatSheet, section?: CheatSection, item?: CheatItem) {
  if (item && !isEditableItemKind(item.kind)) {
    transientNotice = `${item.kind} items remain Markdown-editable; the GUI editor currently supports Shortcut and Command items.`;
    render();
    return;
  }
  const dialog = document.createElement('dialog');
  const editing = Boolean(section && item);
  const initialKind = editorKindForItem(item);
  dialog.innerHTML = `<form class="editor"><h2>${editing ? 'Edit personal item' : 'Add personal item'}</h2>${field('title', 'Title', item?.title ?? '', true)}${field('section', 'Section', section?.title ?? 'Personal', true)}${typeField(initialKind)}<div data-kind-panel="shortcut">${shortcutField(item?.shortcut ?? '')}</div><div data-kind-panel="command">${field('command', 'Command', item?.command ?? '')}</div>${field('description', 'Description', item?.description ?? '')}<p class="confirm-copy" data-type-warning hidden></p><p class="form-error" hidden></p><div class="actions"><button type="button" data-cancel>Cancel</button><button type="submit">${editing ? 'Save' : 'Add'}</button></div></form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => dialog.close('cancel');
  dialog.querySelector<HTMLFormElement>('form')!.onsubmit = async (event) => {
    event.preventDefault();
    const draft = readItemDraft(dialog);
    const normalized = normalizeItemDraft(draft);
    const nextItem = itemFromDraft(item?.id ?? `user-${crypto.randomUUID()}`, draft, item);
    if (!normalized || !nextItem) {
      setDialogError(dialog, `Title, section, and ${draft.kind === 'shortcut' ? 'Shortcut' : 'Command'} are required.`);
      return;
    }
    const submit = dialog.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    submit.disabled = true;
    const next = editing && section && item
      ? editPersonalItem(state, sheet.id, section.id, item.id, draft)
      : stateWithAddedItem(sheet, normalized.section, nextItem);
    const saved = await persistAuthored(next, dialog);
    if (saved) dialog.close('save');
    else submit.disabled = false;
  };
  dialog.showModal();
  setupShortcutCapture(dialog);
  setupItemTypeControls(dialog);
  dialog.querySelector<HTMLInputElement>('[data-field="title"]')?.focus();
}

function openDeleteItemDialog(sheet: CheatSheet, section: CheatSection, item: CheatItem) {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = `<form class="editor"><h2>Delete personal item?</h2><p class="confirm-copy">${escapeHtml(item.title)}</p><p class="form-error" hidden></p><div class="actions"><button type="button" data-cancel>Cancel</button><button type="submit" class="danger-action">Delete</button></div></form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => dialog.close('cancel');
  dialog.querySelector<HTMLFormElement>('form')!.onsubmit = async (event) => {
    event.preventDefault();
    const submit = dialog.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    submit.disabled = true;
    const saved = await persistAuthored(deletePersonalItem(state, sheet.id, section.id, item.id), dialog);
    if (saved) dialog.close('delete');
    else submit.disabled = false;
  };
  dialog.showModal();
}

function openSheetEditor(sheet?: CheatSheet) {
  const dialog = document.createElement('dialog');
  const editing = Boolean(sheet);
  dialog.innerHTML = `<form class="editor"><h2>${editing ? text.renameSheet : 'New Cheat Sheet'}</h2>${field('name', 'Name', sheet?.title ?? '', true)}<p class="form-error" hidden></p><div class="actions"><button type="button" data-cancel>Cancel</button><button type="submit">${editing ? 'Save' : 'Create'}</button></div></form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => dialog.close('cancel');
  dialog.querySelector<HTMLFormElement>('form')!.onsubmit = async (event) => {
    event.preventDefault();
    const name = dialog.querySelector<HTMLInputElement>('[data-field="name"]')?.value ?? '';
    const result = sheet
      ? renameCustomSheet(state, allSheets(), sheet.id, name)
      : createCustomSheet(state, allSheets(), name, `user-${crypto.randomUUID()}`);
    if (!result.ok) {
      setDialogError(dialog, result.error ?? 'Unable to save this Cheat Sheet.');
      return;
    }
    const submit = dialog.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    submit.disabled = true;
    const saved = await persistAuthored(result.state, dialog);
    if (!saved) {
      submit.disabled = false;
      return;
    }
    if (!sheet && result.sheet) selectedId = result.sheet.id;
    query = '';
    dialog.close('save');
    render();
  };
  dialog.showModal();
  const input = dialog.querySelector<HTMLInputElement>('[data-field="name"]');
  input?.focus();
  input?.select();
}

function openDeleteSheetDialog(sheet: CheatSheet) {
  if (!sheet.userOwned) return;
  const dialog = document.createElement('dialog');
  const count = customSheetItemCount(sheet);
  dialog.innerHTML = `<form class="editor"><h2>Delete “${escapeHtml(sheet.title)}”?</h2><p class="confirm-copy">This sheet contains ${count} item${count === 1 ? '' : 's'}.</p><p class="form-error" hidden></p><div class="actions"><button type="button" data-cancel>Cancel</button><button type="submit" class="danger-action">Delete</button></div></form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => dialog.close('cancel');
  dialog.querySelector<HTMLFormElement>('form')!.onsubmit = async (event) => {
    event.preventDefault();
    const sheetsBeforeDelete = allSheets();
    const result = deleteCustomSheet(state, sheet.id);
    if (!result.ok) return;
    const fallback = fallbackSheetIdAfterDelete(sheet.id, selectedId, sheetsBeforeDelete);
    const submit = dialog.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    submit.disabled = true;
    const saved = await persistAuthored(result.state, dialog);
    if (!saved) {
      submit.disabled = false;
      return;
    }
    selectedId = fallback;
    query = '';
    dialog.close('delete');
    render();
  };
  dialog.showModal();
}

function openSheetManagement(sheet: CheatSheet) {
  if (!sheet.userOwned) return;
  const dialog = document.createElement('dialog');
  dialog.classList.add('sheet-management-dialog');
  dialog.innerHTML = `<div class="sheet-management"><h2>${escapeHtml(sheet.title)}</h2><button type="button" data-rename>${text.renameSheet}</button><button type="button" class="danger-menu-action" data-delete-sheet>${text.deleteSheet}</button><button type="button" class="menu-cancel" data-cancel>Cancel</button></div>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => dialog.close('cancel');
  dialog.querySelector<HTMLButtonElement>('[data-rename]')!.onclick = () => {
    dialog.close('rename');
    window.setTimeout(() => openSheetEditor(sheet), 0);
  };
  dialog.querySelector<HTMLButtonElement>('[data-delete-sheet]')!.onclick = () => {
    dialog.close('delete');
    window.setTimeout(() => openDeleteSheetDialog(sheet), 0);
  };
  dialog.showModal();
}

function itemValueMarkup(item: CheatItem): string {
  const view = compactItemView(item, locale);
  if (!view.value || !view.valueKind) return '';
  const displayValue = escapeHtml(view.value);
  const displayAttr = escapeAttr(view.value);
  const copyValue = escapeAttr(view.rawValue ?? view.value);
  const content = view.valueKind === 'shortcut' ? `<kbd>${displayValue}</kbd>` : `<code title="${displayAttr}">${displayValue}</code>`;
  return `<button class="item-value copy ${view.valueKind}" data-copy="${copyValue}" title="Copy ${displayAttr}" aria-label="Copy ${displayAttr}">${content}</button>`;
}

function renderItem(sheet: CheatSheet, section: CheatSection, item: CheatItem, context?: string) {
  const view = compactItemView(item, locale);
  const editRef = `${sheet.id}:${section.id}:${item.id}`;
  const editAction = item.userOwned && isEditableItemKind(item.kind) ? `<button data-edit="${escapeAttr(editRef)}">${text.edit}</button>` : '';
  const deleteAction = item.userOwned ? `<button class="danger" data-delete="${escapeAttr(editRef)}">${text.delete}</button>` : '';
  const actions = editAction || deleteAction ? `<span class="user-actions">${editAction}${deleteAction}</span>` : '';
  return `<div class="item-cell layout-${view.layout}">${context ? `<div class="search-context">${escapeHtml(context)}</div>` : ''}<article id="item-${escapeAttr(sheet.id)}-${escapeAttr(item.id)}" class="item" tabindex="0" data-view="${escapeAttr(`${sheet.id}:${item.id}`)}"><span class="item-label">${escapeHtml(view.label)}</span>${itemValueMarkup(item)}${actions}</article></div>`;
}

function renderRecent(sheet: CheatSheet): string {
  const views = recentItemViews(sheet, state.recent[sheet.id] ?? [], locale);
  if (!views.length) return '';
  return `<details open class="recent-section"><summary>${text.recent}</summary><div class="item-grid recent-grid">${views.map(({ section, item, view }) => {
    const value = view.value ? `<span class="recent-value ${view.valueKind ?? ''}" title="${escapeAttr(view.value)}">${view.valueKind === 'command' ? `<code>${escapeHtml(view.value)}</code>` : `<kbd>${escapeHtml(view.value)}</kbd>`}</span>` : '';
    return `<button class="recent-item layout-${view.layout}" data-jump="${escapeAttr(`${section.id}:${item.id}`)}"><span>${escapeHtml(view.label)}</span>${value}</button>`;
  }).join('')}</div></details>`;
}

function renderSearchResults(sheets: CheatSheet[], sheet: CheatSheet, hits: ReturnType<typeof searchSheets>): string {
  const grouped = groupSearchHits(hits, sheet.id);
  const current = grouped.current.length
    ? `<div class="item-grid search-grid">${grouped.current.map((hit) => renderItem(sheet, { id: hit.sectionId, title: hit.sectionTitle, items: [] }, hit.item, hit.sectionTitle)).join('')}</div>`
    : `<p class="muted search-empty">${text.noCurrentMatches}</p>`;
  const other = grouped.other.length
    ? `<section class="search-other"><div class="search-group-heading"><span>${text.otherSheets}</span></div>${grouped.other.map((group) => {
        const groupSheet = sheets.find((candidate) => candidate.id === group.sheetId);
        if (!groupSheet) return '';
        return `<div class="search-sheet-group"><div class="search-sheet-title">${escapeHtml(group.sheetTitle)}</div><div class="item-grid search-grid">${group.hits.map((hit) => renderItem(groupSheet, { id: hit.sectionId, title: hit.sectionTitle, items: [] }, hit.item, hit.sectionTitle)).join('')}</div></div>`;
      }).join('')}</section>`
    : '';
  return `<div class="search-label">${hits.length} ${text.resultSuffix}</div><section class="search-current"><div class="search-group-heading"><span>${text.currentSheet}</span><strong>${escapeHtml(sheetLabel(sheet, locale))}</strong></div>${current}</section>${other}${hits.length ? '' : `<p class="muted">${text.noMatches}</p>`}`;
}

function renderStorageNotice(): string {
  const storageIssue = fileSession.issues[0];
  const message = transientNotice ?? (storageIssue ? `${storageIssue.relativePath ? `${storageIssue.relativePath}: ` : ''}${storageIssue.message}` : '');
  if (!message && !storageInitializing) return '';
  const label = storageInitializing ? 'Loading user Markdown…' : message;
  return `<div class="storage-notice ${storageIssue || transientNotice?.toLowerCase().includes('failed') ? 'storage-error' : ''}"><span>${escapeHtml(label)}</span><div class="storage-actions">${!storageInitializing ? `<button id="reload-files">${text.reloadFiles}</button>` : ''}</div></div>`;
}

function fitNavigationToWidth() {
  const strip = root.querySelector<HTMLElement>('.nav-tabs');
  if (!strip) return;
  const buttons = [...strip.querySelectorAll<HTMLButtonElement>('[data-sheet]')];
  buttons.forEach((button) => { button.hidden = false; });
  const measurements = buttons.map((button) => ({ id: button.dataset.sheet!, width: Math.min(124, Math.max(44, Math.ceil(button.scrollWidth))) }));
  const visible = new Set(fitNavigation(measurements, strip.clientWidth));
  buttons.forEach((button) => { button.hidden = !visible.has(button.dataset.sheet!); });
}

function setupNavigationFit() {
  navObserver?.disconnect();
  navObserver = undefined;
  const strip = root.querySelector<HTMLElement>('.nav-tabs');
  if (!strip) return;
  const refit = () => window.requestAnimationFrame(fitNavigationToWidth);
  refit();
  if (typeof ResizeObserver !== 'undefined') {
    navObserver = new ResizeObserver(refit);
    navObserver.observe(strip);
  }
}

async function copyDataFolderPath() {
  try {
    const path = fileSession.rootPath ?? await nativeUserStorage.path();
    await navigator.clipboard.writeText(path);
    transientNotice = `Data folder path copied: ${path}`;
  } catch (error) {
    transientNotice = `Unable to copy data folder path: ${error instanceof Error ? error.message : String(error)}`;
  }
  render();
}

function render(options: { focusSearch?: boolean } = {}) {
  const sheets = allSheets();
  const sheet = selected();
  if (!sheet) {
    root.innerHTML = '<main class="empty">No valid Cheat Sheets found.</main>';
    return;
  }

  const navSheets = Array.from(new Set([selectedId, ...state.pinned]))
    .map((id) => sheets.find((value) => value.id === id))
    .filter((value): value is CheatSheet => Boolean(value));
  const hits = query ? searchSheets(sheets, query, locale) : [];
  const content = query
    ? renderSearchResults(sheets, sheet, hits)
    : `${renderRecent(sheet)}${sheet.sections.map((section) => `<details ${state.expanded[sheet.id]?.includes(section.id) ? 'open' : ''} data-section="${escapeAttr(section.id)}"><summary>${escapeHtml(sectionLabel(section, locale))} <span>${section.items.length}</span></summary><div class="item-grid">${section.items.map((item) => renderItem(sheet, section, item)).join('') || `<p class="muted">${text.noItems}</p>`}</div></details>`).join('')}`;
  const disabled = storageInitializing ? ' disabled' : '';

  root.innerHTML = `<main><header><div class="nav"><div class="nav-tabs">${navSheets.map((candidate) => `<button class="sheet-tab ${candidate.id === sheet.id ? 'active' : ''}" data-sheet="${escapeAttr(candidate.id)}">${escapeHtml(sheetLabel(candidate, locale))}</button>`).join('')}</div><select id="all-sheets" aria-label="${escapeAttr(text.allSheets)}"><option value="">${text.allSheets}</option>${sheets.map((candidate) => `<option value="${escapeAttr(candidate.id)}">${escapeHtml(sheetLabel(candidate, locale))}</option>`).join('')}</select></div><div class="toolbar"><input id="search" type="search" autocomplete="off" spellcheck="false" placeholder="${escapeAttr(text.search)}" value="${escapeAttr(query)}"><div class="toolbar-actions"><button id="pin">${state.pinned.includes(sheet.id) ? text.unpin : text.pin}</button><button id="add"${disabled}>${text.addItem}</button><button id="create"${disabled}>${text.addSheet}</button><button id="data-folder" title="Copy user data folder path">${text.dataFolder}</button>${sheet.userOwned ? `<button id="manage" aria-label="${escapeAttr(text.manageSheet)}" title="${escapeAttr(text.manageSheet)}"${disabled}>…</button>` : ''}</div></div>${renderStorageNotice()}</header><section class="content">${content}</section></main>`;

  root.querySelectorAll<HTMLButtonElement>('[data-sheet]').forEach((button) => button.onclick = () => {
    selectedId = button.dataset.sheet!;
    query = '';
    render();
  });

  root.querySelector<HTMLSelectElement>('#all-sheets')!.onchange = (event) => {
    const id = (event.currentTarget as HTMLSelectElement).value;
    if (id) { selectedId = id; query = ''; render(); }
  };

  const search = root.querySelector<HTMLInputElement>('#search')!;
  search.addEventListener('compositionstart', () => imeSearch.compositionStart());
  search.addEventListener('compositionend', (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const deferred = imeSearch.compositionEnd(input.value);
    window.setTimeout(() => {
      if (imeSearch.canCommitDeferred(deferred) && query !== deferred.value) {
        query = deferred.value;
        render({ focusSearch: true });
      }
    }, 0);
  });
  search.addEventListener('input', (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const next = imeSearch.input(input.value, (event as InputEvent).isComposing);
    if (next === null || next === query) return;
    query = next;
    render({ focusSearch: true });
  });

  root.querySelector<HTMLButtonElement>('#pin')!.onclick = () => persistUi(togglePin(state, sheet.id));
  root.querySelector<HTMLButtonElement>('#add')!.onclick = () => openItemEditor(sheet);
  root.querySelector<HTMLButtonElement>('#create')!.onclick = () => openSheetEditor();
  root.querySelector<HTMLButtonElement>('#data-folder')!.onclick = () => { void copyDataFolderPath(); };
  const reload = root.querySelector<HTMLButtonElement>('#reload-files');
  if (reload) reload.onclick = () => { void reloadUserFiles(); };
  const manage = root.querySelector<HTMLButtonElement>('#manage');
  if (manage) manage.onclick = () => openSheetManagement(sheet);

  root.querySelectorAll<HTMLDetailsElement>('details[data-section]').forEach((details) => details.ontoggle = () => {
    const current = new Set(state.expanded[sheet.id] ?? []);
    details.open ? current.add(details.dataset.section!) : current.delete(details.dataset.section!);
    persistUi({ ...state, expanded: { ...state.expanded, [sheet.id]: [...current] } }, false);
  });

  const viewItem = (element: HTMLElement) => {
    const [sheetId, itemId] = element.dataset.view?.split(':') ?? [];
    if (!sheetId || !itemId) return;
    persistUi(recordRecent(state, sheetId, itemId), false);
  };
  root.querySelectorAll<HTMLElement>('[data-view]').forEach((element) => {
    element.onclick = () => viewItem(element);
    element.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        viewItem(element);
      }
    };
  });

  root.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => button.onclick = (event) => {
    event.stopPropagation();
    const item = button.closest<HTMLElement>('[data-view]');
    if (item) viewItem(item);
    void navigator.clipboard.writeText(button.dataset.copy!);
  });

  root.querySelectorAll<HTMLButtonElement>('[data-jump]').forEach((button) => button.onclick = () => {
    const [sectionId, itemId] = button.dataset.jump!.split(':');
    if (!sectionId || !itemId) return;
    const expanded = new Set(state.expanded[sheet.id] ?? []);
    expanded.add(sectionId);
    persistUi({ ...state, expanded: { ...state.expanded, [sheet.id]: [...expanded] } }, false);
    render();
    const target = document.getElementById(`item-${sheet.id}-${itemId}`);
    target?.scrollIntoView({ block: 'nearest' });
    target?.focus({ preventScroll: true });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((button) => button.onclick = (event) => {
    event.stopPropagation();
    const [sheetId, sectionId, itemId] = button.dataset.edit!.split(':');
    const targetSheet = sheets.find((candidate) => candidate.id === sheetId);
    const section = targetSheet?.sections.find((candidate) => candidate.id === sectionId);
    const item = section?.items.find((value) => value.id === itemId);
    if (targetSheet && section && item?.userOwned && isEditableItemKind(item.kind)) openItemEditor(targetSheet, section, item);
  });

  root.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach((button) => button.onclick = (event) => {
    event.stopPropagation();
    const [sheetId, sectionId, itemId] = button.dataset.delete!.split(':');
    const targetSheet = sheets.find((candidate) => candidate.id === sheetId);
    const section = targetSheet?.sections.find((candidate) => candidate.id === sectionId);
    const item = section?.items.find((value) => value.id === itemId);
    if (targetSheet && section && item?.userOwned) openDeleteItemDialog(targetSheet, section, item);
  });

  setupNavigationFit();

  if (options.focusSearch) {
    const input = root.querySelector<HTMLInputElement>('#search');
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  }
}

async function refreshForPopup(payload: ForegroundApplication) {
  try {
    const session = fileSession.mode === 'files'
      ? await reloadFileContent(fileSession, builtins, localStorage)
      : await initializeFileContent(loadState(localStorage), builtins, localStorage);
    setSession(session);
  } catch (error) {
    transientNotice = `User Markdown reload failed: ${error instanceof Error ? error.message : String(error)}`;
  }
  selectedId = sheetForApplication(payload.bundleId, allSheets()) ?? (builtins.find((sheet) => sheet.id === 'my-work')?.id ?? selectedId);
  render();
}

render();
void initializeStorage();
void listen<ForegroundApplication>('foreground-app', ({ payload }) => {
  query = '';
  selectedId = sheetForApplication(payload.bundleId, allSheets()) ?? (builtins.find((sheet) => sheet.id === 'my-work')?.id ?? selectedId);
  render();
  void refreshForPopup(payload);
});
