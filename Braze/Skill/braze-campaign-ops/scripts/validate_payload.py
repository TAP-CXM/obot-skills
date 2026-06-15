#!/usr/bin/env python3
"""Validate local Braze payload JSON before MCP execution.

This script performs structural checks only. It never reads credentials and never
calls Braze.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON: {exc}") from exc


def require_object(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise SystemExit("Payload must be a JSON object.")
    return payload


def check_any_array(payload: dict[str, Any], keys: list[str]) -> list[str]:
    errors: list[str] = []
    if not any(key in payload for key in keys):
        errors.append(f"Payload must include at least one of: {', '.join(keys)}.")
    for key in keys:
        if key in payload and not isinstance(payload[key], list):
            errors.append(f"`{key}` must be an array when present.")
    return errors


def validate_users_track(payload: dict[str, Any]) -> list[str]:
    errors = check_any_array(payload, ["attributes", "events", "purchases"])
    for collection in ["attributes", "events", "purchases"]:
        for index, item in enumerate(payload.get(collection, []) or []):
            if not isinstance(item, dict):
                errors.append(f"`{collection}[{index}]` must be an object.")
                continue
            if not any(k in item for k in ["external_id", "user_alias", "braze_id", "email"]):
                errors.append(
                    f"`{collection}[{index}]` should include an identifier such as external_id, user_alias, braze_id, or email."
                )
    return errors


def validate_messages_send(payload: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if "messages" not in payload or not isinstance(payload["messages"], dict):
        errors.append("`messages` object is required.")
    if not any(key in payload for key in ["recipients", "audience", "broadcast"]):
        errors.append("Include one of `recipients`, `audience`, or `broadcast`.")
    if payload.get("broadcast") is True:
        errors.append("`broadcast: true` is high risk and requires explicit human approval.")
    if "recipients" in payload and not isinstance(payload["recipients"], list):
        errors.append("`recipients` must be an array when present.")
    return errors


def validate_trigger_campaign(payload: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if not payload.get("campaign_id"):
        errors.append("`campaign_id` is required.")
    if not any(key in payload for key in ["recipients", "audience", "broadcast"]):
        errors.append("Include one of `recipients`, `audience`, or `broadcast`.")
    if payload.get("broadcast") is True:
        errors.append("`broadcast: true` is high risk and requires explicit human approval.")
    if "recipients" in payload and not isinstance(payload["recipients"], list):
        errors.append("`recipients` must be an array when present.")
    return errors


VALIDATORS = {
    "users-track": validate_users_track,
    "messages-send": validate_messages_send,
    "trigger-campaign": validate_trigger_campaign,
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate local Braze payload JSON.")
    parser.add_argument("--kind", required=True, choices=sorted(VALIDATORS))
    parser.add_argument("--file", required=True, type=Path)
    args = parser.parse_args()

    payload = require_object(load_json(args.file))
    errors = VALIDATORS[args.kind](payload)
    result = {
        "ok": not errors,
        "kind": args.kind,
        "file": str(args.file),
        "errors": errors,
    }
    print(json.dumps(result, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
