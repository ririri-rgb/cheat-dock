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

### Open a shell in a container
- id: exec-shell
- title-ja: コンテナ内でシェルを開く
- kind: command
- command: docker exec -it <container> sh
- aliases: exec shell, shell container, コンテナシェル
- tags: container, debug
- source: https://docs.docker.com/reference/cli/docker/container/exec/
Starts an interactive `sh` process in a running container when that shell is available.

## Images

### List images
- id: list-images
- title-ja: イメージ一覧
- kind: command
- command: docker images
- aliases: docker image ls, images, イメージ一覧
- tags: image, inspect
- source: https://docs.docker.com/reference/cli/docker/image/ls/
Lists locally available container images.

## Compose

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

### Stop Compose services
- id: compose-stop
- title-ja: Composeサービスを停止
- kind: command
- command: docker compose stop
- aliases: stop services, compose stop, 停止
- tags: compose, services
- source: https://docs.docker.com/reference/cli/docker/compose/stop/
Stops running Compose services without removing their containers.
