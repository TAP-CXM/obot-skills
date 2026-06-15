# Braze MCP Server

Python MCP server for governed Braze REST API access. This is intended to be launched by Obot with `uvx`.

## Obot / uvx

From this folder during local testing:

```bash
uvx --from . braze-mcp-server
```

In Obot, configure the MCP command as `uvx` with args similar to:

```text
--from
<path-or-git-url-to-this-folder>
braze-mcp-server
```

If you publish this package to a private index or Git repo, point `--from` at that package source.

## Configuration

Set secrets in Obot or the MCP host environment:

- `BRAZE_REST_ENDPOINT`
- `BRAZE_API_KEY`
- `BRAZE_DEFAULT_APP_ID` optional
- `BRAZE_ALLOW_GENERIC_REQUEST=true` only for trusted admin/debug environments

Do not store production API keys in skill folders or committed files.

## Tools

- `braze_health`
- `braze_request`
- `braze_list_campaigns`
- `braze_get_campaign_details`
- `braze_list_segments`
- `braze_get_segment_details`
- `braze_get_segment_analytics`
- `braze_export_users_by_segment`
- `braze_export_users_by_identifier`
- `braze_list_canvases`
- `braze_get_canvas_details`
- `braze_get_canvas_analytics`
- `braze_get_canvas_data_summary`
- `braze_duplicate_canvas`
- `braze_duplicate_campaign`
- `braze_trigger_campaign`
- `braze_send_messages`
- `braze_users_track`
- `braze_list_email_templates`
- `braze_create_email_template`
- `braze_list_scheduled_broadcasts`
- `braze_list_custom_events`
- `braze_list_custom_attributes`
- `braze_get_subscription_group_status`
- `braze_list_user_subscription_groups`
- `braze_update_subscription_group_status`
- `braze_list_catalogs`
- `braze_list_catalog_items`
- `braze_get_catalog_item`

High-risk tools require `confirmed: true`.
