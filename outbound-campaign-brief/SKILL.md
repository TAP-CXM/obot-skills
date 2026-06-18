---
name: outbound-campaign-brief
display_name: Outbound Campaign Brief
description: Create strategic and operational briefs for outbound marketing campaigns across email, SMS, WhatsApp, push, in-app, and related owned channels. Use when an agent needs to turn a marketing goal, offer, audience, or launch request into a structured campaign brief, filled campaign workbook, BRD, messaging plan, channel mix, test plan, targeting logic, or delivery-ready requirements for CRM, lifecycle, growth, or promotional campaigns.
license: Proprietary
version: 0.1.0
tags:
  - marketing
  - crm
  - campaign
  - brief
  - lifecycle
compatibility: claude, codex, chatgpt
---

# Outbound Campaign Brief

Create a clear, execution-ready campaign brief from whatever information the user has already supplied. Work well with partial inputs, make sensible assumptions when needed, and separate confirmed facts from inferred recommendations.

This skill supports two connected deliverables from the same campaign inputs:

- a strategic campaign brief
- an operational handoff package, including a filled spreadsheet workbook and a BRD

For Obot campaign-creation workflows, treat the Outbound Campaign Brief as the main deliverable. Build it through these sections and keep each section aligned with the final workbook:

- General: campaign name, campaign template, channel, KPIs, and source documents with versions.
- Data: target groups, audience or segment names, segment codes, exclusions and suppressions, treatment by segment, and data approvers with email addresses.
- Content: subject line, email body or content summary, content template, dynamic content rules, personalization fields, defaults, and fallback behavior.
- Design: design source, Figma URL or frame, preview image reference, supplied HTML, campaign template source, and unresolved creative dependencies.
- QA: proof recipients with names and email addresses, QA checklist generated from the brief contents, proof-send status, and launch-readiness checks.
- Finalize: consolidated brief, workbook, document inventory, versions, assumptions, and open questions.

For repeatable output generation, use the bundled script when the client runtime can run local Node and Python helpers:

```bash
node scripts/generate_campaign_outputs.mjs --input <campaign.json> --outdir <output-dir> --python <python-bin>
```

Read [input-schema.md](./references/input-schema.md) for the input contract and use [example-campaign-input.json](./assets/example-campaign-input.json) as the starter shape.

## Workflow

Follow this sequence.

### 1. Classify the campaign

Identify the campaign type first because it changes the brief structure and recommendations.

Common types:

- Promotional sale or offer
- Product launch or feature announcement
- Lifecycle or CRM journey
- Reactivation or win-back
- Reminder or deadline push
- Content or newsletter distribution
- Transactional or service communication with a marketing objective

If the request mixes multiple goals, choose one primary objective and treat the rest as secondary.

### 2. Gather the minimum viable inputs

Use the information already provided. Ask follow-up questions only when a missing detail would materially change the strategy or make the brief unsafe to invent.

Prefer these inputs:

- Campaign name and campaign template
- Business objective
- Target audience or segment
- Offer, value proposition, or key message
- Channels in scope
- Timing, launch window, or urgency
- Geography, language, or market constraints
- Success metric or KPI
- Brand, legal, or compliance constraints

If important details are missing, continue with explicit assumptions rather than blocking. Keep open questions in a separate section.

For operational outputs, also look for:

- source documents and versions
- workflow or campaign code naming conventions
- delivery labels and delivery codes
- targeting rules in plain English and rule logic form
- control group requirements
- proof or UAT recipients
- data approvers and QA contacts with email addresses
- design source such as Figma, supplied HTML, or a campaign template
- personalization fields and fallback rules
- content modules, links, and asset dependencies
- approval, ownership, and version-control information

### 3. Choose the channel role for each touchpoint

Do not treat every channel as interchangeable. Decide what each one is best for in this campaign.

Examples:

- Email for richer narrative, imagery, detail, and multiple content blocks
- SMS for urgency, reminder, and direct CTA
- WhatsApp for conversational outreach, higher-trust reminders, and richer utility than SMS where appropriate
- Push for immediacy and app-return behavior
- In-app or inbox for reinforcement after the initial outbound touch

Read [channel-guidance.md](./references/channel-guidance.md) when the user asks for channel recommendations, sequencing, or message-shape differences.

### 4. Build the strategy before writing the brief

Decide the following before drafting the final brief:

- Primary objective
- Audience definition
- Single-minded message
- Offer or CTA
- Channel mix
- Contact sequence
- Personalization approach
- Experiment or test hypothesis
- Measurement plan

Avoid jumping straight into copywriting unless the user explicitly asks for copy instead of a brief.

### 5. Draft the brief in the canonical format

Use the template in [brief-template.md](./references/brief-template.md).

Always include:

- General
- Data
- Content
- Design
- QA
- Finalize or handoff summary
- Campaign summary
- Objective and success metrics
- Audience
- Offer and CTA
- Message strategy
- Channel plan
- Timeline or send logic
- Creative and production requirements
- Risks, dependencies, and approvals
- Open questions and assumptions

When the user gives very little context, keep the brief lean and recommendation-led rather than padded with generic filler.

### 6. Create the operational outputs when requested

When the user asks for execution-ready artifacts, produce both of these from the same source inputs.

#### A. Populate the workbook

If the user supplies a campaign workbook template, use that exact file. Otherwise use the bundled asset:

- [TAP CXM - Campaign Brief Template.xlsx](./assets/TAP%20CXM%20-%20Campaign%20Brief%20Template.xlsx)

Read [workbook-mapping.md](./references/workbook-mapping.md) before filling the workbook. It maps the four tabs and expected content:

- `Summary`
- `Targeting & Delivery`
- `Delivery`
- `Reference`

Preserve the workbook's structure and placeholder intent. Replace placeholders with campaign-specific content, but do not remove governance sections unless the user asks for a simplified version.

When generating the workbook programmatically, prefer the bundled script instead of manual cell edits.

#### B. Create the BRD

Use [brd-template.md](./references/brd-template.md) for a more descriptive handoff document. The BRD should explain the same campaign in prose, with enough context for CRM, content, data, QA, and stakeholder teams to execute confidently.

The BRD should usually expand on:

- business context and rationale
- audience and segmentation logic
- journey logic and sequencing
- personalization and decision rules
- content requirements by module or variant
- QA, dependencies, risks, and approvals

When generating both outputs together, keep the workbook concise and operational while letting the BRD carry the fuller explanatory detail.

### 7. Keep the brief, workbook, and BRD aligned

Treat the brief as the strategic source of truth, then make sure the workbook and BRD stay consistent with it.

Minimum alignment checks:

- campaign name, internal code, and dates match
- channels and delivery labels are consistent
- targeting descriptions match targeting rules
- segments map to delivery treatments
- message summary aligns with content modules
- KPIs and hypotheses are consistent across outputs
- approvals, document versioning, and dependencies are not contradictory

### 8. Adapt the output to the client

Default to plain Markdown with clear headings because it travels well across Codex, obot.ai, and other agent clients.

If the user asks for another format, convert the same brief into one of these without changing the strategy:

- Copy-pasteable Markdown
- JSON object for downstream tooling
- Table format for project managers
- Structured YAML for automation

Do not rely on Codex-specific tools, directives, or connector assumptions inside the brief itself.

## Script workflow

Use scripts for executable generation when the runtime supports the dependencies. Workbook population is deterministic, fragile, and repetitive enough to benefit from automation.

If the runtime cannot execute local scripts or does not have the required spreadsheet and docx libraries, still complete the strategic brief in Markdown and use the workbook/BRD templates as the source structure for manual or downstream generation.

Script dependencies, when script execution is available:

- Node.js with `@oai/artifact-tool` available for workbook population.
- Python with `python-docx` available for `.docx` BRD generation.

### Why scripts help

- preserve the exact workbook structure
- reduce missed operational fields
- keep the workbook and BRD aligned from one source input
- make the skill more reusable across clients that can run local scripts

The BRD generation pattern is broadly portable. The workbook generator is also scriptable, but the exact runtime may differ by client. In Codex, prefer the bundled spreadsheet runtime and `@oai/artifact-tool`. In other clients, keep the same input schema and workbook mapping, then adapt the implementation to the spreadsheet library available there.

### Generator inputs and outputs

Input:

- one JSON file matching [input-schema.md](./references/input-schema.md)

Outputs:

- a populated campaign workbook `.xlsx`
- a BRD in Markdown
- a BRD in `.docx`

### Default command

```bash
node scripts/generate_campaign_outputs.mjs \
  --input assets/example-campaign-input.json \
  --outdir outputs \
  --python /path/to/python
```

The script uses the bundled TAP workbook asset by default, but accepts `--template` when the user supplies a different workbook.

## Output Rules

Keep the brief strategic and actionable.

- Separate `Confirmed Inputs`, `Assumptions`, and `Open Questions`
- Make recommendations specific to the campaign, not generic channel best practices
- Include a clear primary CTA and optional secondary CTA only when justified
- Name the KPI and how success will be judged
- Flag compliance-sensitive areas such as consent, quiet hours, opt-out language, regulated claims, or market-specific restrictions
- Call out asset needs such as hero image, promo code, landing page, audience file, coupon logic, or translated variants
- Make operational fields explicit when preparing delivery artifacts, including codes, owners, proof lists, defaults, and fallback behavior

## Quality Bar

A strong brief should let another team member build the campaign without needing to reverse-engineer the strategy.

The brief is ready when it:

- states one clear business outcome
- explains who the campaign is for
- defines why this audience should care now
- assigns a role to each channel
- includes a send or sequencing logic
- identifies measurable success criteria
- surfaces unresolved dependencies and risks

The operational package is ready when it also:

- can be handed to CRM or marketing operations without major reinterpretation
- contains enough detail to build audience logic and delivery setup
- documents personalization fields, modules, and links clearly
- includes review, approval, and version-control fields

## Variations

### Multi-wave campaigns

For launches, sales, or countdowns, include wave purpose by touchpoint:

- Tease
- Launch
- Reminder
- Last chance
- Follow-up or non-converter path

### Triggered or lifecycle campaigns

For journeys, include:

- Trigger event
- Entry criteria
- Exit criteria
- Delay logic
- Suppression logic

### Localization or multi-market campaigns

Call out:

- market-specific offers
- translation needs
- local regulations
- time-zone send differences

## What not to do

- Do not produce only copy lines when the user asked for a brief
- Do not recommend all channels by default
- Do not invent legal approval, segmentation, or technical capability as confirmed fact
- Do not hide uncertainty; label assumptions clearly
- Do not over-specify design or HTML implementation unless the user asks for execution assets next
- Do not leave workbook placeholders unresolved when the underlying information is already known
- Do not let the BRD diverge from the workbook or strategic brief
