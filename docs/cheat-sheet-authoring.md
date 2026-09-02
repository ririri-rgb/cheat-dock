# Cheat Sheet authoring guide

Built-in Cheat Sheets live in `cheats/*.md`. They use a deliberately small Markdown schema so files remain readable on GitHub and deterministic to parse.

## Frontmatter

```md
---
id: git
title: Git
description: Short human description.
aliases: version control, vcs
applications:
related: terminal
---
```

`id` is lowercase ASCII letters/numbers/hyphens and must be unique. `applications` contains macOS bundle identifiers for sheets that bind to GUI applications. CLI/reference-only sheets leave it empty. `related` contains other Cheat Sheet IDs.

`title-ja` is optional. English `title` remains canonical; explicit Japanese text is used only when present and otherwise falls back to English. Known app/tool sheet names and user-created sheet names are intentionally displayed canonically, so fields such as `title-ja: マイワーク` should not be added merely to transliterate a product/tool name.

## Sections and items

Sections are `##` headings. Items are `###` headings. A section may optionally put `- title-ja:` immediately below the heading. Item metadata uses `- key: value` lines below the item heading.

```md
## Basic
- title-ja: 基本

### Status
- id: status
- title-ja: 変更状態を見る
- kind: command
- command: git status
- aliases: changes, state
- tags: inspect
- source: https://git-scm.com/docs/git-status
Shows the working tree state.
```

Supported item fields are `id`, `title-ja`, `kind`, `description`, `shortcut`, `command`, `aliases`, `tags`, and `source`. Supported kinds are `shortcut`, `command`, `operation`, `procedure`, and `snippet`. Unknown fields, duplicate item IDs (including duplicates across sections), malformed frontmatter, and items outside a section are rejected.

Section localization is optional and intentionally sparse. Use it when Japanese clearly improves comprehension (`Basic` → `基本`, `Formatting` → `書式`); leave technical or visually natural English headings unchanged when appropriate.

## Shortcuts

Authors do **not** need to type macOS glyphs. Human-readable shortcut data is valid:

```md
- shortcut: Command + Option + S
```

The presentation layer formats this as `⌘ ⌥ S`. `Command`/`Cmd`, `Option`/`Alt`, `Shift`, `Control`/`Ctrl`, common navigation keys, and already-symbolized shortcuts are supported. The raw Markdown value is retained; presentation formatting never rewrites the source data. In particular, `Control` is distinct from `Command`.

## Localization policy

Localization is explicit and selective:

- localized field present → use it for that locale;
- localized field absent → show canonical English;
- do not automatically transliterate English into Katakana;
- keep app/tool names such as `Excel`, `Git`, `Vim`, `Docker`, `Homebrew`, `SSH`, `VS Code`, `Terminal`, and `My Work` canonical;
- keep compact technical controls such as `Edit` / `Delete` / `Item` / `Sheet` in English;
- localize human-facing operation labels and sections only where it makes scanning easier;
- never translate commands or shortcut semantics.

Aliases may contain both languages when that improves local search.

HTML is not interpreted. Item body text is treated as text rather than executable markup.

## Accuracy policy

Prefer verified seed data over coverage. For app-specific shortcuts, use official documentation for the relevant platform. Commands should point to an authoritative manual or upstream documentation when practical.
