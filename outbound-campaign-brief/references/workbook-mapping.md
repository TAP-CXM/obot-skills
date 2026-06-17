# Workbook Mapping

Use this file when filling the campaign workbook template.

## Goal

The workbook is not just a summary sheet. It is an operational handoff artifact that combines campaign context, targeting logic, delivery setup, content structure, and document governance.

Fill the tabs in this order:

1. `Summary`
2. `Targeting & Delivery`
3. `Delivery`
4. `Reference`

## 1. Summary

Use this tab for campaign identity, context, KPI assumptions, and document governance.

Expected content:

- campaign name
- internal campaign name or code
- main channel
- campaign plan and nature
- start and end dates
- program hierarchy where relevant
- campaign description
- hypothesis and KPI assumptions
- delivery outline naming
- document inventory
- version control
- review and approval names, dates, and comments

Notes:

- If the user gives only one channel, still fill the main channel explicitly.
- If KPI targets are unknown, leave them blank or mark them as assumptions instead of inventing confidence-heavy numbers.
- Preserve version and approval sections even in early drafts.

## 2. Targeting & Delivery

Use this tab for audience logic and campaign-operational setup.

Expected content:

- workflow name and internal workflow name
- targeting description in plain English
- targeting rules in logic form
- standard inclusions and exclusions
- campaign and universal control group settings
- delivery labels, delivery codes, channels, nature, launch dates, throttle rates, and send sequence
- automated priority and quarantine details where relevant
- segmentation rules and treatments
- UAT or proof list recipients

Notes:

- Mirror the human-readable targeting criteria with a logic equivalent where possible.
- Keep delivery rows distinct when different segments, content, or channels need different treatments.
- Populate proof lists with real stakeholders when provided; otherwise label them as pending.

## 3. Delivery

Use this tab for message structure, personalization, and module-level content requirements.

Expected content:

- delivery label and code
- messaging summary
- content summary
- whether HTML is supplied
- whether an offer space is included
- dynamic content and personalization field definitions
- example values
- system field names when known
- default values or skip conditions
- content management rows by module
- audience or rule for each module
- image, copy, URL, CTA label, and notes
- screenshot or rendering placeholder if relevant

Notes:

- Treat this tab as a build brief for CRM production, not just a creative summary.
- Personalization and dynamic-content rules should be explicit enough for implementation and QA.
- Content modules should tie back to segments or rules when variants exist.

## 4. Reference

Use this tab for dropdowns, enumerations, and workbook-controlled values.

Expected content:

- allowable values for channels
- campaign plans
- frequencies
- inclusion and exclusion toggles
- control-group toggles
- delivery channel values
- delivery content toggles such as HTML supplied and offer space
- personalization type values such as `P`, `DC`, and `Both`

Notes:

- Preserve the reference values unless the user explicitly wants the taxonomy changed.
- Add new allowed values only when they are genuinely needed for the campaign or the user's operating model.

## Mapping heuristics

Use these translation rules:

- strategic objective -> `Summary`
- audience and suppression logic -> `Targeting & Delivery`
- execution routing and deployment setup -> `Targeting & Delivery`
- copy/module plan and personalization schema -> `Delivery`
- fixed picklist options -> `Reference`

If a detail belongs in more than one place, put:

- the concise operational value in the workbook
- the fuller explanation in the BRD
