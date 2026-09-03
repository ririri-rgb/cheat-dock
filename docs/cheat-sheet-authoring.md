# Cheat Sheet authoring guide

Built-in Cheat Sheets live in repository `cheats/*.md`. File-backed custom Sheets and built-in personal overlays use the same deliberately constrained Markdown grammar so files remain readable, diffable, and deterministic to parse.

## Frontmatter

```md
---
id: user-project-a
title: Project A
description: Short human description.
aliases: project, work
applications:
related: git
---
```

`id` is the stable identity. Built-in IDs are repository-controlled. GUI-created custom Sheet IDs start with `user-` and become the filename; the title is never used as a filesystem path. Renaming a Sheet therefore does not change its file identity.

`title-ja` is optional. English `title` remains canonical; explicit Japanese text is used only when present and otherwise falls back to English. Do not add mechanical Katakana transliterations for tool names.

## Sections and items

Sections are `##` headings. Items are `###` headings. A section may optionally put `- title-ja:` immediately below the heading. Item metadata uses `- key: value` lines.

```md
## Deploy

### Production deploy
- id: user-deploy
- kind: command
- command: printf '%s  %s' "$A" "$B"

Production deploy command.
```

Supported item fields are `id`, `title-ja`, `kind`, `description`, `shortcut`, `command`, `aliases`, `tags`, and `source`. Supported kinds remain `shortcut`, `command`, `operation`, `procedure`, and `snippet`. `kind` is authoritative; there is no separate persisted `type` field.

Unknown fields, duplicate item IDs, malformed frontmatter, and items outside a section are rejected. A bad user file is isolated rather than disabling built-ins or other valid files.

## Shortcut vs Command

These are deliberately different semantics.

### Shortcut

A Shortcut is a keyboard chord the user presses:

```md
### Open Command Palette
- id: user-open-palette
- kind: shortcut
- shortcut: Command + Shift + P
```

The canonical Markdown is human-readable and the macOS UI presents it as `⌘ ⇧ P`. Only Shortcut presentation uses the macOS shortcut formatter. The GUI Record control is available only for `kind: shortcut`.

### Command

A Command is literal textual command input:

```md
### Show repository status
- id: user-status
- kind: command
- command: git status
```

Other valid examples include:

```text
docker compose up
brew update
ssh user@example.com
command -v node
Press Command + K
Command failed
```

Command content is literal. Cheat Dock does **not** interpret the English word `Command` as a keyboard modifier when it appears in a `command:` field. It is displayed and copied exactly as stored and is never passed through the macOS shortcut formatter.

## GUI item invariants and legacy compatibility

The compact GUI editor currently focuses on Shortcut and Command creation/editing and labels the existing `kind` choice as **Type**.

New GUI saves use one primary value:

```md
- kind: shortcut
- shortcut: Command + K
```

or:

```md
- kind: command
- command: git status
```

They do not create a new item with both `shortcut` and `command`.

Historical localStorage/Markdown may already contain both fields. Such mixed items remain valid compatibility input. Loading/reloading them does not remove either field or rewrite the file. Their valid `kind` decides which field is primary for presentation. If a user edits a mixed Shortcut/Command item, the dialog shows the current `kind` as Type and warns that saving the selected Type will remove the inactive value.

Malformed historical items whose valid `kind` is missing its matching field use a compatibility fallback to the other available value so the app remains usable. New GUI saves return to the valid one-primary-field invariant.

`operation`, `procedure`, and `snippet` remain supported in Markdown. PR #6 does not expand their GUI editor surface; direct file editing is the supported path for those kinds.

## Payload whitespace

Human-facing structural labels may be normalized for stable Markdown output. Authored payload fields are different: `command`, `shortcut`, `description`, and `source` keep meaningful internal spaces. For example the two spaces in:

```md
- command: printf '%s  %s' "$A" "$B"
```

must remain two spaces after GUI save/reload. Command presentation is literal and cannot convert those bytes into shortcut glyphs.

## Shortcut Record

Canonical stored shortcuts are author-friendly text:

```md
- shortcut: Command + K
- shortcut: Command + Shift + P
- shortcut: Control + Option + Space
```

The macOS UI renders these as `⌘ K`, `⌘ ⇧ P`, and `⌃ ⌥ Space`. Authors may continue typing shortcut text directly. GUI item dialogs also have **Record** for Shortcut Type: click Record, press one chord, and Cheat Dock fills the canonical raw value. Meta maps to Command, Control remains Control, Alt maps to Option, and Shift remains Shift.

Modifier-only input does not commit; Escape cancels; IME composition is ignored by the Record handler. Record currently supports one chord. Multi-chord sequences are a future extension and are not encoded into a new schema in PR #6.

Already-symbolized input remains accepted for compatibility, but canonical human-readable names are preferred in editable Markdown.

A pure explicit-keyboard-chord formatter remains available internally for potential future operation/procedure presentation. It is intentionally **not** used for `command:` values.

## Built-in overlays

Never edit bundled built-in Markdown for personal additions. A personal item added to Git/Excel/etc. is stored in `user-data/overlays/<built-in-id>.md`. The overlay uses the same sections/items grammar and merges at runtime.

Custom Sheets live in `user-data/cheats/user-<stable-id>.md`. See `docs/user-data.md` for direct editing, conflicts, backups, and recovery.

## Localization policy

Localization is explicit and selective:

- localized field present → use it for that locale;
- localized field absent → show canonical English;
- no automatic Katakana transliteration;
- keep app/tool names such as `Excel`, `Git`, `Vim`, `Docker`, `Homebrew`, `SSH`, `VS Code`, `Terminal`, and `My Work` canonical;
- compact technical controls such as `Type`, `Shortcut`, `Command`, `Record`, `Edit`, `Delete`, `Item`, and `Sheet` may remain English;
- never translate command contents or shortcut semantics.

Aliases may contain both languages when that improves local search.

HTML is not interpreted as executable content. User text is escaped in the application UI.

## Accuracy policy

Prefer verified seed data over coverage. For app-specific shortcuts, use official documentation for the relevant platform. Commands should point to an authoritative manual or upstream documentation when practical.
