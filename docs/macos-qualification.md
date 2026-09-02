# macOS manual qualification

Record macOS version, architecture, commit SHA, and failures. Checked items in the first section are physical evidence already reported during PR #1. PR #6 changes remain unchecked until observed on a physical Mac.

## Previously qualified foundation (PR #1)

- [x] `npm run tauri dev` starts and the menu-bar icon opens the popup.
- [x] Excel foreground-app detection works on the qualification Mac.
- [x] Japanese IME enters `コピー` without the former `kここpコピコピー` corruption.
- [x] Japanese locale detection/selective localization works.
- [x] Rounded popup appearance is acceptable.
- [x] Compact Excel items render correctly.
- [x] Recently viewed shows localized label + shortcut.
- [x] Personal items survive restart under the PR #1 persistence layer.
- [x] `Command + Option + S` displays as `⌘ ⌥ S`.
- [x] `Control + Option + Space` displays as `⌃ ⌥ Space`; Control and Command stay distinct.
- [x] Adding a personal item works and the in-app Delete confirmation opens.
- [x] Custom Cheat Sheets can be created and persist.

PR #6 must not regress these, especially Search IME composition.

# PR #6 file-backed personal-data qualification

## 1. Migration and source of truth

- [ ] Before updating, keep at least one existing My Work/custom personal item from PR #1.
- [ ] Run the PR #6 branch with `npm run tauri dev`; the existing authored item still appears after first startup.
- [ ] Close/reopen the popup and restart the app; migrated content still appears.
- [ ] Add a new personal item, restart, and confirm it remains.
- [ ] Pin/Recently viewed/expanded state remains usable after migration (these remain UI state, not Markdown content).
- [ ] No duplicate custom Sheet/item appears after several restarts.

## 2. User Markdown and Finder

- [ ] Click **Open Data Folder**. Finder reveals Cheat Dock's OS app-data `user-data` directory.
- [ ] Confirm the path contains `cheats/` and `overlays/`.
- [ ] A custom Sheet is represented by `cheats/user-<stable-id>.md` rather than a title-based filename.
- [ ] Rename the custom Sheet; its existing stable-ID filename remains the same and its `title:` updates.
- [ ] Add a personal item to a built-in such as Git/Excel; bundled repository Markdown is untouched and `overlays/<built-in-id>.md` changes.
- [ ] Edit/delete custom-Sheet and built-in-overlay items; Markdown reflects each operation after save/reload.
- [ ] Delete a custom Sheet and confirm its target Markdown disappears while one `.bak` recovery file may remain.

## 3. Direct external editing and reload

- [ ] Open one user Markdown file in VS Code/Vim, edit its human title or an item, save, then close/reopen the Cheat Dock popup; the edit appears.
- [ ] Alternatively use **Reload Files** when shown; valid external edits appear.
- [ ] External formatting changes to an unrelated file are not rewritten merely because another Sheet is edited in the GUI.
- [ ] A direct edit that creates a duplicate Sheet title is isolated/reported rather than shadowing a built-in.

## 4. Conflict protection

- [ ] Open a user file externally but leave Cheat Dock's edit dialog based on the older version.
- [ ] Save the external edit first, then press Save in Cheat Dock.
- [ ] Cheat Dock reports a conflict and does **not** overwrite the external file.
- [ ] Pressing Save again without Reload still does not overwrite it.
- [ ] Reload/reopen, review the external content, then make a fresh GUI edit; save succeeds.

## 5. Corrupt-file recovery

- [ ] Create or intentionally break one test user Markdown file (keep a backup first).
- [ ] Cheat Dock still opens; built-ins, search, and other valid user files remain usable.
- [ ] A compact storage error shows the relative file path and reason.
- [ ] Open Data Folder provides a repair path; Cheat Dock does not delete/overwrite the corrupt file.
- [ ] Fix the Markdown and reload/reopen; the error clears and content returns.

## 6. Shortcut Record

- [ ] In Add/Edit Item, the Shortcut field still accepts normal typed text.
- [ ] Click **Record**, press `⌘K`; field stores `Command + K`, preview/list displays `⌘ K`.
- [ ] Press `⌘⇧P`; stored value is `Command + Shift + P`, UI displays `⌘ ⇧ P`.
- [ ] Press `⌃⌥Space`; stored value is `Control + Option + Space`, UI displays `⌃ ⌥ Space`.
- [ ] Press `⌥↑`; stored value is `Option + Up`, UI displays `⌥ ↑`.
- [ ] Press only a modifier; capture remains pending rather than committing.
- [ ] Press Escape while recording; capture cancels without changing the existing shortcut.
- [ ] After a captured shortcut save, inspect the Markdown: it contains canonical words, not glyphs.
- [ ] Restart and confirm the captured shortcut round-trips from Markdown.

## 7. Keyboard/IME isolation

- [ ] Record mode only captures while the explicit Record control is active; normal app/search keyboard shortcuts work after capture ends.
- [ ] Japanese Search IME still enters `コピー` normally.
- [ ] `コミット 戻す` and `セル 書式` compose without duplicate/interleaved text.
- [ ] Search updates after composition commit and ordinary Latin search remains immediate.

## 8. Explicit chord presentation safety

- [ ] Create a displayed value containing `Command + K`; UI presents `⌘ K` while Markdown remains `Command + K`.
- [ ] `Press Command + Shift + P` presents `Press ⌘ ⇧ P`.
- [ ] A command `command -v node` remains exactly `command -v node` in both UI raw copy and Markdown.
- [ ] `run command`, `Git command`, and `Command failed` are not glyph-rewritten.
- [ ] Copying a command copies its raw value, not presentation glyph substitutions.

## 9. Command whitespace semantics

- [ ] Save an item whose command contains meaningful repeated spaces, for example `printf '%s  %s' "$A" "$B"`.
- [ ] Inspect Markdown after GUI save: the two internal spaces are preserved.
- [ ] Restart/reload and confirm the raw copied command still preserves those spaces.

## 10. Existing menu-bar UX regression

- [ ] Rounded panel/shadow/titlebar spacing remain acceptable.
- [ ] Foreground detection and manual Sheet navigation still work.
- [ ] Three/two/one-column adaptive layout still behaves as before.
- [ ] Recently viewed, pinning, grouped Current/Other search, selective localization, and shortcut glyphs remain intact.
- [ ] No Accessibility permission appears and no network connection is required for core use.

## Qualification record

When complete, record:

```text
macOS:
architecture:
commit:
result:
notes:
```
