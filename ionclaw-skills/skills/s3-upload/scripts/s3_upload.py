#!/usr/bin/env python3

import json
import mimetypes
import os
import sys

import boto3
from botocore.exceptions import BotoCoreError, ClientError


def upload_file(
    file_path,
    bucket,
    key=None,
    region=None,
    acl="public-read",
    endpoint_url=None,
):
    if not os.path.isfile(file_path):
        return {"success": False, "error": f"File not found: {file_path}"}

    if not key:
        key = os.path.basename(file_path)

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
            url = f"{endpoint_url.rstrip('/')}/{bucket}/{key}"
        else:
            if region and region != "us-east-1":
                url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
            else:
                url = f"https://{bucket}.s3.amazonaws.com/{key}"

        return {
            "success": True,
            "url": url,
            "bucket": bucket,
            "key": key,
            "content_type": content_type,
            "acl": acl if acl else "none",
            "size_bytes": os.path.getsize(file_path),
        }

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_message = e.response["Error"]["Message"]
        return {
            "success": False,
            "error": f"AWS error ({error_code}): {error_message}",
        }
    except BotoCoreError as e:
        return {"success": False, "error": f"Boto3 error: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Unexpected error: {str(e)}"}


def main():
    if len(sys.argv) < 3:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Usage: s3_upload.py <file_path> <bucket> [key] [region] [acl] [endpoint_url]",
                }
            )
        )
        sys.exit(1)

    file_path = sys.argv[1]
    bucket = sys.argv[2]
    key = sys.argv[3] if len(sys.argv) > 3 else None
    region = sys.argv[4] if len(sys.argv) > 4 else None
    acl = sys.argv[5] if len(sys.argv) > 5 else "public-read"
    endpoint_url = sys.argv[6] if len(sys.argv) > 6 else None

    if acl == "none":
        acl = None

    result = upload_file(file_path, bucket, key, region, acl, endpoint_url)
    print(json.dumps(result, indent=2))

    if not result["success"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
