# macOS manual qualification

Run this checklist on a physical Mac before marking a release candidate qualified.

- [ ] `npm run tauri dev` starts without a normal Dock-first main window.
- [ ] Cheat Dock tray icon appears in the menu bar.
- [ ] Clicking the icon opens the panel near the icon.
- [ ] With Excel, Finder, VS Code, and Terminal frontmost before the click, the corresponding sheet opens.
- [ ] An unknown frontmost app produces a usable fallback instead of crashing.
- [ ] Manual sheet selection remains stable until the popup closes.
- [ ] Reopening re-detects the current foreground app.
- [ ] Clicking outside hides the popup; reopening restores usable focus.
- [ ] Pin/unpin persists after restart.
- [ ] Section expanded state persists after restart.
- [ ] Recent items are kept separately per sheet.
- [ ] Add/edit/delete personal items, restart, and verify persistence.
- [ ] Create a custom Cheat Sheet and verify persistence.
- [ ] Search crosses multiple sheets and mixed Japanese/English aliases.
- [ ] No Accessibility permission prompt appears.
- [ ] No network request is required for core usage.

Record OS version, architecture, commit SHA, and failures in the PR/release qualification notes.
