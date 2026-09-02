# Architecture and decision log

## Framework

Tauri 2 + Rust + vanilla TypeScript/Vite. Tauri provides supported desktop tray APIs on macOS and Windows while keeping the UI bundle small. v0.1 is macOS-first; no cross-platform abstraction layer is added beyond stable application identifiers.

## Menu-bar lifecycle

The main window starts hidden and the macOS activation policy is `Accessory`, so Cheat Dock behaves as a menu-bar utility rather than a normal Dock-first app. On a left tray click, Rust queries `NSWorkspace.frontmostApplication` **before** focusing Cheat Dock, emits its bundle identifier to the webview, positions the popup near the tray click, and shows it. Losing focus hides the popup.

This foreground lookup does not require Accessibility permission and reads only the current application's bundle identifier/localized name.

## macOS panel appearance

The window keeps normal native decorations, shadow, and an opaque WebView. Tauri's public `Overlay` title-bar style lets content use the title-bar area instead of reserving a large empty title row. The title text stays hidden and the standard close/minimize/zoom controls are hidden through public AppKit `NSWindow.standardWindowButton` APIs.

Whole-window transparency remains disabled because Tauri requires its `macos-private-api` feature for that path on macOS. Cheat Dock does not enable that feature. This preserves the already-qualified rounded native window/shadow approach while reducing unused top inset. Exact top inset and shadow after the `Overlay` switch remain a physical-Mac qualification item.

## Data and personal content

Built-ins are repository-managed Markdown compiled into the frontend bundle. The parser accepts a constrained frontmatter/H2/H3 schema and rejects unknown fields and duplicate item IDs. User additions are overlaid in state rather than mutating built-ins, so application updates cannot overwrite built-in source files with personal edits.

Current phase-one persistence uses the WebView's application-local storage. Loading performs nested runtime validation of IDs, strings, arrays, sections, items, overlays, duplicate IDs, and custom sheets before data enters application state. Invalid fragments are discarded rather than trusted as `AppState`.

Personal item and custom Sheet CRUD use in-app `<dialog>` UI rather than browser `prompt`/`confirm`, avoiding focus-loss conflicts with the menu-bar popup lifecycle. Built-in Sheets/items are never accepted by the destructive mutation functions.

Custom Sheet names are normalized with Unicode NFKC, collapsed whitespace, trimming, and case-insensitive comparison before Create/Rename. Names must be unique across both built-in and user-created Sheets. Existing legacy duplicate data is not silently deleted; the user can rename or delete the user-owned duplicate.

Deleting a custom Sheet removes its `userSheets` entry plus pinned, recent, expanded, overlay, and user `related` references. If the deleted Sheet is selected, the UI falls back to built-in `My Work` when available.

Moving personal data to human-readable file-backed Markdown remains a separate persistence project. It is intentionally deferred from PR #1 so the menu-bar foundation does not carry a storage migration at the same time.

## Locale

English is the canonical authoring language and existing `###` headings remain stable. Japanese is an optional overlay inside the same Markdown file using `title-ja` on a sheet, section, and/or item. Internally this maps to localized title metadata keyed by locale while the item ID remains unchanged.

Localization is deliberately selective. App/tool names (`My Work`, `Excel`, `Git`, `Vim`, `Docker`, `Homebrew`, `SSH`, `VS Code`, `Terminal`), user-created Sheet names, and technical controls such as `Edit`, `Delete`, `Item`, `Sheet`, `Rename Sheet`, and `Delete Sheet` remain canonical English unless an explicit localized field exists. Comprehension-oriented labels such as search, pinning, Recently viewed, and selected section names may provide Japanese text. No automatic Katakana transliteration is performed.

Missing Japanese text falls back to the canonical English title. Commands are never localized. Shortcut raw data is preserved and presentation-formatted separately. Search indexes both canonical and localized titles so Japanese display does not remove English discoverability.

## Search and IME

Search is deterministic and local. NFKC/case/whitespace normalization plus AND token matching is applied to canonical/localized titles, aliases, tags, descriptions, commands, shortcuts, body text, sheet names, and section names. Ranking weights the currently displayed localized title, then other title/alias/tag matches, over body matches; there is no AI or remote query.

Search still covers every Sheet. Presentation groups the globally ranked hits into the current Sheet first and then `Other Sheets`, grouped by Sheet while preserving ranked order within each group. A zero-hit current Sheet does not hide matching results elsewhere.

IME composition is handled separately from search ranking. While WebKit reports an active composition, input does not trigger a DOM rebuild. The committed composition is applied after composition ends; ordinary Latin input continues to update immediately. A generation token prevents a deferred composition-end update from overwriting a newer normal input event.

## Compact presentation and navigation

At the default 680px popup width, compact shortcut items use a three-column grid. Presentation classifies command items as compact, wide, or full so long Git/Docker/SSH/Terminal commands can span more columns without forcing all items wider. Medium and narrow breakpoints fall back to two and one columns.

Top navigation contains the current Sheet plus pinned Sheets. All candidates are rendered, then a small width-measurement function hides only the candidates that do not fit the current single-row navigation strip. There is no fixed visible-Sheet count. `All Sheets…` remains outside the measured strip and is always available as overflow access.

## Shortcut presentation

Markdown and user data keep human-readable raw shortcuts. A pure presentation formatter converts macOS names such as `Command`, `Option`, `Control`, and `Shift` to `⌘`, `⌥`, `⌃`, and `⇧` while preserving the raw value for editing. Already-symbolized shortcuts are normalized without confusing Control and Command.

## Dependency reproducibility

`package-lock.json` and `src-tauri/Cargo.lock` are committed. CI installs JavaScript dependencies with `npm ci` and checks Rust with `cargo check --locked`. `rust-toolchain.toml` declares the `stable` channel rather than pinning one compiler patch forever; the application dependency graph is still locked while contributors receive supported stable Rust updates.

## Security/privacy

No network API, analytics, login, global shortcut, shell-execution, or broad filesystem permission is enabled. Commands are display/copy references only. User-authored text is escaped and never passed to an HTML/Markdown renderer. Tauri capability configuration currently grants only `core:default`.

## Distribution

Development builds require no Apple identity. Public direct-download builds will require Developer ID signing and Apple notarization; those credentials are intentionally not stored in the repository.
