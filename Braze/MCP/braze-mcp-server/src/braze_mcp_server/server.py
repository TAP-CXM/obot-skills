from __future__ import annotations

import json
import os
from typing import Any, Literal
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from mcp.server.fastmcp import FastMCP


mcp = FastMCP("braze-mcp-server")


JsonObject = dict[str, Any]


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise ValueError(f"Missing required environment variable: {name}")
    return value


def _rest_endpoint() -> str:
    return _require_env("BRAZE_REST_ENDPOINT").rstrip("/")


def _api_key() -> str:
    return _require_env("BRAZE_API_KEY")


def _allow_generic_request() -> bool:
    return os.environ.get("BRAZE_ALLOW_GENERIC_REQUEST") == "true"


def _clean_query(query: JsonObject | None) -> JsonObject:
    return {
        key: value
        for key, value in (query or {}).items()
        if value is not None and value != ""
    }


def _clean_value(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: cleaned
            for key, child in value.items()
            if (cleaned := _clean_value(child)) is not None
        }
    if isinstance(value, list):
        return [cleaned for child in value if (cleaned := _clean_value(child)) is not None]
    if value == "":
        return None
    return value


def _clean_body(body: Any | None) -> Any | None:
    return _clean_value(body)


def _build_url(path: str, query: JsonObject | None = None) -> str:
    normalized_path = path if path.startswith("/") else f"/{path}"
    url = f"{_rest_endpoint()}{normalized_path}"
    filtered = _clean_query(query)
    if filtered:
        url = f"{url}?{urlencode(filtered, doseq=True)}"
    return url


def _require_confirmation(confirmed: bool, reason: str) -> None:
    if not confirmed:
        raise ValueError(f"{reason} Re-run with confirmed=true after human approval.")


def _require_non_empty(value: str | None, name: str) -> str:
    cleaned = (value or "").strip()
    if not cleaned:
        raise ValueError(f"Missing required value: {name}.")
    return cleaned


def _email_alias(email: str, alias_label: str = "email") -> JsonObject:
    cleaned_email = _require_non_empty(email, "email").lower()
    return {
        "alias_name": cleaned_email,
        "alias_label": _require_non_empty(alias_label, "alias_label"),
    }


def _default_app_id(app_id: str | None) -> str:
    return _require_non_empty(app_id or os.environ.get("BRAZE_DEFAULT_APP_ID"), "app_id")


def _default_email_from(from_email: str | None) -> str:
    return _require_non_empty(
        from_email or os.environ.get("BRAZE_DEFAULT_EMAIL_FROM"),
        "from_email. Provide a Braze-approved sender such as 'Team <team@example.com>' or configure BRAZE_DEFAULT_EMAIL_FROM.",
    )


def _braze_request(
    method: str,
    path: str,
    *,
    query: JsonObject | None = None,
    body: Any | None = None,
) -> Any:
    headers = {
        "Authorization": f"Bearer {_api_key()}",
        "Accept": "application/json",
    }
    data = None
    cleaned_body = _clean_body(body)
    if cleaned_body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(cleaned_body).encode("utf-8")

    request = Request(
        _build_url(path, query),
        data=data,
        headers=headers,
        method=method.upper(),
    )

    try:
        with urlopen(request, timeout=60) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise ValueError(f"Braze API {exc.code}: {detail}") from exc
    except URLError as exc:
        raise ValueError(f"Braze API request failed: {exc.reason}") from exc

    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


@mcp.tool()
def braze_health() -> JsonObject:
    """Check MCP server configuration without exposing secrets."""
    return {
        "ok": True,
        "server": "braze-mcp-server",
        "version": "0.3.2",
        "rest_endpoint_configured": bool(os.environ.get("BRAZE_REST_ENDPOINT")),
        "api_key_configured": bool(os.environ.get("BRAZE_API_KEY")),
        "default_app_id_configured": bool(os.environ.get("BRAZE_DEFAULT_APP_ID")),
        "generic_request_enabled": _allow_generic_request(),
    }


@mcp.tool()
def braze_request(
    method: Literal["GET", "POST", "PUT", "PATCH", "DELETE"],
    path: str,
    query: JsonObject | None = None,
    body: Any | None = None,
    confirmed: bool = False,
) -> Any:
    """Make a generic Braze REST request when explicitly enabled on the MCP host."""
    if not _allow_generic_request():
        raise ValueError(
            "Generic Braze requests are disabled. Use named tools or set BRAZE_ALLOW_GENERIC_REQUEST=true."
        )
    if method in {"POST", "PUT", "PATCH", "DELETE"}:
        _require_confirmation(confirmed, "Generic mutating Braze requests are high risk.")
    return _braze_request(method, path, query=query, body=body)


@mcp.tool()
def braze_list_campaigns(
    page: int | None = None,
    include_archived: bool | None = None,
    sort_direction: Literal["asc", "desc"] | None = None,
    modified_after: str | None = None,
) -> Any:
    """List Braze campaigns, optionally filtered by modified_after."""
    return _braze_request(
        "GET",
        "/campaigns/list",
        query={
            "page": page,
            "include_archived": include_archived,
            "sort_direction": sort_direction,
            "modified_after": modified_after,
        },
    )


@mcp.tool()
def braze_get_campaign_details(
    campaign_id: str,
    post_launch_draft_version: bool | None = None,
) -> Any:
    """Get metadata and message details for a campaign."""
    return _braze_request(
        "GET",
        "/campaigns/details",
        query={
            "campaign_id": campaign_id,
            "post_launch_draft_version": post_launch_draft_version,
        },
    )


@mcp.tool()
def braze_get_campaign_analytics(
    campaign_id: str,
    length: int,
    ending_at: str | None = None,
) -> Any:
    """Get campaign time-series analytics from /campaigns/data_series."""
    return _braze_request(
        "GET",
        "/campaigns/data_series",
        query={"campaign_id": campaign_id, "length": length, "ending_at": ending_at},
    )


def _metric_total(value: Any, keys: set[str]) -> float:
    if isinstance(value, dict):
        total = 0.0
        for key, child in value.items():
            if key.lower() in keys and isinstance(child, (int, float)) and not isinstance(child, bool):
                total += float(child)
            total += _metric_total(child, keys)
        return total
    if isinstance(value, list):
        return sum(_metric_total(item, keys) for item in value)
    return 0.0


def _campaign_score(payload: Any, metric: str) -> JsonObject:
    metric_keys = {
        "sends": {"sent", "sends", "delivered"},
        "opens": {"opens", "unique_opens"},
        "clicks": {"clicks", "unique_clicks"},
        "conversions": {"conversions", "conversions1", "conversion"},
    }
    totals = {name: _metric_total(payload, keys) for name, keys in metric_keys.items()}
    if metric == "open_rate":
        score = totals["opens"] / totals["sends"] if totals["sends"] else None
    elif metric == "click_rate":
        score = totals["clicks"] / totals["sends"] if totals["sends"] else None
    elif metric == "conversion_rate":
        score = totals["conversions"] / totals["sends"] if totals["sends"] else None
    else:
        score = totals[metric]
    return {"score": score, **totals}


@mcp.tool()
def braze_rank_campaigns_by_performance(
    metric: Literal["open_rate", "click_rate", "conversion_rate", "opens", "clicks", "conversions", "sends"] = "open_rate",
    length: int = 30,
    ending_at: str | None = None,
    page: int | None = None,
    include_archived: bool | None = None,
    sort_direction: Literal["asc", "desc"] | None = None,
    modified_after: str | None = None,
    limit: int = 1,
) -> JsonObject:
    """Rank campaigns by performance; use for best performing campaign. Defaults to open_rate."""
    campaign_response = braze_list_campaigns(
        page=page,
        include_archived=include_archived,
        sort_direction=sort_direction,
        modified_after=modified_after,
    )
    campaigns = campaign_response.get("campaigns") if isinstance(campaign_response, dict) else None
    if not isinstance(campaigns, list):
        campaigns = []

    rows: list[JsonObject] = []
    for campaign in campaigns:
        if not isinstance(campaign, dict) or not campaign.get("id"):
            continue
        campaign_id = str(campaign["id"])
        row: JsonObject = {
            "id": campaign_id,
            "name": campaign.get("name") or campaign_id,
            "is_api_campaign": campaign.get("is_api_campaign"),
            "last_edited": campaign.get("last_edited"),
            "metric": metric,
        }
        try:
            analytics = braze_get_campaign_analytics(
                campaign_id=campaign_id,
                length=length,
                ending_at=ending_at,
            )
            row.update(_campaign_score(analytics, metric))
        except Exception as exc:
            row.update({"score": None, "error": str(exc)})
        rows.append(row)

    rows.sort(
        key=lambda item: item["score"] if isinstance(item.get("score"), (int, float)) else -1,
        reverse=True,
    )
    max_results = max(1, limit)
    ranked = rows[:max_results]
    return {
        "metric": metric,
        "default_metric_used": metric == "open_rate",
        "length": length,
        "campaigns": ranked,
        "best_campaign": ranked[0] if ranked else None,
        "total_campaigns_checked": len(rows),
        "message": "success",
    }


@mcp.tool()
def braze_list_segments(
    page: int | None = None,
    sort_direction: Literal["asc", "desc"] | None = None,
) -> Any:
    """List Braze segments and their Segment API identifiers."""
    return _braze_request(
        "GET",
        "/segments/list",
        query={"page": page, "sort_direction": sort_direction},
    )


@mcp.tool()
def braze_get_segment_details(segment_id: str) -> Any:
    """Get metadata and filter description for a Braze segment."""
    return _braze_request(
        "GET",
        "/segments/details",
        query={"segment_id": segment_id},
    )


@mcp.tool()
def braze_get_segment_analytics(
    segment_id: str,
    length: int,
    ending_at: str | None = None,
) -> Any:
    """Get segment size time-series analytics from /segments/data_series."""
    return _braze_request(
        "GET",
        "/segments/data_series",
        query={"segment_id": segment_id, "length": length, "ending_at": ending_at},
    )


def _latest_segment_size(payload: Any) -> JsonObject:
    rows = payload.get("data") if isinstance(payload, dict) else None
    if not isinstance(rows, list):
        rows = []

    latest: JsonObject = {}
    for row in rows:
        if isinstance(row, dict) and row.get("size") is not None:
            latest = row

    return {
        "size": latest.get("size"),
        "time": latest.get("time"),
    }


def _normalized_words(value: str | None) -> set[str]:
    stop_words = {
        "a",
        "all",
        "an",
        "are",
        "braze",
        "called",
        "count",
        "do",
        "does",
        "filter",
        "first",
        "have",
        "has",
        "how",
        "in",
        "last",
        "many",
        "name",
        "named",
        "number",
        "of",
        "the",
        "there",
        "total",
        "user",
        "users",
        "with",
    }
    raw_words = "".join(character.lower() if character.isalnum() else " " for character in (value or ""))
    return {word for word in raw_words.split() if word and word not in stop_words}


def _segment_name(segment: JsonObject) -> str:
    return str(segment.get("name") or segment.get("id") or "")


def _looks_like_total_user_count(query: str | None, segment_name: str | None) -> bool:
    text = f"{query or ''} {segment_name or ''}".lower()
    return (
        "all users" in text
        or "total users" in text
        or "how many users" in text
        or "users are in braze" in text
    )


def _matching_segments(
    segments: list[JsonObject],
    *,
    segment_id: str | None,
    segment_name: str | None,
    query: str | None,
) -> list[JsonObject]:
    if segment_id:
        return [segment for segment in segments if str(segment.get("id")) == segment_id]

    if _looks_like_total_user_count(query, segment_name):
        all_user_matches = [
            segment
            for segment in segments
            if "all users" in _segment_name(segment).lower()
        ]
        if all_user_matches:
            return all_user_matches

    requested_name = (segment_name or "").strip().lower()
    if requested_name:
        exact = [segment for segment in segments if _segment_name(segment).lower() == requested_name]
        if exact:
            return exact
        contains = [segment for segment in segments if requested_name in _segment_name(segment).lower()]
        if contains:
            return contains

    query_words = _normalized_words(query)
    if not query_words:
        return []

    scored: list[tuple[int, JsonObject]] = []
    for segment in segments:
        name_words = _normalized_words(_segment_name(segment))
        score = len(query_words & name_words)
        if score:
            scored.append((score, segment))

    scored.sort(key=lambda item: item[0], reverse=True)
    best_score = scored[0][0] if scored else 0
    return [segment for score, segment in scored if score == best_score]


@mcp.tool()
def braze_list_segment_sizes(
    length: int = 1,
    page: int | None = None,
    sort_direction: Literal["asc", "desc"] | None = None,
    ending_at: str | None = None,
    max_segments: int = 50,
) -> JsonObject:
    """List Braze segments/audiences with latest sizes; use for largest segment or audience-size inventory."""
    segment_response = braze_list_segments(page=page, sort_direction=sort_direction)
    segments = segment_response.get("segments") if isinstance(segment_response, dict) else None
    if not isinstance(segments, list):
        segments = []

    rows: list[JsonObject] = []
    for segment in segments[: max(0, max_segments)]:
        if not isinstance(segment, dict) or not segment.get("id"):
            continue
        segment_id = str(segment["id"])
        row: JsonObject = {
            "id": segment_id,
            "name": segment.get("name") or segment_id,
            "analytics_tracking_enabled": segment.get("analytics_tracking_enabled"),
        }
        try:
            analytics = braze_get_segment_analytics(
                segment_id=segment_id,
                length=length,
                ending_at=ending_at,
            )
            latest = _latest_segment_size(analytics)
            row.update(latest)
        except Exception as exc:
            row.update({"size": None, "time": None, "error": str(exc)})
        rows.append(row)

    rows.sort(
        key=lambda item: item["size"] if isinstance(item.get("size"), (int, float)) else -1,
        reverse=True,
    )
    return {
        "audiences": rows,
        "largest": rows[0] if rows else None,
        "total_audiences_checked": len(rows),
        "truncated": len(segments) > len(rows),
        "message": "success",
    }


@mcp.tool()
def braze_count_users(
    query: str | None = None,
    segment_id: str | None = None,
    segment_name: str | None = None,
    length: int = 1,
    ending_at: str | None = None,
    max_segments: int = 50,
) -> JsonObject:
    """Count users through saved Braze segment analytics; use for total users or saved-segment filters."""
    segment_response = braze_list_segments(sort_direction="asc")
    segments = segment_response.get("segments") if isinstance(segment_response, dict) else None
    if not isinstance(segments, list):
        segments = []

    limited_segments = [
        segment for segment in segments[: max(0, max_segments)] if isinstance(segment, dict)
    ]
    matches = _matching_segments(
        limited_segments,
        segment_id=segment_id,
        segment_name=segment_name,
        query=query,
    )

    if not matches:
        return {
            "count": None,
            "matched_segments": [],
            "unsupported_filter": bool(query or segment_name),
            "message": (
                "No saved Braze segment matched this count request. Braze user counts are available "
                "through segment analytics, so create or provide a saved segment for ad hoc filters "
                "such as name, custom attribute, or event conditions."
            ),
            "total_segments_checked": len(limited_segments),
            "truncated": len(segments) > len(limited_segments),
        }

    rows: list[JsonObject] = []
    for segment in matches:
        current_segment_id = str(segment.get("id"))
        row: JsonObject = {
            "id": current_segment_id,
            "name": _segment_name(segment),
            "analytics_tracking_enabled": segment.get("analytics_tracking_enabled"),
        }
        try:
            analytics = braze_get_segment_analytics(
                segment_id=current_segment_id,
                length=length,
                ending_at=ending_at,
            )
            row.update(_latest_segment_size(analytics))
        except Exception as exc:
            row.update({"size": None, "time": None, "error": str(exc)})
        rows.append(row)

    numeric_sizes = [row["size"] for row in rows if isinstance(row.get("size"), (int, float))]
    count = sum(numeric_sizes) if numeric_sizes else None
    multiple_matches = len(rows) > 1
    return {
        "count": count,
        "count_source": "saved_segment_analytics",
        "count_is_sum_of_matched_segments": multiple_matches,
        "caveat": (
            "Multiple saved segments matched; the count is the sum of segment sizes and may double-count "
            "users who belong to more than one matched segment."
            if multiple_matches
            else None
        ),
        "matched_segments": rows,
        "total_segments_checked": len(limited_segments),
        "truncated": len(segments) > len(limited_segments),
        "message": "success",
    }


@mcp.tool()
def braze_export_users_by_segment(
    segment_id: str,
    fields_to_export: list[str],
    callback_endpoint: str | None = None,
    custom_attributes_to_export: list[str] | None = None,
    output_format: Literal["zip", "gzip"] | None = None,
    confirmed: bool = False,
) -> Any:
    """Export users in a segment. High-risk because it may expose personal data."""
    _require_confirmation(
        confirmed,
        "Exporting users by segment can expose personal data and may generate downloadable files.",
    )
    return _braze_request(
        "POST",
        "/users/export/segment",
        body={
            "segment_id": segment_id,
            "callback_endpoint": callback_endpoint,
            "fields_to_export": fields_to_export,
            "custom_attributes_to_export": custom_attributes_to_export,
            "output_format": output_format,
        },
    )


@mcp.tool()
def braze_export_users_by_identifier(
    external_ids: list[str] | None = None,
    user_aliases: list[JsonObject] | None = None,
    device_id: str | None = None,
    email_address: str | None = None,
    phone: str | None = None,
    fields_to_export: list[str] | None = None,
    confirmed: bool = False,
) -> Any:
    """Export user profiles by identifier. High-risk because it can expose personal data."""
    _require_confirmation(
        confirmed,
        "Exporting user profiles by identifier can expose personal data.",
    )
    return _braze_request(
        "POST",
        "/users/export/ids",
        body={
            "external_ids": external_ids,
            "user_aliases": user_aliases,
            "device_id": device_id,
            "email_address": email_address,
            "phone": phone,
            "fields_to_export": fields_to_export,
        },
    )


@mcp.tool()
def braze_list_canvases(
    page: int | None = None,
    include_archived: bool | None = None,
    sort_direction: Literal["asc", "desc"] | None = None,
) -> Any:
    """List Braze Canvases and their Canvas API identifiers."""
    return _braze_request(
        "GET",
        "/canvas/list",
        query={
            "page": page,
            "include_archived": include_archived,
            "sort_direction": sort_direction,
        },
    )


@mcp.tool()
def braze_get_canvas_details(canvas_id: str) -> Any:
    """Get metadata for a Braze Canvas."""
    return _braze_request(
        "GET",
        "/canvas/details",
        query={"canvas_id": canvas_id},
    )


@mcp.tool()
def braze_get_canvas_analytics(
    canvas_id: str,
    length: int,
    ending_at: str | None = None,
) -> Any:
    """Get Canvas time-series analytics from /canvas/data_series."""
    return _braze_request(
        "GET",
        "/canvas/data_series",
        query={"canvas_id": canvas_id, "length": length, "ending_at": ending_at},
    )


@mcp.tool()
def braze_get_canvas_data_summary(
    canvas_id: str,
    length: int,
    ending_at: str | None = None,
) -> Any:
    """Get Canvas rollup analytics from /canvas/data_summary."""
    return _braze_request(
        "GET",
        "/canvas/data_summary",
        query={"canvas_id": canvas_id, "length": length, "ending_at": ending_at},
    )


@mcp.tool()
def braze_duplicate_canvas(
    canvas_id: str,
    name: str,
    description: str | None = None,
    tag_names: list[str] | None = None,
    confirmed: bool = False,
) -> Any:
    """Duplicate a Braze Canvas. Requires confirmed=true."""
    _require_confirmation(confirmed, "Duplicating a Braze Canvas changes the Braze workspace.")
    return _braze_request(
        "POST",
        "/canvas/duplicate",
        body={
            "canvas_id": canvas_id,
            "name": name,
            "description": description,
            "tag_names": tag_names,
        },
    )


@mcp.tool()
def braze_duplicate_campaign(campaign_id: str, name: str, confirmed: bool = False) -> Any:
    """Duplicate an existing Braze campaign. Requires confirmed=true."""
    _require_confirmation(confirmed, "Duplicating a Braze campaign changes the Braze workspace.")
    return _braze_request(
        "POST",
        "/campaigns/duplicate",
        body={"campaign_id": campaign_id, "name": name},
    )


@mcp.tool()
def braze_trigger_campaign(
    campaign_id: str,
    recipients: list[JsonObject] | None = None,
    broadcast: bool | None = None,
    trigger_properties: JsonObject | None = None,
    schedule: JsonObject | None = None,
    confirmed: bool = False,
) -> Any:
    """Trigger a dashboard-configured API campaign. Requires confirmed=true."""
    _require_confirmation(confirmed, "Triggering a Braze campaign can message users.")
    return _braze_request(
        "POST",
        "/campaigns/trigger/send",
        body={
            "campaign_id": campaign_id,
            "recipients": recipients,
            "broadcast": broadcast,
            "trigger_properties": trigger_properties,
            "schedule": schedule,
        },
    )


@mcp.tool()
def braze_send_messages(
    messages: JsonObject,
    external_user_ids: list[str] | None = None,
    user_aliases: list[JsonObject] | None = None,
    recipients: list[JsonObject] | None = None,
    audience: JsonObject | None = None,
    broadcast: bool | None = None,
    segment_id: str | None = None,
    campaign_id: str | None = None,
    send_id: str | None = None,
    override_frequency_capping: bool | None = None,
    recipient_subscription_state: Literal["opted_in", "subscribed", "all"] | None = None,
    confirmed: bool = False,
) -> Any:
    """Send API-defined Braze messages with /messages/send. Requires confirmed=true."""
    _require_confirmation(confirmed, "Sending Braze messages can message users.")
    return _braze_request(
        "POST",
        "/messages/send",
        body={
            "messages": messages,
            "external_user_ids": external_user_ids,
            "user_aliases": user_aliases,
            "recipients": recipients,
            "audience": audience,
            "broadcast": broadcast,
            "segment_id": segment_id,
            "campaign_id": campaign_id,
            "send_id": send_id,
            "override_frequency_capping": override_frequency_capping,
            "recipient_subscription_state": recipient_subscription_state,
        },
    )


@mcp.tool()
def braze_send_proof_email(
    to_email: str,
    subject: str,
    body: str,
    from_email: str | None = None,
    app_id: str | None = None,
    plaintext_body: str | None = None,
    preheader: str | None = None,
    reply_to: str | None = None,
    campaign_id: str | None = None,
    message_variation_id: str | None = None,
    send_id: str | None = None,
    alias_label: str = "email",
    create_user_first: bool = True,
    recipient_subscription_state: Literal["opted_in", "subscribed", "all"] = "all",
    confirmed: bool = False,
) -> JsonObject:
    """Send an API-only proof email to an email alias, creating the alias-only user first if needed."""
    _require_confirmation(confirmed, "Sending a Braze proof email can message a user.")
    recipient_alias = _email_alias(to_email, alias_label)
    create_result: Any | None = None
    if create_user_first:
        create_result = braze_create_user(
            email=to_email,
            user_alias=recipient_alias,
            confirmed=True,
        )

    email_message: JsonObject = {
        "app_id": _default_app_id(app_id),
        "from": _default_email_from(from_email),
        "subject": _require_non_empty(subject, "subject"),
        "body": _require_non_empty(body, "body"),
        "plaintext_body": plaintext_body,
        "preheader": preheader,
        "reply_to": reply_to,
    }
    if message_variation_id:
        email_message["message_variation_id"] = message_variation_id

    send_result = braze_send_messages(
        messages={"email": email_message},
        user_aliases=[recipient_alias],
        campaign_id=campaign_id,
        send_id=send_id,
        recipient_subscription_state=recipient_subscription_state,
        confirmed=True,
    )
    return {
        "message": "success",
        "to_email": to_email,
        "user_alias": recipient_alias,
        "created_or_updated_user_first": create_user_first,
        "create_result": create_result,
        "send_result": send_result,
        "caveat": (
            "Braze notes that /users/track processing is asynchronous. If this was a brand-new user, "
            "an immediate API-only send can race profile creation; retry after propagation or use an "
            "API-triggered campaign/Canvas for guaranteed create-and-send behavior."
            if create_user_first
            else None
        ),
    }


@mcp.tool()
def braze_users_track(
    attributes: list[JsonObject] | None = None,
    events: list[JsonObject] | None = None,
    purchases: list[JsonObject] | None = None,
    partner: str | None = None,
    confirmed: bool = False,
) -> Any:
    """Write user attributes, events, and purchases through /users/track."""
    _require_confirmation(confirmed, "Braze /users/track mutates user profiles and events.")
    return _braze_request(
        "POST",
        "/users/track",
        body={
            "attributes": attributes,
            "events": events,
            "purchases": purchases,
            "partner": partner,
        },
    )


@mcp.tool()
def braze_create_user(
    email: str,
    external_id: str | None = None,
    user_alias: JsonObject | None = None,
    alias_label: str = "email",
    attributes: JsonObject | None = None,
    confirmed: bool = False,
) -> Any:
    """Create or update a Braze user profile by email, using an alias when no external_id is provided."""
    _require_confirmation(confirmed, "Creating or updating a Braze user mutates user profile data.")
    cleaned_email = _require_non_empty(email, "email")
    attribute: JsonObject = {
        **(attributes or {}),
        "email": cleaned_email,
    }
    if external_id:
        attribute["external_id"] = external_id
    else:
        attribute["_update_existing_only"] = False
        attribute["user_alias"] = user_alias or _email_alias(cleaned_email, alias_label)

    return braze_users_track(attributes=[attribute], confirmed=True)


@mcp.tool()
def braze_list_email_templates(
    modified_after: str | None = None,
    modified_before: str | None = None,
    limit: int | None = None,
    offset: int | None = None,
) -> Any:
    """List email templates from Braze."""
    return _braze_request(
        "GET",
        "/templates/email/list",
        query={
            "modified_after": modified_after,
            "modified_before": modified_before,
            "limit": limit,
            "offset": offset,
        },
    )


@mcp.tool()
def braze_list_custom_events(page: int | None = None) -> Any:
    """List custom event names recorded for the workspace."""
    return _braze_request("GET", "/events/list", query={"page": page})


@mcp.tool()
def braze_list_custom_attributes(cursor: str | None = None) -> Any:
    """List custom attributes recorded for the workspace."""
    return _braze_request("GET", "/custom_attributes", query={"cursor": cursor})


@mcp.tool()
def braze_get_subscription_group_status(
    subscription_group_id: str,
    external_id: str | None = None,
    email: str | None = None,
    phone: str | None = None,
) -> Any:
    """Get a user's status in a specific subscription group."""
    return _braze_request(
        "GET",
        "/subscription/status/get",
        query={
            "subscription_group_id": subscription_group_id,
            "external_id": external_id,
            "email": email,
            "phone": phone,
        },
    )


@mcp.tool()
def braze_list_user_subscription_groups(
    external_id: str | None = None,
    email: str | None = None,
    phone: str | None = None,
) -> Any:
    """List subscription groups and history for a user."""
    return _braze_request(
        "GET",
        "/subscription/user/status",
        query={"external_id": external_id, "email": email, "phone": phone},
    )


@mcp.tool()
def braze_update_subscription_group_status(
    subscription_group_id: str,
    subscription_state: Literal["subscribed", "unsubscribed"],
    external_id: list[str] | None = None,
    email: list[str] | None = None,
    phone: list[str] | None = None,
    confirmed: bool = False,
) -> Any:
    """Update subscription group status for up to 50 users. Requires confirmed=true."""
    _require_confirmation(
        confirmed,
        "Updating subscription group status changes consent or preference state.",
    )
    return _braze_request(
        "POST",
        "/subscription/status/set",
        body={
            "subscription_group_id": subscription_group_id,
            "subscription_state": subscription_state,
            "external_id": external_id,
            "email": email,
            "phone": phone,
        },
    )


@mcp.tool()
def braze_list_catalogs() -> Any:
    """List Braze catalogs."""
    return _braze_request("GET", "/catalogs")


@mcp.tool()
def braze_list_catalog_items(
    catalog_name: str,
    cursor: str | None = None,
) -> Any:
    """List multiple item details for a Braze catalog."""
    safe_catalog = quote(catalog_name, safe="")
    return _braze_request(
        "GET",
        f"/catalogs/{safe_catalog}/items",
        query={"cursor": cursor},
    )


@mcp.tool()
def braze_get_catalog_item(catalog_name: str, item_id: str) -> Any:
    """Get one Braze catalog item by catalog name and item ID."""
    safe_catalog = quote(catalog_name, safe="")
    safe_item = quote(item_id, safe="")
    return _braze_request("GET", f"/catalogs/{safe_catalog}/items/{safe_item}")


@mcp.tool()
def braze_create_email_template(
    template_name: str,
    subject: str,
    body: str,
    sender: str | None = None,
    reply_to: str | None = None,
    preheader: str | None = None,
    tags: list[str] | None = None,
    confirmed: bool = False,
) -> Any:
    """Create a Braze email template. Requires confirmed=true."""
    _require_confirmation(confirmed, "Creating a Braze email template changes the Braze workspace.")
    return _braze_request(
        "POST",
        "/templates/email/create",
        body={
            "template_name": template_name,
            "subject": subject,
            "body": body,
            "sender": sender,
            "reply_to": reply_to,
            "preheader": preheader,
            "tags": tags,
        },
    )


@mcp.tool()
def braze_list_scheduled_broadcasts(end_time: str) -> Any:
    """List scheduled campaign and Canvas broadcasts before end_time."""
    return _braze_request(
        "GET",
        "/messages/scheduled_broadcasts",
        query={"end_time": end_time},
    )


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
