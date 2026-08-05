---
name: pushbullet-notify
description: Send push notifications via Pushbullet API. Supports note and link push types. Send notifications to all devices, a specific device, an email address, or a channel. Returns the push details on success or a specific error message on failure.
version: 1.0.0
author: IonClaw
tags: [pushbullet, notification, push, alert, notify, message, note, link, device, channel, mobile]
dependencies: [http_client]
requires: {}
---

# Pushbullet Notify

Send **push notifications** via the [Pushbullet API](https://docs.pushbullet.com/). Deliver alerts, messages, notes, and links to your devices, other users, or channel subscribers.

This skill uses the built-in `http_client` tool to call the Pushbullet API directly — no external scripts or dependencies required.

---

## Push Types

- **note** -- a simple text notification with title and body (default)
- **link** -- a notification with a clickable URL, title, and optional body

---

## Required Parameters

- **Access Token** -- Pushbullet API token (provided by the user in the prompt or read from `PUSHBULLET_ACCESS_TOKEN` environment variable)

## Optional Parameters

- **Type** -- push type: `note` (default) or `link`
- **Title** -- notification title
- **Body** -- notification body/message text
- **URL** -- link URL (required when type is `link`)
- **Device Iden** -- send to a specific device (device identifier)
- **Email** -- send to a specific user by email address
- **Channel Tag** -- send to all subscribers of a Pushbullet channel

> If no target (device, email, or channel) is specified, the notification is sent to **all devices** on the account.

---

## Authentication

The access token can be:
- **Provided directly by the user** in the prompt
- **Read from the `PUSHBULLET_ACCESS_TOKEN` environment variable**

If provided in the prompt, use that value. Otherwise, fall back to the environment variable. If neither is available, ask the user.

Tokens can be generated at: **Pushbullet > Settings > Access Tokens**

---

## API Calls

All calls use the built-in `http_client` tool. No Python scripts, venv, or external binaries needed.

### Send a note push

```
http_client(
  method="POST",
  url="https://api.pushbullet.com/v2/pushes",
  headers={"Access-Token": "<PUSHBULLET_ACCESS_TOKEN>"},
  body="{\"type\": \"note\", \"title\": \"Deploy Complete\", \"body\": \"App v2.0.0 deployed to production.\"}"
)
```

### Send a link push

```
http_client(
  method="POST",
  url="https://api.pushbullet.com/v2/pushes",
  headers={"Access-Token": "<PUSHBULLET_ACCESS_TOKEN>"},
  body="{\"type\": \"link\", \"title\": \"PR Ready\", \"body\": \"Please review\", \"url\": \"https://github.com/org/repo/pull/42\"}"
)
```

### Send to a specific device

```
http_client(
  method="POST",
  url="https://api.pushbullet.com/v2/pushes",
  headers={"Access-Token": "<PUSHBULLET_ACCESS_TOKEN>"},
  body="{\"type\": \"note\", \"title\": \"Alert\", \"body\": \"CPU above 90%\", \"device_iden\": \"ujpah72o0sjAoRtnM0jc\"}"
)
```

### Send to a user by email

```
http_client(
  method="POST",
  url="https://api.pushbullet.com/v2/pushes",
  headers={"Access-Token": "<PUSHBULLET_ACCESS_TOKEN>"},
  body="{\"type\": \"note\", \"title\": \"Task Done\", \"body\": \"Export ready\", \"email\": \"colleague@example.com\"}"
)
```

### Send to a channel

```
http_client(
  method="POST",
  url="https://api.pushbullet.com/v2/pushes",
  headers={"Access-Token": "<PUSHBULLET_ACCESS_TOKEN>"},
  body="{\"type\": \"note\", \"title\": \"New Release\", \"body\": \"Version 3.0 available\", \"channel_tag\": \"my-releases\"}"
)
```

---

## Request Body Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| type | string | no | note | Push type: `note` or `link` |
| title | string | no | -- | Notification title |
| body | string | no | -- | Notification body/message |
| url | string | for `link` | -- | Link URL (required when type is `link`) |
| device_iden | string | no | -- | Target device identifier |
| email | string | no | -- | Target user email address |
| channel_tag | string | no | -- | Target channel tag |

---

## Response

The Pushbullet API returns JSON.

**Success (HTTP 200):**

```json
{
  "iden": "ujpah72o0sjAoRtnM0jc",
  "active": true,
  "created": 1711036800.0,
  "modified": 1711036800.0,
  "type": "note",
  "dismissed": false,
  "direction": "self",
  "sender_name": "John Doe",
  "sender_email": "john@example.com",
  "title": "Deploy Complete",
  "body": "App v2.0.0 deployed to production."
}
```

**Error (HTTP 401):**

```json
{
  "error": {
    "code": "invalid_access_token",
    "type": "invalid_request",
    "message": "Access token is missing or invalid."
  }
}
```

---

## Workflow

1. Resolve the **access token**: use the value from the prompt if provided, otherwise from `PUSHBULLET_ACCESS_TOKEN` env var; if neither is available, ask the user
2. Determine the **push type** (`note` or `link`); default to `note`
3. Gather **title** and **body** from the user's request
4. If type is `link`, ensure a **URL** is provided
5. Determine the **target**: device, email, channel, or all devices (default)
6. Build the JSON body with all fields
7. Call `http_client` with `POST` to `https://api.pushbullet.com/v2/pushes` passing the `Access-Token` header and JSON body
8. Parse the response
9. On **success** (HTTP 200): return the push details (iden, type, title, body, sender) to the user
10. On **error**: return the specific error message (code + message) to the user

---

## Skill Usage

### Send a simple notification to all devices
```
pushbullet-notify: title: Deploy Complete | body: App v2.0.0 deployed to production successfully.
```

### Send a note with title only
```
pushbullet-notify: title: Build Passed
```

### Send a link notification
```
pushbullet-notify: type: link | title: PR Ready for Review | body: Please review this PR | url: https://github.com/org/repo/pull/42
```

### Send to a specific device
```
pushbullet-notify: title: Alert | body: CPU usage above 90% | device_iden: ujpah72o0sjAoRtnM0jc
```

### Send to a specific user by email
```
pushbullet-notify: title: Task Complete | body: Your export is ready | email: colleague@example.com
```

### Send to a channel
```
pushbullet-notify: title: New Release | body: Version 3.0 is now available | channel_tag: my-releases
```

---

## Practical Examples

### CI/CD deploy notification
```
pushbullet-notify: title: Deploy Complete | body: App v2.0.0 deployed to production at 2026-03-21 14:30 UTC
```

### Alert on error
```
pushbullet-notify: title: ERROR - API Down | body: Health check failed for api.example.com. Status code 503.
```

### Share a link with your devices
```
pushbullet-notify: type: link | title: Dashboard | url: https://grafana.internal/d/api-latency
```

### Notify a team channel
```
pushbullet-notify: title: Incident Resolved | body: Database connectivity restored. Root cause: expired SSL cert. | channel_tag: oncall-alerts
```

---

## Common Errors

| HTTP Status | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 401 | invalid_access_token | Invalid or missing access token | Verify PUSHBULLET_ACCESS_TOKEN is correct |
| 403 | forbidden | Token lacks required permissions | Generate a new token with full access |
| 404 | not_found | Invalid device or target | Check device_iden or email |
| 429 | rate_limit | Rate limit exceeded (500 pushes/month free) | Wait for rate limit reset or upgrade plan |

---

## Important Skill Rules

1. Default push type is **note**; only use `link` when the user explicitly provides a URL or requests it.
2. If type is `link`, a **URL is required**; return an error if missing.
3. On failure, return the **specific Pushbullet API error** (code + message); never report success on error.
4. Resolve the **access token** from the prompt or `PUSHBULLET_ACCESS_TOKEN` env var; ask the user if neither is available.
5. When no target (device, email, channel) is specified, send to **all devices** on the account.
6. Return the **push identifier** (`iden`) on success so the user can reference it later.
7. The access token grants **full account access** -- never log or expose it in output.
8. Use the built-in `http_client` tool for all API calls -- do **not** use external scripts, curl, or Python.
