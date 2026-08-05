---
name: buffer-post
description: Full Buffer.com GraphQL API skill for managing social media. Supports creating and deleting posts, scheduling, image posts via external URL, listing channels and organizations, retrieving posts with filtering/pagination/assets, scheduled posts, daily posting limits, and creating ideas. Automatically detects user language.
version: 1.0.0
author: Assistant
tags: [social-media, buffer, api, publishing, scheduling, ideas, graphql]
dependencies: [http_client]
---

# Buffer Post

Complete skill for the **Buffer.com GraphQL API**. Manages social media posts, channels, organizations, ideas, and scheduling across all Buffer-supported networks.

Documentation: https://developers.buffer.com/guides/getting-started.html

The **post text** must be written in the **language explicitly requested** by the user. If no language is specified, it must follow the **same language used by the user**.

The skill instructions themselves remain **in English**, but the generated content must follow the **requested or detected language**.

---

## Buffer GraphQL API

Single endpoint for all operations:

```
POST https://graph.buffer.com/graphql
```

Headers:

```
Authorization: Bearer [USER_BUFFER_API_KEY]
Content-Type: application/json
```

Body: JSON with a `query` (and optionally `variables`) field containing the GraphQL document.

Rate limit: **60 authenticated requests per user per minute**.

API token: created at https://publish.buffer.com/settings/api

---

## Supported Networks

| Service | Identifier |
|---------|-----------|
| Instagram | instagram |
| Facebook | facebook |
| X / Twitter | twitter |
| LinkedIn | linkedin |
| Pinterest | pinterest |
| TikTok | tiktok |
| YouTube | youtube |
| Google Business Profiles | googlebusiness |
| Mastodon | mastodon |
| Threads | threads |
| Bluesky | bluesky |
| Start Pages | startpage |

---

## Character Limits by Network

Post text must not exceed the character limit of the target channel. The API may reject or truncate content that exceeds it.

| Channel | Post text limit (characters) |
|---------|-----------------------------|
| Facebook (pages & groups) | 63,206 |
| Instagram (post/reel captions) | 2,200 |
| X / Twitter (free) | 280 |
| X / Twitter (Basic, Premium, Premium+) | 25,000 |
| LinkedIn (pages & profiles) | 3,000 |
| Pinterest | 500 |
| TikTok | 2,200 |
| Threads | 500 |
| Bluesky | 300 |
| Google Business Profiles | 1,500 |
| Mastodon | 500 |
| YouTube (Shorts, descriptions) | 5,000 |
| Start Pages (Buffer) | 5,000 |

Before publishing, validate that the post text length is within the limit for the channel. If the channel type is known (e.g. from the GetChannels response), use the corresponding limit; otherwise enforce the most restrictive limit (280) or prompt the user to shorten the text.

---

## Quick Reference

### Get organizations

```bash
curl -X POST 'https://graph.buffer.com/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [USER_BUFFER_API_KEY]' \
  -d '{"query": "query GetOrganizations {\n  account {\n    organizations {\n      id\n      name\n      ownerEmail\n    }\n  }\n}"}'
```

### Get channels

```bash
curl -X POST 'https://graph.buffer.com/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [USER_BUFFER_API_KEY]' \
  -d '{"query": "query GetChannels {\n  channels(input: {\n    organizationId: \"ORGANIZATION_ID\"\n  }) {\n    id\n    name\n    displayName\n    service\n    avatar\n    isQueuePaused\n  }\n}"}'
```

### Create text post

```bash
curl -X POST 'https://graph.buffer.com/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [USER_BUFFER_API_KEY]' \
  -d '{"query": "mutation CreatePost {\n  createPost(input: {\n    text: \"Post text here\",\n    channelId: \"CHANNEL_ID\",\n    schedulingType: automatic,\n    mode: shareNow\n  }) {\n    ... on PostActionSuccess {\n      post {\n        id\n        text\n      }\n    }\n    ... on UnexpectedError { message }\n    ... on LimitReachedError { message }\n    ... on InvalidInputError { message }\n  }\n}"}'
```

### Create image post

```bash
curl -X POST 'https://graph.buffer.com/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [USER_BUFFER_API_KEY]' \
  -d '{"query": "mutation CreatePost {\n  createPost(input: {\n    text: \"Post text here\",\n    channelId: \"CHANNEL_ID\",\n    schedulingType: automatic,\n    mode: shareNow,\n    assets: {\n      images: [\n        { url: \"https://i.ibb.co/xyz123/image.png\" }\n      ]\n    }\n  }) {\n    ... on PostActionSuccess {\n      post {\n        id\n        text\n        assets {\n          id\n          mimeType\n        }\n      }\n    }\n    ... on UnexpectedError { message }\n    ... on LimitReachedError { message }\n    ... on InvalidInputError { message }\n  }\n}"}'
```

### Delete post

```bash
curl -X POST 'https://graph.buffer.com/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [USER_BUFFER_API_KEY]' \
  -d '{"query": "mutation DeletePost {\n  deletePost(input: {\n    postId: \"POST_ID\"\n  }) {\n    ... on PostActionSuccess {\n      post {\n        id\n      }\n    }\n    ... on UnexpectedError { message }\n    ... on LimitReachedError { message }\n    ... on InvalidInputError { message }\n  }\n}"}'
```

### Create idea

```bash
curl -X POST 'https://graph.buffer.com/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [USER_BUFFER_API_KEY]' \
  -d '{"query": "mutation CreateIdea {\n  createIdea(input: {\n    organizationId: \"ORGANIZATION_ID\",\n    content: {\n      title: \"Idea title\",\n      text: \"Idea body text\"\n    }\n  }) {\n    ... on CreateIdeaSuccess {\n      idea {\n        id\n        content {\n          title\n          text\n        }\n      }\n    }\n    ... on UnexpectedError { message }\n    ... on LimitReachedError { message }\n    ... on InvalidInputError { message }\n  }\n}"}'
```

### Get posts with assets

```bash
curl -X POST 'https://graph.buffer.com/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [USER_BUFFER_API_KEY]' \
  -d '{"query": "query GetPostsWithAssets {\n  posts(\n    input: {\n      organizationId: \"ORGANIZATION_ID\",\n      filter: {\n        status: [sent],\n        channelIds: [\"CHANNEL_ID\"]\n      }\n    }\n  ) {\n    edges {\n      node {\n        id\n        text\n        createdAt\n        channelId\n        assets {\n          thumbnail\n          mimeType\n          source\n          ... on ImageAsset {\n            image {\n              altText\n              width\n              height\n            }\n          }\n        }\n      }\n    }\n  }\n}"}'
```

### Get scheduled posts

```bash
curl -X POST 'https://graph.buffer.com/graphql' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [USER_BUFFER_API_KEY]' \
  -d '{"query": "query GetScheduledPosts {\n  posts(\n    input: {\n      organizationId: \"ORGANIZATION_ID\",\n      sort: [\n        { field: dueAt, direction: asc },\n        { field: createdAt, direction: desc }\n      ],\n      filter: {\n        status: [scheduled]\n      }\n    }\n  ) {\n    edges {\n      node {\n        id\n        text\n        createdAt\n      }\n    }\n  }\n}"}'
```

---

## Operations Reference

### Queries

| Operation | Description |
|-----------|-------------|
| GetAccount | Get authenticated user account info (id, email, timezone, avatar) |
| GetOrganizations | List all organizations for the account (id, name, ownerEmail) |
| GetChannels | List channels for an organization (id, name, displayName, service, avatar, isQueuePaused) |
| GetPosts | Fetch posts for an organization with optional filtering by status and channelIds |
| GetPostsWithAssets | Fetch posts including media assets (thumbnail, mimeType, source, image details) |
| GetScheduledPosts | Fetch posts with `status: [scheduled]`, sorted by dueAt |
| DailyPostingLimits | Get daily posting limit status for channels on a specified date |

### Mutations

| Operation | Description |
|-----------|-------------|
| CreatePost | Create a post (text, optional media, scheduling, mode) |
| DeletePost | Delete a post by ID |
| CreateIdea | Create an idea with title and text for an organization |

---

## Detailed Operations

### 1. Get Account

Retrieves the authenticated user's account information.

```graphql
query GetAccount {
  account {
    id
    email
    organizations {
      id
      name
    }
  }
}
```

Response fields: `id`, `email`, `organizations[].id`, `organizations[].name`.

---

### 2. Get Organizations

Fetches all organizations belonging to the authenticated account. Required to obtain `organizationId` for most other operations.

```graphql
query GetOrganizations {
  account {
    organizations {
      id
      name
      ownerEmail
    }
  }
}
```

Response fields: `id`, `name`, `ownerEmail`.

---

### 3. Get Channels

Lists all connected social media channels for an organization. Requires `organizationId`.

```graphql
query GetChannels {
  channels(input: {
    organizationId: "ORGANIZATION_ID"
  }) {
    id
    name
    displayName
    service
    avatar
    isQueuePaused
  }
}
```

Response fields:

| Field | Description |
|-------|-------------|
| id | Channel unique identifier |
| name | Channel name |
| displayName | Human-readable display name |
| service | Social media platform (instagram, facebook, twitter, linkedin, etc.) |
| avatar | Channel profile image URL |
| isQueuePaused | Whether the channel queue is paused |

---

### 4. Get Posts

Fetches posts for an organization with optional filtering by status and channel.

```graphql
query GetPosts {
  posts(
    input: {
      organizationId: "ORGANIZATION_ID",
      filter: {
        status: [sent],
        channelIds: ["CHANNEL_ID"]
      }
    }
  ) {
    edges {
      node {
        id
        text
        createdAt
        channelId
      }
    }
  }
}
```

#### Post status values

| Status | Description |
|--------|-------------|
| sent | Published posts |
| scheduled | Posts scheduled for future publishing |
| draft | Saved drafts |

#### Sorting

Posts support multi-field sorting:

```graphql
sort: [
  { field: dueAt, direction: asc },
  { field: createdAt, direction: desc }
]
```

#### Pagination

Uses cursor-based pagination following the GraphQL Relay specification:

```graphql
query GetPosts {
  posts(
    input: {
      organizationId: "ORGANIZATION_ID",
      filter: { status: [sent] }
    },
    first: 10,
    after: "CURSOR_VALUE"
  ) {
    edges {
      node {
        id
        text
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

| Field | Description |
|-------|-------------|
| first | Number of items to return |
| after | Cursor from previous page's `endCursor` |
| pageInfo.hasNextPage | Whether more results exist |
| pageInfo.endCursor | Cursor for the next page |
| totalCount | Total number of matching posts |

---

### 5. Get Posts With Assets

Retrieves posts including their media attachments.

```graphql
query GetPostsWithAssets {
  posts(
    input: {
      organizationId: "ORGANIZATION_ID",
      filter: {
        status: [sent],
        channelIds: ["CHANNEL_ID"]
      }
    }
  ) {
    edges {
      node {
        id
        text
        createdAt
        channelId
        assets {
          thumbnail
          mimeType
          source
          ... on ImageAsset {
            image {
              altText
              width
              height
            }
          }
        }
      }
    }
  }
}
```

Asset fields:

| Field | Description |
|-------|-------------|
| thumbnail | Asset thumbnail URL |
| mimeType | Media type (e.g. image/png, video/mp4) |
| source | Asset source URL |
| image.altText | Alt text for image assets |
| image.width | Image width in pixels |
| image.height | Image height in pixels |

---

### 6. Get Scheduled Posts

Fetches posts scheduled for future publishing, sorted by due date.

```graphql
query GetScheduledPosts {
  posts(
    input: {
      organizationId: "ORGANIZATION_ID",
      sort: [
        { field: dueAt, direction: asc },
        { field: createdAt, direction: desc }
      ],
      filter: {
        status: [scheduled]
      }
    }
  ) {
    edges {
      node {
        id
        text
        createdAt
      }
    }
  }
}
```

---

### 7. Daily Posting Limits

Retrieves daily posting limit status for channels on a specified date.

```graphql
query DailyPostingLimits {
  dailyPostingLimits(input: {
    organizationId: "ORGANIZATION_ID",
    date: "2026-03-19",
    channelIds: ["CHANNEL_ID"]
  }) {
    channelId
    limit
    used
    remaining
  }
}
```

---

### 8. Create Post

Creates a post on a Buffer channel. Supports text-only, image, scheduling, and queue modes.

#### Input parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| text | String | yes | Post content |
| channelId | String | yes | Target channel ID |
| schedulingType | Enum | yes | `automatic` or `notification` |
| mode | Enum | yes | `shareNow`, `addToQueue`, or `customScheduled` |
| dueAt | String | no | ISO 8601 timestamp (required when mode is `customScheduled`) |
| assets | AssetsInput | no | Media attachments (images, videos, documents) |
| tagIds | [String] | no | Tag IDs to associate with the post |
| aiAssisted | Boolean | no | Whether the post was AI-assisted |
| saveToDraft | Boolean | no | Save as draft instead of publishing |

#### Scheduling modes

| mode | Meaning |
|------|--------|
| shareNow | Publish immediately |
| addToQueue | Add to the end of the queue (Buffer picks the time) |
| shareNext | Add to the top of the queue (next to be sent) |
| customScheduled | Publish at a specific time (requires `dueAt`, ISO 8601) |
| recommendedTime | Use Buffer's recommended optimal time |

By default use **`schedulingType: automatic`** and **`mode: shareNow`** (publish immediately).

#### Text post

```graphql
mutation CreatePost {
  createPost(input: {
    text: "Post text here",
    channelId: "CHANNEL_ID",
    schedulingType: automatic,
    mode: shareNow
  }) {
    ... on PostActionSuccess {
      post {
        id
        text
      }
    }
    ... on UnexpectedError { message }
    ... on LimitReachedError { message }
    ... on InvalidInputError { message }
  }
}
```

#### Image post

Add `assets` with `images` containing a publicly accessible image URL:

```graphql
mutation CreatePost {
  createPost(input: {
    text: "Post text here",
    channelId: "CHANNEL_ID",
    schedulingType: automatic,
    mode: shareNow,
    assets: {
      images: [
        { url: "https://i.ibb.co/xyz123/image.png" }
      ]
    }
  }) {
    ... on PostActionSuccess {
      post {
        id
        text
        assets {
          id
          mimeType
        }
      }
    }
    ... on UnexpectedError { message }
    ... on LimitReachedError { message }
    ... on InvalidInputError { message }
  }
}
```

#### Scheduled post

Use `mode: customScheduled` with `dueAt` in ISO 8601 format:

```graphql
mutation CreatePost {
  createPost(input: {
    text: "Scheduled post text",
    channelId: "CHANNEL_ID",
    schedulingType: automatic,
    mode: customScheduled,
    dueAt: "2026-03-20T14:00:00Z"
  }) {
    ... on PostActionSuccess {
      post {
        id
        text
      }
    }
    ... on UnexpectedError { message }
    ... on LimitReachedError { message }
    ... on InvalidInputError { message }
  }
}
```

#### Queue post

Use `mode: addToQueue` to let Buffer pick the optimal time:

```graphql
mutation CreatePost {
  createPost(input: {
    text: "Queued post text",
    channelId: "CHANNEL_ID",
    schedulingType: automatic,
    mode: addToQueue
  }) {
    ... on PostActionSuccess {
      post {
        id
        text
      }
    }
    ... on UnexpectedError { message }
    ... on LimitReachedError { message }
    ... on InvalidInputError { message }
  }
}
```

#### Anti-spam

Buffer may reject the post if the same or similar content was published recently. The API call can succeed while the post is not actually published. On `UnexpectedError` / `LimitReachedError` / `InvalidInputError` or when the response indicates rejection, inform the user clearly (e.g. post not published due to Buffer anti-spam; try again later).

---

### 9. Delete Post

Deletes an existing post by ID.

```graphql
mutation DeletePost {
  deletePost(input: {
    postId: "POST_ID"
  }) {
    ... on PostActionSuccess {
      post {
        id
      }
    }
    ... on UnexpectedError { message }
    ... on LimitReachedError { message }
    ... on InvalidInputError { message }
  }
}
```

---

### 10. Create Idea

Creates an idea in the Buffer Ideas board for an organization.

```graphql
mutation CreateIdea {
  createIdea(input: {
    organizationId: "ORGANIZATION_ID",
    content: {
      title: "Idea title",
      text: "Idea body text"
    }
  }) {
    ... on CreateIdeaSuccess {
      idea {
        id
        content {
          title
          text
        }
      }
    }
    ... on UnexpectedError { message }
    ... on LimitReachedError { message }
    ... on InvalidInputError { message }
  }
}
```

---

## API Standards

Buffer follows additive evolution: fields are never removed, only deprecated with `@deprecated` annotations.

### Error handling

- **Non-recoverable errors**: returned in the standard GraphQL `errors` array with extension codes (`NOT_FOUND`, `UNAUTHORIZED`, etc.)
- **Recoverable errors**: returned as typed `UnexpectedError` / `LimitReachedError` / `InvalidInputError` in the mutation payload

### Pagination

All list queries use cursor-based pagination with `edges`, `pageInfo`, and `totalCount`. Use `first` and `after` parameters to paginate.

---

## Required Parameters

- **Buffer API Key** -- provided by the user
- **Channel ID** -- Buffer channel ID where the post will be published (for post operations)
- **Organization ID** -- required for channels, posts, ideas, and posting limits queries
- **Post Text** -- content of the post; must respect the character limit of the target network
- **Image URL** (optional) -- public URL of an already-hosted image to attach to the post

---

## Language Rules

The post text must be written in the **language explicitly requested** by the user. If no language is specified, use the **same language the user is writing in**.

Example:

User writes in Portuguese without specifying language:
```
buffer-post: Novo lançamento da plataforma! | channel: 123
```

Then:
- Post text → Portuguese

User writes in Portuguese but requests English:
```
buffer-post: Novo lançamento da plataforma! | channel: 123 | lang: en
```

Then:
- Post text → English

User writes in English:
```
buffer-post: Our new AI platform is live! | channel: 123
```

Then:
- Post text → English

System instructions stay **English**, but generated content must follow the **requested or detected language**.

---

## Post Creation Workflow

### 1. Initial Validation

Verify the following parameters:
- Buffer API Key
- Channel ID

If missing → request from the user.

Check that **post text length** does not exceed the character limit for the target channel (see [Character Limits by Network](#character-limits-by-network)). If it exceeds, ask the user to shorten the text or truncate only when the user explicitly accepts it.

---

### 2. Publish Post to Buffer

Publish the post using the **CreatePost** mutation (see [Create Post](#8-create-post)).

If an **image URL** is provided, include it in `assets.images`. The URL must be a publicly accessible, already-hosted image. This skill does not generate or upload images -- it only receives a URL.

---

## Skill Response

After success, return:
- Post ID
- Channel used
- Post text
- Image URL (if provided)

Example:
```
Post published successfully.

Post ID: 123456789
Channel: 5f8a2b1c3d4e5f6g7h8i9j0k
Text: IonClaw revolutionizes automation!
Image: https://i.ibb.co/xyz123/image.png
```

---

## Skill Usage

### Basic Post
```
buffer-post: [post text] | channel: [CHANNEL_ID]
```

### Post With Image URL
```
buffer-post: [post text] | channel: [CHANNEL_ID] | image_url: [PUBLIC_IMAGE_URL]
```

### Scheduled Post
```
buffer-post: [post text] | channel: [CHANNEL_ID] | schedule: 2026-03-20T14:00:00Z
```

### Queue Post
```
buffer-post: [post text] | channel: [CHANNEL_ID] | mode: addToQueue
```

### Delete Post
```
buffer-post: delete | post: [POST_ID]
```

### Create Idea
```
buffer-post: idea | title: [TITLE] | text: [BODY]
```

### List Organizations
```
buffer-post: list organizations
```

### List Available Channels
```
buffer-post: list channels
```

### Get Posts
```
buffer-post: get posts | channel: [CHANNEL_ID] | status: sent
```

### Get Scheduled Posts
```
buffer-post: get scheduled posts
```

### Get Posts With Assets
```
buffer-post: get posts with assets | channel: [CHANNEL_ID]
```

### Get Daily Posting Limits
```
buffer-post: get posting limits | date: 2026-03-19
```

---

## Practical Examples

### Publish immediately with image
```
buffer-post: IonClaw revolutionizes automation! | channel: 5f8a2b1c3d4e5f6g7h8i9j0k | image_url: https://i.ibb.co/xyz123/image.png
```

### Schedule a post for tomorrow
```
buffer-post: New feature release coming soon! | channel: 5f8a2b1c3d4e5f6g7h8i9j0k | schedule: 2026-03-20T10:00:00Z
```

### Add to queue with image
```
buffer-post: Check out our latest update | channel: 5f8a2b1c3d4e5f6g7h8i9j0k | mode: addToQueue | image_url: https://i.ibb.co/xyz123/image.png
```

### Save an idea for later
```
buffer-post: idea | title: Product launch campaign | text: Series of 5 posts highlighting key features of v2.0 release
```

---

## Important Skill Rules

1. Use the **Buffer GraphQL API** (POST https://graph.buffer.com/graphql) for all operations; by default use `schedulingType: automatic` and `mode: shareNow`.
2. On Buffer `UnexpectedError` / `LimitReachedError` / `InvalidInputError` or anti-spam rejection, inform the user clearly and do not report success.
3. Enforce **post text character limit** per target channel; do not publish text that exceeds the social network limit.
4. If an `image_url` is provided, include it in `assets.images`; this skill does not generate or host images.
5. Ensure **post text follows the requested language**; if none is specified, use the **user's language**.
6. Always resolve `organizationId` before querying channels, posts, ideas, or posting limits.
7. Use cursor-based pagination (`first`, `after`) when retrieving large post lists.
8. Respect the rate limit of **60 requests per minute**; space out bulk operations.
9. Provide clear feedback to the user.
