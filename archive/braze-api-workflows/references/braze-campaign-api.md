# Braze Campaign API Reference

## Summary

Use this reference when Codex needs the public Braze campaign endpoints that were verified from current Braze docs.

Publicly documented operations covered by this skill:

- `GET /campaigns/list`
- `POST /campaigns/duplicate`
- `POST /campaigns/trigger/send`
- `POST /campaigns/trigger/schedule/create`

Important constraint:

- The Braze docs reviewed for this skill did not expose a general REST endpoint for creating a brand-new dashboard campaign from scratch.
- When the user asks to create a campaign, prefer duplicating an existing template campaign or preparing a dashboard build brief.

## Authentication

Use:

```http
Authorization: Bearer YOUR_REST_API_KEY
Content-Type: application/json
```

Base URL pattern:

```text
https://rest.REGION.braze.com
```

The scripts in this skill expect:

- `BRAZE_REST_ENDPOINT`
- `BRAZE_API_KEY`

They can also load a named profile from `profiles.json` using `--profile` or `BRAZE_PROFILE`.

## Endpoint Notes

### `GET /campaigns/list`

Use to discover campaign IDs and verify whether a campaign is an API campaign.

Useful query params:

- `page`
- `include_archived`
- `sort_direction`
- `last_edit.time[gt]`

### `POST /campaigns/duplicate`

Use to create a new campaign from an existing template.

Required body fields:

- `campaign_id`
- `name`

Optional:

- `description`
- `tag_names`

The response is asynchronous. Treat this as a creation-via-template operation, not a generic create-from-scratch endpoint.

### `POST /campaigns/trigger/send`

Use for immediate API-triggered sends of a dashboard-configured campaign.

Common body fields:

- `campaign_id`
- `send_id`
- `recipients`
- `trigger_properties`
- `broadcast`
- `audience`

Important:

- The content is defined in Braze, not in this request.
- `broadcast: true` can send to a much larger audience than intended.

### `POST /campaigns/trigger/schedule/create`

Use to schedule a future API-triggered send for a dashboard campaign.

Adds required:

- `schedule`

Typical schedule fields:

- `time`
- `in_local_time`
- `at_optimal_time`

## Recommended Codex Behavior

If the user says:

- "Create a Braze campaign"
  First determine whether they mean duplicate a template, trigger an existing API campaign, or prepare a brief for a human to build in Braze.
- "Send a Braze campaign"
  Prefer `/campaigns/trigger/send` after confirming the `campaign_id` and recipients.
- "Schedule a campaign"
  Prefer `/campaigns/trigger/schedule/create`.
- "Find the campaign ID"
  Use `/campaigns/list`.

## Minimal Payload Examples

### Duplicate a campaign

```json
{
  "campaign_id": "existing_campaign_id",
  "name": "Q3 Product Launch - Copy",
  "description": "Cloned from approved launch template"
}
```

### Trigger an API campaign

```json
{
  "campaign_id": "existing_campaign_id",
  "recipients": [
    {
      "external_user_id": "user-123"
    }
  ]
}
```

### Schedule an API campaign

```json
{
  "campaign_id": "existing_campaign_id",
  "recipients": [
    {
      "external_user_id": "user-123"
    }
  ],
  "schedule": {
    "time": "2026-05-12T09:00:00Z",
    "in_local_time": false,
    "at_optimal_time": false
  }
}
```
