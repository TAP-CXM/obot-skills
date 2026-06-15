#!/usr/bin/env python3
"""Shared Braze REST API helpers for the braze-campaigns skill."""

from __future__ import annotations

import json
import mimetypes
import os
from pathlib import Path
import uuid
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


def skill_root() -> Path:
    return Path(__file__).resolve().parent.parent


def profiles_path() -> Path:
    return skill_root() / "profiles.json"


def load_profiles() -> dict[str, dict[str, str]]:
    path = profiles_path()
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit("profiles.json must contain a JSON object.")
    return data


def use_profile(profile_name: str) -> dict[str, str]:
    profiles = load_profiles()
    profile = profiles.get(profile_name)
    if not profile:
        known = ", ".join(sorted(profiles)) or "none"
        raise SystemExit(
            f"Unknown Braze profile '{profile_name}'. Available profiles: {known}"
        )
    endpoint = str(profile.get("rest_endpoint", "")).strip()
    api_key = str(profile.get("api_key", "")).strip()
    if not endpoint or not api_key:
        raise SystemExit(
            f"Braze profile '{profile_name}' must define rest_endpoint and api_key."
        )
    os.environ["BRAZE_REST_ENDPOINT"] = endpoint
    os.environ["BRAZE_API_KEY"] = api_key
    return {"profile": profile_name, "rest_endpoint": endpoint}


def configure_profile(profile_name: str | None = None) -> dict[str, str] | None:
    selected = (profile_name or os.environ.get("BRAZE_PROFILE", "")).strip()
    if not selected:
        return None
    return use_profile(selected)


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def build_url(path: str, query: dict[str, Any] | None = None) -> str:
    base = require_env("BRAZE_REST_ENDPOINT").rstrip("/")
    if not path.startswith("/"):
        path = f"/{path}"
    url = f"{base}{path}"
    if query:
        filtered = {
            key: value
            for key, value in query.items()
            if value is not None and value != ""
        }
        if filtered:
            url = f"{url}?{urllib.parse.urlencode(filtered)}"
    return url


def request(method: str, path: str, body: Any = None, query: dict[str, Any] | None = None) -> Any:
    api_key = require_env("BRAZE_API_KEY")
    data = None
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(
        build_url(path, query=query),
        data=data,
        headers=headers,
        method=method.upper(),
    )
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Braze API request failed ({exc.code}): {detail}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Braze API request failed: {exc.reason}") from exc

    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def request_json(method: str, path: str, body: dict[str, Any] | None = None, query: dict[str, Any] | None = None) -> Any:
    return request(method, path, body=body, query=query)


def request_multipart(
    path: str,
    fields: dict[str, str],
    files: list[tuple[str, Path]],
) -> Any:
    api_key = require_env("BRAZE_API_KEY")
    boundary = f"----CodexBrazeBoundary{uuid.uuid4().hex}"
    chunks: list[bytes] = []

    for name, value in fields.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"),
                value.encode("utf-8"),
                b"\r\n",
            ]
        )

    for field_name, file_path in files:
        mime_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        file_bytes = file_path.read_bytes()
        chunks.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                (
                    f'Content-Disposition: form-data; name="{field_name}"; '
                    f'filename="{file_path.name}"\r\n'
                ).encode("utf-8"),
                f"Content-Type: {mime_type}\r\n\r\n".encode("utf-8"),
                file_bytes,
                b"\r\n",
            ]
        )

    chunks.append(f"--{boundary}--\r\n".encode("utf-8"))
    data = b"".join(chunks)
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    }
    request_obj = urllib.request.Request(
        build_url(path),
        data=data,
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request_obj) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Braze API request failed ({exc.code}): {detail}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Braze API request failed: {exc.reason}") from exc

    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def print_json(payload: Any) -> None:
    print(json.dumps(payload, indent=2, sort_keys=True))


def add_profile_argument(parser: Any) -> None:
    parser.add_argument(
        "--profile",
        help="Named Braze profile from profiles.json. Overrides BRAZE_PROFILE.",
    )


def parse_key_value_pairs(items: list[str] | None) -> dict[str, str]:
    pairs: dict[str, str] = {}
    for item in items or []:
        if "=" not in item:
            raise SystemExit(f"Expected key=value pair, got: {item}")
        key, value = item.split("=", 1)
        key = key.strip()
        if not key:
            raise SystemExit(f"Expected non-empty key in pair: {item}")
        pairs[key] = value
    return pairs
