#!/usr/bin/env python3
"""Duplicate a Braze campaign using the public campaigns/duplicate endpoint."""

from __future__ import annotations

import argparse

from braze_api import add_profile_argument, configure_profile, print_json, request_json


def main() -> None:
    parser = argparse.ArgumentParser(description="Duplicate a Braze campaign.")
    add_profile_argument(parser)
    parser.add_argument("--campaign-id", required=True, help="Source campaign ID.")
    parser.add_argument("--name", required=True, help="Name of the duplicated campaign.")
    parser.add_argument("--description", help="Optional description for the new campaign.")
    parser.add_argument(
        "--tag-names",
        help="Optional comma-separated tag list. These overwrite inherited tags.",
    )
    args = parser.parse_args()
    configure_profile(args.profile)

    body = {
        "campaign_id": args.campaign_id,
        "name": args.name,
    }
    if args.description:
        body["description"] = args.description
    if args.tag_names:
        body["tag_names"] = args.tag_names

    result = request_json("POST", "/campaigns/duplicate", body=body)
    print_json(result)


if __name__ == "__main__":
    main()
