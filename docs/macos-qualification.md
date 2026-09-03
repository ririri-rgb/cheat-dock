# macOS manual qualification

Checked items reflect physical evidence reported by the project owner. PR #6 physical qualification is complete for the merge gate; unchecked items remain follow-up observations rather than claimed PASS evidence.

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
- [x] GUI-authored content persisted through the file-backed layer after restart/reload.
- [ ] Pin/Recently viewed/expanded state remains usable after migration (these remain UI state, not Markdown content).
- [ ] No duplicate custom Sheet/item appears after several restarts.

## 2. User Markdown and Finder

- [x] **Open Data Folder** revealed Cheat Dock's user-data directory in Finder.
- [x] The path contains `user-data/cheats/` and `user-data/overlays/` Markdown.
- [x] GUI Add/Edit/Rename/Delete changes were reflected in Markdown.
- [x] Restart/reload restored GUI-authored Markdown content.
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
- [x] After explicit Reload, a fresh GUI edit can be made against the new revision.

## 5. Corrupt-file recovery

- [x] A corrupt user Markdown file is isolated instead of preventing app startup.
- [x] Built-ins and search remain usable while a user file is corrupt.
- [ ] A compact storage error shows the relative file path and reason.
- [ ] Open Data Folder provides a repair path; Cheat Dock does not delete/overwrite the corrupt file.
- [ ] Fix the Markdown and reload/reopen; the error clears and content returns.

## 6. Shortcut Record

- [x] `⌘K` captured as `Command + K` and displayed as `⌘ K`.
- [x] `⌘⇧P` captured as `Command + Shift + P` and displayed as `⌘ ⇧ P`.
- [x] `⌃⌥Space` captured as `Control + Option + Space` and displayed as `⌃ ⌥ Space`.
- [x] Command and Control remain distinct.
- [x] Record capture is scoped correctly and does not take over normal Search/input behavior.
- [ ] `⌥↑` captures as `Option + Up` and displays as `⌥ ↑`.
- [ ] Modifier-only input remains pending.
- [ ] Escape cancels without replacing the existing shortcut.
- [x] Saved Record values use canonical words in Markdown and macOS glyphs only in presentation.
- [ ] Restart and confirm the captured shortcut round-trips from Markdown.

## 7. Keyboard/IME isolation

- [x] Japanese Search IME showed no regression during PR #6 qualification.
- [x] Record mode remains limited to the explicit Record surface; normal Search/input behavior works outside capture.
- [ ] Re-run broader Japanese composition cases on future release candidates as needed.

## 8. Product decision: Shortcut and Command are separate semantics

Physical qualification exposed an ambiguity: an item could contain both `shortcut` and `command`, while presentation preferred whichever field happened to be checked first. A test value `Press Command + K` also prompted reevaluation of whether Command should receive keyboard-glyph formatting.

This is resolved as a product semantic decision, not as a missing glyph-formatting bug:

- **Shortcut** = keyboard chord; `kind: shortcut` is authoritative and only its `shortcut` primary value receives macOS glyph presentation.
- **Command** = literal textual command; `kind: command` is authoritative and its `command` value is never keyboard-formatted.
- `Press Command + K` in a `command:` field therefore remains exactly `Press Command + K`.
- Existing mixed legacy items are preserved on load; editing them may explicitly normalize to the selected Type after a warning.

Physical PASS:

- [x] Type = Shortcut shows Shortcut + Record and hides Command.
- [x] Type = Command shows Command and hides Shortcut/Record.
- [x] Switch Shortcut → Command → Shortcut before Save; the in-dialog hidden value remains in editor memory.
- [x] If Save will remove an inactive value, the compact warning is visible.
- [x] New Shortcut Markdown contains the shortcut primary field only.
- [x] New Command Markdown contains the command primary field only.
- [x] Recently viewed and search presentation are kind-aware.
- [x] A mixed legacy item displays according to its authoritative `kind`.
- [x] Merely reopening/reloading a mixed legacy file does not rewrite or delete its inactive field.

## 9. Command literal safety

- [x] `command -v node` remains exactly `command -v node`.
- [x] `Press Command + K` in a Command item remains exactly `Press Command + K` (no `⌘` conversion).
- [x] `Command failed` remains exactly `Command failed`.
- [x] Repeated-space command content remains unchanged through presentation/persistence qualification.
- [ ] `git status` displays/copies exactly as stored on the qualification Mac.

## 10. Existing menu-bar UX regression

The PR #1 foundation remains covered by the previously qualified evidence above. PR #6 additionally confirmed:

- [x] Japanese IME remains healthy after file-backed storage, Record, item-kind, and search refinements.
- [x] Recently viewed/search use kind-aware Shortcut vs literal Command presentation.
- [x] Current Sheet / Other Sheets grouped search remains usable during final search qualification.
- [ ] Re-run the full PR #1 visual/layout matrix on every future release candidate.

## 11. Final search relevance finding — closed

Physical qualification at `40bb53c6e83b2278b18800d8a378cbfd25c15750` found a short-Latin false positive: while My Work was selected, searching `Ab` also returned Terminal `pwd` because its weak prose description contains the word `absolute`.

The final search refinement keeps title/alias/tag/command/shortcut matching responsive, but weak prose/context fields use word-aware Latin matching: one- or two-character Latin/alphanumeric tokens only match an exact weak-field word, while three-or-more-character tokens may match a word prefix. Japanese/CJK weak-field substring behavior remains unchanged.

Final physical PASS at `51a1a7ef437877d7ef88ace5ed6bf3fc8f10c80a`:

- [x] My Work + `Ab`: the My Work `Ab` item appears and Terminal `pwd` does **not** appear under Other Sheets.
- [x] `abs`: Terminal `pwd` may appear through the `absolute` description prefix.
- [x] Japanese IME/search remains normal after the relevance change.

The short-Latin search-noise issue is closed.

## Final PR #6 qualification result

**Result: PASS for the PR #6 merge gate based on the physical evidence above plus automated CI.**

The unchecked items in this document were not part of the reported final physical evidence and are intentionally not promoted to PASS.
