---
id: vscode
title: VS Code
title-ja: VS Code
description: High-frequency Visual Studio Code shortcuts for macOS.
aliases: visual studio code, code
applications: com.microsoft.VSCode
related: terminal, git
---

## Navigation
- title-ja: 移動

### Quick Open
- id: quick-open
- title-ja: ファイルをすばやく開く
- kind: shortcut
- shortcut: Command + P
- aliases: file search, open file, ファイル検索
- tags: navigation, files
- source: https://code.visualstudio.com/docs/getstarted/keybindings
Quickly opens a file by name.

### Command Palette
- id: command-palette
- title-ja: コマンドパレット
- kind: shortcut
- shortcut: Shift + Command + P
- aliases: palette, commands, コマンド
- tags: navigation, commands
- source: https://code.visualstudio.com/docs/getstarted/keybindings
Opens the Command Palette to search and run editor commands.

### Go to line
- id: go-to-line
- title-ja: 行へ移動
- kind: shortcut
- shortcut: Control + G
- aliases: line number, jump line, 行番号
- tags: navigation, editor
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Jumps to a line number in the active editor.

### Go to Symbol
- id: go-to-symbol
- title-ja: シンボルへ移動
- kind: shortcut
- shortcut: Shift + Command + O
- aliases: symbol search, outline, シンボル, 関数検索
- tags: navigation, symbol
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Searches symbols in the active file and jumps to the selected one.

### Go Back
- id: go-back
- title-ja: 前の場所へ戻る
- kind: shortcut
- shortcut: Control + -
- aliases: navigate back, previous location, 戻る, 前の場所
- tags: navigation, history
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Returns to the previous editor navigation location.

## Search
- title-ja: 検索

### Find in file
- id: find-file
- title-ja: ファイル内検索
- kind: shortcut
- shortcut: Command + F
- aliases: find, search current file, 検索
- tags: search, editor
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Searches text in the active editor.

### Replace in file
- id: replace-file
- title-ja: ファイル内置換
- kind: shortcut
- shortcut: Option + Command + F
- aliases: replace, find replace, 置換, ファイル内置換
- tags: search, editing
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Opens replace controls for matches in the active editor.

### Search across files
- id: search-files
- title-ja: ファイル横断検索
- kind: shortcut
- shortcut: Shift + Command + F
- aliases: global search, workspace search, 全体検索
- tags: search, workspace
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Searches text across files in the workspace.

### Replace across files
- id: replace-files
- title-ja: ファイル横断置換
- kind: shortcut
- shortcut: Shift + Command + H
- aliases: global replace, workspace replace, 一括置換, 全体置換
- tags: search, workspace, editing
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Opens workspace-wide search and replace.

## Editing
- title-ja: 編集

### Toggle line comment
- id: toggle-line-comment
- title-ja: 行コメント切替
- kind: shortcut
- shortcut: Command + /
- aliases: comment, uncomment, コメント
- tags: editing, code
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Adds or removes a line comment for the current line or selection.

### Format document
- id: format-document
- title-ja: ドキュメントを整形
- kind: shortcut
- shortcut: Shift + Option + F
- aliases: format, formatter, 整形
- tags: editing, format
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Runs the configured document formatter for the active file.

### Save file
- id: save-file
- title-ja: 保存
- kind: shortcut
- shortcut: Command + S
- aliases: save, 保存
- tags: file, editing
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Saves the active file.

## Code intelligence
- title-ja: コード移動とリファクタリング

### Go to Definition
- id: go-to-definition
- title-ja: 定義へ移動
- kind: shortcut
- shortcut: F12
- aliases: definition, jump definition, 定義, 定義ジャンプ
- tags: navigation, code
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Jumps to the definition of the symbol at the cursor when the language service supports it.

### Go to References
- id: go-to-references
- title-ja: 参照へ移動
- kind: shortcut
- shortcut: Shift + F12
- aliases: references, find usages, 参照, 使用箇所
- tags: navigation, code
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Shows references to the symbol at the cursor when the language service supports them.

### Rename Symbol
- id: rename-symbol
- title-ja: シンボル名を変更
- kind: shortcut
- shortcut: F2
- aliases: rename, refactor rename, 名前変更, リネーム
- tags: editing, refactor
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Starts a language-aware symbol rename when supported.

### Quick Fix
- id: quick-fix
- title-ja: クイックフィックス
- kind: shortcut
- shortcut: Command + .
- aliases: code action, quick fix, 修正候補, コードアクション
- tags: editing, code-action
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Shows available code actions and quick fixes for the current position.

## Problems
- title-ja: 問題

### Show Problems
- id: show-problems
- title-ja: 問題パネルを表示
- kind: shortcut
- shortcut: Shift + Command + M
- aliases: diagnostics, problems panel, エラー一覧, 問題
- tags: inspect, diagnostics
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Opens the Problems panel containing reported errors and warnings.

### Next Problem
- id: next-problem
- title-ja: 次の問題へ移動
- kind: shortcut
- shortcut: F8
- aliases: next error, next warning, 次のエラー, 次の問題
- tags: navigation, diagnostics
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Moves to the next reported error or warning.

## Layout
- title-ja: レイアウト

### Split editor
- id: split-editor
- title-ja: エディタを分割
- kind: shortcut
- shortcut: Command + \
- aliases: split editor, editor group, 画面分割, エディタ分割
- tags: layout, editor
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Splits the current editor into another editor group.

### Toggle primary side bar
- id: toggle-sidebar
- title-ja: サイドバーを切り替える
- kind: shortcut
- shortcut: Command + B
- aliases: sidebar, hide sidebar, サイドバー, サイドバー表示
- tags: layout, panel
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Shows or hides the primary side bar.

### Show Explorer
- id: show-explorer
- title-ja: エクスプローラーを表示
- kind: shortcut
- shortcut: Shift + Command + E
- aliases: explorer, files view, ファイルツリー, エクスプローラー
- tags: navigation, files
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Focuses the Explorer view for browsing workspace files.

## Terminal
- title-ja: ターミナル

### Toggle integrated terminal
- id: toggle-terminal
- title-ja: 統合ターミナル切替
- kind: shortcut
- shortcut: Control + `
- aliases: terminal, integrated terminal, ターミナル
- tags: terminal, panel
- source: https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf
Shows or hides the integrated terminal.
