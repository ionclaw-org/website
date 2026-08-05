---
name: pushover-notify
description: Send push notifications via Pushover API. Supports priority levels (lowest to emergency), custom sounds, HTML formatting, URLs, device targeting, and TTL. Returns request ID on success or specific error messages on failure.
version: 1.0.0
author: IonClaw
tags: [pushover, notification, push, alert, notify, message, priority, emergency, sound, mobile, device]
dependencies: [http_client]
requires: {}
---

# Pushover Notify

Send **push notifications** via the [Pushover API](https://pushover.net/api). Deliver alerts, messages, and emergency notifications to your devices with support for priority levels, custom sounds, HTML content, and more.

This skill uses the built-in `http_client` tool to call the Pushover API directly -- no external scripts or dependencies required.

---

## Required Parameters

- **App Token** -- Pushover application API token (provided by the user in the prompt or read from `PUSHOVER_APP_TOKEN` environment variable)
- **User Key** -- recipient user or group key (provided by the user in the prompt or read from `PUSHOVER_USER_KEY` environment variable)
- **Message** -- notification body text (max 1024 characters)

## Optional Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| **title** | App name | Notification title (max 250 chars) |
| **device** | All devices | Target device name(s), comma-separated |
| **priority** | 0 (normal) | Priority level: `-2` to `2` (see below) |
| **sound** | User default | Notification sound name |
| **url** | -- | Supplementary clickable URL (max 512 chars) |
| **url_title** | URL itself | Label for the supplementary URL (max 100 chars) |
| **html** | 0 | Set to `1` to enable HTML formatting (`<b>`, `<i>`, `<u>`, `<a>`, `<font>`) |
| **monospace** | 0 | Set to `1` for monospace font (mutually exclusive with `html`) |
| **timestamp** | Server time | Unix timestamp for custom display time |
| **ttl** | -- | Auto-delete notification after N seconds |
| **retry** | -- | Emergency only: retry interval in seconds (min 30) |
| **expire** | -- | Emergency only: stop retrying after N seconds (max 10800) |
| **callback** | -- | Emergency only: webhook URL called on user acknowledgement |

---

## Priority Levels

| Value | Name | Behavior |
|-------|------|----------|
| **-2** | Lowest | No alert; badge count incremented only |
| **-1** | Low | Popup notification but no sound or vibration |
| **0** | Normal | Sound + vibration + alert per user settings (default) |
| **1** | High | Bypasses quiet hours; always sounds/vibrates; highlighted in red |
| **2** | Emergency | Repeats until acknowledged; requires `retry` and `expire` parameters |

---

## Available Sounds

| Name | Description |
|------|-------------|
| `pushover` | Pushover (default) |
| `bike` | Bike |
| `bugle` | Bugle |
| `cashregister` | Cash Register |
| `classical` | Classical |
| `cosmic` | Cosmic |
| `falling` | Falling |
| `gamelan` | Gamelan |
| `incoming` | Incoming |
| `intermission` | Intermission |
| `magic` | Magic |
| `mechanical` | Mechanical |
| `pianobar` | Piano Bar |
| `siren` | Siren |
| `spacealarm` | Space Alarm |
| `tugboat` | Tug Boat |
| `alien` | Alien Alarm (long) |
| `climb` | Climb (long) |
| `persistent` | Persistent (long) |
| `echo` | Pushover Echo (long) |
| `updown` | Up Down (long) |
| `vibrate` | Vibrate Only |
| `none` | None (silent) |

---

## Authentication

Both credentials can be:
- **Provided directly by the user** in the prompt
- **Read from environment variables**: `PUSHOVER_APP_TOKEN` and `PUSHOVER_USER_KEY`

If provided in the prompt, use those values. Otherwise, fall back to the environment variables. If neither is available, ask the user.

- App token: get one at [pushover.net/apps](https://pushover.net/apps)
- User key: found on your [Pushover dashboard](https://pushover.net/)

---

## API Calls

All calls use the built-in `http_client` tool. No Python scripts, venv, or external binaries needed.

### Send a simple notification

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"message\": \"Deploy finished successfully.\"}"
)
```

### Send with title and message

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"title\": \"Deploy Complete\", \"message\": \"App v2.0.0 deployed to production.\"}"
)
```

### Send with high priority

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"title\": \"ALERT\", \"message\": \"CPU above 95%\", \"priority\": 1, \"sound\": \"siren\"}"
)
```

### Send emergency notification (repeats until acknowledged)

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"title\": \"CRITICAL\", \"message\": \"Database is down!\", \"priority\": 2, \"retry\": 60, \"expire\": 1800}"
)
```

### Send with a clickable URL

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"title\": \"PR Ready\", \"message\": \"Please review\", \"url\": \"https://github.com/org/repo/pull/42\", \"url_title\": \"View PR\"}"
)
```

### Send to a specific device

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"message\": \"Test notification\", \"device\": \"my-iphone\"}"
)
```

### Send with HTML formatting

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"title\": \"Build Report\", \"message\": \"<b>Status:</b> passed\\n<i>Duration:</i> 3m 42s\", \"html\": 1}"
)
```

### Send silent notification

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"message\": \"Low priority log entry\", \"priority\": -1, \"sound\": \"none\"}"
)
```

### Send with TTL (auto-delete after 1 hour)

```
http_client(
  method="POST",
  url="https://api.pushover.net/1/messages.json",
  body="{\"token\": \"<PUSHOVER_APP_TOKEN>\", \"user\": \"<PUSHOVER_USER_KEY>\", \"message\": \"Temporary alert\", \"ttl\": 3600}"
)
```

---

## Response

The Pushover API returns JSON.

**Success (HTTP 200):**

```json
{
  "status": 1,
  "request": "647d2300-702c-4b38-8b2f-d56326ae460b"
}
```

**Success with emergency priority (HTTP 200):**

```json
{
  "status": 1,
  "request": "647d2300-702c-4b38-8b2f-d56326ae460b",
  "receipt": "receipttoken123"
}
```

**Error (HTTP 4xx):**

```json
{
  "status": 0,
  "errors": ["application token is invalid"],
  "request": "5042853c-402d-4a18-abcb-168734a801de"
}
```

---

## Workflow

1. Resolve **app token** and **user key**: use values from the prompt if provided, otherwise from `PUSHOVER_APP_TOKEN` / `PUSHOVER_USER_KEY` env vars; if neither is available, ask the user
2. Gather **message** (required) and **title** (optional) from the user's request
3. Determine **priority** level; default to `0` (normal)
4. If priority is `2` (emergency), ensure **retry** and **expire** are provided (default: `retry=60`, `expire=1800`)
5. Gather any optional parameters: device, sound, url, url_title, html, monospace, timestamp, ttl
6. Build the JSON body with `token`, `user`, `message`, and all applicable fields
7. Call `http_client` with `POST` to `https://api.pushover.net/1/messages.json` with the JSON body
8. Parse the response
9. On **success** (status=1): return the request ID (and receipt for emergency) to the user
10. On **error** (status=0): return the specific error messages to the user

---

## Skill Usage

### Send a simple notification
```
pushover-notify: message: Deploy finished successfully.
```

### Send with title and message
```
pushover-notify: title: Deploy Complete | message: App v2.0.0 deployed to production.
```

### Send high priority alert
```
pushover-notify: title: ALERT | message: CPU usage above 95% | priority: 1 | sound: siren
```

### Send emergency notification
```
pushover-notify: title: CRITICAL | message: Database is down! | priority: 2 | retry: 60 | expire: 1800
```

### Send with a URL
```
pushover-notify: title: PR Ready | message: Please review | url: https://github.com/org/repo/pull/42 | url_title: View PR
```

### Send to a specific device
```
pushover-notify: message: Test notification | device: my-iphone
```

### Send with HTML
```
pushover-notify: title: Build Report | message: <b>Status:</b> passed | html: 1
```

### Send silent notification
```
pushover-notify: message: Low priority log | priority: -1 | sound: none
```

### Send with auto-delete (TTL)
```
pushover-notify: message: Temporary alert | ttl: 3600
```

---

## Practical Examples

### CI/CD deploy notification
```
pushover-notify: title: Deploy Complete | message: App v2.0.0 deployed to production at 14:30 UTC | sound: magic
```

### Server down emergency
```
pushover-notify: title: SERVER DOWN | message: api.example.com is unreachable. Health check returned 503. | priority: 2 | retry: 30 | expire: 3600 | sound: siren
```

### Cron job completion
```
pushover-notify: title: Backup Done | message: Database backup completed. Size: 2.4 GB. | priority: -1
```

### Share a link
```
pushover-notify: title: Dashboard Alert | message: Latency spike detected | url: https://grafana.internal/d/api-latency | url_title: Open Dashboard
```

### Team channel alert
```
pushover-notify: title: Incident Resolved | message: Database connectivity restored. Root cause: expired SSL cert. | sound: incoming
```

---

## Common Errors

| HTTP Status | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 400 | application token is invalid | Wrong or missing app token | Verify PUSHOVER_APP_TOKEN |
| 400 | user identifier is not valid | Wrong or missing user key | Verify PUSHOVER_USER_KEY |
| 400 | message cannot be blank | Empty message body | Provide a message |
| 400 | device name is not valid | Unknown device name | Check device names on Pushover dashboard |
| 429 | over quota | Monthly limit exceeded (10k free / 25k team) | Wait for monthly reset or upgrade |

---

## Rate Limits

- **Free**: 10,000 messages/month per application
- **Team apps**: 25,000 messages/month
- Resets at 00:00 Central Time on the 1st of each month
- One message = one successful API call to one user
- Group messages count 1 per member
- Excessive 4xx errors may trigger IP blocking

---

## Important Skill Rules

1. **message** is always required; return an error if missing.
2. Default priority is **0** (normal); only change when the user explicitly requests it.
3. If priority is **2** (emergency), ensure `retry` (min 30s) and `expire` (max 10800s) are set; default to `retry=60, expire=1800` if not specified.
4. On failure, return the **specific Pushover error messages** (from the `errors` array); never report success on error.
5. Resolve **app token** and **user key** from the prompt or env vars; ask the user if neither is available.
6. Return the **request ID** on success so the user can reference it.
7. For emergency pushes, also return the **receipt** token for acknowledgement tracking.
8. The app token and user key grant **full access** -- never log or expose them in output.
9. Use the built-in `http_client` tool for all API calls -- do **not** use external scripts, curl, or Python.
10. `html` and `monospace` are **mutually exclusive** -- never set both to `1`.
