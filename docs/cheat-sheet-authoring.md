# Cheat Sheet authoring guide

Built-in Cheat Sheets live in `cheats/*.md`. They are Markdown with a deliberately small schema so the files remain readable in GitHub and deterministic to parse.

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

## Sections and items

Sections are `##` headings. Items are `###` headings. Item metadata uses `- key: value` lines directly below the item heading.

```md
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

Supported item fields are `id`, `kind`, `description`, `shortcut`, `command`, `aliases`, `tags`, and `source`. Supported kinds are `shortcut`, `command`, `operation`, `procedure`, and `snippet`. Unknown fields, duplicate IDs, malformed frontmatter, and items outside a section are rejected.

HTML is not interpreted. Item body text is rendered as text, preventing user-authored markup from becoming executable HTML.

## Accuracy policy

Prefer verified seed data over coverage. For app-specific shortcuts, use official documentation for the relevant platform. Commands should point to an authoritative manual or upstream documentation when practical.
