# Legacy localStorage migration

PR #6 migrates PR #1 user-authored content from WebView localStorage into file-backed Markdown without deleting the legacy data before verification.

## Migration sequence

On startup/popup initialization when the file-migration marker is absent:

1. Load and sanitize the legacy PR #1 state.
2. Load existing user Markdown files.
3. Build the desired stable-ID custom-Sheet and overlay documents.
4. Reject duplicate titles, malformed identities, or a pre-existing file whose semantic content differs from legacy data.
5. Write only missing documents using the normal atomic write path.
6. Reload all user files from disk.
7. Parse them with the constrained Markdown parser.
8. Verify every desired document is present and semantically round-trips to the legacy content.
9. Store the original legacy JSON once under `cheat-dock-legacy-content-backup-v1`.
10. Store migration marker `cheat-dock-file-migration-v1` with a verification timestamp.
11. Rewrite active localStorage to UI-only state, removing authored `userSheets`/`overlays` from the active state.

The migration marker is therefore evidence of a verified file set, not merely evidence that migration was attempted.

## Failure behavior

If planning, writing, reload, parsing, or verification fails:

- no migration marker is written;
- legacy authored content remains in active localStorage;
- existing conflicting Markdown is not overwritten;
- valid built-ins remain usable;
- migration can be retried after the user resolves the problem.

A partial migration is idempotent. Stable IDs map to the same filenames; on retry, already-written files that semantically match legacy content are accepted and not duplicated. A mismatching partial file blocks migration instead of being replaced.

## Historical malformed/duplicate data

Legacy state is first passed through the PR #1 runtime sanitizer. Duplicate custom Sheet titles are additionally compared with Unicode NFKC, collapsed whitespace, trim, and case-insensitive keys. A historical user Sheet that collides with a built-in title must be renamed/deleted before migration; Cheat Dock does not guess which data to discard.

## Recovery data

Two different recovery mechanisms exist:

- migration backup: one copy of the original legacy JSON remains in localStorage under `cheat-dock-legacy-content-backup-v1`;
- normal file edits: one previous `.bak` file is kept alongside the edited/deleted Markdown.

PR #6 does not automatically restore either backup. The user can reveal the data directory in Finder and repair/restore Markdown manually. Automatic recovery policy can be considered only after physical qualification proves the storage format stable.

## After successful migration

User-authored knowledge is loaded from Markdown, not from active localStorage. localStorage continues to carry UI-only state such as pins, recents, and expanded sections. Removing active authored content from localStorage prevents two independent writable sources of truth.
