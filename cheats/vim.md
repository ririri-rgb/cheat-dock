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
- title-ja: 移動

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

### Next word
- id: next-word
- title-ja: 次の単語へ
- kind: operation
- shortcut: w
- aliases: next word, word forward, 次の単語, 単語移動
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
Moves to the start of the next word in Normal mode.

### Previous word
- id: previous-word
- title-ja: 前の単語へ
- kind: operation
- shortcut: b
- aliases: previous word, word backward, 前の単語, 単語移動
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
Moves to the start of the previous word in Normal mode.

### Start of line
- id: line-start
- title-ja: 行頭へ
- kind: operation
- shortcut: 0
- aliases: start of line, line beginning, 行頭, 先頭
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
Moves to the first character position of the current line.

### End of line
- id: line-end
- title-ja: 行末へ
- kind: operation
- shortcut: $
- aliases: end of line, line ending, 行末, 末尾
- tags: movement, normal-mode
- source: https://vimhelp.org/motion.txt.html
Moves to the end of the current line.

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
- title-ja: 編集

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

### Delete current line
- id: delete-line
- title-ja: 現在行を削除
- kind: operation
- shortcut: dd
- aliases: delete line, cut line, 行削除, 1行削除
- tags: editing, normal-mode
- source: https://vimhelp.org/change.txt.html
Deletes the current line into a register; the change can be undone with `u`.

### Yank current line
- id: yank-line
- title-ja: 現在行をヤンク
- kind: operation
- shortcut: yy
- aliases: copy line, yank line, 行コピー, ヤンク
- tags: editing, register
- source: https://vimhelp.org/change.txt.html
Yanks the current line into a register without changing the buffer.

### Paste after cursor
- id: paste-after
- title-ja: カーソル後へ貼り付け
- kind: operation
- shortcut: p
- aliases: paste, put, 貼り付け, ペースト
- tags: editing, register
- source: https://vimhelp.org/change.txt.html
Puts the contents of a register after the cursor or below the current line.

### Change inner word
- id: change-inner-word
- title-ja: 単語の中身を置き換える
- kind: operation
- shortcut: ciw
- aliases: change word, replace word, 単語置換, 単語編集
- tags: editing, text-object
- source: https://vimhelp.org/change.txt.html
Deletes the current word's inner text and enters Insert mode so you can replace it.

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
- title-ja: 検索と置換

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

### Search word under cursor
- id: search-current-word
- title-ja: カーソル下の単語を検索
- kind: operation
- shortcut: *
- aliases: search current word, word search, 単語検索, カーソル下
- tags: search, normal-mode
- source: https://vimhelp.org/pattern.txt.html
Searches forward for the word currently under or after the cursor.

### Replace all matches in buffer
- id: replace-all
- title-ja: バッファ全体で置換
- kind: operation
- command: :%s/<old>/<new>/g
- aliases: substitute all, replace all, 置換, 全置換
- tags: search, editing
- source: https://vimhelp.org/change.txt.html
Replaces every match of the supplied pattern in the current buffer; use `u` to undo the change if needed.

## Save and quit
- title-ja: 保存と終了

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
