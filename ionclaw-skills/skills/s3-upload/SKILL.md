---
name: s3-upload
description: Upload files to Amazon S3 or S3-compatible storage (MinIO, DigitalOcean Spaces, Cloudflare R2). Sends files to a bucket with automatic MIME type detection, public-read ACL by default (optionally private), and returns the public URL on success or a detailed error message on failure. Supports custom keys, regions, and endpoint URLs.
version: 1.0.0
author: IonClaw
tags: [s3, aws, upload, file, storage, cloud, bucket, minio, spaces, r2, public, hosting]
dependencies: [exec, read_file]
requires:
  bins:
    - python3
  env:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
---

# S3 Upload

Upload files to **Amazon S3** or any S3-compatible storage service (MinIO, DigitalOcean Spaces, Cloudflare R2, Backblaze B2, etc.).

Files are uploaded with **public-read** ACL by default so they are publicly accessible via URL. The user can request a **private** upload to restrict access.

The MIME type (Content-Type) is **automatically detected** from the file extension, ensuring correct handling by browsers and CDNs.

---

## Required Parameters

- **File path** -- local path to the file to upload
- **Bucket** -- S3 bucket name

## Optional Parameters

- **Key** -- object key (path inside the bucket). Defaults to the file name.
- **Region** -- AWS region (e.g. `us-east-1`, `sa-east-1`). Uses AWS SDK default if omitted.
- **ACL** -- access control. Default: `public-read`. Use `private` or `none` for restricted access.
- **Endpoint URL** -- custom endpoint for S3-compatible services (e.g. `https://nyc3.digitaloceanspaces.com`).

---

## AWS Credentials

Credentials are read from environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (optional, for temporary credentials)

If credentials are not configured, ask the user to set them before proceeding.

---

## Script

The upload is performed by `scripts/s3_upload.py` included in this skill package.

### Usage

```bash
python3 scripts/s3_upload.py <file_path> <bucket> [key] [region] [acl] [endpoint_url]
```

### Arguments

| Position | Name | Required | Default | Description |
|----------|------|----------|---------|-------------|
| 1 | file_path | yes | -- | Local path to the file |
| 2 | bucket | yes | -- | S3 bucket name |
| 3 | key | no | file name | Object key (path in bucket) |
| 4 | region | no | SDK default | AWS region |
| 5 | acl | no | public-read | ACL: `public-read`, `private`, or `none` |
| 6 | endpoint_url | no | -- | Custom S3-compatible endpoint URL |

### Response

The script outputs JSON to stdout.

**Success:**

```json
{
  "success": true,
  "url": "https://my-bucket.s3.us-east-1.amazonaws.com/images/photo.jpg",
  "bucket": "my-bucket",
  "key": "images/photo.jpg",
  "content_type": "image/jpeg",
  "acl": "public-read",
  "size_bytes": 245760
}
```

**Error:**

```json
{
  "success": false,
  "error": "AWS error (NoSuchBucket): The specified bucket does not exist"
}
```

---

## Workflow

1. Validate that **AWS credentials** are available in environment; if missing, ask the user
2. Validate the **file path** exists; if not, inform the user
3. Determine the **key** (use user-provided key or default to file name)
4. Determine the **ACL**: use `public-read` unless the user explicitly requests private or restricted access
5. Run the upload script via `exec`:
   ```bash
   python3 scripts/s3_upload.py "/path/to/file.png" "my-bucket" "uploads/file.png" "us-east-1" "public-read"
   ```
6. Parse the JSON output
7. On **success**: return the public URL, bucket, key, content type, and file size to the user
8. On **error**: return the specific error message to the user

---

## Skill Usage

### Upload a file (public by default)
```
s3-upload: /path/to/file.png | bucket: my-bucket
```

### Upload with custom key (path in bucket)
```
s3-upload: /path/to/file.png | bucket: my-bucket | key: images/2026/03/photo.png
```

### Upload to a specific region
```
s3-upload: /path/to/report.pdf | bucket: my-bucket | region: sa-east-1
```

### Upload as private (not publicly accessible)
```
s3-upload: /path/to/file.png | bucket: my-bucket | acl: private
```

### Upload to DigitalOcean Spaces
```
s3-upload: /path/to/file.png | bucket: my-space | endpoint: https://nyc3.digitaloceanspaces.com | region: nyc3
```

### Upload to MinIO
```
s3-upload: /path/to/file.png | bucket: my-bucket | endpoint: http://localhost:9000
```

### Upload to Cloudflare R2
```
s3-upload: /path/to/file.png | bucket: my-bucket | endpoint: https://ACCOUNT_ID.r2.cloudflarestorage.com | acl: none
```

---

## Practical Examples

### Host an image publicly on S3
```
s3-upload: /tmp/screenshot.png | bucket: assets-cdn | key: screenshots/app-v2.png | region: us-east-1
```
Result: `https://assets-cdn.s3.us-east-1.amazonaws.com/screenshots/app-v2.png`

### Upload a build artifact privately
```
s3-upload: ./dist/app-v2.0.0.tar.gz | bucket: releases | key: builds/app-v2.0.0.tar.gz | acl: private
```

### Upload a PDF report
```
s3-upload: /home/user/reports/q1-2026.pdf | bucket: company-docs | key: reports/q1-2026.pdf | region: eu-west-1
```

---

## MIME Type Detection

The content type is automatically detected from the file extension:

| Extension | Content-Type |
|-----------|-------------|
| .png | image/png |
| .jpg, .jpeg | image/jpeg |
| .gif | image/gif |
| .webp | image/webp |
| .svg | image/svg+xml |
| .pdf | application/pdf |
| .zip | application/zip |
| .tar.gz | application/gzip |
| .json | application/json |
| .html | text/html |
| .css | text/css |
| .js | application/javascript |
| .mp4 | video/mp4 |
| .mp3 | audio/mpeg |
| (unknown) | application/octet-stream |

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| NoSuchBucket | Bucket does not exist | Check the bucket name |
| AccessDenied | Insufficient permissions | Check IAM policy and credentials |
| InvalidAccessKeyId | Invalid AWS access key | Verify AWS_ACCESS_KEY_ID |
| SignatureDoesNotMatch | Invalid secret key | Verify AWS_SECRET_ACCESS_KEY |
| AllAccessDisabled | Bucket access is fully disabled | Check bucket policy |
| EntityTooLarge | File exceeds S3 size limit | Use multipart upload for files > 5GB |
| InvalidBucketName | Bucket name is invalid | Use lowercase, no spaces, 3-63 chars |

---

## Important Skill Rules

1. Always **detect MIME type** from the file extension; never upload without Content-Type.
2. Default ACL is **public-read**; only use `private` or `none` when the user explicitly requests it.
3. On failure, return the **specific AWS error** (code + message); never report success on error.
4. Validate that the **file exists** before attempting upload.
5. Validate that **AWS credentials** are available; ask the user if missing.
6. Return the **full public URL** on success so the user can access the file immediately.
7. Support **S3-compatible services** via the endpoint URL parameter.
