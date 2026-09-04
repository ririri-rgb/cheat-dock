# cheat-dock

> A local cheat sheet for every app, right from your menu bar.

`cheat-dock` is an early-stage, macOS-first open-source menu-bar utility for shortcuts, CLI commands, operations, procedures, snippets, and personal references in one compact UI.

## Project status

The usable macOS foundation, file-backed personal-data work, universal `arm64 + x86_64` production packaging, and physical macOS qualification baseline are complete on `main`. The baseline at `b10881fefbdaf72d80fb50fdd17b7af07014c719` passed browser-download/Gatekeeper, fresh-install, persistence, upgrade/data-retention, Markdown filename/hash retention, post-upgrade edit/restart, uninstall/reinstall retention, and DMG visual qualification.

The current release-readiness phase is the final v0.1 starter-content and documentation pass. Because bundled cheat content is release-relevant, merging content changes means the previously qualified `b10881f...` candidate remains historical qualification evidence but **must not** be published as the final v0.1 artifact. After the content change lands, the project must freeze the new `main` SHA, generate a new manual production candidate, freeze its exact artifact/checksums, and repeat the required physical qualification on that new artifact.

There is **no public v0.1 release yet**. No `v0.1.0` tag or GitHub Release exists.

Cheat Dock v0.1 is planned for direct distribution through the official `ririri-rgb/cheat-dock` GitHub Releases page. The v0.1 app is **ad-hoc signed, not Developer ID signed, and not Apple-notarized**. Developer ID signing and Apple notarization remain a possible future distribution option, not a v0.1 requirement.

## Privacy

Core behavior is local-only. v0.1 intentionally has no account, login, cloud sync, AI/LLM API, analytics, telemetry, ads, or remote Cheat Sheet marketplace. Search terms and personal content are not sent to a server.

Foreground app detection uses macOS `NSWorkspace.frontmostApplication` and does not request Accessibility permission.

## Install on macOS

When a v0.1 GitHub Release is published:

1. Download the universal DMG only from the official `ririri-rgb/cheat-dock` GitHub Release.
2. Confirm the Release, exact filename, and published SHA-256. On macOS you can calculate a DMG checksum with `shasum -a 256 /path/to/file.dmg` and compare it with the published `SHA256SUMS.txt`.
3. Open the DMG and drag **Cheat Dock** to **Applications**.
4. Try to open Cheat Dock normally once.
5. Because v0.1 is not signed with an Apple Developer ID and is not notarized by Apple, macOS may block the first launch.
6. If you have verified the repository, Release, filename, and SHA-256 and choose to continue, open **System Settings → Privacy & Security** and use macOS's per-app **Open Anyway** / **このまま開く** control, then confirm the app.

Do not disable Gatekeeper, SIP, or quarantine protections to install Cheat Dock. Apple's current guidance for opening an app from an unidentified developer uses the per-app Privacy & Security exception after an initial launch attempt:

- https://support.apple.com/102445
- https://support.apple.com/guide/mac-help/mh40616/mac

SHA-256 is provided as an artifact-integrity check. It is **not** a substitute for Apple Developer ID identity verification or Apple notarization.

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

Deleting only `/Applications/Cheat Dock.app` does not intentionally delete user-authored Application Support data. For a complete data removal, first use **Open Data Folder** to identify the application-owned location, then remove the data explicitly if that is what you want.

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

## Release qualification

The candidate application version is `0.1.0`, but no tag or Release exists yet. `src-tauri/tauri.conf.json` is the authoritative release version; CI verifies that npm/package-lock/Cargo mirrors do not drift.

The v0.1 GitHub-distribution candidate is built as a universal production `.app` and DMG with an **ad-hoc code signature**:

```sh
npm ci
npm run release:check
rustup target add aarch64-apple-darwin x86_64-apple-darwin
APPLE_SIGNING_IDENTITY=- npm run tauri build -- --target universal-apple-darwin --bundles app,dmg
```

`APPLE_SIGNING_IDENTITY=-` means ad-hoc signing. It does not create a Developer ID signature and it does not imply Apple verification or notarization.

### Qualified technical baseline

The completed pre-content qualification baseline is retained as evidence:

- source SHA: `b10881fefbdaf72d80fb50fdd17b7af07014c719`
- workflow run: `33765182052`
- artifact ID: `9897462782`
- artifact name: `cheat-dock-v0.1-candidate-universal-adhoc`
- Actions artifact digest: `sha256:f6f75013f5504aab3f56132ca2ad7464f7faba789463749d8f4f5ba93a3a4aac`
- DMG: `Cheat Dock_0.1.0_universal.dmg`
- qualified DMG SHA-256: `fe86d3bc4db20c5f0f936a53743fdbdf230310eb78a5c20b9933b93d988c14bf`

These values describe the already-qualified technical baseline only. They are **not** the final public v0.1 checksum after starter-content changes. Any release-relevant content merged after this SHA requires a newly frozen candidate and new physical qualification.

The final candidate must be generated by manual workflow dispatch from the exact intended post-content `main` commit. The workflow records SHA-256 for the DMG and retained app ZIP; physical qualification must use that exact downloaded artifact. The public v0.1 Release design is intentionally simple: the universal DMG plus `SHA256SUMS.txt`.

The existing protected `signed-notarized-universal` workflow lane is retained for a possible future Developer ID/notarized distribution model. It is not a v0.1 release gate under the current project decision.

See [the macOS release qualification guide](docs/macos-release-qualification.md).

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

- v0.1 is planned as a direct GitHub download and is not Developer ID signed or Apple-notarized; first-launch Gatekeeper friction is expected and must be handled through macOS's per-app approval UI.
- GUI creation/editing currently focuses on Shortcut and Command; operation/procedure/snippet remain Markdown-compatible and directly editable in the data folder.
- User Markdown reload is popup-open/manual, not real-time file watching.
- Concurrent GUI/external edits do not three-way merge; conflicts require Reload Files.
- Shortcut Record supports one chord, not VS Code-style multi-chord sequences.
- There is no auto-updater; v0.1 upgrade qualification uses normal app replacement while retaining Application Support data.
- Built-in starter content is curated for common daily use rather than intended as an exhaustive manual.

## License

MIT
