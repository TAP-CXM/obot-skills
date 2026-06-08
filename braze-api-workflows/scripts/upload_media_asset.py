#!/usr/bin/env python3
"""Upload an asset file to the Braze media library."""

from __future__ import annotations

import argparse
from pathlib import Path

from braze_api import add_profile_argument, configure_profile, print_json, request_multipart


MAX_IMAGE_BYTES = 5 * 1024 * 1024


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload a file to the Braze media library.")
    add_profile_argument(parser)
    parser.add_argument("--file", required=True, help="Path to the local asset file.")
    parser.add_argument(
        "--name",
        help="Optional media library name. Defaults to the source filename.",
    )
    args = parser.parse_args()

    configure_profile(args.profile)
    file_path = Path(args.file).resolve()
    if not file_path.exists():
        raise SystemExit(f"Asset file not found: {file_path}")
    if file_path.stat().st_size > MAX_IMAGE_BYTES:
        raise SystemExit(
            f"Asset exceeds Braze's 5 MB image limit: {file_path.stat().st_size} bytes"
        )

    result = request_multipart(
        "/media_library/create",
        fields={"name": args.name or file_path.name},
        files=[("asset_file", file_path)],
    )
    print_json(result)


if __name__ == "__main__":
    main()
