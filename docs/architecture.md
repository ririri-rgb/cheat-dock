# Architecture and decision log

## Framework

Tauri 2 + Rust + vanilla TypeScript/Vite. Tauri provides supported desktop tray APIs while keeping the UI bundle small. v0.1 is macOS-first; Windows implementation is out of scope for PR #1.

## Menu-bar lifecycle

The main window starts hidden and the macOS activation policy is `Accessory`, so Cheat Dock behaves as a menu-bar utility rather than a Dock-first app. On a left tray click, Rust queries `NSWorkspace.frontmostApplication` **before** focusing Cheat Dock, emits the bundle identifier to the webview, positions the popup near the tray click, and shows it. Losing focus hides the popup.

This foreground lookup does not require Accessibility permission and reads only the current application's bundle identifier/localized name.

### In-window editing

The popup's focus-loss behavior makes browser-owned `prompt()` / `confirm()` dialogs a poor fit: opening a browser modal can move focus outside the menu-bar window and cause Tauri to hide it. Personal item add/edit/delete and custom-sheet creation therefore use same-document HTML `<dialog>` modals. They remain inside the WebView, keep the popup lifecycle predictable, and share one validation/persistence path. Built-in items never enter the writable mutation path.

## macOS panel appearance

Tauri's whole-window `transparent` option on macOS requires its `macos-private-api` feature. Cheat Dock deliberately does **not** enable that feature. Instead the panel keeps a normal opaque native `NSWindow`, uses Tauri's public transparent-titlebar/hidden-title configuration, retains native window shadow/corner clipping, and hides the standard close/minimize/zoom controls through public AppKit APIs. CSS supplies the compact panel surface inside the native window.

Physical qualification has confirmed the current rounded popup appearance is acceptable. Private macOS APIs remain out of scope.

## Data and personal state

Built-ins are repository-managed Markdown compiled into the frontend bundle. The parser accepts a constrained frontmatter/H2/H3 schema and rejects unknown fields and duplicate item IDs. User additions are overlaid in state rather than mutating built-ins.

Current phase-one persistence uses the WebView's application-local storage. Loading performs nested runtime validation of IDs, strings, arrays, sections, items, overlays, duplicate IDs, and custom sheets before data enters application state. Invalid fragments are discarded rather than trusted as `AppState`.

Personal edit/delete operations are pure state transformations. Editing preserves the stable item ID, normalizes whitespace, may move an item to another user section, and never mutates a built-in item. Deleting also removes stale recent-history references.

Moving personal data to human-readable file-backed Markdown remains a separate persistence project and is intentionally deferred from PR #1.

## Locale: selective localization

English is canonical. Japanese is an optional explicit overlay via `title-ja`; missing localized text falls back to canonical English. No automatic transliteration or Katakana conversion is performed.

Localization is intentionally selective. Human-readable operation labels and a small set of comprehension-heavy UI strings can be localized. Known app/tool sheet names (`Excel`, `Finder`, `VS Code`, `Terminal`, `Git`, `Vim`, `Docker`, `Homebrew`, `SSH`, `My Work`), user-created sheet names, and compact technical controls such as `Edit`, `Delete`, `Item`, and `Sheet` stay canonical English. This keeps the utility visually technical rather than translating every token merely because the system locale is Japanese.

Sections can optionally declare `title-ja` immediately below the `##` heading. For example, `Basic` may display as `基本`, while sections such as `Notes` can remain English simply by omitting the localized field.

Commands and stored shortcut strings are never translated. Search indexes canonical and localized item/section titles so Japanese display does not remove English discoverability.

## Shortcut presentation

Shortcut authoring and presentation are separated. Markdown and user-created items may store readable raw strings such as `Command + Option + S`; a pure presentation formatter renders macOS-standard symbols such as `⌘ ⌥ S`. Existing symbolized values such as `⌘C` are accepted and normalized for display. `Control`/`Ctrl` maps only to `⌃`, never to Command.

The raw shortcut remains in the data model and persistence layer. Copy/display formatting does not rewrite built-in Markdown or personal state.

## Information density and adaptive layout

The default 680px popup uses a three-track item grid. Short shortcut items and short commands occupy one track. Commands of moderate length are classified `wide` and span two tracks; very long commands are `full` and span the row. CSS media queries reduce the grid to two columns at medium width and one column at narrow width.

The classification is a small pure presentation function rather than being inferred from DOM measurements, which keeps layout intent deterministic and unit-testable. Text still truncates safely inside its assigned cell so a command cannot widen the popup.

## Search and IME

Search remains deterministic and local. NFKC/case/whitespace normalization plus AND token matching is applied to canonical/localized titles, aliases, tags, descriptions, commands, shortcuts, body text, sheet names, and section names. Ranking affects ordering only; there is no AI or remote query.

IME composition is handled separately from search ranking. While WebKit reports an active composition, input does not trigger a DOM rebuild. The committed composition is applied after composition ends; ordinary Latin input continues to update immediately. A generation token prevents a deferred composition-end update from overwriting newer normal input. This behavior has passed physical-Mac Japanese IME qualification and must be preserved by later UI refinements.

## Dependency reproducibility

`package-lock.json` and `src-tauri/Cargo.lock` are committed. CI installs JavaScript dependencies with `npm ci` and checks Rust with `cargo check --locked`. `rust-toolchain.toml` declares the `stable` channel rather than pinning one compiler patch forever.

## Security/privacy

No network API, analytics, login, global shortcut, shell execution, or broad filesystem permission is enabled. Commands are display/copy references only. User-authored text is escaped and never passed to an HTML/Markdown renderer. Tauri capability configuration grants only `core:default`.

## Distribution

Development builds require no Apple identity. Public direct-download builds will require Developer ID signing and Apple notarization; those credentials are intentionally not stored in the repository.
