# Architecture and decision log

## Framework and menu-bar lifecycle

Cheat Dock uses Tauri 2 + Rust + vanilla TypeScript/Vite. The main window starts hidden with macOS activation policy `Accessory`. On tray click, Rust reads `NSWorkspace.frontmostApplication` before Cheat Dock takes focus, emits the bundle ID, positions/shows the popup, and hides it again on focus loss. No Accessibility permission is required.

The panel keeps native decorations/shadow with Tauri's public `Overlay` title-bar style. Whole-window private-API transparency remains disabled.

## Built-in vs user-authored content

Built-ins remain repository-managed Markdown compiled into the app and are read-only from GUI CRUD. User-authored knowledge is a separate file-backed source of truth under Tauri's OS-standard `app_data_dir`:

```text
user-data/
├── cheats/
│   └── user-<stable-id>.md
└── overlays/
    └── <built-in-id>.md
```

Custom Sheet filenames use stable IDs, never titles, so rename does not move/create a second file. A built-in overlay uses the built-in Sheet ID but never rewrites the bundled Markdown.

Pins, Recently viewed, expanded sections, and similar UI state remain in validated WebView localStorage because they are not authored knowledge. After migration, `userSheets` and `overlays` are deliberately removed from the active localStorage state; files are authoritative.

## Item semantics: `kind` is authoritative

The existing `kind` field is the single item type system. The schema does not add a second `type` field. Supported schema kinds remain `shortcut`, `command`, `operation`, `procedure`, and `snippet`.

For the compact GUI editor, creation/editing currently focuses on `shortcut` and `command`:

- `kind: shortcut` means a keyboard chord the user presses. Its primary field is `shortcut`.
- `kind: command` means literal textual command input. Its primary field is `command`.

Presentation resolves the primary value from `kind`, not from whichever field happens to exist first. A mixed historical item with both fields therefore displays the field selected by its valid `kind`. A malformed historical item whose primary field is missing uses a pure compatibility fallback to the other available field so one bad item does not break the app.

New GUI saves enforce one primary field: Shortcut saves remove `command`; Command saves remove `shortcut`. The editor keeps hidden values in memory while switching Type and shows a compact warning whenever Save would remove an inactive value. Loading/reloading legacy mixed Markdown never performs that cleanup automatically.

Existing `operation` / `procedure` / `snippet` Markdown remains valid. Their GUI editing is intentionally not expanded; direct Markdown editing remains available.

## Markdown schema and loading

User files reuse the existing constrained frontmatter/H2/H3 parser. Unknown/malformed fields, duplicate IDs, unsafe identities, invalid UTF-8, and duplicate Sheet titles are isolated rather than trusted. One corrupt file produces a compact issue while valid user files and built-ins continue loading.

The serializer distinguishes structural labels from authored payload. Human labels may normalize repeated whitespace, while `command`, `shortcut`, `description`, and `source` retain meaningful internal spacing. A legacy mixed item serializes both fields if both still exist in state; merely loading a file does not trigger serialization or rewrite.

Shortcut glyph formatting is presentation-only and never persisted to Markdown. Command values do not use keyboard formatting at all.

## Native filesystem boundary

The frontend does not receive a broad filesystem plugin/scope. Four narrow Rust/Tauri operations own file access: load documents, write one identified document, delete one identified document, and reveal the app-owned user-data folder.

The Rust boundary:

- resolves the directory through Tauri `app_data_dir` rather than hard-coded absolute paths;
- only accepts bounded ASCII stable document IDs;
- refuses traversal, symlinked data directories/files/backups, and non-regular files;
- accepts UTF-8 Markdown only;
- limits a file to 1 MiB and loads at most 256 files per document kind;
- never executes user content or shell commands.

On macOS, Open Data Folder calls public `NSWorkspace.selectFile:inFileViewerRootedAtPath:` through `objc2-app-kit`; it does not invoke the shell or private APIs. The returned path is also copied to the clipboard as a recovery convenience.

## Atomic writes and backup

A write stays in the target directory and follows:

1. validate request/path/content;
2. compare the current raw content with the expected raw revision;
3. create a unique temporary file with `create_new`;
4. write all bytes and `sync_all` the temporary file;
5. read the temporary file back and verify exact content;
6. write/sync one previous-version `.bak` when replacing an existing file;
7. rename the temporary file to the target on the same filesystem;
8. sync the containing directory on Unix/macOS.

Failure before replacement leaves the old target intact. Delete also requires the expected raw revision and writes `.bak` before removing the target.

The storage layer is atomic per document, not a multi-file database transaction. A multi-document operation that fails partway requires Reload Files before further authored saves; the conflict policy prevents a blind second Save from overwriting an external edit.

## External editing and concurrency

Files are re-read at app initialization and whenever the menu-bar popup opens; Reload Files provides an explicit recovery path. There is no file watcher.

Each loaded file retains its exact raw content. Before GUI write/delete, Rust compares disk content with that expected revision. A mismatch returns `conflict` and does not write. The session intentionally keeps its stale pre-save revision until the user explicitly reloads, so repeatedly pressing Save cannot silently convert a conflict into an overwrite.

Change detection is semantic per document. If an external editor merely changes formatting/spacing in one file and the GUI changes a different document, the externally formatted file is not canonicalized/re-written. When Cheat Dock intentionally edits a document, its constrained serializer becomes the file's new canonical formatting.

## localStorage migration

Legacy foundation content migrates once, conservatively:

1. sanitize/load legacy localStorage state;
2. load existing user Markdown;
3. plan stable-ID documents and reject collisions/conflicts;
4. write only missing documents;
5. re-read every document;
6. parse and verify semantic round-trip equality;
7. save the original legacy JSON as a single recovery backup in localStorage;
8. write the verified migration marker;
9. save UI-only localStorage without authored content.

The marker is never written before file verification. Failed/interrupted migration keeps legacy authored data, remains retryable, and reuses matching partial files rather than creating duplicates. Existing non-matching files are never overwritten by migration.

## Shortcut parsing, recording and Command literal safety

Keyboard shortcut logic is centralized in a pure module. Canonical Record storage uses author-friendly text such as `Command + Shift + P`. Presentation maps known shortcut keys/modifiers to macOS glyphs. Actual Record capture maps `Meta → Command`, `Control → Control`, `Alt → Option`, `Shift → Shift`; modifier-only events remain pending, Escape cancels, composition/repeat events are ignored, and the final non-modifier key commits one chord.

Capture is attached only to the explicit Record control in the item dialog, never document-wide, so Search's Japanese IME controller remains independent.

Only Shortcut presentation uses `formatMacShortcut`. Command presentation is literal: `git status`, `command -v node`, `Press Command + K`, `Command failed`, and repeated internal spaces are displayed/copied exactly as stored. Command data is never passed through the explicit keyboard-chord formatter.

The pure `formatExplicitKeyboardChords()` helper may remain available for future procedure/operation presentation where explicit keyboard instructions are semantically appropriate, but it is not part of Command rendering.

Multi-chord sequences such as `Command + K`, then `Command + S` are intentionally future work.

## Search, Recently viewed, locale and compact UI

Search remains deterministic/local with NFKC/case/whitespace normalization, aliases/tags and stable scoring. It indexes raw canonical shortcut and raw command data rather than glyph display text. Results are presented as Current Sheet then Other Sheets without dropping hits; each hit uses the same kind-aware primary-value presentation as the normal list.

Recently viewed also uses the same kind-aware presentation, so mixed historical items follow `kind` consistently there too.

IME composition does not cause root re-render until composition commits. English is canonical; Japanese localization is explicit/selective through optional localized fields. Technical tool names/control labels (`Type`, `Shortcut`, `Command`, `Record`) may remain English. Missing translations fall back safely.

At default width short items target three columns; medium/narrow widths fall back to two/one, and long literal commands may span wide/full rows.

## Reproducibility, security and macOS distribution

`package-lock.json`, `src-tauri/Cargo.lock`, and `rust-toolchain.toml` are committed. CI uses `npm ci`, frontend tests/build, release-identity validation, and `cargo test --locked` on macOS.

The macOS release identity is deliberately stable:

- `productName`: `Cheat Dock`;
- package/executable: `cheat-dock`;
- bundle identifier: `dev.cheatdock.app`;
- candidate version: `0.1.0`, authoritative in `src-tauri/tauri.conf.json` and mirrored into npm/lock/Cargo metadata;
- explicit minimum macOS: `10.15`;
- distribution target: universal `arm64 + x86_64` `.app` packaged in DMG.

The bundle identifier is also the Application Support identity used by Tauri's `app_data_dir`; changing it without a migration would strand existing file-backed user data, so the identifier is frozen for v0.1.

Release qualification uses two lanes. Pull-request CI performs a real universal production build with ad-hoc signing, inspects the generated Info.plist and executable slices, verifies the code signature and DMG contents, and retains only a short-lived Actions artifact. A manual protected `macos-release` environment is prepared for Developer ID Application signing and Apple notarization. Signing certificates and App Store Connect keys are never committed.

Hardened Runtime is explicitly enabled and no custom entitlements are currently required. The release gate additionally requires Gatekeeper/stapling validation and physical fresh-install/upgrade/data-retention qualification on the exact notarized candidate artifact. See `docs/macos-release-qualification.md`.

No AI, cloud, telemetry, account, arbitrary command execution, global shortcut permission, Accessibility permission, updater, or `macos-private-api` is enabled. User-authored text is escaped and not executed as HTML.
