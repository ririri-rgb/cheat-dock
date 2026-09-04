---
id: git
title: Git
title-ja: Git
description: High-frequency Git commands for everyday repository work.
aliases: version control
applications:
related: terminal
---

## Working tree

### Status
- id: status
- title-ja: 変更状態を見る
- kind: command
- command: git status
- aliases: changes, state, 状態
- tags: inspect, working-tree
- source: https://git-scm.com/docs/git-status
Shows paths that differ between HEAD, the index, and the working tree.

### Diff unstaged changes
- id: diff-unstaged
- title-ja: 未ステージ差分を見る
- kind: command
- command: git diff
- aliases: diff, changes, 差分
- tags: inspect, working-tree
- source: https://git-scm.com/docs/git-diff
Shows changes in the working tree that are not staged.

### Stage a path
- id: add-path
- title-ja: パスをステージする
- kind: command
- command: git add <path>
- aliases: stage, add file, ステージ
- tags: index, working-tree
- source: https://git-scm.com/docs/git-add
Adds the selected path's current content to the index.

### Commit staged changes
- id: commit-message
- title-ja: ステージ済み変更をコミット
- kind: command
- command: git commit -m "<message>"
- aliases: commit, save revision, コミット
- tags: history, index
- source: https://git-scm.com/docs/git-commit
Creates a commit from staged changes with the supplied message.

## Branches

### List branches
- id: branch-list
- title-ja: ブランチ一覧
- kind: command
- command: git branch
- aliases: branches, branch list, ブランチ
- tags: branch, inspect
- source: https://git-scm.com/docs/git-branch
Lists local branches and marks the current branch.

### Switch branch
- id: switch-branch
- title-ja: ブランチを切り替える
- kind: command
- command: git switch <branch>
- aliases: checkout branch, switch, ブランチ切替
- tags: branch, navigation
- source: https://git-scm.com/docs/git-switch
Switches the working tree to an existing branch.

### Create and switch branch
- id: switch-create
- title-ja: 新しいブランチを作って切り替える
- kind: command
- command: git switch -c <branch>
- aliases: new branch, create branch, ブランチ作成
- tags: branch, create
- source: https://git-scm.com/docs/git-switch
Creates a new branch at the current commit and switches to it.

## History

### Compact history
- id: log-oneline
- title-ja: 履歴を簡潔に見る
- kind: command
- command: git log --oneline --decorate -n 20
- aliases: history, recent commits, 履歴
- tags: history, inspect
- source: https://git-scm.com/docs/git-log
Shows the 20 most recent commits in a compact decorated form.

## Sync

### Fetch remotes
- id: fetch
- title-ja: リモート情報を取得
- kind: command
- command: git fetch
- aliases: update remote refs, fetch remote, 取得
- tags: remote, sync
- source: https://git-scm.com/docs/git-fetch
Downloads remote objects and updates remote-tracking refs without merging them into the current branch.

### Pull current branch
- id: pull
- title-ja: 現在のブランチを更新
- kind: command
- command: git pull
- aliases: update branch, pull remote, 同期
- tags: remote, sync
- source: https://git-scm.com/docs/git-pull
Fetches from the configured remote and integrates the current branch according to repository configuration.

### Push current branch
- id: push
- title-ja: 現在のブランチを送信
- kind: command
- command: git push
- aliases: publish commits, push remote, 送信
- tags: remote, sync
- source: https://git-scm.com/docs/git-push
Updates the configured remote with commits from the current branch when permitted.
