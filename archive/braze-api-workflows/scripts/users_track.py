#!/usr/bin/env python3
"""Call Braze /users/track with a JSON payload file."""

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
    parser = argparse.ArgumentParser(description="Track users, events, purchases, or attributes in Braze.")
    add_profile_argument(parser)
    parser.add_argument(
        "--payload-file",
        required=True,
        help="Path to a JSON payload file for /users/track.",
    )
    args = parser.parse_args()

    configure_profile(args.profile)
    result = request_json("POST", "/users/track", body=load_payload(args.payload_file))
    print_json(result)


if __name__ == "__main__":
    main()
