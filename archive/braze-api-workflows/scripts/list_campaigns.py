#!/usr/bin/env python3
"""List Braze campaigns using the public campaigns/list endpoint."""

from __future__ import annotations

import argparse

from braze_api import add_profile_argument, configure_profile, print_json, request_json


def main() -> None:
    parser = argparse.ArgumentParser(description="List Braze campaigns.")
    add_profile_argument(parser)
    parser.add_argument("--page", type=int, default=0, help="Page number.")
    parser.add_argument(
        "--include-archived",
        action="store_true",
        help="Include archived campaigns.",
    )
    parser.add_argument(
        "--sort-direction",
        choices=("asc", "desc"),
        default="desc",
        help="Sort by creation time.",
    )
    parser.add_argument(
        "--last-edit-time-gt",
        help="Filter to campaigns edited after an ISO 8601 timestamp.",
    )
    args = parser.parse_args()
    configure_profile(args.profile)

    result = request_json(
        "GET",
        "/campaigns/list",
        query={
            "page": args.page,
            "include_archived": str(args.include_archived).lower(),
            "sort_direction": args.sort_direction,
            "last_edit.time[gt]": args.last_edit_time_gt,
        },
    )
    print_json(result)


if __name__ == "__main__":
    main()
