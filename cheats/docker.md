---
id: docker
title: Docker
title-ja: Docker
description: High-frequency Docker CLI commands for inspecting and working with containers.
aliases: container
applications:
related: terminal
---

## Containers
- title-ja: コンテナ

### List running containers
- id: list-containers
- title-ja: 実行中のコンテナ一覧
- kind: command
- command: docker ps
- aliases: docker container ls, containers, コンテナ一覧
- tags: container, inspect
- source: https://docs.docker.com/reference/cli/docker/container/ls/
Lists running containers.

### List all containers
- id: list-all-containers
- title-ja: 全コンテナ一覧
- kind: command
- command: docker ps -a
- aliases: stopped containers, all containers, 全コンテナ
- tags: container, inspect
- source: https://docs.docker.com/reference/cli/docker/container/ls/
Lists running and stopped containers.

### Show container logs
- id: container-logs
- title-ja: コンテナログを見る
- kind: command
- command: docker logs <container>
- aliases: logs, output, ログ
- tags: container, inspect, logs
- source: https://docs.docker.com/reference/cli/docker/container/logs/
Shows logs produced by the selected container.

### Follow container logs
- id: follow-logs
- title-ja: コンテナログを追跡
- kind: command
- command: docker logs -f <container>
- aliases: tail logs, follow output, ログ追跡
- tags: container, logs
- source: https://docs.docker.com/reference/cli/docker/container/logs/
Streams new log output until you stop following it.

### Inspect a container
- id: inspect-container
- title-ja: コンテナ詳細を確認
- kind: command
- command: docker inspect <container>
- aliases: container details, configuration, コンテナ詳細, 設定確認
- tags: container, inspect
- source: https://docs.docker.com/reference/cli/docker/inspect/
Shows low-level JSON information about the selected Docker object.

### Show container resource usage
- id: container-stats
- title-ja: コンテナのリソース使用量
- kind: command
- command: docker stats
- aliases: cpu memory, resource usage, リソース使用量, メモリ
- tags: container, inspect, performance
- source: https://docs.docker.com/reference/cli/docker/container/stats/
Streams CPU, memory, network, and I/O statistics for running containers.

### Show container port mappings
- id: container-ports
- title-ja: コンテナのポート割り当てを見る
- kind: command
- command: docker port <container>
- aliases: port mapping, exposed ports, ポート, ポート割り当て
- tags: container, network, inspect
- source: https://docs.docker.com/reference/cli/docker/container/port/
Lists port mappings for the selected container.

### Open a shell in a container
- id: exec-shell
- title-ja: コンテナ内でシェルを開く
- kind: command
- command: docker exec -it <container> sh
- aliases: exec shell, shell container, コンテナシェル
- tags: container, debug
- source: https://docs.docker.com/reference/cli/docker/container/exec/
Starts an interactive `sh` process in a running container when that shell is available.

## Lifecycle
- title-ja: 起動と停止

### Start a stopped container
- id: start-container
- title-ja: 停止中コンテナを起動
- kind: command
- command: docker start <container>
- aliases: start container, resume container, コンテナ起動, 起動
- tags: container, lifecycle
- source: https://docs.docker.com/reference/cli/docker/container/start/
Starts one or more stopped containers.

### Stop a running container
- id: stop-container
- title-ja: コンテナを停止
- kind: command
- command: docker stop <container>
- aliases: stop container, graceful stop, コンテナ停止, 停止
- tags: container, lifecycle
- source: https://docs.docker.com/reference/cli/docker/container/stop/
Requests a running container to stop and waits for its normal stop timeout.

### Restart a container
- id: restart-container
- title-ja: コンテナを再起動
- kind: command
- command: docker restart <container>
- aliases: restart container, reboot container, コンテナ再起動, 再起動
- tags: container, lifecycle
- source: https://docs.docker.com/reference/cli/docker/container/restart/
Stops and then starts the selected container.

## Transfer
- title-ja: ファイル転送

### Copy a file from a container
- id: copy-from-container
- title-ja: コンテナからファイルをコピー
- kind: command
- command: docker cp <container>:<path> <path>
- aliases: docker cp, copy from container, ファイル取得, コンテナからコピー
- tags: container, transfer
- source: https://docs.docker.com/reference/cli/docker/container/cp/
Copies a file or directory from a container path to a local path.

## Images
- title-ja: イメージ

### List images
- id: list-images
- title-ja: イメージ一覧
- kind: command
- command: docker images
- aliases: docker image ls, images, イメージ一覧
- tags: image, inspect
- source: https://docs.docker.com/reference/cli/docker/image/ls/
Lists locally available container images.

### Pull an image
- id: pull-image
- title-ja: イメージを取得
- kind: command
- command: docker pull <image>
- aliases: download image, pull image, イメージ取得, ダウンロード
- tags: image, registry
- source: https://docs.docker.com/reference/cli/docker/image/pull/
Downloads an image or repository from a registry.

### Build an image
- id: build-image
- title-ja: 現在のディレクトリからイメージをビルド
- kind: command
- command: docker build -t <name> .
- aliases: build image, dockerfile, イメージ作成, ビルド
- tags: image, build
- source: https://docs.docker.com/reference/cli/docker/buildx/build/
Builds an image from the current directory's build context and assigns the supplied tag.

## Compose
- title-ja: Compose

### Start Compose services
- id: compose-up
- title-ja: Composeサービスを起動
- kind: command
- command: docker compose up -d
- aliases: compose start, start services, 起動
- tags: compose, services
- source: https://docs.docker.com/reference/cli/docker/compose/up/
Creates and starts Compose services in the background.

### Show Compose status
- id: compose-ps
- title-ja: Compose状態を見る
- kind: command
- command: docker compose ps
- aliases: compose status, services, 状態
- tags: compose, inspect
- source: https://docs.docker.com/reference/cli/docker/compose/ps/
Lists containers for the current Compose project with their status and ports.

### Follow Compose logs
- id: compose-logs
- title-ja: Composeログを追跡
- kind: command
- command: docker compose logs -f
- aliases: compose logs, service logs, ログ
- tags: compose, logs
- source: https://docs.docker.com/reference/cli/docker/compose/logs/
Streams log output from services in the current Compose project.

### Run a command in a Compose service
- id: compose-exec
- title-ja: Composeサービス内でコマンドを実行
- kind: command
- command: docker compose exec <service> <command>
- aliases: compose exec, service command, サービス内コマンド, コンテナ内実行
- tags: compose, debug
- source: https://docs.docker.com/reference/cli/docker/compose/exec/
Runs a command in an already-running Compose service container.

### Stop Compose services
- id: compose-stop
- title-ja: Composeサービスを停止
- kind: command
- command: docker compose stop
- aliases: stop services, compose stop, 停止
- tags: compose, services
- source: https://docs.docker.com/reference/cli/docker/compose/stop/
Stops running Compose services without removing their containers.
