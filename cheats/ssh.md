---
id: ssh
title: SSH
title-ja: SSH
description: Common OpenSSH client commands for connection, transfer, and key inspection.
aliases: secure shell, remote
applications:
related: terminal
---

## Connect

### Connect to a host
- id: connect-host
- title-ja: ホストへ接続
- kind: command
- command: ssh user@host
- aliases: login, remote host, 接続
- tags: connection, remote
- source: https://man.openbsd.org/ssh.1
Starts an SSH client connection to a remote host using the given user name.

### Connect on a custom port
- id: connect-port
- title-ja: ポートを指定して接続
- kind: command
- command: ssh -p <port> user@host
- aliases: ssh port, custom port, ポート指定
- tags: connection, remote
- source: https://man.openbsd.org/ssh.1
Connects to an SSH server listening on a non-default port.

### Debug a connection
- id: verbose-connect
- title-ja: 接続を詳細表示
- kind: command
- command: ssh -v user@host
- aliases: verbose ssh, debug connection, 接続診断
- tags: connection, diagnose
- source: https://man.openbsd.org/ssh.1
Enables verbose client diagnostics useful when an SSH connection or authentication fails.

## Transfer

### Copy a local file to a host
- id: scp-upload
- title-ja: ローカルファイルを送る
- kind: command
- command: scp <file> user@host:<path>
- aliases: upload file, secure copy, ファイル送信
- tags: transfer, remote
- source: https://man.openbsd.org/scp.1
Copies a local file to a path on a remote SSH host.

### Copy a remote file locally
- id: scp-download
- title-ja: リモートファイルを取得
- kind: command
- command: scp user@host:<file> <path>
- aliases: download file, secure copy, ファイル取得
- tags: transfer, remote
- source: https://man.openbsd.org/scp.1
Copies a file from a remote SSH host to a local path.

## Keys

### Create an Ed25519 key
- id: keygen-ed25519
- title-ja: Ed25519鍵を作成
- kind: command
- command: ssh-keygen -t ed25519
- aliases: create ssh key, key pair, 鍵作成
- tags: key, authentication
- source: https://man.openbsd.org/ssh-keygen.1
Starts interactive creation of an Ed25519 SSH key pair and asks where to store it and for a passphrase.

### Show a public key fingerprint
- id: key-fingerprint
- title-ja: 公開鍵の指紋を表示
- kind: command
- command: ssh-keygen -lf <public-key>
- aliases: fingerprint, key inspect, 指紋
- tags: key, inspect
- source: https://man.openbsd.org/ssh-keygen.1
Displays the fingerprint and key information for a public key file.

### Find a known host key
- id: known-host-find
- title-ja: known_hostsからホストを探す
- kind: command
- command: ssh-keygen -F <host>
- aliases: known hosts, host key lookup, ホスト鍵
- tags: key, inspect, known-hosts
- source: https://man.openbsd.org/ssh-keygen.1
Searches the known-hosts file for entries matching a hostname.
