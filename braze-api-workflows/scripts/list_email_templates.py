#!/usr/bin/env python3
"""List Braze email templates."""

from __future__ import annotations

import argparse

from braze_api import add_profile_argument, configure_profile, print_json, request_json


def main() -> None:
    parser = argparse.ArgumentParser(description="List Braze email templates.")
    add_profile_argument(parser)
    args = parser.parse_args()

    configure_profile(args.profile)
    result = request_json("GET", "/templates/email/list")
    print_json(result)


if __name__ == "__main__":
    main()
