# Braze Safety Policy

## Before Any Live Execution

Confirm:

- target Braze environment
- campaign, Canvas, template, or app ID
- audience definition and expected recipient count
- channel and message variation
- schedule or send time
- suppression, consent, and subscription assumptions
- rollback or cancellation path
- human approval for high-risk actions

## High-Risk Markers

Escalate and require approval when a payload includes:

- `broadcast: true`
- `recipients` with more than a small test list
- missing test recipient identifiers
- user attribute writes at scale
- user profile exports or segment exports
- subscription or preference updates
- delete/archive/update operations
- production environment ambiguity
- unreviewed Liquid, HTML, personalization, or URLs

## Draft Response Pattern

When not executing, provide:

- intended MCP tool
- payload file or JSON body
- assumptions
- exact approval needed
- residual risks

## Result Response Pattern

After execution, report:

- MCP tool used
- Braze IDs returned
- environment
- timestamp or schedule
- any warnings
- recommended verification step
