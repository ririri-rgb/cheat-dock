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
- title-ja: 検索と確認

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

### List installed formulae
- id: list-formulae
- title-ja: インストール済みFormula一覧
- kind: command
- command: brew list --formula
- aliases: formula list, installed formulae, Formula一覧, CLIパッケージ
- tags: inspect, formula
- source: https://docs.brew.sh/Manpage
Lists installed formulae without casks.

### List installed casks
- id: list-casks
- title-ja: インストール済みCask一覧
- kind: command
- command: brew list --cask
- aliases: cask list, installed apps, Cask一覧, GUIアプリ
- tags: inspect, cask
- source: https://docs.brew.sh/Manpage
Lists installed casks without formulae.

### Show top-level formulae
- id: list-leaves
- title-ja: 直接インストールしたFormulaを見る
- kind: command
- command: brew leaves
- aliases: top level formulae, leaves, 直接インストール, 依存ではない
- tags: inspect, formula
- source: https://docs.brew.sh/Manpage
Lists installed formulae that are not dependencies of another installed formula.

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
- title-ja: インストールと更新

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

## Dependencies and paths
- title-ja: 依存関係とパス

### Show formula dependencies
- id: formula-deps
- title-ja: Formulaの依存関係を見る
- kind: command
- command: brew deps <formula>
- aliases: dependencies, formula deps, 依存関係, 依存パッケージ
- tags: inspect, dependency
- source: https://docs.brew.sh/Manpage
Lists the dependencies declared for the supplied formula.

### Show installed users of a formula
- id: formula-users
- title-ja: Formulaを使うインストール済みパッケージを見る
- kind: command
- command: brew uses --installed <formula>
- aliases: reverse dependencies, dependents, 逆依存, 使用パッケージ
- tags: inspect, dependency
- source: https://docs.brew.sh/Manpage
Lists installed formulae that depend on the supplied formula.

### Show formula installation prefix
- id: formula-prefix
- title-ja: Formulaのインストール先を表示
- kind: command
- command: brew --prefix <formula>
- aliases: install path, prefix, インストール先, パス
- tags: inspect, path
- source: https://docs.brew.sh/Manpage
Prints the Homebrew installation prefix for the supplied formula.

## Services
- title-ja: サービス

### List Homebrew services
- id: services-list
- title-ja: Homebrewサービス一覧
- kind: command
- command: brew services list
- aliases: background services, service status, サービス一覧, 常駐
- tags: services, inspect
- source: https://docs.brew.sh/Manpage
Lists services managed through `brew services` and their current status.

## Diagnose
- title-ja: 診断

### Preview cleanup candidates
- id: cleanup-dry-run
- title-ja: cleanup対象を削除せず確認
- kind: command
- command: brew cleanup --dry-run
- aliases: cleanup preview, disk cleanup, 削除候補, cleanup確認
- tags: inspect, cleanup
- source: https://docs.brew.sh/Manpage
Shows what `brew cleanup` would remove without deleting anything.

### Check Homebrew health
- id: doctor
- title-ja: Homebrew環境を診断
- kind: command
- command: brew doctor
- aliases: diagnose brew, health check, 診断
- tags: diagnose, inspect
- source: https://docs.brew.sh/Manpage
Checks the Homebrew environment for common configuration problems and prints guidance.
