# Contributing to cheat-dock

Thanks for contributing. cheat-dock is local-first and intentionally small in scope.

## Development

Requirements: Node.js 24, Rust stable, Xcode Command Line Tools, and macOS for native qualification.

```sh
npm ci
npm run check
npm run tauri dev
```

Rust/storage validation:

```sh
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

Release identity validation:

```sh
npm run release:identity
```

`src-tauri/tauri.conf.json > version` is the release-version authority. Keep `package.json`, the root `package-lock.json`, and the Cargo package version synchronized. Do not casually change `dev.cheatdock.app`: Tauri's application-data directory is identifier-scoped and existing personal Markdown depends on that identity.

## Adding a built-in Cheat Sheet

1. Add one Markdown file under repository `cheats/`.
2. Follow `docs/cheat-sheet-authoring.md` exactly.
3. Prefer a small number of entries verified against current official documentation.
4. Add `source:` per built-in item when a primary source exists.
5. Run the frontend and Rust checks above.

Do not bulk-submit guessed shortcuts or generated command lists.

## User Markdown compatibility

The file-backed layer reuses the same constrained Markdown schema for custom Sheets and built-in overlays. Changes to the parser/serializer must preserve:

- stable IDs;
- raw `shortcut` values rather than presentation glyphs;
- command payload whitespace/semantics;
- explicit locale fields;
- deterministic rejection of duplicate/invalid identities;
- safe round-trip through parse → serialize → parse.

When changing storage code, include real temporary-filesystem tests. Never write outside the OS app-data-owned `user-data` root, follow symlink/path-traversal defenses, and do not weaken optimistic conflict checks or atomic-write/backup behavior.

## Shortcut changes

Keyboard capture is explicit and scoped to the Record control in the item dialog. Do not install document-wide keyboard interception. Keep Meta → Command, Control → Control, Alt → Option, Shift → Shift, and keep Search IME composition independent from shortcut capture.

## macOS release engineering

See `docs/macos-release-qualification.md` before changing packaging, bundle identity, minimum macOS version, signing, entitlements, or release workflows.

Public macOS artifacts must eventually be Developer ID signed and notarized. Ad-hoc CI bundles are qualification artifacts only. Never commit signing certificates, `.p12` files, App Store Connect private keys, Apple IDs/passwords, or other release credentials. Do not create tags or GitHub Releases as part of an ordinary implementation PR.

## Pull requests

Keep changes reviewable. Explain behavior changes, tests performed, migration/data-loss considerations, and macOS permission implications. Do not introduce telemetry, cloud calls, AI APIs, arbitrary shell execution, private macOS APIs, or broad filesystem scopes without a separate product/security discussion.
