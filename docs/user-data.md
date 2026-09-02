# User data files

PR #6 makes human-readable Markdown the source of truth for user-authored Cheat Dock content.

## Location

Cheat Dock asks Tauri for the OS-standard application-data directory; it does not hard-code a home-directory path. On macOS this resolves under the user's Application Support area for the app identifier. Inside it Cheat Dock owns:

```text
user-data/
├── cheats/
│   └── user-<stable-id>.md
└── overlays/
    └── <built-in-id>.md
```

Use **Open Data Folder** in the popup. On macOS this uses the public AppKit `NSWorkspace` Finder API. Cheat Dock also copies the resolved path to the clipboard as a recovery convenience. No shell `open` command is executed.

## What goes where

- `cheats/`: user-created custom Cheat Sheets. Filename identity is the stable Sheet ID, not the title.
- `overlays/`: personal sections/items attached to bundled built-in Sheets such as Excel or Git.
- bundled repository `cheats/`: built-ins only; GUI personal CRUD never modifies these files.

Pins, Recently viewed, expanded sections, and other UI state remain validated localStorage rather than being mixed into authored Markdown.

## Direct editing

You can edit user Markdown in VS Code, Vim, or another text editor. Save the file, then close/reopen the Cheat Dock popup or use **Reload Files** when shown. PR #6 deliberately avoids a real-time file watcher to keep race/battery behavior simple.

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

There is no three-way merge in PR #6.

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
