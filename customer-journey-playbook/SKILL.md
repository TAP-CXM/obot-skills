---
name: customer-journey-playbook
description: Recommend, prioritize, design, and progressively refine customer journeys from a business problem, audience, lifecycle stage, product, channel mix, or user-provided journey brief. Use when Codex needs to advise which customer journey or journeys are most appropriate for acquisition, onboarding, commerce, retention, service, feedback, offline-to-online, or omnichannel orchestration problems, and when Codex needs to turn user specifics into a complete customer journey with trigger, audience, timing, channel sequence, touchpoints, message strategy, personalization, suppression, metrics, governance, implementation-ready requirements, and focused follow-up questions that adapt the solution to customer specifics.
---

# Customer Journey Playbook

Use this skill to help users choose the right customer journey strategy and build practical journeys from their specific business context.

This skill is playbook-led. It should use the bundled source playbook as the catalog of journey patterns, timing logic, channel roles, and sample message approaches:

- [Digital Customer Journey Playbook.md](Digital%20Customer%20Journey%20Playbook.md)

Read [references/playbook-method.md](references/playbook-method.md) for the working method, recommendation rules, output formats, and quality checks.

Use [references/catalog-index.md](references/catalog-index.md) as the fast journey catalog before opening the full source playbook.

## Core Modes

### Recommend Journeys

Use this mode when the user describes a problem, opportunity, KPI, lifecycle gap, or customer behavior and asks what to do.

Examples:

- "Customers abandon quotes halfway through. What journeys should we use?"
- "We need to increase first purchase after signup."
- "Our email list is becoming inactive."
- "How should we improve retention for high-value customers?"

Return:

- Problem diagnosis.
- Recommended journey or journey set.
- Why each journey fits.
- Trigger, audience, channel, timing, and KPI.
- Priority order and rollout sequence.
- Data and platform prerequisites.
- Risks, suppressions, and governance checks.

### Design a Journey

Use this mode when the user gives a specific journey type or enough details to build one.

Examples:

- "Build a basket abandonment journey for a fashion retailer using email and SMS."
- "Create a customer onboarding journey for a SaaS trial."
- "Design a complaint recovery journey for insurance customers."

Return:

- Journey objective and KPI.
- Audience, trigger, entry criteria, exclusions, suppression, exit, and re-entry.
- Touch-by-touch sequence with timing, channel, content purpose, and personalization.
- Decision paths and next-best-action logic.
- Measurement plan.
- Governance and approval checks.
- YAML or JSON-style specification when useful.

### Refine a Journey

Use this mode after giving an initial recommendation or design, or when the user answers prior follow-up questions.

Return:

- Updated recommendation or journey design based on the new specifics.
- Changed assumptions and resolved open questions.
- Any newly exposed risks, dependencies, or implementation choices.
- The next small batch of refinement questions, only where answers would materially improve the solution.

## Standard Workflow

1. Parse the user context.
   - Identify business problem, lifecycle stage, audience, customer behavior, product or service type, channels, data availability, geography or compliance constraints, and requested deliverable.
   - If the user gives limited context, proceed with labelled assumptions rather than blocking.

2. Match the problem to playbook categories.
   - Acquisition: anonymous-to-lead, lead nurture, event, demo, quote, paid media, retail lead capture, app install.
   - Welcome and onboarding: subscriber, customer, account, app, product, loyalty, preference, consent, first login, first value, trial.
   - Commerce: first purchase, post-purchase, repeat purchase, basket, browse, search, wishlist, price, stock, replenishment, cross-sell, upsell, payment, order, delivery, returns, reviews.
   - Retention: churn prevention, lapsed, win-back, reactivation, low engagement, dormant, renewal, loyalty, VIP, high-value, birthday, anniversary, seasonal, preference refresh, repermission.
   - Service and feedback: NPS, CSAT, CES, complaint recovery, service follow-up, closed-loop feedback, registration, warranty, recall, appointment, missed appointment, call centre, case closure, feedback escalation, advocacy.
   - Offline and hybrid: store visit, POS capture, branch appointment, direct mail follow-up, call centre assisted, field sales, retail loyalty, offline-to-online, event attendance, local store reactivation.
   - Read [references/catalog-index.md](references/catalog-index.md) when selecting exact journey candidates.

3. Choose the journey pattern.
   - For recommendation requests, propose the smallest journey set that addresses the problem.
   - For design requests, select the closest playbook pattern and adapt it to the user's context.
   - Read the source playbook section for exact pattern timing and message examples when designing a named journey or when precision matters.

4. Build the journey logic.
   - Define entry trigger, behavioral signal, audience eligibility, exclusions, consent checks, suppression rules, frequency caps, exit criteria, and re-entry logic.
   - Use dynamic orchestration where possible: perceive event, propose decision, act through the best channel, observe results, learn and adjust.
   - Avoid static calendar campaigns when behavioral or product timing is available.

5. Create the touchpoint plan.
   - Assign each touch a purpose, channel, timing, content type, personalization fields, fallback, tracking event, and KPI.
   - Keep content examples short and specific. Use playbook examples as patterns, not copy to reuse blindly.

6. Add measurement and governance.
   - Include operational, engagement, conversion, and guardrail metrics.
   - Include suppression, consent, quiet hours, complaint pause, discount caps, deliverability, and data-sharing checks.
   - Include approval points for audience, content, offer, compliance, and launch.

7. Close with a focused refinement loop.
   - Provide a practical first solution before asking questions.
   - Ask 3-5 questions at a time, prioritized by the biggest unknowns affecting feasibility, performance, or customer experience.
   - Cover customer-specific details such as available offers, data quality, channel permissions, survey tooling, service capacity, product constraints, and compliance only when relevant to the chosen journey.
   - When the user answers, revise the solution and ask the next batch only if material gaps remain.

## Output Rules

- Always separate confirmed inputs, assumptions, and open questions.
- Recommend journeys before designing them when the user's problem is broad.
- Do not recommend every possible journey. Prioritize the few journeys most likely to change the KPI.
- Include inbound and outbound balance when relevant. Early-stage growth can lean outbound; mature brands should protect brand-building and lifecycle retention.
- Include frequency caps and suppression hierarchy for push channels.
- Include pause logic for complaints or negative feedback.
- Include fallback channels when preferred channel consent or permission is missing.
- Include data prerequisites and mark unknown fields as required, not confirmed.
- Do not claim live platform capabilities or deployability unless the user supplies that context or another tool confirms it.
- End recommendations and journey designs with a short "Refinement Questions" section unless the user asked for a final artifact with no follow-up.
- Do not ask every possible discovery question. Keep each batch small and explain what the answers will refine.

## Minimum Output for Recommendations

Use this structure:

1. Problem diagnosis
2. Recommended journey set
3. Prioritization
4. Journey summary table
5. Required data and triggers
6. Channel and timing rationale
7. Measurement plan
8. Risks and governance
9. Next decisions
10. Refinement questions

## Minimum Output for Journey Designs

Use this structure:

1. Journey summary
2. Confirmed inputs
3. Assumptions and open questions
4. Audience, trigger, entry criteria, exclusions, exit, and re-entry
5. Touchpoint sequence
6. Decision and next-best-action logic
7. Personalization and fallback rules
8. Measurement plan
9. Suppression and governance checks
10. Build checklist
11. Refinement questions
12. Optional YAML specification

Use [templates/journey-design.md](templates/journey-design.md) for a full journey scaffold.

## Quality Bar

A strong answer should make the chosen journey obvious, defensible, and buildable. It should show why the recommended journey fits the problem, what behavior triggers it, what customer barrier it solves, what channels and timing are appropriate, what data is required, and how the business will know whether it worked.
