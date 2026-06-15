#!/usr/bin/env python3
"""Create a Braze email template from a JSON payload file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from braze_api import add_profile_argument, configure_profile, print_json, request_json


def load_payload(path: str) -> dict:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise SystemExit("Payload file must contain a JSON object.")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a Braze email template.")
    add_profile_argument(parser)
    parser.add_argument(
        "--payload-file",
        required=True,
        help="Path to a JSON payload file for /templates/email/create.",
    )
    args = parser.parse_args()

    configure_profile(args.profile)
    result = request_json("POST", "/templates/email/create", body=load_payload(args.payload_file))
    print_json(result)


if __name__ == "__main__":
    main()
