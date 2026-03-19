---
name: imgbb-image-host
description: Upload images to IMGBB for public hosting. Supports base64 and file uploads with optional expiration. Returns the public image URL for use in posts, embeds, or any external service.
version: 1.0.0
author: Assistant
tags: [image, hosting, upload, imgbb, api]
dependencies: [http_client, read_file]
---

# IMGBB Image Host

Skill for uploading images to **IMGBB** and obtaining a public URL. Used as a dependency by any skill that needs to host images externally (e.g. buffer-post, ionclaw-post).

Documentation: https://api.imgbb.com/

---

## Required Parameters

- **IMGBB API Key** -- provided by the user
- **Image** -- local file path or base64 string

## Optional Parameters

- **Expiration** -- seconds until the image expires (e.g. 600). Omit for no expiration.

---

## API Reference

### Endpoint

```
POST https://api.imgbb.com/1/upload?key=YOUR_CLIENT_API_KEY
```

Always use **POST** when uploading (local files or base64). URL encoding may alter the base64 source due to encoded characters or URL length limits when using GET.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| key | string | yes | User IMGBB API key |
| expiration | integer | no | Seconds until the image expires (e.g. 600). Omit for no expiration. |

### Request Body

**form-data** with a single field:

| Field | Type | Description |
|-------|------|-------------|
| image | string (base64) or file | Image as base64 string or multipart file |

---

## Examples

### Upload base64 image

```bash
curl --location --request POST "https://api.imgbb.com/1/upload?expiration=600&key=YOUR_CLIENT_API_KEY" \
  --form "image=R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
```

### Upload local file

```http
POST https://api.imgbb.com/1/upload?expiration=600&key=IMGBB_API_KEY
Content-Type: multipart/form-data

image=@/path/to/public/media/2026/03/12/image_1710230012.png
```

### Upload base64 in form body

Send the base64 string in the form field `image`; do not put image data in the URL.

```http
POST https://api.imgbb.com/1/upload?expiration=600&key=IMGBB_API_KEY
Content-Type: multipart/form-data (or application/x-www-form-urlencoded)

image=BASE64_IMAGE_DATA
```

---

## Response

### Success

```json
{
  "data": {
    "id": "abc123",
    "url": "https://i.ibb.co/xyz123/image.png",
    "display_url": "https://i.ibb.co/xyz123/image.png"
  },
  "success": true,
  "status": 200
}
```

The **public URL** is `data.url`.

### Error

If the response returns:
- `success = false`
- `status != 200`
- missing `data.url`

The upload has failed. The caller must handle the failure accordingly (e.g. cancel the post, inform the user).

---

## Skill Usage

### Upload a local file
```
imgbb-image-host: upload | file: public/media/2026/03/12/image_1710230012.png
```

### Upload with expiration
```
imgbb-image-host: upload | file: public/media/2026/03/12/image_1710230012.png | expiration: 600
```

---

## Workflow

1. Validate that the **IMGBB API Key** is available; if missing, request from the user
2. Read the image file (or receive base64 data)
3. Send **POST** request to `https://api.imgbb.com/1/upload` with the image in the `image` form field
4. Validate the response: `success = true`, `status = 200`, and `data.url` is present
5. Return the public image URL (`data.url`)

---

## Important Skill Rules

1. Always use **POST** method for uploads
2. Never put image data in the URL query string
3. Validate the full response before returning the URL
4. On upload failure, return a clear error; never return a partial or empty URL
5. Support both base64 and local file uploads