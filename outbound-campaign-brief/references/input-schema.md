# Input Schema

Use a single JSON input file as the source for both deliverables.

## Required shape

```json
{
  "overview": {},
  "summary": {},
  "targeting": {},
  "delivery": {},
  "design": {},
  "qa": {},
  "governance": {}
}
```

## Recommended fields

### `overview`

- `campaign_name`
- `internal_campaign_code`
- `campaign_template`
- `channels`
- `primary_channel`
- `secondary_channel`
- `tertiary_channel`
- `source_documents`

### `summary`

- `campaign_template`
- `campaign_nature`
- `campaign_frequency`
- `campaign_plan`
- `plan_mode`
- `program_level_1`
- `program_level_2`
- `program_level_3`
- `program_level_4`
- `start_date`
- `end_date`
- `description`
- `business_context`
- `why_now`
- `related_initiative`
- `primary_objective`
- `secondary_objective`
- `offer`
- `primary_cta`
- `single_minded_message`
- `hypothesis`
- `kpis`
- `expected_open_rate`
- `expected_ctor`
- `expected_conversion_rate`
- `expected_ctr_delivered`
- `test_plan`
- `dependencies`
- `risks`
- `compliance_considerations`
- `assumptions`
- `open_questions`

### `targeting`

- `workflow_name`
- `workflow_internal_name`
- `audience_description`
- `audience_rules`
- `inclusions`
- `exclusions`
- `suppressions`
- `control_group`
- `deliveries`
- `automated_quarantine_days`
- `automated_priority_description`
- `timing_rules`
- `trigger_logic`
- `operational_rules`
- `segments`
- `segment_codes`
- `treatments`
- `data_approvers`

### `delivery`

- `delivery_label`
- `delivery_code`
- `subject_line`
- `paragraph_1_summary`
- `paragraph_2_summary`
- `paragraph_3_summary`
- `additional_content`
- `content_summary`
- `message_body`
- `content_template`
- `html_supplied`
- `include_offer_space`
- `offer_space_notes`
- `dynamic_content_rules`
- `tone_and_personalization`
- `asset_requirements`
- `localization_notes`
- `personalization_fields`
- `content_modules`

### `design`

- `source`
- `figma_url`
- `figma_file`
- `figma_frame`
- `figma_version`
- `preview_image_name`
- `preview_image_url`
- `preview_image_base64`
- `preview_image_mime_type`
- `html_supplied`
- `html_summary`
- `template_source`
- `asset_requirements`
- `dependencies`
- `open_items`

### `qa`

- `proof_list`
- `qa_checkpoints`
- `data_checks`
- `content_checks`
- `design_checks`
- `proof_send_status`
- `proof_send_notes`
- `approval_requirements`

### `governance`

- `owner`
- `document_date`
- `current_version`
- `delivery_outline_name`
- `delivery_outline_internal_name`
- `estimated_provisional_cost`
- `documents`
- `version_history`
- `approvals`

## Arrays

Use arrays for:

- `channels`
- `source_documents`
- `kpis`
- `dependencies`
- `risks`
- `compliance_considerations`
- `assumptions`
- `open_questions`
- `inclusions`
- `exclusions`
- `suppressions`
- `deliveries`
- `segments`
- `segment_codes`
- `treatments`
- `data_approvers`
- `proof_list`
- `asset_requirements`
- `qa_checkpoints`
- `personalization_fields`
- `content_modules`
- `dynamic_content_rules`
- `data_checks`
- `content_checks`
- `design_checks`
- `approval_requirements`
- `documents`
- `version_history`
- `approvals`

## Notes

- Dates can be plain strings such as `2026-06-30` or `30/06/2026`.
- Percentages can be stored as strings when the exact display matters.
- Keep field names stable so the same JSON can be reused for workbook generation, BRD generation, or future automation.
