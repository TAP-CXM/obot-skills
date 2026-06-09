---
name: braze-api-workflows
display_name: Braze API Workflow Assistant
description: Plans and prepares safe Braze REST API workflows for campaigns, templates, direct sends, and user updates.
license: Proprietary
version: 0.1.0
tags:
  - braze
  - crm
  - messaging
  - api
compatibility:
  - claude
  - codex
  - chatgpt
---

# Braze API Workflow Assistant

## Purpose

Use this skill when the task involves Braze REST API workflows such as campaigns, direct sends, templates, user tracking, subscriptions, preference centers, catalogs, segments, exports, or payload drafting for review.

## When to Use

Use this skill when the user wants to:

- inspect or duplicate campaigns
- trigger or schedule sends
- draft or review `/messages/send` payloads
- prepare `/users/track` requests
- manage templates or subscription state
- translate a Braze operational request into a safe execution plan

Prefer this skill for API-oriented Braze work. If the user wants a brand-new dashboard campaign designed in Braze's UI, produce an implementation brief rather than pretending the API can create the whole dashboard workflow.

## Inputs

- the user's goal
- the Braze object type, if known
- environment or workspace context
- any known identifiers such as campaign ID, app ID, template ID, segment, or recipient reference
- whether the user wants a draft-only answer or live execution

## Process

1. Clarify the real goal and identify the Braze object type: campaign, message, template, user, subscription, catalog, segment, Canvas, or export.
2. Decide whether the task should be:
   - a dashboard implementation brief
   - a reviewed API payload draft
   - a live API execution plan
3. If identifiers are uncertain, recommend listing or inspecting existing Braze objects before mutating anything.
4. Map the request to the likely Braze endpoint and payload shape.
5. Call out assumptions, missing identifiers, permission needs, and execution risks.
6. For risky actions such as broadcast sends, subscription changes, deletes, and bulk user updates, require explicit confirmation before execution.

## Workflow Guidance

### Campaign Workflows

- If the user has a template campaign, prefer duplication over building from scratch.
- If the user wants an event-driven or one-off send, prefer an existing API-triggered campaign.
- If the user wants a dashboard-built campaign, return a concise implementation brief for a human Braze operator.

### Direct Message Sends

- Use `/messages/send` when the user wants an API-defined message body instead of a dashboard-stored campaign.
- Separate payload drafting from execution when targeting, scheduling, or message content is still ambiguous.

### User Data and Events

Use `/users/track` for:

- attribute updates
- custom events
- purchases

Confirm the mutation scope before preparing or executing bulk user updates.

### Templates, Subscriptions, and Preference Centers

Use this skill to identify the right request shape for:

- email template management
- subscription group status changes
- preference center listing
- scheduled broadcast review

### Media Library Assets

If the task involves uploading an image or GIF, call out asset constraints, especially file size, before execution.

## Package Assets

This skill package includes supporting assets under:

- `references/`
- `scripts/`
- `profiles.example.json`
- `examples/`
- `tests/`

These are implementation aids that travel with the skill package when installed.

## Required Environment for Live Execution

- `BRAZE_REST_ENDPOINT`
- `BRAZE_API_KEY`

If credentials are unavailable, produce a review-ready plan and payload instead of claiming execution success.

## Output Format

Return a structured Braze workflow response with:

- Goal
- Braze object type
- Recommended approach
- Required identifiers
- Endpoint
- Draft payload
- Risks and approvals
- Open questions
- Next step
