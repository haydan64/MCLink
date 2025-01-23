# Minecraft Bedrock Edition Server WebSocket API

## Overview
This WebSocket API allows you to interact with a Minecraft Bedrock Edition Server. It supports commands for server management and emits various events related to player activities and server state.

## IN DEVELOPMENT
This project is currently in development, and has no release versions.

## Server Management Commands
The following commands can be sent to the server via the WebSocket to manage the server process environment:

- **backup**: Takes an immediate backup that is not auto-deleted.
- **stop**: Stops the Minecraft server.
- **start**: Starts the Minecraft server.
- **restart**: Restarts the Minecraft server.

## Example Command JSON
All commands are transmitted in JSON format:

```json
{
    "type": 1,
    "body": {
        "env": "process",
        "command": "say Hello World!"
    }
}
```

## Events
The server emits the following events, which need to be subscribed to by sending a subscribe event with a list of event names. Each event has a specific type number, which is included in the body.

- **Player Spawned (Type: 1)**
```json
{
    "type": 2,
    "body": {
        "event": "Player Spawned",
        "type": 1,
        "data": {
            "xuid": "string",
            "player": "string",
            "location": [x: float, y: float, z: float],
            "dimension": "string",
            "gamemode": "string",
            "tags": ["string"]
        }
    }
}
```
- **Player Leave (Type: 2)**
```json
{
    "type": 2,
    "body": {
        "event": "Player Leave",
        "type": 2,
        "data": {
            "xuid": "string",
            "player": "string"
        }
    }
}
```
- **Player Message (Type: 3)**
```json
{
    "type": 2,
    "body": {
        "event": "Player Message",
        "type": 3,
        "data": {
            "xuid": "string",
            "player": "string",
            "message": "string"
        }
    }
}
```
- **Player Gamemode Change (Type: 4)**
```json
{
    "type": 2,
    "body": {
        "event": "Player Gamemode Change",
        "type": 4,
        "data": {
            "xuid": "string",
            "player": "string",
            "gamemode": "string"
        }
    }
}
```
- **Player Place (Type: 5)**
```json
{
    "type": 2,
    "body": {
        "event": "Player Place",
        "type": 5,
        "data": {
            "xuid": "string",
            "player": "string",
            "dimension": "string",
            "location": [x: int, y: int, z: int],
            "block": "string"
        }
    }
}
```
- **Player Break (Type: 6)**
```json
{
    "type": 2,
    "body": {
        "event": "Player Break",
        "type": 6,
        "data": {
            "xuid": "string",
            "player": "string",
            "dimension": "string",
            "location": [x: int, y: int, z: int],
            "block": "string"
        }
    }
}
```
- **Weather (Type: 7)**
```json
{
    "type": 2,
    "body": {
        "event": "Weather",
        "type": 7,
        "data": {
            "previous": "string",
            "new": "string"
        }
    }
}
```
- **Death (Type: 8)**
```json
{
    "type": 2,
    "body": {
        "event": "Death",
        "type": 8,
        "data": {
            "dead": "string",
            "deadName": "string | undefined",
            "cause": "string",
            "killer": "string",
            "killerName": "string | undefined",
            "location": [x: float, y: float, z: float],
            "dimension": "string"
        }
    }
}
```
- **Explosion (Type: 9)**
```json
{
    "type": 2,
    "body": {
        "event": "Explosion",
        "type": 9,
        "data": {
            "dimension": "string",
            "source": "string",
            "sourceName": "string | undefined",
            "sourceLocation": [x: float, y: float, z: float]
        }
    }
}
```
- **Gamerule Change (Type: 10)**
```json
{
    "type": 2,
    "body": {
        "event": "Gamerule Change",
        "type": 10,
        "data": {
            "rule": "string",
            "value": "any"
        }
    }
}
```
- **Item Use (Type: 11)**
```json
{
    "type": 2,
    "body": {
        "event": "Item Use",
        "type": 11,
        "data": {
            "xuid": "string",
            "player": "string",
            "location": [x: float, y: float, z: float],
            "dimension": "string",
            "item": "string",
            "amount": "int"
        }
    }
}
```
- **Item Use On (Type: 12)**
```json
{
    "type": 2,
    "body": {
        "event": "Item Use On",
        "type": 12,
        "data": {
            "xuid": "string",
            "player": "string",
            "location": [x: float, y: float, z: float],
            "dimension": "string",
            "item": "string",
            "amount": "int",
            "block": "string",
            "blockLoc": [x: int, y: int, z: int]
        }
    }
}
```
- **Player Interact Block (Type: 13)**
```json
{
    "type": 2,
    "body": {
        "event": "Player Interact Block",
        "type": 13,
        "data": {
            "xuid": "string",
            "player": "string",
            "location": [x: int, y: int, z: int],
            "dimension": "string",
            "item": "string | undefined",
            "amount": "int | undefined",
            "block": "string"
        }
    }
}
```
- **Player Interact Entity (Type: 14)**
```json
{
    "type": 2,
    "body": {
        "event": "Player Interact Entity",
        "type": 14,
        "data": {
            "xuid": "string",
            "player": "string",
            "location": [x: int, y: int, z: int],
            "dimension": "string",
            "item": "string | undefined",
            "amount": "int | undefined",
            "target": "string",
            "targetName": "string"
        }
    }
}
```
## Subscribing to Events
To receive events, you must subscribe by sending a JSON object listing the events you want to listen to.


- **Example subscription JSON:**

```json
{
    "type": "subscribe",
    "events": ["Player Spawned", "Player Leave", "Player Message"]
}
```
## Sending Commands
You can send commands to the WebSocket to manage the server or perform actions.
The Env can be `process` or `internal`.
The commands reload, restart, stop, start, backup, allowlist, whitelist, op, deop, changesetting, kick, and transfer only work if it's `process`. If you need support for characters outside utf-8 use `internal`.

- **Example command JSON:**

```json
{
    "type": 1,
    "body": {
        "env": "process",
        "command": "backup"
    }
}
```