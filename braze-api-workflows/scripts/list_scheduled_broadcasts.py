#!/usr/bin/env python3
"""List upcoming scheduled campaigns and canvases in Braze."""

from __future__ import annotations

import argparse

from braze_api import add_profile_argument, configure_profile, print_json, request_json


def main() -> None:
    parser = argparse.ArgumentParser(description="List Braze scheduled broadcasts.")
    add_profile_argument(parser)
    parser.add_argument(
        "--end-time",
        required=True,
        help="ISO 8601 end time for the scheduled broadcast query window.",
    )
    args = parser.parse_args()

    configure_profile(args.profile)
    result = request_json(
        "GET",
        "/messages/scheduled_broadcasts",
        query={"end_time": args.end_time},
    )
    print_json(result)


if __name__ == "__main__":
    main()
