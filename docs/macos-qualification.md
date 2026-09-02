# macOS manual qualification

Run this checklist on a physical Mac before marking a release candidate qualified. Record macOS version, architecture, commit SHA, and failures in PR/release qualification notes. Checked items below reflect explicit physical-Mac evidence reported during PR #1 qualification; newly changed behavior is not marked as physically passed until observed.

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
- [ ] After the final `Overlay` title-bar change, Sheet navigation begins near the rounded top with only compact padding and no large empty title row.
- [ ] No rectangular background leaks outside the rounded native panel in both light/dark mode.
- [ ] Native shadow/panel placement remains natural below the menu bar after the title-bar change.
- [ ] No close/minimize/zoom traffic-light buttons are visible.
- [ ] Light mode is readable.
- [ ] Dark mode is readable and has no bright background flash/artifact.
- [ ] Retina scaling does not produce clipped borders or blurry one-pixel seams.

## Personal Item Edit / Delete

- [x] Add a personal item in My Work.
- [x] A personal item remains after restarting Cheat Dock.
- [ ] Edit its title with the in-app dialog and verify the popup does not hide.
- [ ] Edit its section and shortcut/command/description.
- [ ] Restart Cheat Dock and confirm the edit persists.
- [x] The in-app Delete confirmation dialog opens without using browser `confirm()`.
- [ ] Confirm Delete and verify the item is removed.
- [ ] Restart Cheat Dock and confirm the deletion persists.
- [ ] Built-in items never expose destructive Edit/Delete behavior.

## Custom Sheet management

- [x] A custom Cheat Sheet can be created and persists.
- [ ] Only a selected custom Sheet shows the `…` management action.
- [ ] Rename a custom Sheet and restart to confirm persistence.
- [ ] Create/Rename rejects collisions with built-ins such as `Git`, `Excel`, and `My Work`.
- [ ] Case/whitespace/NFKC-equivalent duplicate names are rejected with an in-app validation message.
- [ ] Delete a custom Sheet through the in-app destructive confirmation.
- [ ] A deleted Sheet does not return after restart.
- [ ] Deleting the selected custom Sheet falls back to built-in `My Work`.
- [ ] Deleting a custom Sheet removes stale pin/recent/expanded references.
- [ ] Built-in Sheets, including built-in `My Work`, cannot be renamed or deleted.
- [ ] A legacy user-created duplicate named `My Work` can still be renamed or deleted because it is user-owned.

## Item density and adaptive layout

- [x] Compact Excel items rendered correctly on a physical Mac.
- [ ] At the default 680px width, three short items can occupy three columns. Because the verified Excel seed currently contains only two items, add one temporary personal short shortcut for this check, then delete it.
- [ ] Item descriptions do not consume the default list view.
- [ ] A medium-length Git/Docker command spans extra width without widening/breaking the popup.
- [ ] A very long command remains contained/truncated in its full-row layout.
- [ ] Around the medium breakpoint, the grid falls back to two columns and remains readable.
- [ ] At narrow width, the grid falls back to one column and remains readable.
- [ ] Tab navigation and visible focus rings remain usable after the density increase.

## Shortcut rendering

- [ ] `Command + C` renders as `⌘ C`.
- [x] `Command + Option + S` renders as `⌘ ⌥ S`.
- [ ] `Command + Shift + P` renders as `⌘ ⇧ P`.
- [x] `Control + Option + Space` renders as `⌃ ⌥ Space`.
- [x] Control and Command remain distinct in physical-Mac presentation.
- [ ] Enter/Return, Tab, Backspace, Escape, and arrow names render with the expected compact macOS forms.
- [ ] Existing symbolized shortcuts such as `⌘C` still render correctly.
- [ ] A user-created raw shortcut goes through the same formatter and still persists in editable raw form.

## Locale / selective localization

- [x] Japanese primary system language enables locale-aware labels.
- [x] Selective localization is visible in the running app rather than automatic full-UI translation.
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

## Search grouping

- [ ] Search still finds matches across every Cheat Sheet.
- [ ] Current Sheet results are shown first under a clear Current Sheet heading.
- [ ] If the current Sheet has zero hits, matching Other Sheets are still shown.
- [ ] Other Sheets are grouped compactly by Sheet without losing any hits.
- [ ] Japanese IME composition remains stable while using the grouped result UI.

## Top navigation

- [ ] Current + pinned Sheets use available single-row width instead of a fixed visible count.
- [ ] More pinned Sheets become visible when enough width exists.
- [ ] Overflowed pinned Sheets remain reachable through `All Sheets…`.
- [ ] A long custom Sheet title truncates without creating a second navigation row.
- [ ] Keyboard focus remains visible for Sheet tabs and `All Sheets…`.

## Destructive styling

- [ ] Item Delete confirmation uses a neutral Cancel button and explicit red Delete button.
- [ ] Sheet Delete confirmation uses the same compact destructive treatment.
- [ ] Delete styling is readable in both light and dark mode and does not inherit an accidental blue browser button style.

## Persistence and search

- [ ] Pin/unpin persists after restart.
- [ ] Section expanded state persists after restart.
- [ ] Search crosses multiple sheets and mixed Japanese/English aliases.
- [ ] Corrupting one persisted user fragment does not prevent the app from opening (developer qualification only).

## Privacy

- [ ] No Accessibility permission prompt appears.
- [ ] No network request is required for core usage.
