---
name: s3-upload
description: Upload files to Amazon S3 or S3-compatible storage (MinIO, DigitalOcean Spaces, Cloudflare R2). Sends files to a bucket with automatic MIME type detection, public-read ACL by default (optionally private), and returns the public URL on success or a detailed error message on failure. Supports custom keys, regions, and endpoint URLs.
version: 1.0.0
author: IonClaw
tags: [s3, aws, upload, file, storage, cloud, bucket, minio, spaces, r2, public, hosting]
dependencies: [exec]
requires: {}
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

Credentials can be:
- **Provided directly by the user** in the prompt
- **Read from environment variables**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (optional, for temporary credentials)

If provided in the prompt, use those values. Otherwise, fall back to the environment variables. If neither is available, ask the user.

---

## Python Environment (venv)

The upload requires `boto3`. If `boto3` is not available in the current Python environment, you **must** create and use a virtual environment before running the inline script.

**Before executing**, check if a venv is already active (the `VIRTUAL_ENV` environment variable is set). If it is, skip venv creation and just ensure `boto3` is installed. If no venv is active, create one.

### macOS / Linux

```bash
python3 -m venv /tmp/s3-upload-venv && /tmp/s3-upload-venv/bin/pip install boto3
```

### Windows

```cmd
python -m venv %TEMP%\s3-upload-venv && %TEMP%\s3-upload-venv\Scripts\pip install boto3
```

**Decision flow:**

1. Check if `VIRTUAL_ENV` is set (venv already active)
2. If **yes** → run `pip install boto3` (no-op if already installed) → use `python3` / `python`
3. If **no** → detect OS:
   - **macOS/Linux** → create venv at `/tmp/s3-upload-venv` → use `/tmp/s3-upload-venv/bin/python`
   - **Windows** → create venv at `%TEMP%\s3-upload-venv` → use `%TEMP%\s3-upload-venv\Scripts\python`

---

## Inline Script

There is **no external script file** to locate. The upload is executed as an **inline Python script** via `exec`. Use `python3 -c '...'` (or the venv python binary) passing the full code inline.

### Template

Replace the placeholder values with the actual parameters. Run this via the `exec` tool:

```bash
/tmp/s3-upload-venv/bin/python -c '
import json, mimetypes, os, sys
import boto3
from botocore.exceptions import BotoCoreError, ClientError

file_path = "FILE_PATH"
bucket = "BUCKET"
key = "KEY_OR_EMPTY"
region = "REGION_OR_EMPTY"
acl = "ACL_VALUE"
endpoint_url = "ENDPOINT_OR_EMPTY"

if not key:
    key = os.path.basename(file_path)
if not region:
    region = None
if not endpoint_url:
    endpoint_url = None
if acl == "none":
    acl = None

if not os.path.isfile(file_path):
    print(json.dumps({"success": False, "error": f"File not found: {file_path}"}))
    sys.exit(1)

content_type, _ = mimetypes.guess_type(file_path)
if not content_type:
    content_type = "application/octet-stream"

session_kwargs = {}
if region:
    session_kwargs["region_name"] = region

client_kwargs = {}
if endpoint_url:
    client_kwargs["endpoint_url"] = endpoint_url

try:
    session = boto3.Session(**session_kwargs)
    s3 = session.client("s3", **client_kwargs)
    extra_args = {"ContentType": content_type}
    if acl:
        extra_args["ACL"] = acl
    s3.upload_file(file_path, bucket, key, ExtraArgs=extra_args)
    if endpoint_url:
        url = f"{endpoint_url.rstrip(chr(47))}/{bucket}/{key}"
    elif region and region != "us-east-1":
        url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
    else:
        url = f"https://{bucket}.s3.amazonaws.com/{key}"
    print(json.dumps({"success": True, "url": url, "bucket": bucket, "key": key, "content_type": content_type, "acl": acl if acl else "none", "size_bytes": os.path.getsize(file_path)}, indent=2))
except ClientError as e:
    code = e.response["Error"]["Code"]
    msg = e.response["Error"]["Message"]
    print(json.dumps({"success": False, "error": f"AWS error ({code}): {msg}"}))
    sys.exit(1)
except BotoCoreError as e:
    print(json.dumps({"success": False, "error": f"Boto3 error: {str(e)}"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"success": False, "error": f"Unexpected error: {str(e)}"}))
    sys.exit(1)
'
```

When credentials are provided by the user (not from env vars), export them before running:

```bash
export AWS_ACCESS_KEY_ID="user_provided_key"
export AWS_SECRET_ACCESS_KEY="user_provided_secret"
```

---

## Response

The inline script outputs JSON to stdout.

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

1. Resolve **AWS credentials**: use values from the prompt if provided, otherwise from env vars (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`); if neither is available, ask the user
2. Validate the **file path** exists; if not, inform the user
3. **Prepare Python environment**: check if `VIRTUAL_ENV` is set; if not, create a venv at `/tmp/s3-upload-venv` (or `%TEMP%\s3-upload-venv` on Windows) and install `boto3`
4. Determine the **key** (use user-provided key or default to file name)
5. Determine the **ACL**: use `public-read` unless the user explicitly requests private or restricted access
6. Run the **inline Python script** via `exec` using the appropriate Python binary (substitute actual values into the template)
7. Parse the JSON output
8. On **success**: return the public URL, bucket, key, content type, and file size to the user
9. On **error**: return the specific error message to the user

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
5. Resolve **AWS credentials** from the prompt or env vars; ask the user if neither is available.
6. Return the **full public URL** on success so the user can access the file immediately.
7. Support **S3-compatible services** via the endpoint URL parameter.
8. Use **inline Python code** via `exec` -- do **not** reference or search for external script files.
