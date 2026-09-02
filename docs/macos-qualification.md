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

- [ ] Japanese IME can enter `コピー` without duplicated/interleaved romanized text.
- [ ] Composition candidates remain stable while conversion is active.
- [ ] `コミット 戻す` works as a mixed Japanese/English query.
- [ ] `セル 書式` can be composed normally.
- [ ] Search results update after composition is committed, not during intermediate composition.
- [ ] Ordinary English input still updates search immediately.

## Appearance

- [ ] Popup outer corners are visibly rounded.
- [ ] No rectangular background leaks outside the rounded native panel.
- [ ] Native shadow/panel placement looks natural below the menu bar.
- [ ] No close/minimize/zoom traffic-light buttons are visible.
- [ ] Light mode is readable.
- [ ] Dark mode is readable and has no bright background flash/artifact.
- [ ] Retina scaling does not produce clipped borders or blurry one-pixel seams.

## Item density and layout

- [ ] At 680px popup width, normal sections show approximately two compact items per row where practical.
- [ ] Item descriptions do not consume the default list view.
- [ ] A long Git/Docker command truncates or contains itself without widening/breaking the layout.
- [ ] Narrow-window responsive fallback remains readable when inspected with a narrower dev window.
- [ ] Tab navigation and visible focus rings remain usable after compacting items.

## Locale

- [ ] Japanese primary system language shows Japanese item labels when `title-ja` exists.
- [ ] Missing Japanese translation falls back to the English title.
- [ ] English primary system language uses English titles.
- [ ] Commands and shortcuts remain byte-for-byte/untranslated in either locale.

## Recently viewed

- [ ] Recently viewed is kept separately per sheet.
- [ ] Each recent entry shows localized label plus shortcut/command.
- [ ] Clicking a recent entry expands/navigates to its original item.
- [ ] Copying a shortcut/command records the item as recently used.

## Persistence and search

- [ ] Pin/unpin persists after restart.
- [ ] Section expanded state persists after restart.
- [ ] Add/edit/delete personal items, restart, and verify persistence.
- [ ] Create a custom Cheat Sheet and verify persistence.
- [ ] Search crosses multiple sheets and mixed Japanese/English aliases.
- [ ] Corrupting one persisted user fragment does not prevent the app from opening (developer qualification only).

## Privacy

- [ ] No Accessibility permission prompt appears.
- [ ] No network request is required for core usage.
