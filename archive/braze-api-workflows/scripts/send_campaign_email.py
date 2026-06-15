#!/usr/bin/env python3
"""Send an email through Braze /messages/send tracked under a campaign."""

from __future__ import annotations

import argparse

from braze_api import add_profile_argument, configure_profile, print_json, request_json


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Send a Braze email tracked under a campaign and message variation.",
    )
    add_profile_argument(parser)
    parser.add_argument("--campaign-id", required=True, help="Braze campaign ID.")
    parser.add_argument("--external-user-id", required=True, help="Braze external user ID.")
    parser.add_argument("--app-id", required=True, help="Braze app ID for the email send.")
    parser.add_argument(
        "--message-variation-id",
        required=True,
        help="Braze email message variation ID, for example email-1730.",
    )
    parser.add_argument("--from-address", required=True, help="From header, for example Name <email@example.com>.")
    parser.add_argument("--subject", required=True, help="Email subject line.")
    parser.add_argument("--body-html", required=True, help="HTML email body.")
    args = parser.parse_args()

    configure_profile(args.profile)
    payload = {
        "campaign_id": args.campaign_id,
        "external_user_ids": [args.external_user_id],
        "messages": {
            "email": {
                "app_id": args.app_id,
                "message_variation_id": args.message_variation_id,
                "from": args.from_address,
                "subject": args.subject,
                "body": args.body_html,
            }
        },
    }
    result = request_json("POST", "/messages/send", body=payload)
    print_json(result)


if __name__ == "__main__":
    main()
