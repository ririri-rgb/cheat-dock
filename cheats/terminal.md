---
id: terminal
title: Terminal
description: Safe, high-frequency shell commands for everyday macOS terminal work.
aliases: shell, zsh
applications: com.apple.Terminal, com.googlecode.iterm2
related: git, vim, docker, homebrew, ssh
---

## Navigation

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
- aliases: list directory, files, 一覧
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

### Create a directory
- id: make-directory
- title-ja: ディレクトリを作成
- kind: command
- command: mkdir <directory>
- aliases: new folder, make folder, 作成
- tags: filesystem, create
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/mkdir.html
Creates a new directory at the supplied path.

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

### Search text recursively
- id: grep-recursive
- title-ja: テキストを再帰検索
- kind: command
- command: grep -R "<pattern>" <path>
- aliases: search text, grep, 文字列検索
- tags: search, text
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/grep.html
Searches files under a path recursively for matching text.

### Find files by name
- id: find-name
- title-ja: 名前でファイルを探す
- kind: command
- command: find <path> -name "<name>"
- aliases: find file, filename search, ファイル検索
- tags: search, filesystem
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/find.html
Finds pathnames whose final component matches the supplied name pattern.

## Processes

### List processes
- id: process-list
- title-ja: プロセス一覧
- kind: command
- command: ps aux
- aliases: processes, process list, プロセス
- tags: process, inspect
- source: https://man.freebsd.org/cgi/man.cgi?query=ps&sektion=1
Shows a detailed process listing useful for identifying running programs and process IDs.

### Stop a process by PID
- id: kill-process
- title-ja: PIDを指定して終了要求
- kind: command
- command: kill <pid>
- aliases: terminate process, signal process, 終了
- tags: process, signal
- source: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/kill.html
Sends the default termination signal to the specified process ID; unlike force-kill variants, it allows normal signal handling.
