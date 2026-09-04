---
id: vim
title: Vim
title-ja: Vim
description: Everyday Vim motions and editing operations for Normal and Insert mode.
aliases: vi, editor
applications:
related: terminal
---

## Movement

### Move left
- id: move-left
- title-ja: 左へ移動
- kind: operation
- shortcut: h
- aliases: left, 左
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
In Normal mode, moves the cursor one character to the left.

### Move down
- id: move-down
- title-ja: 下へ移動
- kind: operation
- shortcut: j
- aliases: down, 下
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
In Normal mode, moves the cursor down one line.

### Move up
- id: move-up
- title-ja: 上へ移動
- kind: operation
- shortcut: k
- aliases: up, 上
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
In Normal mode, moves the cursor up one line.

### Move right
- id: move-right
- title-ja: 右へ移動
- kind: operation
- shortcut: l
- aliases: right, 右
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
In Normal mode, moves the cursor one character to the right.

### First line
- id: first-line
- title-ja: ファイル先頭へ
- kind: operation
- shortcut: gg
- aliases: top, first line, 先頭
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
Moves to the first line of the buffer.

### Last line
- id: last-line
- title-ja: ファイル末尾へ
- kind: operation
- shortcut: G
- aliases: bottom, last line, 末尾
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
Moves to the last line of the buffer.

## Editing

### Enter Insert mode
- id: insert-mode
- title-ja: Insertモードへ
- kind: operation
- shortcut: i
- aliases: insert, edit text, 挿入
- tags: editing, normal-mode
- source: https://vimhelp.org/insert.txt.html
Enters Insert mode before the cursor.

### Return to Normal mode
- id: normal-mode
- title-ja: Normalモードへ戻る
- kind: operation
- shortcut: Esc
- aliases: escape insert, normal mode, ノーマルモード
- tags: editing, mode
- source: https://vimhelp.org/insert.txt.html
Leaves Insert mode and returns to Normal mode.

### Undo
- id: undo
- title-ja: 元に戻す
- kind: operation
- shortcut: u
- aliases: undo change, 元に戻す
- tags: editing, history
- source: https://vimhelp.org/undo.txt.html
Undoes the most recent change in Normal mode.

### Redo
- id: redo
- title-ja: やり直す
- kind: operation
- shortcut: Control + R
- aliases: redo change, やり直す
- tags: editing, history
- source: https://vimhelp.org/undo.txt.html
Redoes a change that was undone.

## Search

### Search forward
- id: search-forward
- title-ja: 前方検索
- kind: operation
- shortcut: /
- aliases: find text, search, 検索
- tags: search, normal-mode
- source: https://vimhelp.org/pattern.txt.html
Starts a forward search; type a pattern and press Enter.

### Next match
- id: next-match
- title-ja: 次の一致へ
- kind: operation
- shortcut: n
- aliases: next search result, next match, 次の一致
- tags: search, normal-mode
- source: https://vimhelp.org/pattern.txt.html
Repeats the most recent search in the same direction.

## Save and quit

### Save
- id: write
- title-ja: 保存
- kind: operation
- command: :w
- aliases: write file, save, 保存
- tags: file, command-line
- source: https://vimhelp.org/editing.txt.html
Writes the current buffer to its file.

### Quit
- id: quit
- title-ja: 終了
- kind: operation
- command: :q
- aliases: quit editor, exit, 終了
- tags: file, command-line
- source: https://vimhelp.org/editing.txt.html
Quits the current window when there are no unsaved changes blocking the command.
