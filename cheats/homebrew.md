---
id: homebrew
title: Homebrew
title-ja: Homebrew
description: High-frequency Homebrew commands for everyday package management.
aliases: brew, package manager
applications:
related: terminal
---

## Find and inspect

### Search packages
- id: search-package
- title-ja: パッケージを検索
- kind: command
- command: brew search <term>
- aliases: find formula, search cask, 検索
- tags: search, package
- source: https://docs.brew.sh/Manpage
Searches available formulae and casks by name.

### Show package info
- id: info-package
- title-ja: パッケージ情報を見る
- kind: command
- command: brew info <formula>
- aliases: package details, formula info, 情報
- tags: inspect, formula
- source: https://docs.brew.sh/Manpage
Shows information about an installed or available formula.

### List installed packages
- id: list-installed
- title-ja: インストール済み一覧
- kind: command
- command: brew list
- aliases: installed formulae, packages, 一覧
- tags: inspect, installed
- source: https://docs.brew.sh/Manpage
Lists installed formulae and casks.

### Show outdated packages
- id: outdated
- title-ja: 更新可能なパッケージを見る
- kind: command
- command: brew outdated
- aliases: updates available, old packages, 更新確認
- tags: inspect, update
- source: https://docs.brew.sh/Manpage
Lists installed formulae and casks that have newer versions available.

## Install and update

### Install a formula
- id: install-formula
- title-ja: Formulaをインストール
- kind: command
- command: brew install <formula>
- aliases: install package, formula, パッケージ追加
- tags: install, formula
- source: https://docs.brew.sh/Manpage
Installs a Homebrew formula.

### Update Homebrew metadata
- id: update-homebrew
- title-ja: Homebrew情報を更新
- kind: command
- command: brew update
- aliases: update brew, refresh formulae, 情報更新
- tags: update, metadata
- source: https://docs.brew.sh/Manpage
Fetches the newest Homebrew and formula metadata.

### Upgrade installed packages
- id: upgrade-packages
- title-ja: インストール済みを更新
- kind: command
- command: brew upgrade
- aliases: upgrade formulae, update packages, パッケージ更新
- tags: update, installed
- source: https://docs.brew.sh/Manpage
Upgrades outdated installed formulae and casks according to Homebrew's normal rules.

## Diagnose

### Check Homebrew health
- id: doctor
- title-ja: Homebrew環境を診断
- kind: command
- command: brew doctor
- aliases: diagnose brew, health check, 診断
- tags: diagnose, inspect
- source: https://docs.brew.sh/Manpage
Checks the Homebrew environment for common configuration problems and prints guidance.
