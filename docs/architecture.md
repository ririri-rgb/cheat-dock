# Architecture and decision log

## Framework

Tauri 2 + Rust + vanilla TypeScript/Vite. Tauri provides supported desktop tray APIs on macOS and Windows while keeping the UI bundle small. v0.1 is macOS-first; no cross-platform abstraction layer is added beyond stable application identifiers.

## Menu-bar lifecycle

The main window starts hidden and the macOS activation policy is `Accessory`, so Cheat Dock behaves as a menu-bar utility rather than a normal Dock-first app. On a left tray click, Rust queries `NSWorkspace.frontmostApplication` **before** focusing Cheat Dock, emits its bundle identifier to the webview, positions the popup near the tray click, and shows it. Losing focus hides the popup.

This foreground lookup does not require Accessibility permission and reads only the current application's bundle identifier/localized name.

## macOS panel appearance

Tauri's whole-window `transparent` option on macOS requires its `macos-private-api` feature. Cheat Dock deliberately does **not** enable that feature. Instead the panel keeps a normal opaque native `NSWindow`, uses Tauri's public transparent-titlebar/hidden-title configuration, retains native window shadow/corner clipping, and hides the standard close/minimize/zoom controls through public AppKit `NSWindow.standardWindowButton` APIs. CSS supplies the compact panel surface inside the native window.

This avoids private API/App Store risk. The exact corner/shadow result remains part of physical-Mac qualification because native rendering is not meaningfully validated by CI.

## Data

Built-ins are repository-managed Markdown compiled into the frontend bundle. The parser accepts a constrained frontmatter/H2/H3 schema and rejects unknown fields and duplicate item IDs. User additions are overlaid in state rather than mutating built-ins, so application updates cannot overwrite built-in source files with personal edits.

Current phase-one persistence uses the webview's application-local storage. Loading performs nested runtime validation of IDs, strings, arrays, sections, items, overlays, duplicate IDs, and custom sheets before data enters application state. Invalid fragments are discarded rather than trusted as `AppState`.

Moving personal data to human-readable file-backed Markdown remains a separate persistence project. It is intentionally deferred from PR #1 so the IME/menu-bar UX refinement does not carry a second storage migration at the same time.

## Locale

English is the canonical authoring language and existing `###` headings remain stable. Japanese is an optional overlay inside the same Markdown file using `title-ja` on a sheet and/or item. Internally this maps to localized title metadata keyed by locale while the item ID remains unchanged.

The UI chooses Japanese only when the primary system/browser language is Japanese, otherwise English. Missing Japanese text falls back to the canonical English title. Commands and shortcuts are never localized. Search indexes both canonical and localized titles so Japanese display does not remove English discoverability.

This inline optional-field approach was chosen over companion translation files because the current seed set is small and one-file review keeps IDs, source links, and translations visibly aligned. If localization grows beyond a small number of languages, the storage shape can evolve without changing canonical item IDs.

## Search

Search is deterministic and local. NFKC/case/whitespace normalization plus AND token matching is applied to canonical/localized titles, aliases, tags, descriptions, commands, shortcuts, body text, sheet names, and section names. Ranking weights the currently displayed localized title, then other title/alias/tag matches, over body matches; there is no AI or remote query.

IME composition is handled separately from search ranking. While WebKit reports an active composition, input does not trigger a DOM rebuild. The committed composition is applied after composition ends; ordinary Latin input continues to update immediately.

## Security/privacy

No network API, analytics, login, global shortcut, shell-execution, or broad filesystem permission is enabled. Commands are display/copy references only. User-authored text is escaped and never passed to an HTML/Markdown renderer. Tauri capability configuration currently grants only `core:default`.

## Distribution

Development builds require no Apple identity. Public direct-download builds will require Developer ID signing and Apple notarization; those credentials are intentionally not stored in the repository.
