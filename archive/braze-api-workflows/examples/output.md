# Example Output

## Goal

Duplicate an existing Braze template campaign and prepare it for a new lifecycle experiment without executing a live send yet.

## Braze Object Type

Campaign

## Recommended Approach

Use an existing template campaign as the source of truth and duplicate it rather than rebuilding content manually. Confirm that the source campaign is suitable for API-triggered or scheduled use before preparing any send workflow.

## Required Identifiers

- Source campaign ID
- Target workspace or environment
- App ID if the duplicated campaign will be triggered via API
- New audience or segment definition

## Endpoint

`POST /campaigns/duplicate`

## Draft Payload

```json
{
  "campaign_id": "SOURCE_CAMPAIGN_ID",
  "name": "Lifecycle Experiment - Reactivation Variant A"
}
```

## Risks and Approvals

- Confirm the original campaign is the correct template
- Confirm the new audience is approved
- Do not send or schedule until the duplicated campaign content and targeting are reviewed

## Open Questions

- Is this campaign intended for API-triggered or dashboard scheduling?
- Which segment should receive the duplicated campaign?
- Should the duplicated campaign inherit all original message variations?

## Next Step

Retrieve or confirm the source campaign ID, then review the duplicate payload and post-duplication checklist before making a live Braze call.
