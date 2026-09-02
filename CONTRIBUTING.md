# Contributing to cheat-dock

Thanks for contributing. cheat-dock is local-first and intentionally small in scope.

## Development

Requirements: a current Node.js release supported by Vite 8, Rust stable, Xcode Command Line Tools, and macOS for native qualification.

```sh
npm install
npm run check
npm run tauri dev
```

For Rust-only validation:

```sh
cd src-tauri
cargo check
```

## Adding a Cheat Sheet

1. Add one Markdown file under `cheats/`.
2. Follow `docs/cheat-sheet-authoring.md` exactly.
3. Prefer a small number of entries verified against current official documentation.
4. Add `source:` per built-in item when a primary source exists.
5. Run `npm run check`.

Do not bulk-submit guessed shortcuts or generated command lists. Application-specific shortcuts must be checked for the relevant OS/version.

## Pull requests

Keep changes reviewable. Explain behavior changes, tests performed, and any macOS permission implications. Do not introduce telemetry, cloud calls, AI APIs, arbitrary shell execution, or broad filesystem scopes without a separate product/security discussion.
