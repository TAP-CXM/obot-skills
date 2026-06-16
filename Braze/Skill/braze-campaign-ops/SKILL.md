---
name: braze-campaign-ops
description: Use when Codex needs to plan, QA, draft, or orchestrate Braze campaign operations through governed MCP tools rather than direct API calls. Applies to Braze campaigns, Canvases, API-triggered sends, direct messages, email templates, users/track payloads, scheduled broadcasts, campaign QA, launch readiness checks, and payload preparation for human review.
---

# Braze Campaign Ops

## Operating Rule

Use this skill as the workflow layer for Braze work. Do not make direct Braze API calls from this skill. Use the Braze MCP server for live reads, writes, sends, scheduling, template changes, and user mutations.

Skills prepare and judge. MCP servers execute.

## Standard Workflow

1. Clarify the business goal, Braze object type, environment, audience, channel, and whether execution is approved.
2. Classify the task:
   - discovery/read-only
   - draft/payload preparation
   - workspace mutation
   - live send or user data mutation
3. Read [references/mcp-tool-map.md](references/mcp-tool-map.md) to select the smallest MCP tool that fits.
4. For campaign safety decisions, read [references/safety-policy.md](references/safety-policy.md).
5. For local JSON validation, use `scripts/validate_payload.py`.
6. Show payloads and assumptions before high-risk execution.
7. Call the Braze MCP server only after required human approval is present.
8. Summarize the result with Braze IDs, endpoint/tool used, assumptions, and next checks.

For ambiguous performance questions, do not answer by only listing objects. Use a performance/ranking MCP tool when one exists. If the user asks for the "best performing" campaign without a KPI, use open rate as the default metric and explicitly state that assumption, unless the surrounding context names another metric.

For user-count questions, do not answer by only listing users, segments, or audiences. Use a count-oriented MCP tool when one exists. If the user asks how many users match an ad hoc filter such as a name, custom attribute, or event condition, first try the count tool with the requested filter text. If no saved segment matches, explain that Braze needs a saved segment or approved export workflow before that filtered count can be computed.

## Execution Boundary

Allowed in this skill:

- Draft payloads.
- Validate local JSON files.
- Produce QA checklists.
- Compare user-provided exports.
- Explain which Braze MCP tool should be used.
- Prepare human-readable launch notes.

Not allowed in this skill:

- Store Braze API keys.
- Read `BRAZE_API_KEY`.
- Call Braze REST endpoints directly.
- Maintain plaintext profile files with credentials.
- Send, schedule, duplicate, update, or delete Braze objects except through MCP.

## Approval Rules

Treat these as high risk and require explicit user approval before asking MCP to execute:

- any message send
- `broadcast: true`
- `/users/track`
- subscription or preference changes
- campaign duplication, creation, update, archive, or delete
- template creation or update
- bulk imports, exports containing personal data, or large audience changes

When approval is missing, draft the payload and say what approval is needed.

## Payload Validation

Validate JSON before MCP execution:

```bash
python scripts/validate_payload.py --kind users-track --file payload.json
python scripts/validate_payload.py --kind messages-send --file payload.json
python scripts/validate_payload.py --kind trigger-campaign --file payload.json
```

Validation is structural only. It does not prove Braze IDs, segment logic, Liquid syntax, consent status, or deliverability.

## References

- Read [references/mcp-tool-map.md](references/mcp-tool-map.md) for Braze task-to-tool routing.
- Read [references/safety-policy.md](references/safety-policy.md) for approval and QA requirements.
