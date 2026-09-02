# Architecture and decision log

## Framework

Tauri 2 + Rust + vanilla TypeScript/Vite. Tauri provides supported desktop tray APIs on macOS and Windows while keeping the UI bundle small. v0.1 is macOS-first; no cross-platform abstraction layer is added beyond stable application identifiers.

## Menu-bar lifecycle

The main window starts hidden and the macOS activation policy is `Accessory`, so Cheat Dock behaves as a menu-bar utility rather than a normal Dock-first app. On a left tray click, Rust queries `NSWorkspace.frontmostApplication` **before** focusing Cheat Dock, emits its bundle identifier to the webview, positions the popup near the tray click, and shows it. Losing focus hides the popup.

This foreground lookup does not require Accessibility permission and reads only the current application's bundle identifier/localized name.

## Data

Built-ins are repository-managed Markdown compiled into the frontend bundle. The parser accepts a constrained frontmatter/H2/H3 schema and rejects unknown or duplicate item fields. User additions are overlaid in state rather than mutating built-ins, so application updates cannot overwrite built-in source files with personal edits.

Current phase-one persistence uses the webview's application-local storage. This is local-only and survives ordinary restarts/updates, but direct Markdown editing/export for user data remains future work before v0.1 release quality.

## Search

Search is deterministic and local. NFKC/case/whitespace normalization plus AND token matching is applied to title, aliases, tags, descriptions, commands, shortcuts, body text, sheet names, and section names. Ranking weights explicit title/alias/tag matches over body matches; there is no AI or remote query.

## Security/privacy

No network API, analytics, login, global shortcut, shell-execution, or broad filesystem permission is enabled. Commands are display/copy references only. User-authored text is escaped and never passed to an HTML/Markdown renderer. Tauri capability configuration currently grants only `core:default`.

## Distribution

Development builds require no Apple identity. Public direct-download builds will require Developer ID signing and Apple notarization; those credentials are intentionally not stored in the repository.
