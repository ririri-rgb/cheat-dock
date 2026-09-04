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
- title-ja: 接続

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

### Connect with a specific identity file
- id: connect-identity
- title-ja: 秘密鍵ファイルを指定して接続
- kind: command
- command: ssh -i <identity-file> user@host
- aliases: identity file, private key, 鍵指定, 秘密鍵
- tags: connection, authentication
- source: https://man.openbsd.org/ssh.1
Uses the specified private identity file for authentication to the remote host.

### Connect through a jump host
- id: connect-jump-host
- title-ja: 踏み台ホスト経由で接続
- kind: command
- command: ssh -J <jump-host> user@host
- aliases: proxy jump, bastion, 踏み台, jump host
- tags: connection, proxy
- source: https://man.openbsd.org/ssh.1
Connects to the destination through the specified SSH jump host using ProxyJump.

### Debug a connection
- id: verbose-connect
- title-ja: 接続を詳細表示
- kind: command
- command: ssh -v user@host
- aliases: verbose ssh, debug connection, 接続診断
- tags: connection, diagnose
- source: https://man.openbsd.org/ssh.1
Enables verbose client diagnostics useful when an SSH connection or authentication fails.

### Show resolved SSH configuration
- id: show-config
- title-ja: 適用されるSSH設定を表示
- kind: command
- command: ssh -G host
- aliases: effective config, ssh config, 設定確認, 適用設定
- tags: connection, inspect
- source: https://man.openbsd.org/ssh.1
Prints the client configuration that would be applied to the named host without opening a session.

## Tunnels
- title-ja: トンネル

### Create a local port forward
- id: local-forward
- title-ja: ローカルポートフォワード
- kind: command
- command: ssh -N -L <local-port>:<destination-host>:<destination-port> user@host
- aliases: local tunnel, port forward, SSHトンネル, ポートフォワード
- tags: connection, tunnel
- source: https://man.openbsd.org/ssh.1
Opens a local listening port and forwards connections through the SSH server to the supplied destination; `-N` runs no remote command.

## Transfer
- title-ja: 転送

### Copy a local file to a host
- id: scp-upload
- title-ja: ローカルファイルを送る
- kind: command
- command: scp <file> user@host:<path>
- aliases: upload file, secure copy, ファイル送信
- tags: transfer, remote
- source: https://man.openbsd.org/scp.1
Copies a local file to a path on a remote SSH host.

### Copy a local file using a custom port
- id: scp-upload-port
- title-ja: ポート指定でファイルを送る
- kind: command
- command: scp -P <port> <file> user@host:<path>
- aliases: scp port, upload custom port, ポート指定, ファイル送信
- tags: transfer, remote
- source: https://man.openbsd.org/scp.1
Copies a local file to a remote host while using the specified SSH port.

### Copy a remote file locally
- id: scp-download
- title-ja: リモートファイルを取得
- kind: command
- command: scp user@host:<file> <path>
- aliases: download file, secure copy, ファイル取得
- tags: transfer, remote
- source: https://man.openbsd.org/scp.1
Copies a file from a remote SSH host to a local path.

### Start an SFTP session
- id: sftp-session
- title-ja: SFTPセッションを開始
- kind: command
- command: sftp user@host
- aliases: sftp, interactive transfer, ファイル転送, SFTP
- tags: transfer, remote
- source: https://man.openbsd.org/sftp.1
Starts an interactive SFTP file-transfer session over SSH.

## Keys
- title-ja: 鍵

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

### Derive a public key from a private key
- id: derive-public-key
- title-ja: 秘密鍵から公開鍵を表示
- kind: command
- command: ssh-keygen -y -f <private-key>
- aliases: recover public key, derive public key, 公開鍵, 秘密鍵から公開鍵
- tags: key, inspect
- source: https://man.openbsd.org/ssh-keygen.1
Reads a private key and prints the corresponding public key, prompting for its passphrase when required.

### List keys loaded in ssh-agent
- id: agent-list
- title-ja: ssh-agentの鍵一覧
- kind: command
- command: ssh-add -l
- aliases: agent keys, loaded identities, agent鍵, 鍵一覧
- tags: key, agent, inspect
- source: https://man.openbsd.org/ssh-add.1
Lists fingerprints of identities currently held by the authentication agent.

### Find a known host key
- id: known-host-find
- title-ja: known_hostsからホストを探す
- kind: command
- command: ssh-keygen -F <host>
- aliases: known hosts, host key lookup, ホスト鍵
- tags: key, inspect, known-hosts
- source: https://man.openbsd.org/ssh-keygen.1
Searches the known-hosts file for entries matching a hostname.
