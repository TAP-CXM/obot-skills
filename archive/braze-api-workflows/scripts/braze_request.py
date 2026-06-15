#!/usr/bin/env python3
"""Make a generic authenticated request to any Braze REST API path."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from braze_api import (
    add_profile_argument,
    configure_profile,
    parse_key_value_pairs,
    print_json,
    request,
)


def load_body(args: argparse.Namespace) -> Any:
    if args.body_file:
        return json.loads(Path(args.body_file).read_text(encoding="utf-8"))
    if args.body:
        return json.loads(args.body)
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description="Call any Braze REST API path.")
    add_profile_argument(parser)
    parser.add_argument("--method", required=True, help="HTTP method, for example GET or POST.")
    parser.add_argument("--path", required=True, help="Braze REST API path, such as /users/track.")
    parser.add_argument(
        "--query",
        action="append",
        default=[],
        help="Query parameter in key=value form. Repeat as needed.",
    )
    parser.add_argument(
        "--body-file",
        help="Path to a JSON body file.",
    )
    parser.add_argument(
        "--body",
        help="Inline JSON body string.",
    )
    args = parser.parse_args()

    if args.body and args.body_file:
        raise SystemExit("Use either --body or --body-file, not both.")

    configure_profile(args.profile)
    result = request(
        args.method,
        args.path,
        body=load_body(args),
        query=parse_key_value_pairs(args.query),
    )
    if isinstance(result, str):
        print(result)
        return
    print_json(result)


if __name__ == "__main__":
    main()
