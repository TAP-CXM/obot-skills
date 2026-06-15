# Braze REST API Overview

Use this reference as the first stop when a request goes beyond campaigns.
It is intentionally broad rather than exhaustive. When you need an exact payload or a less common endpoint, confirm the current Braze docs with Context7 before making a live call.

## Authentication

Use:

```http
Authorization: Bearer YOUR_REST_API_KEY
Content-Type: application/json
```

The scripts in this skill support either:

- a named profile from `profiles.json` via `--profile`
- or `BRAZE_REST_ENDPOINT` and `BRAZE_API_KEY`

## Core Operating Rule

Use `scripts/braze_request.py` for any Braze REST path, then prefer the narrower helper scripts only when they save time or add guardrails.

Current convenience wrappers:

- `scripts/users_track.py`
- `scripts/list_email_templates.py`
- `scripts/create_email_template.py`
- `scripts/send_messages.py`
- `scripts/send_campaign_email.py`
- `scripts/list_scheduled_broadcasts.py`
- `scripts/upload_media_asset.py`
- `scripts/list_campaigns.py`
- `scripts/duplicate_campaign.py`
- `scripts/trigger_campaign.py`

## Major API Families

### Messaging and campaigns

Representative endpoints:

- `POST /messages/send`
- `GET /messages/scheduled_broadcasts`
- `GET /campaigns/list`
- `POST /campaigns/duplicate`
- `POST /campaigns/trigger/send`
- `POST /campaigns/trigger/schedule/create`

Use this family for direct sends, scheduled broadcast discovery, campaign lookup, template cloning, and API-triggered campaign delivery.

### Users and identity

Representative endpoints:

- `POST /users/track`
- `DELETE /users/{user_id}`

Use this family for attribute updates, event logging, purchase logging, and profile deletion.

### Templates

Representative endpoints:

- `POST /templates/email/create`
- `GET /templates/email/info`
- `GET /templates/email/list`
- `POST /templates/email/update`

Use this family when the user wants reusable email content managed in Braze instead of ad hoc API message bodies.

### Subscription and preference management

Representative endpoints:

- `POST /subscription/status/set`
- `GET /preference_center/v1/list`

Use this family for email, SMS, or RCS subscription-state management and preference center discovery.

### Catalogs

Representative endpoints:

- `GET /catalogs/{catalog_name}/items/{item_id}`

Use this family for personalized content backed by catalog data. Confirm create, update, and bulk catalog operations in the current docs before calling them.

### Segments and audiences

Representative tasks:

- segment listing
- segment detail lookup
- connected audience targeting

Braze supports segment and audience operations in the REST API, but the exact endpoint mix evolves. Confirm the exact path and permissions in current docs before a live call if the endpoint is not already in this skill.

### Canvases

Representative tasks:

- scheduled Canvas discovery through `GET /messages/scheduled_broadcasts`
- Canvas list/detail/export workflows

Confirm the exact Canvas endpoint before using `braze_request.py` for non-scheduling tasks.

### Exports

Representative tasks:

- exporting campaign data
- exporting Canvas data
- exporting user, segment, KPI, and session data

The export area is broad. Use Context7 to confirm exact paths and request bodies, then call them with `scripts/braze_request.py`.

## Safe Workflow

1. Choose the smallest API family that matches the task.
2. If the endpoint is already documented in this skill, use it directly.
3. If not, confirm the endpoint in current Braze docs with Context7.
4. Draft the request body before executing when the action changes data or can message users.
5. Ask for confirmation before any live send, subscription change, delete, or bulk mutation.

## Generic Examples

### Track a user event

```bash
python scripts/braze_request.py --profile "TAP Sandbox" --method POST --path /users/track --body-file payload.json
```

Or:

```bash
python scripts/users_track.py --profile "TAP Sandbox" --payload-file payload.json
```

### List email templates

```bash
python scripts/braze_request.py --profile "TAP Sandbox" --method GET --path /templates/email/list
```

Or:

```bash
python scripts/list_email_templates.py --profile "TAP Sandbox"
```

### Send a tracked campaign email

```bash
python scripts/send_campaign_email.py --profile "TAP Sandbox" --campaign-id YOUR_CAMPAIGN_ID --external-user-id YOUR_EXTERNAL_USER_ID --app-id YOUR_APP_ID --message-variation-id YOUR_VARIATION_ID --from-address "Team <no-reply@example.com>" --subject "Hello from Braze" --body-html "<p>Hi there</p>"
```

### Get upcoming scheduled broadcasts

```bash
python scripts/braze_request.py --profile "TAP Sandbox" --method GET --path /messages/scheduled_broadcasts --query end_time=2026-05-20T00:00:00Z
```

Or:

```bash
python scripts/list_scheduled_broadcasts.py --profile "TAP Sandbox" --end-time 2026-05-20T00:00:00Z
```

### Upload a media asset

```bash
python scripts/upload_media_asset.py --profile "TAP Sandbox" --file "C:\path\to\image.gif"
```
