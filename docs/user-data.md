# User data files

Human-readable Markdown is the source of truth for user-authored Cheat Dock content.

## Location

Cheat Dock asks Tauri for the OS-standard application-data directory; it does not hard-code a home-directory path. Tauri scopes that directory by the configured bundle identifier. The v0.1 release candidate deliberately keeps the qualified identifier `dev.cheatdock.app`, so on macOS the data root is conceptually:

```text
~/Library/Application Support/dev.cheatdock.app/user-data/
```

Inside it Cheat Dock owns:

```text
user-data/
├── cheats/
│   └── user-<stable-id>.md
└── overlays/
    └── <built-in-id>.md
```

Use **Open Data Folder** in the popup. On macOS this uses the public AppKit `NSWorkspace` Finder API. Cheat Dock also copies the resolved path to the clipboard as a recovery convenience. No shell `open` command is executed.

The bundle identifier is now part of the user-data compatibility contract. Changing it would point Tauri at a different application-data directory, so any future identifier change requires an explicitly qualified data migration first.

## What goes where

- `cheats/`: user-created custom Cheat Sheets. Filename identity is the stable Sheet ID, not the title.
- `overlays/`: personal sections/items attached to bundled built-in Sheets such as Excel or Git.
- bundled repository `cheats/`: built-ins only; GUI personal CRUD never modifies these files.

Pins, Recently viewed, expanded sections, and other UI state remain validated localStorage rather than being mixed into authored Markdown.

## Upgrade and uninstall behavior

Normal macOS app replacement changes `/Applications/Cheat Dock.app` but must not move or delete the identifier-scoped Application Support directory. The v0.1 release checklist therefore tests upgrading an existing qualified build while retaining custom Sheets/overlays.

Deleting only the `.app` bundle is not a request to delete personal data. Reinstalling the same bundle identity should find the retained Markdown again. Users who intentionally want a full reset can back up and then remove the application-data directory themselves.

## Shortcut and Command files

Item `kind` is authoritative. GUI-created Shortcut and Command items use one primary field:

```md
### Open Palette
- id: user-palette
- kind: shortcut
- shortcut: Command + Shift + P
```

```md
### Status
- id: user-status
- kind: command
- command: git status
```

Shortcut values are stored as editable canonical text and rendered with macOS glyphs in the UI. Command values are literal: `command -v node`, `Press Command + K`, `Command failed`, and meaningful repeated spaces are not keyboard-formatted or otherwise rewritten for display/copy.

Historical files may contain both `shortcut` and `command`. Opening/reloading such a file preserves both raw fields and does not rewrite it. The valid `kind` selects primary presentation. When that mixed item is explicitly saved through the Shortcut/Command GUI editor, a compact warning explains that the inactive value will be removed so the item returns to the one-primary-field invariant.

`operation`, `procedure`, and `snippet` remain valid Markdown kinds. Their authoring continues through direct Markdown rather than a larger GUI editor expansion.

## Direct editing

You can edit user Markdown in VS Code, Vim, or another text editor. Save the file, then close/reopen the Cheat Dock popup or use **Reload Files** when shown. Cheat Dock deliberately avoids a real-time file watcher to keep race/battery behavior simple.

The file must follow `docs/cheat-sheet-authoring.md`. One malformed file is skipped and reported; valid user files and built-ins continue to load. The error surface includes the relative file path and a reason so you can open the data folder and repair it.

Cheat Dock never deletes a corrupt file automatically.

## External-edit conflicts

Every loaded document retains its exact raw content as an optimistic-concurrency revision. Before a GUI write/delete, the Rust storage boundary compares the current file with that revision.

If they differ:

1. Cheat Dock refuses the write/delete;
2. the old disk file is left untouched;
3. the UI reports a conflict;
4. pressing Save again still cannot overwrite it;
5. explicitly Reload Files (or reopen the popup), review the external change, then edit again.

There is no three-way merge in v0.1.

Unrelated files are not reserialized. If an external editor changes spacing/formatting in Sheet A and the GUI only edits Sheet B, Sheet A remains byte-for-byte untouched. If the GUI intentionally edits Sheet A, the constrained serializer writes its canonical structure while preserving authored payload semantics such as internal command spaces.

## Atomic writes and `.bak`

Each document write uses a temporary file in the same directory, flush/sync, exact read-back verification, one previous-version `.bak`, atomic same-filesystem rename/replace, then directory sync on macOS/Unix.

Examples:

```text
cheats/user-project.md
cheats/user-project.md.bak
```

The backup is one generation, not an unlimited history. A failed write before replacement retains the existing target file. Delete also writes `.bak` before removing the target.

## Safety limits

The native boundary rejects:

- path traversal/unsafe IDs;
- symlinked user files/directories/backups;
- non-regular files;
- invalid UTF-8;
- files larger than 1 MiB;
- more than 256 loaded Markdown files per kind.

User Markdown is parsed as constrained data and escaped in the UI. It is never executed as HTML or shell code.

See `docs/macos-release-qualification.md` for the install/upgrade data-retention gate.
