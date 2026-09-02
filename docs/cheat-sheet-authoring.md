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

Supported item fields are `id`, `title-ja`, `kind`, `description`, `shortcut`, `command`, `aliases`, `tags`, and `source`. Supported kinds are `shortcut`, `command`, `operation`, `procedure`, and `snippet`.

Unknown fields, duplicate item IDs, malformed frontmatter, and items outside a section are rejected. A bad user file is isolated rather than disabling built-ins or other valid files.

## Payload whitespace

Human-facing structural labels may be normalized for stable Markdown output. Authored payload fields are different: `command`, `shortcut`, `description`, and `source` keep meaningful internal spaces. For example the two spaces in:

```md
- command: printf '%s  %s' "$A" "$B"
```

must remain two spaces after GUI save/reload. Cheat Dock never rewrites a CLI command into display glyphs.

## Shortcuts

Canonical stored shortcuts are author-friendly text:

```md
- shortcut: Command + K
- shortcut: Command + Shift + P
- shortcut: Control + Option + Space
```

The macOS UI renders these as `⌘ K`, `⌘ ⇧ P`, and `⌃ ⌥ Space`. Authors may continue typing raw shortcut text directly. GUI item dialogs also have **Record**: click Record, press one chord, and Cheat Dock fills the canonical raw value. Meta maps to Command, Control remains Control, Alt maps to Option, and Shift remains Shift.

Modifier-only input does not commit; Escape cancels; IME composition is ignored by the Record handler. Record currently supports one chord. Multi-chord sequences are a future extension and are not encoded into a new schema in PR #6.

Already-symbolized input remains accepted for compatibility, but canonical human-readable names are preferred in editable Markdown.

## Keyboard chords inside display text

Presentation may convert an explicit chord inside a displayed command/procedure value, for example `Press Command + Shift + P` → `Press ⌘ ⇧ P`. This is grammar-based and presentation-only. Ordinary words and shell commands are not substitutions:

```text
command -v node   # unchanged
run command       # unchanged
Git command       # unchanged
Command failed    # unchanged
```

Copy and file persistence always use the raw value.

## Built-in overlays

Never edit bundled built-in Markdown for personal additions. A personal item added to Git/Excel/etc. is stored in `user-data/overlays/<built-in-id>.md`. The overlay uses the same sections/items grammar and merges at runtime.

Custom Sheets live in `user-data/cheats/user-<stable-id>.md`. See `docs/user-data.md` for direct editing, conflicts, backups, and recovery.

## Localization policy

Localization is explicit and selective:

- localized field present → use it for that locale;
- localized field absent → show canonical English;
- no automatic Katakana transliteration;
- keep app/tool names such as `Excel`, `Git`, `Vim`, `Docker`, `Homebrew`, `SSH`, `VS Code`, `Terminal`, and `My Work` canonical;
- keep compact technical controls such as `Edit` / `Delete` / `Item` / `Sheet` in English;
- never translate command contents or shortcut semantics.

Aliases may contain both languages when that improves local search.

HTML is not interpreted as executable content. User text is escaped in the application UI.

## Accuracy policy

Prefer verified seed data over coverage. For app-specific shortcuts, use official documentation for the relevant platform. Commands should point to an authoritative manual or upstream documentation when practical.
