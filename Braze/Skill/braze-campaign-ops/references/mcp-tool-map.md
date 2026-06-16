# Braze MCP Tool Map

Use the smallest named MCP tool that matches the task. Avoid generic REST calls unless the MCP server has explicitly enabled them for an admin/debug environment.

| Task | Preferred MCP tool | Notes |
| --- | --- | --- |
| Check configuration | `braze_health` | Safe read-only check; does not expose secrets. |
| List campaigns | `braze_list_campaigns` | Use before duplicating or triggering campaigns when campaign IDs are uncertain. |
| Get campaign details | `braze_get_campaign_details` | Use to inspect message metadata, draft versions, channels, and configuration. |
| Get campaign analytics | `braze_get_campaign_analytics` | Use only when a specific `campaign_id` is already known and a time-series trend for that single campaign is needed. |
| Rank campaign performance | `braze_rank_campaigns_by_performance` | Use for "best performing campaign" or campaign ranking. If the user does not specify a metric, default to `open_rate` and state that assumption; otherwise set `metric` to the requested KPI. |
| List segments / audiences | `braze_list_segments` | Use to find Segment API identifiers. |
| List segment / audience sizes | `braze_list_segment_sizes` | Use for "all audiences with sizes", "largest segment", or ranked audience-size inventory. This combines segment listing and size analytics. |
| Get segment details | `braze_get_segment_details` | Use to inspect segment filter descriptions before targeting. |
| Get segment analytics | `braze_get_segment_analytics` | Use only when a specific `segment_id` is already known and a time-series trend for that single segment is needed. |
| Export users by segment | `braze_export_users_by_segment` | High-risk PII/data export; requires approval and `confirmed: true`. |
| Export users by ID | `braze_export_users_by_identifier` | High-risk PII/data export; requires approval and `confirmed: true`. |
| List Canvases | `braze_list_canvases` | Use to find Canvas API identifiers. |
| Get Canvas details | `braze_get_canvas_details` | Use to inspect Canvas metadata. |
| Get Canvas analytics | `braze_get_canvas_analytics` | Use for Canvas time-series reporting. |
| Get Canvas summary | `braze_get_canvas_data_summary` | Use for concise Canvas result rollups. |
| Duplicate Canvas | `braze_duplicate_canvas` | Requires approval and `confirmed: true`. |
| Duplicate campaign | `braze_duplicate_campaign` | Requires approval and `confirmed: true`. |
| Trigger API campaign | `braze_trigger_campaign` | Requires approval and `confirmed: true`; preserve dashboard campaign content. |
| Send API-defined message | `braze_send_messages` | Requires approval and `confirmed: true`; inspect audience and content carefully. |
| Track user attributes/events/purchases | `braze_users_track` | Requires approval and `confirmed: true`; validate payload first. |
| List email templates | `braze_list_email_templates` | Safe discovery action. |
| Create email template | `braze_create_email_template` | Requires approval and `confirmed: true`. |
| List scheduled broadcasts | `braze_list_scheduled_broadcasts` | Safe read-only schedule check. |
| List custom events | `braze_list_custom_events` | Use to discover event names for targeting, tracking, or reporting. |
| List custom attributes | `braze_list_custom_attributes` | Use to discover attribute names for targeting or payload design. |
| Get subscription group status | `braze_get_subscription_group_status` | Safe read of one subscription group status. |
| List user's subscription groups | `braze_list_user_subscription_groups` | Safe read of subscription group history/status. |
| Update subscription group status | `braze_update_subscription_group_status` | Consent/preference mutation; requires approval and `confirmed: true`. |
| List catalogs | `braze_list_catalogs` | Use to discover catalog names. |
| List catalog items | `braze_list_catalog_items` | Use to inspect catalog content for personalization. |
| Get catalog item | `braze_get_catalog_item` | Use to inspect one catalog item. |
| Uncovered endpoint | `braze_request` | Use only when enabled by MCP host and after verifying current Braze docs. |

## Tool Selection Pattern

1. Prefer discovery tools before mutation when IDs are uncertain.
2. Prefer dashboard campaign triggers for approved reusable campaign logic.
3. Prefer direct `messages/send` only when the message body is API-defined and has been reviewed.
4. Prefer `users/track` only for attributes, events, and purchases that have a clear owner and data contract.
5. Use generic REST only as an exception, not the default.
