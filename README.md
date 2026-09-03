# cheat-dock

> A local cheat sheet for every app, right from your menu bar.

`cheat-dock` is an early-stage, macOS-first open-source menu-bar utility for shortcuts, CLI commands, operations, procedures, snippets, and personal references in one compact UI.

## Project status

The macOS menu-bar foundation is on `main`. PR #6 moves user-authored content from WebView localStorage to human-readable Markdown files and adds explicit keyboard-shortcut recording. Physical Mac qualification has passed migration, persistence, Finder access, direct editing, conflict protection, Record, command-literal safety, and Japanese IME checks; the final item-editor semantic refinement remains under qualification. It is **not yet a signed/notarized end-user release**.

## Privacy

Core behavior is local-only. v0.1 intentionally has no account, login, cloud sync, AI/LLM API, analytics, telemetry, ads, or remote Cheat Sheet marketplace. Search terms and personal content are not sent to a server.

Foreground app detection uses macOS `NSWorkspace.frontmostApplication` and does not request Accessibility permission.

## Built-in and personal data

Built-in starter sheets (Excel, Finder, VS Code, Terminal, Git, Vim, Docker, Homebrew, SSH, My Work) are repository-managed Markdown under `cheats/` and remain read-only from normal GUI CRUD.

User-authored content is stored under the OS-standard application-data directory in `user-data/`:

```text
user-data/
├── cheats/
│   └── user-<stable-id>.md
└── overlays/
    └── <built-in-id>.md
```

Custom Sheet titles are not used as filenames; stable IDs keep file identity unchanged when a Sheet is renamed. Built-in personal additions are written to overlay Markdown rather than modifying bundled files.

Use **Open Data Folder** in the popup to reveal this directory in Finder. Files may be edited directly in VS Code/Vim; closing and reopening the popup (or using Reload Files after an error) reloads them. See [docs/user-data.md](docs/user-data.md).

## Item types, Shortcut, and Command

`kind` is the authoritative item semantic. The GUI currently focuses on creating/editing two kinds:

- **Shortcut** — a keyboard chord the user presses. Markdown stores canonical text such as `Command + Shift + P`; macOS presentation renders `⌘ ⇧ P`. The editor offers **Record** only for Shortcut items.
- **Command** — literal text typed/executed in a terminal, CLI, command palette, or similar text-command surface. `git status`, `command -v node`, `Press Command + K`, and repeated spaces are displayed/copied exactly as stored. Command values are never passed through the macOS shortcut formatter.

The compact editor has one **Type** selector. New GUI items persist only the primary field for their selected kind, so a Shortcut item does not also store `command` and a Command item does not also store `shortcut`.

Historical Markdown/localStorage may contain both fields. Loading does not rewrite or delete them. `kind` decides which value is primary for display; malformed kind/field mismatches use a compatibility fallback. Editing a mixed legacy item shows a compact warning before Save removes the inactive field.

Shortcut Record captures one chord such as `⌘K` and stores `Command + K`. Multi-chord sequences are a future enhancement.

## Development

Prerequisites: macOS for native behavior testing, Xcode Command Line Tools, Rustup, and Node.js 24. Lockfiles are committed.

```sh
npm ci
npm run check
npm run tauri dev
```

Rust storage tests use real temporary filesystem operations:

```sh
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

## Cheat Sheet format

Cheat Sheets use constrained frontmatter plus `##` sections and `###` items. Example:

```md
---
id: user-project-a
title: Project A
---

## Deploy

### Production deploy
- id: user-deploy
- kind: command
- command: make deploy-prod
```

See [the authoring guide](docs/cheat-sheet-authoring.md), [user-data documentation](docs/user-data.md), [migration notes](docs/migration.md), and [CONTRIBUTING.md](CONTRIBUTING.md).

## Safety model

User Markdown is treated as untrusted text. Cheat Dock uses a constrained parser, escapes user text rather than rendering arbitrary HTML, rejects unsafe file identities/symlinks, limits file size/count, writes through temp-file + sync + atomic replace, keeps one `.bak`, and uses raw-content optimistic concurrency so external edits are not silently overwritten. Commands remain reference/copy only; Cheat Dock never executes them.

## Current limitations

- PR #6 must not be merged until the final physical-Mac item-editor semantic check is reviewed.
- GUI creation/editing currently focuses on Shortcut and Command; operation/procedure/snippet remain Markdown-compatible and directly editable in the data folder.
- User Markdown reload is popup-open/manual, not real-time file watching.
- Concurrent GUI/external edits do not three-way merge; conflicts require Reload Files.
- Shortcut Record supports one chord, not VS Code-style multi-chord sequences.
- No signed/notarized downloadable build yet.
- Seed data remains deliberately sparse.

## License

MIT
