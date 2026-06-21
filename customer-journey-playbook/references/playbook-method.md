# Customer Journey Playbook Method

Use this reference with the source playbook when recommending or designing customer journeys.

## Source Playbook Routing

Start with [catalog-index.md](catalog-index.md) for journey names, goals, triggers, channels, timing, and touch patterns.

Read [../Digital Customer Journey Playbook.md](../Digital%20Customer%20Journey%20Playbook.md) when:

- The user asks for a named journey from the catalog.
- The user asks for timing, touch count, channel mix, or message examples.
- The user asks which journeys solve a specific lifecycle or KPI problem.
- The answer needs exact playbook patterns rather than general journey advice.

Use these source sections:

- Framework choice and orchestration logic: beginning of the playbook and "Operational Orchestration Logic".
- Acquisition journeys: Lead Nurture through App Install Prompt.
- Welcome and onboarding: New Subscriber Welcome through Trial Conversion.
- Commerce: First Purchase through Review Request.
- Retention: Churn Prevention through Repermission.
- Service and feedback: NPS through Positive Feedback Advocacy.
- Offline and hybrid: Store Visit Follow-Up through Local Store Reactivation.
- Governance: "Synthesis and Governance Framework".

## Strategic Frameworks

Choose the planning lens based on the problem:

| Framework | Use for | Avoid when |
|---|---|---|
| AIDA or funnel | Simple awareness-to-conversion campaigns, early drafts, basic content mapping | The behavior is nonlinear or customers loop across channels |
| See-Think-Do-Care | Intent-led content and channel planning | The journey needs detailed operational branching |
| McKinsey Consumer Decision Journey | Consideration, active evaluation, purchase, post-purchase, loyalty loop | The user needs real-time orchestration detail |
| Messy Middle | Search, comparison, social proof, scarcity, authority, and evaluation friction | The problem is a simple transactional alert |
| Dynamic omnichannel orchestration | Behavior-triggered, adaptive, CDP-driven journeys across web, app, email, SMS, support, POS | Data, identity, or channel permissions are not available |

Default to dynamic omnichannel orchestration for mature lifecycle journeys, but keep the first version buildable with available channels and data.

## Recommendation Method

When the user asks what journey would help:

1. Restate the problem in behavioral terms.
2. Identify lifecycle stage and customer barrier.
3. Pick 1-3 primary journeys from the catalog.
4. Add supporting journeys only if they remove a dependency or protect the customer experience.
5. Prioritize by impact, speed to deploy, data readiness, and risk.
6. Explain why rejected alternatives are lower priority if they are obvious candidates.

Recommendation table:

| Priority | Journey | Why it fits | Trigger | Audience | Channels | KPI | Dependencies |
|---|---|---|---|---|---|---|---|

## Problem-to-Journey Map

| Problem | Strong candidate journeys |
|---|---|
| Anonymous traffic is not converting to leads | Lead Nurture, Newsletter Signup, Prospect Welcome, Brochure Download Nurture, Paid Media Lead Nurture |
| Event registrations do not attend or convert | Event Reminder, Event Follow-Up, Webinar Nurture |
| Quote or demo process stalls | Quote Request Follow-Up, Quote Abandonment, Demo Request Follow-Up |
| New customers do not reach first value | New Customer Welcome, Product Onboarding, First Login Journey, First Value Moment Journey |
| Trial users do not convert | Trial Onboarding, First Value Moment Journey, Trial Conversion |
| First purchase is low after signup | Prospect Welcome, First Purchase Journey, Preference Capture Journey |
| Carts, baskets, or quotes are abandoned | Basket Abandonment, Quote Abandonment, Browse Abandonment, Product Page Abandon |
| Browse behavior is not converting | Browse Abandonment, Product Recommendation, Wishlist Reminder, Price Drop Alert, Back-In-Stock Alert |
| Repeat purchase is weak | Post-Purchase Journey, Repeat Purchase Journey, Product Replenishment, Cross-Sell Journey |
| Average order value is low | Cross-Sell Journey, Upsell Journey, Subscription Add-On |
| Involuntary churn from billing issues | Payment Failure, Subscription Renewal, Contract Renewal |
| Engagement is dropping | Low Engagement Journey, Churn Prevention, Preference Refresh |
| Customers have lapsed or churned | Lapsed Customer Journey, Win-Back Journey, Reactivation Journey, Dormant Account Journey |
| High-value customers are at risk | High-Value Churn Prevention, VIP Customer Journey, Account Manager outreach |
| Loyalty members are not using benefits | Loyalty Programme Onboarding, Loyalty Tier Upgrade, Loyalty Retention, Retail Loyalty Journey |
| Feedback is missing | NPS Journey, CSAT Journey, CES Journey, Review Request Journey |
| Negative feedback needs action | Negative Feedback Escalation, Complaint Recovery Journey, Closed-Loop Feedback |
| Appointments or events are missed | Appointment Reminder, Missed Appointment Follow-Up, Event Reminder |
| Offline engagement is not connected to CRM | POS Capture Journey, Store Visit Follow-Up, Offline-to-Online Activation, Event Attendance Follow-Up |

## Journey Design Method

For a full journey design, define:

- Business problem.
- Customer barrier.
- Journey type.
- Lifecycle stage.
- Audience and segment logic.
- Entry trigger and behavioral signal.
- Entry criteria, consent, suppression, and frequency cap.
- Exit criteria and re-entry rule.
- Channel sequence and fallback channels.
- Touchpoint timing and content purpose.
- Personalization fields and defaults.
- Decision branches and next-best-action logic.
- Measurement and attribution.
- Governance and launch checks.

Touchpoint table:

| Touch | Timing | Channel | Purpose | Message angle | Personalization | Decision/fallback | Tracking |
|---|---|---|---|---|---|---|---|

## Timing Rules

Use behavior-based timing where possible:

- Abandonment: short delays while intent is high, commonly 1 hour, 24 hours, and 72 hours for basket-style journeys.
- Quote abandonment: often faster, such as 15 minutes and 24 hours, because the user is in a high-intent task.
- Event reminders: work backward from the event, such as 72 hours, 24 hours, and 1 hour.
- Onboarding: start immediately, then sequence over the first 3-8 days around the first value moment.
- Trial conversion: work backward from trial end, such as T-2 days and T-0 days.
- Replenishment: use burn rate minus shipping lead time when product consumption data is available.
- Renewal: work backward from renewal or contract end date.
- Sunset or reactivation: trigger after sustained inactivity, but avoid over-contacting inactive customers.

If exact timing is unknown, propose a starting cadence and label it as a testable assumption.

## Orchestration Logic

Prefer an adaptive loop:

1. Perceive: ingest event, segment update, survey response, purchase, support case, or offline signal.
2. Propose: evaluate eligibility, channel permission, fatigue, customer value, risk, and next-best-action.
3. Act: send or show the most relevant message on the best available channel.
4. Observe: measure conversion, engagement, opt-out, complaints, and feedback.
5. Learn: adjust thresholds, timing, channel choice, and content variants.

Use decision branches to:

- Exit customers who already converted.
- Pause marketing during complaints or support escalations.
- Shift from email to push, in-app, SMS, direct mail, or service outreach when the context supports it.
- Suppress secondary promotions when a higher-priority transactional or service journey is active.

## Suppression and Governance

Always include:

- Channel consent and unsubscribe check.
- Frequency cap, such as max messages by channel in a rolling window.
- Global suppression and hard bounce checks.
- Complaint/open case pause.
- Transactional messages prioritized over promotional messages.
- Quiet hours and market restrictions.
- Discount or incentive cap.
- Data minimization and data-sharing controls.
- Control group or holdout where incrementality matters.
- Approval gates for audience, content, offer, compliance, and launch.

## Measurement

Include:

- Primary KPI tied to the journey goal.
- Secondary engagement metrics.
- Guardrails such as unsubscribe, complaint, opt-out, frequency, and negative feedback.
- Journey-level metrics such as cross-channel conversion rate, time-to-purchase by segment, repeat purchase rate, and CLV trajectory where relevant.
- Test design for subject line, channel mix, timing, offer, content type, or holdout/control.

## Output Quality Checks

Before finalizing:

- Does the journey solve a specific customer barrier?
- Is the trigger observable?
- Is the entry audience precise enough to build?
- Are consent, suppression, frequency, exit, and re-entry rules explicit?
- Does each touch have a purpose and measurable outcome?
- Are fallbacks defined for missing data or channel permission?
- Are recommendations prioritized rather than exhaustive?
- Are assumptions clearly labelled?
