# macOS manual qualification

Record macOS version, architecture, commit SHA, and failures. Checked items reflect physical evidence reported by the project owner. The final Shortcut/Command semantic refinement must be rechecked at the new HEAD before merge.

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

# PR #6 file-backed personal-data qualification

## 1. Migration and source of truth

- [x] Existing PR #1 My Work authored data migrated and remained visible.
- [x] Migrated content remained after app restart.
- [x] GUI-authored content persisted through the file-backed layer after restart.
- [ ] Pin/Recently viewed/expanded state remains usable after migration (these remain UI state, not Markdown content).
- [ ] No duplicate custom Sheet/item appears after several restarts.

## 2. User Markdown and Finder

- [x] **Open Data Folder** revealed Cheat Dock's user-data directory in Finder.
- [x] The path contains `cheats/` and `overlays/`.
- [x] GUI Add/Edit/Rename/Delete changes were reflected in Markdown.
- [ ] Confirm a custom Sheet filename remains the same stable ID across Rename.
- [ ] Confirm bundled repository Markdown remains untouched while built-in personal additions update `overlays/<built-in-id>.md`.
- [ ] Delete a custom Sheet and confirm its target Markdown disappears while one `.bak` recovery file may remain.

## 3. Direct external editing and reload

- [x] Direct Markdown editing was reflected after popup reopen/reload.
- [ ] External formatting changes to an unrelated file are not rewritten merely because another Sheet is edited in the GUI.
- [ ] A direct edit that creates a duplicate Sheet title is isolated/reported rather than shadowing a built-in.

## 4. Conflict protection

- [x] Saving a GUI edit based on an older externally changed file reports a conflict.
- [x] The external file is not overwritten.
- [x] Pressing Save again without Reload still does not overwrite it.
- [x] After Reload, a fresh GUI edit can be made against the new revision.

## 5. Corrupt-file recovery

- [ ] Create or intentionally break one test user Markdown file (keep a backup first).
- [ ] Cheat Dock still opens; built-ins, search, and other valid user files remain usable.
- [ ] A compact storage error shows the relative file path and reason.
- [ ] Open Data Folder provides a repair path; Cheat Dock does not delete/overwrite the corrupt file.
- [ ] Fix the Markdown and reload/reopen; the error clears and content returns.

## 6. Shortcut Record

- [x] `⌘K` captured as `Command + K` and displayed as `⌘ K`.
- [x] `⌘⇧P` captured as `Command + Shift + P` and displayed as `⌘ ⇧ P`.
- [x] `⌃⌥Space` captured as `Control + Option + Space` and displayed as `⌃ ⌥ Space`.
- [ ] `⌥↑` captures as `Option + Up` and displays as `⌥ ↑`.
- [ ] Modifier-only input remains pending.
- [ ] Escape cancels without replacing the existing shortcut.
- [x] Saved Record values use canonical words in Markdown and macOS glyphs only in presentation.
- [ ] Restart and confirm the captured shortcut round-trips from Markdown.

## 7. Keyboard/IME isolation

- [x] Japanese Search IME showed no regression during PR #6 qualification.
- [ ] Record mode only captures while the explicit Record control is active; normal app/search keyboard behavior works after capture ends.
- [ ] `コミット 戻す` and `セル 書式` compose without duplicate/interleaved text on the final semantic-refinement HEAD.
- [ ] Search updates after composition commit and ordinary Latin search remains immediate.

## 8. Product decision: Shortcut and Command are separate semantics

Physical qualification exposed an ambiguity: an item could contain both `shortcut` and `command`, while presentation preferred whichever field happened to be checked first. A test value `Press Command + K` also prompted reevaluation of whether Command should receive keyboard-glyph formatting.

This is resolved as a product semantic decision, not as a missing glyph-formatting bug:

- **Shortcut** = keyboard chord; `kind: shortcut` is authoritative and only its `shortcut` primary value receives macOS glyph presentation.
- **Command** = literal textual command; `kind: command` is authoritative and its `command` value is never keyboard-formatted.
- `Press Command + K` in a `command:` field therefore remains exactly `Press Command + K`.
- Existing mixed legacy items are preserved on load; editing them may explicitly normalize to the selected Type after a warning.

Final physical checks for this refinement:

- [ ] Add Item shows compact **Type** with Shortcut and Command choices.
- [ ] Type = Shortcut shows Shortcut + Record and hides Command.
- [ ] Type = Command shows Command and hides Shortcut/Record.
- [ ] Switch Shortcut → Command → Shortcut before Save; the in-dialog old value is retained while switching.
- [ ] If Save will remove an inactive value, the compact warning is visible.
- [ ] New Shortcut Markdown contains `kind: shortcut` + `shortcut:` and no `command:`.
- [ ] New Command Markdown contains `kind: command` + `command:` and no `shortcut:`.
- [ ] A mixed legacy `kind: shortcut` item displays its Shortcut even when `command:` also exists.
- [ ] A mixed legacy `kind: command` item displays its literal Command even when `shortcut:` also exists.
- [ ] Merely reopening/reloading a mixed legacy file does not rewrite or delete its inactive field.

## 9. Command literal safety

- [x] `command -v node` remained exactly `command -v node` during physical qualification.
- [ ] `git status` displays/copies exactly as stored.
- [ ] `Press Command + K` in a Command item remains exactly `Press Command + K` (no `⌘` conversion).
- [ ] `Command failed` remains exactly `Command failed`.
- [ ] `printf '%s  %s' "$A" "$B"` preserves its repeated internal spaces in UI copy and Markdown after save/reload.

## 10. Existing menu-bar UX regression

- [ ] Rounded panel/shadow/titlebar spacing remain acceptable on the final semantic-refinement HEAD.
- [ ] Foreground detection and manual Sheet navigation still work.
- [ ] Three/two/one-column adaptive layout still behaves as before.
- [ ] Recently viewed shows Shortcut glyphs for Shortcut items and literal commands for Command items.
- [ ] Search results use the same kind-aware presentation while still matching raw shortcut/command text.
- [ ] Pinning, grouped Current/Other search, and selective localization remain intact.
- [ ] No Accessibility permission appears and no network connection is required for core use.

## 11. Final search relevance finding

Physical qualification at `40bb53c6e83b2278b18800d8a378cbfd25c15750` found a short-Latin false positive: while My Work was selected, searching `Ab` also returned Terminal `pwd` because its weak prose description contains the word `absolute`.

The final search refinement keeps title/alias/tag/command/shortcut matching responsive, but weak prose/context fields use word-aware Latin matching: one- or two-character Latin/alphanumeric tokens only match an exact weak-field word, while three-or-more-character tokens may match a word prefix. Japanese/CJK weak-field substring behavior remains unchanged.

Physical recheck:

- [ ] Select My Work and search `Ab`: the My Work `Ab` item appears, and Terminal `pwd` does **not** appear under Other Sheets.
- [ ] Search `abs`: Terminal `pwd` may appear through the `absolute` description prefix.
- [ ] Confirm Japanese IME/search still behaves normally after the relevance change.

## Qualification record

For the final semantic-refinement pass, record:

```text
macOS:
architecture:
commit:
result:
notes:
```
