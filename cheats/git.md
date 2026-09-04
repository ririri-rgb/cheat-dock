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
- title-ja: 作業ツリー

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

### Diff staged changes
- id: diff-staged
- title-ja: ステージ済み差分を見る
- kind: command
- command: git diff --cached
- aliases: staged diff, index diff, ステージ済み, 差分
- tags: inspect, index
- source: https://git-scm.com/docs/git-diff
Shows changes staged in the index relative to the current HEAD.

### Stage a path
- id: add-path
- title-ja: パスをステージする
- kind: command
- command: git add <path>
- aliases: stage, add file, ステージ
- tags: index, working-tree
- source: https://git-scm.com/docs/git-add
Adds the selected path's current content to the index.

### Unstage a path
- id: unstage-path
- title-ja: パスをステージから外す
- kind: command
- command: git restore --staged <path>
- aliases: unstage, remove from index, ステージ解除, ステージから外す
- tags: index, recover
- source: https://git-scm.com/docs/git-restore
Removes the path's staged changes from the index while leaving its working-tree contents intact.

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
- title-ja: ブランチ

### List branches
- id: branch-list
- title-ja: ブランチ一覧
- kind: command
- command: git branch
- aliases: branches, branch list, ブランチ
- tags: branch, inspect
- source: https://git-scm.com/docs/git-branch
Lists local branches and marks the current branch.

### Show current branch
- id: current-branch
- title-ja: 現在のブランチ名を表示
- kind: command
- command: git branch --show-current
- aliases: current branch, branch name, 現在のブランチ, ブランチ名
- tags: branch, inspect
- source: https://git-scm.com/docs/git-branch
Prints the name of the current branch when HEAD is attached to a branch.

### List local and remote branches
- id: branch-list-all
- title-ja: ローカル・リモートブランチ一覧
- kind: command
- command: git branch -a
- aliases: remote branches, all branches, リモートブランチ, ブランチ一覧
- tags: branch, inspect
- source: https://git-scm.com/docs/git-branch
Lists local branches together with remote-tracking branches.

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
- title-ja: 履歴

### Compact history
- id: log-oneline
- title-ja: 履歴を簡潔に見る
- kind: command
- command: git log --oneline --decorate -n 20
- aliases: history, recent commits, 履歴
- tags: history, inspect
- source: https://git-scm.com/docs/git-log
Shows the 20 most recent commits in a compact decorated form.

### History for a path
- id: log-path
- title-ja: パスの履歴を見る
- kind: command
- command: git log --oneline -- <path>
- aliases: file history, path history, ファイル履歴, 履歴
- tags: history, inspect
- source: https://git-scm.com/docs/git-log
Shows commits that affect the supplied path in a compact form.

### Show a commit
- id: show-commit
- title-ja: コミット内容を見る
- kind: command
- command: git show <commit>
- aliases: commit details, commit diff, コミット詳細, 変更内容
- tags: history, inspect
- source: https://git-scm.com/docs/git-show
Shows metadata and patch information for the named commit or object.

### Blame a file
- id: blame-file
- title-ja: 各行の最終変更を調べる
- kind: command
- command: git blame <file>
- aliases: line history, who changed line, 行履歴, blame
- tags: history, inspect
- source: https://git-scm.com/docs/git-blame
Annotates each line with the commit and author that most recently changed it.

## Remotes
- title-ja: リモート

### List remotes and URLs
- id: remote-list
- title-ja: リモートURL一覧
- kind: command
- command: git remote -v
- aliases: remotes, origin url, リモート, URL
- tags: remote, inspect
- source: https://git-scm.com/docs/git-remote
Lists configured remote names and their fetch and push URLs.

## Stash
- title-ja: 一時退避

### Stash current work with a message
- id: stash-push
- title-ja: 作業をメッセージ付きで一時退避
- kind: command
- command: git stash push -m "<message>"
- aliases: stash changes, save work, 一時退避, stash
- tags: stash, working-tree
- source: https://git-scm.com/docs/git-stash
Saves the current working-tree and index changes to the stash and returns the working tree to the recorded state.

### List stashes
- id: stash-list
- title-ja: 一時退避一覧
- kind: command
- command: git stash list
- aliases: stash history, saved work, 退避一覧, stash一覧
- tags: stash, inspect
- source: https://git-scm.com/docs/git-stash
Lists saved stash entries without applying or dropping them.

### Inspect latest stash
- id: stash-show
- title-ja: 最新の一時退避差分を見る
- kind: command
- command: git stash show -p stash@{0}
- aliases: stash diff, inspect stash, 退避差分, stash内容
- tags: stash, inspect
- source: https://git-scm.com/docs/git-stash
Shows the patch stored in the newest stash entry without applying it.

## Sync
- title-ja: 同期

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
