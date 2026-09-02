# macOS manual qualification

Run this checklist on a physical Mac before marking a release candidate qualified. Record macOS version, architecture, commit SHA, and failures in PR/release qualification notes.

## Lifecycle and foreground application

- [x] `npm run tauri dev` starts on a physical Mac.
- [x] Cheat Dock tray icon appears and opens the popup.
- [x] Excel foreground detection selects Excel on the qualification Mac.
- [ ] Finder, VS Code, and Terminal foreground detection selects the corresponding sheet.
- [ ] An unknown frontmost app produces a usable fallback instead of crashing.
- [ ] Manual sheet selection remains stable until the popup closes.
- [ ] Reopening re-detects the current foreground app.
- [ ] Clicking outside hides the popup; reopening restores usable focus.

## IME

- [x] Japanese IME can enter `コピー` without duplicated/interleaved romanized text.
- [x] The previously observed `kここpコピコピー` composition corruption is no longer reproduced.
- [ ] Composition candidates remain stable through a longer conversion/edit sequence.
- [ ] `コミット 戻す` works as a mixed Japanese/English query.
- [ ] `セル 書式` can be composed normally.
- [ ] Search results update after composition is committed, not during intermediate composition.
- [ ] Ordinary English input still updates search immediately.

## Appearance

- [x] Popup outer corners are visibly rounded and acceptable on the qualification Mac.
- [ ] No rectangular background leaks outside the rounded native panel in both light/dark mode.
- [ ] Native shadow/panel placement looks natural below the menu bar.
- [ ] No close/minimize/zoom traffic-light buttons are visible.
- [ ] Light mode is readable.
- [ ] Dark mode is readable and has no bright background flash/artifact.
- [ ] Retina scaling does not produce clipped borders or blurry one-pixel seams.

## Edit / Delete

- [ ] Add a personal item in My Work.
- [ ] Edit its title with the in-app dialog and verify the popup does not hide.
- [ ] Edit its section and shortcut/command/description.
- [ ] Restart Cheat Dock and confirm the edit persists.
- [ ] Delete the personal item using the in-app confirmation dialog.
- [ ] Restart Cheat Dock and confirm the deletion persists.
- [ ] Built-in items never expose destructive Edit/Delete behavior.

## Item density and adaptive layout

- [x] The previous two-column compact Excel layout rendered correctly on a physical Mac.
- [ ] At the default 680px width, three short items can occupy three columns. Because the verified Excel seed currently contains only two items, add one temporary personal short shortcut for this check, then delete it.
- [ ] Item descriptions do not consume the default list view.
- [ ] A medium-length Git/Docker command spans extra width without widening/breaking the popup.
- [ ] A very long command remains contained/truncated in its full-row layout.
- [ ] Around the medium breakpoint, the grid falls back to two columns and remains readable.
- [ ] At narrow width, the grid falls back to one column and remains readable.
- [ ] Tab navigation and visible focus rings remain usable after the density increase.

## Shortcut rendering

- [ ] `Command + C` renders as `⌘ C`.
- [ ] `Command + Option + S` renders as `⌘ ⌥ S`.
- [ ] `Command + Shift + P` renders as `⌘ ⇧ P`.
- [ ] `Control + Option + Space` renders as `⌃ ⌥ Space` (Control is not Command).
- [ ] Enter/Return, Tab, Backspace, Escape, and arrow names render with the expected compact macOS forms.
- [ ] Existing symbolized shortcuts such as `⌘C` still render correctly.
- [ ] A user-created raw shortcut goes through the same formatter and still persists in editable raw form.

## Locale / selective localization

- [x] Japanese primary system language enables locale-aware labels.
- [x] Excel item labels display Japanese where an explicit `title-ja` exists.
- [ ] `My Work` remains `My Work` in Japanese locale.
- [ ] App/tool names such as `Terminal`, `Git`, `Vim`, and `Docker` remain canonical English.
- [ ] `Edit` and `Delete` remain English.
- [ ] `＋ Item` and `＋ Sheet` remain English/technical controls.
- [ ] `Recently viewed` displays as `最近見た項目` in Japanese locale.
- [ ] Excel `Basic` displays as `基本`.
- [ ] Missing Japanese translation falls back to canonical English; no Katakana transliteration is invented.
- [ ] Commands remain unchanged; shortcut raw data is not localized (only presentation-formatted).

## Recently viewed

- [x] A recent entry shows localized label plus shortcut on the qualification Mac.
- [ ] Recently viewed is kept separately per sheet.
- [ ] A formatted shortcut is shown using the same shortcut presentation logic as the source item.
- [ ] Clicking a recent entry expands/navigates to its original item.
- [ ] Copying a shortcut/command records the item as recently used.

## Persistence and search

- [ ] Pin/unpin persists after restart.
- [ ] Section expanded state persists after restart.
- [ ] Create a custom Cheat Sheet and verify persistence.
- [ ] Search crosses multiple sheets and mixed Japanese/English aliases.
- [ ] Corrupting one persisted user fragment does not prevent the app from opening (developer qualification only).

## Privacy

- [ ] No Accessibility permission prompt appears.
- [ ] No network request is required for core usage.
