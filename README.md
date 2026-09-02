# cheat-dock

> A local cheat sheet for every app, right from your menu bar.

`cheat-dock` is an early-stage, macOS-first open-source menu-bar utility for shortcuts, CLI commands, operations, procedures, snippets, and personal references in one compact UI.

## Project status

Phase-one implementation is in progress. The repository contains a working Tauri 2 foundation, constrained Markdown data model, local cross-sheet search, per-sheet recents, pinning, personal overlays/custom sheets, and macOS foreground-app mapping. It is **not yet a signed/notarized end-user release**.

## Privacy

Core behavior is local-only. v0.1 intentionally has no account, login, cloud sync, AI/LLM API, analytics, telemetry, ads, or remote Cheat Sheet marketplace. Search terms and personal Cheat Sheet content are not sent to a server.

Foreground app detection uses macOS `NSWorkspace.frontmostApplication` and does not request Accessibility permission. Cheat Dock only needs the frontmost app's stable bundle identifier/localized name for sheet selection.

## Built-in starter sheets

Excel, Finder, VS Code, Terminal, Git, Vim, Docker, Homebrew, SSH, and My Work are registered. Seed content is intentionally small and source-verified rather than broad and guessed.

Built-ins are Markdown under `cheats/`. Personal items are stored separately as overlays, so built-in updates do not destructively edit user content.

## Development

Prerequisites: macOS for native behavior testing, Rust stable, Xcode Command Line Tools, and a Node.js release supported by Vite 8.

```sh
npm install
npm run check
npm run tauri dev
```

Rust validation:

```sh
cargo check --manifest-path src-tauri/Cargo.toml
```

## Cheat Sheet format

Cheat Sheets use minimal frontmatter plus `##` sections and `###` items. Example:

```md
---
id: git
title: Git
applications:
related: terminal
---

## Working tree

### Status
- id: status
- kind: command
- command: git status
- aliases: changes, state
- tags: inspect
- source: https://git-scm.com/docs/git-status
Shows the working tree state.
```

See [the authoring guide](docs/cheat-sheet-authoring.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Architecture

Tauri 2 + Rust handles tray/window lifecycle and macOS foreground application detection. Vanilla TypeScript/Vite keeps the compact UI small. Search/parser/state logic is framework-independent and unit-tested. See [docs/architecture.md](docs/architecture.md).

## Current limitations

- No signed/notarized downloadable build yet.
- User data currently persists in application-local webview storage; direct user-Markdown editing/export is not implemented yet.
- Native macOS lifecycle behavior requires the manual qualification checklist in [docs/macos-qualification.md](docs/macos-qualification.md).
- Seed data is deliberately sparse.

## License

MIT
