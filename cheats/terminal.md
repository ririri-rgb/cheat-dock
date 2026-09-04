---
id: terminal
title: Terminal
description: Safe, high-frequency shell commands for everyday macOS terminal work.
aliases: shell, zsh
applications: com.apple.Terminal, com.googlecode.iterm2
related: git, vim, docker, homebrew, ssh
---

## Navigation
- title-ja: 移動

### Print working directory
- id: pwd
- title-ja: 現在のディレクトリを表示
- kind: command
- command: pwd
- aliases: current directory, cwd, 現在のディレクトリ
- tags: filesystem, shell
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/pwd.html
Prints the absolute pathname of the current working directory.

### List files
- id: list-files
- title-ja: ファイル一覧を表示
- kind: command
- command: ls -la
- aliases: list directory, files, hidden files, 一覧, 隠しファイル
- tags: filesystem, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/ls.html
Lists directory entries including hidden entries in long format.

### Change directory
- id: change-directory
- title-ja: ディレクトリを移動
- kind: command
- command: cd <path>
- aliases: change folder, navigate, 移動
- tags: filesystem, navigation
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cd.html
Changes the shell's current working directory to the supplied path.

### Go to parent directory
- id: parent-directory
- title-ja: 親ディレクトリへ移動
- kind: command
- command: cd ..
- aliases: up one level, parent folder, 親
- tags: filesystem, navigation
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cd.html
Moves the shell one directory level upward.

## Files
- title-ja: ファイル

### Create a directory
- id: make-directory
- title-ja: ディレクトリを作成
- kind: command
- command: mkdir <directory>
- aliases: new folder, make folder, 作成
- tags: filesystem, create
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/mkdir.html
Creates a new directory at the supplied path.

### Create parent directories as needed
- id: make-parent-directories
- title-ja: 親ディレクトリもまとめて作成
- kind: command
- command: mkdir -p <path>
- aliases: nested directory, mkdir parents, 階層作成, 親ディレクトリ
- tags: filesystem, create
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/mkdir.html
Creates the requested directory path and any missing parent directories.

### Create an empty file or update timestamp
- id: touch-file
- title-ja: 空ファイルを作成・更新時刻を変更
- kind: command
- command: touch <file>
- aliases: create file, timestamp, 空ファイル, touch
- tags: filesystem, create
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/touch.html
Creates an empty file when it does not exist, or updates timestamps on an existing file.

### Copy a file
- id: copy-file
- title-ja: ファイルをコピー
- kind: command
- command: cp <source> <destination>
- aliases: copy, duplicate file, コピー
- tags: filesystem, copy
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cp.html
Copies a file from the source path to the destination path.

### Move or rename a file
- id: move-file
- title-ja: ファイルを移動・名前変更
- kind: command
- command: mv <source> <destination>
- aliases: move, rename, 移動, 名前変更
- tags: filesystem, move
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/mv.html
Moves a file or directory, and is also commonly used to rename it.

## Search and inspect
- title-ja: 検索と確認

### Search text in a file
- id: grep-file
- title-ja: ファイル内のテキストを検索
- kind: command
- command: grep "<pattern>" <file>
- aliases: search text, grep, 文字列検索
- tags: search, text
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/grep.html
Searches a file for lines matching the supplied pattern.

### Search text with line numbers
- id: grep-line-numbers
- title-ja: 行番号付きでテキストを検索
- kind: command
- command: grep -n "<pattern>" <file>
- aliases: grep line number, search lines, 行番号, 文字列検索
- tags: search, text
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/grep.html
Searches for matching lines and prefixes each result with its line number.

### Find files by name
- id: find-name
- title-ja: 名前でファイルを探す
- kind: command
- command: find <path> -name "<name>"
- aliases: find file, filename search, ファイル検索
- tags: search, filesystem
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/find.html
Finds pathnames whose final component matches the supplied name pattern.

### Locate a command
- id: command-location
- title-ja: コマンドの場所を確認
- kind: command
- command: command -v <command>
- aliases: which command, executable path, コマンド場所, 実行ファイル
- tags: shell, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/command.html
Shows how the current shell would resolve the supplied command name.

## Text inspection
- title-ja: テキスト確認

### Print a file
- id: cat-file
- title-ja: ファイル内容を表示
- kind: command
- command: cat <file>
- aliases: show file, print file, 内容表示, cat
- tags: text, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cat.html
Writes the file contents to standard output.

### Show first 20 lines
- id: head-lines
- title-ja: 先頭20行を表示
- kind: command
- command: head -n 20 <file>
- aliases: first lines, head file, 先頭, 最初の行
- tags: text, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/head.html
Shows the first 20 lines of a file.

### Show last 20 lines
- id: tail-lines
- title-ja: 末尾20行を表示
- kind: command
- command: tail -n 20 <file>
- aliases: last lines, tail file, 末尾, 最後の行
- tags: text, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/tail.html
Shows the last 20 lines of a file.

### Follow appended lines
- id: follow-file
- title-ja: 追記される行を追跡
- kind: command
- command: tail -f <file>
- aliases: follow log, live file, ログ追跡, 追記監視
- tags: text, logs
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/tail.html
Keeps reading a file as new data is appended; stop it with Control-C.

### Count lines
- id: count-lines
- title-ja: 行数を数える
- kind: command
- command: wc -l <file>
- aliases: line count, count lines, 行数
- tags: text, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/wc.html
Counts newline-delimited lines in a file.

### Sort and remove duplicate lines
- id: sort-unique
- title-ja: 並べ替えて重複行を除く
- kind: command
- command: sort -u <file>
- aliases: unique lines, deduplicate, 重複削除, 並べ替え
- tags: text, transform
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/sort.html
Prints the file's lines in sorted order while suppressing duplicate lines; it does not modify the file.

## Disk and time
- title-ja: ディスクと時刻

### Show filesystem free space
- id: filesystem-space
- title-ja: ファイルシステムの空き容量を表示
- kind: command
- command: df -k .
- aliases: disk free, free space, 空き容量, ディスク容量
- tags: filesystem, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/df.html
Shows allocated and available filesystem space for the current location in 1024-byte units.

### Show path disk usage
- id: path-disk-usage
- title-ja: パスの使用容量を表示
- kind: command
- command: du -sk <path>
- aliases: disk usage, folder size, 使用容量, サイズ
- tags: filesystem, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/du.html
Summarizes disk usage for the supplied path in 1024-byte units.

### Show current date and time
- id: current-date-time
- title-ja: 現在の日付と時刻を表示
- kind: command
- command: date
- aliases: current time, current date, 日付, 時刻
- tags: shell, time
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/date.html
Prints the current date and time using the system's default format.

## Processes
- title-ja: プロセス

### List processes
- id: process-list
- title-ja: プロセス一覧
- kind: command
- command: ps -ef
- aliases: processes, process list, プロセス
- tags: process, inspect
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/ps.html
Shows a full-format process listing useful for identifying running programs and process IDs.

### Stop a process by PID
- id: kill-process
- title-ja: PIDを指定して終了要求
- kind: command
- command: kill <pid>
- aliases: terminate process, signal process, 終了
- tags: process, signal
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/kill.html
Sends the default termination signal to the specified process ID; unlike force-kill variants, it allows normal signal handling.
