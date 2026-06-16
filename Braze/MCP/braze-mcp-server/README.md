# Braze MCP Server

Python MCP server for governed Braze REST API access. This is intended to be launched by Obot with `uvx`.

## Obot / uvx

From this folder during local testing:

```bash
uvx --from . braze-mcp-server
```

Do not point Obot at an individual `.whl` file. Obot's Python runtime expects UVX package configuration. For this GitHub repo, use the Python package source and command.

Manual Obot setup:

1. Go to MCP Management -> MCP Servers -> Add MCP Server.
2. Choose Single User Server.
3. Select the UVX runtime.
4. Set Package to:

```text
git+https://github.com/TAP-CXM/obot-skills.git#subdirectory=Braze/MCP/braze-mcp-server
```

5. Set Command to:

```text
braze-mcp-server
```

For testing from this PR branch before it is merged, use:

```text
git+https://github.com/TAP-CXM/obot-skills.git@codex/add-braze-campaign-ops-mcp#subdirectory=Braze/MCP/braze-mcp-server
```

This corresponds to:

```bash
uvx --from 'git+https://github.com/TAP-CXM/obot-skills.git#subdirectory=Braze/MCP/braze-mcp-server' braze-mcp-server
```

## Obot Git Source

This repository includes `braze_mcp_server.yaml`, an Obot MCP catalog entry. After this branch is merged, an Obot administrator can add this repository under Admin -> MCP Servers -> Git Source URLs:

```text
https://github.com/TAP-CXM/obot-skills
```

For testing this PR branch as a Git source before merge, use:

```text
https://github.com/TAP-CXM/obot-skills/codex/add-braze-campaign-ops-mcp
```

The catalog entry uses UVX with:

- Package: `git+https://github.com/TAP-CXM/obot-skills.git#subdirectory=Braze/MCP/braze-mcp-server`
- Command: `braze-mcp-server`

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
- `braze_get_campaign_analytics`
- `braze_rank_campaigns_by_performance`
- `braze_list_segments`
- `braze_list_segment_sizes`
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
