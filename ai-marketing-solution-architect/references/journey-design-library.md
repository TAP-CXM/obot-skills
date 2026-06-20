# Journey Design Library

Use this reference for journey patterns, data requirements, decision patterns, personalisation, testing, survey, tracking, and governance.

## Journey Types

Support at least these lifecycle groups:

- Acquisition: lead nurture, newsletter signup, prospect welcome, event registration, event reminders, event follow-up, webinar nurture, quote request follow-up, quote abandonment, demo request follow-up, brochure download nurture, paid media lead nurture, offline event capture, retail lead capture, app install prompt.
- Welcome and onboarding: subscriber welcome, customer welcome, account onboarding, app onboarding, product onboarding, loyalty onboarding, preference capture, consent capture, first login, first value moment, trial onboarding, trial conversion.
- Commerce: first purchase, post-purchase, repeat purchase, basket abandonment, browse abandonment, product page abandonment, search abandonment, wishlist reminder, price drop, back-in-stock, replenishment, recommendation, cross-sell, upsell, subscription add-on, payment failure, order enhancement, delivery update, returns, review request.
- Retention: churn prevention, lapsed customer, win-back, reactivation, low engagement, dormant account, renewal, loyalty upgrade, VIP retention, birthday, anniversary, seasonal retention, preference refresh, repermission.
- Service and feedback: NPS, CSAT, CES, complaint recovery, service issue follow-up, closed-loop feedback, product registration, warranty, recall, appointment reminder, missed appointment, call centre follow-up, case closure, negative feedback escalation, positive advocacy.
- Offline and hybrid: store visit follow-up, POS capture, branch appointment, direct mail follow-up, call centre assisted journey, field sales follow-up, retail loyalty, offline-to-online activation, event attendance follow-up, local store reactivation.

## Channel Roles

| Channel | Best use | Key checks |
|---|---|---|
| Email | Rich content, education, offers, onboarding | Consent, deliverability, frequency caps |
| SMS | Urgent reminders and short nudges | SMS consent, length, cost, quiet hours |
| Push | App engagement and timely prompts | App installed, permission, relevance |
| In-app | Contextual education and onboarding | Active app usage, placement |
| Content cards | Persistent app or web content | Placement and lifecycle rules |
| Web personalisation | Real-time offers or next best action | Identity, page context, consent |
| WhatsApp | Conversational or high-trust reminders | Consent, approved templates, opt-out |
| Direct mail | High-value or low-digital journeys | Address quality, print lead time |
| Call centre | High-value, complex, service, or vulnerable cases | Agent script, CRM task, SLA |
| Paid media | Suppression, retargeting, reactivation | Audience sync, consent, exclusions |
| Retail or POS | Store and loyalty activation | Customer identification at POS |
| Survey | Feedback, NPS, CSAT, CES, preferences | Survey fatigue, closed-loop process |

## Data Framework

Profile data:

- customer_id, email_address, mobile_number, first_name, last_name, language, country, region, nearest_store, customer_since_date, lifecycle_stage, loyalty_id, loyalty_tier, preferred_channel, consent status, consent timestamps, vulnerability flags where relevant.

Behavioural data:

- email_open, email_click, sms_click, push_open, app_open, web_visit, product_view, category_view, search, basket_add, checkout_start, form_start, form_submit, content_engagement, survey_start, survey_submit.

Transactional data:

- purchase, order_id, product_id, category, purchase_date, order_value, quantity, discount_used, payment_status, delivery_status, return_status, refund_status.

Offline data:

- store_visit, POS_purchase, call_centre_contact, complaint_case, appointment, branch_visit, direct_mail_sent, direct_mail_response, event_attendance.

Derived data:

- days_since_last_purchase, predicted_churn_score, predicted_lifetime_value, next_best_product, next_best_offer, preferred_category, engagement_score, fatigue_score, discount_sensitivity, customer_value_segment, loyalty_progress, propensity_to_buy.

## Entry, Exit, Re-entry, and Suppression

Always define:

- Entry trigger: event, schedule, segment membership, audience sync, service status, renewal window, feedback response, or manual enrollment.
- Entry criteria: inclusion, channel consent, suppression, frequency cap, recent journey participation, data quality, market eligibility, and offer eligibility.
- Exit criteria: purchased, converted, survey completed, complaint opened, unsubscribed, consent withdrawn, entered conflicting journey, reached max touches, or completed service recovery.
- Re-entry: never, after X days, once per product, once per lifecycle event, once per subscription period, or only after a new qualifying behaviour.
- Suppression: unsubscribed, no channel consent, open complaint, recent similar exposure, vulnerable customer flag, deceased flag, fraud flag, staff/test account, hard bounce, global suppression, market exclusion.

## Decision Patterns

Engagement:

- Opened, clicked, ignored, viewed landing page, watched video, downloaded content, completed survey, no engagement after X days.

Commerce:

- Purchased, added to basket, started checkout, abandoned checkout, returned product, product in stock, replenishment due, eligible for discount, high basket value, low basket value.

Customer value:

- VIP, high value, loyalty member, near tier upgrade, discount sensitive, high churn risk, new customer, repeat customer, dormant customer.

Channel:

- Email consent, SMS consent, push permission, app installed, preferred channel known, fatigue score high, direct mail address valid, call centre follow-up appropriate.

Service:

- Complaint open, complaint resolved, low NPS, high NPS, negative CSAT, case closed, refund requested, delivery issue.

## Personalisation

Use multiple levels when relevant:

- Basic: first name, location, language, customer type, lifecycle stage.
- Behavioural: recently viewed products, browsed categories, basket contents, last purchase, product usage, app behaviour, content consumed.
- Transactional: order details, delivery status, renewal date, subscription type, product owned, warranty status.
- Predictive: propensity to buy, churn risk, next best product, next best offer, lifetime value, discount sensitivity, recommended send time.
- Contextual: weather, time of day, device, location, nearest store, stock availability, live price, countdown.

For every personalised element specify:

- Required data.
- Fallback data.
- Default content.
- Suppression condition.
- Approval requirement.

Example:

```yaml
personalisation:
  element: recommended_product
  primary_rule: use_next_best_product_from_model
  required_data:
    - customer_id
    - next_best_product_id
    - product_catalogue
  fallback_1: use_top_product_from_preferred_category
  fallback_2: use_best_seller_overall
  suppress_if: no_product_catalogue_match
```

## Testing

Include a testing plan unless excluded. Consider A/B test, multivariate test, champion/challenger, holdout, incrementality, offer test, subject line test, channel test, timing test, personalisation test, creative test, or recommendation algorithm test.

Each test needs:

- Hypothesis.
- Test type.
- Variants.
- Audience split.
- Primary metric.
- Secondary metrics.
- Guardrail metrics.
- Test duration.
- Success criteria.
- Decision rule.

## Survey and Feedback

Add feedback when it improves the journey or when requested. Common types include NPS, CSAT, CES, product satisfaction, delivery satisfaction, onboarding feedback, post-purchase feedback, cancellation reason, preference capture, and complaint resolution feedback.

Define:

- When the survey is sent.
- Who receives it.
- Which tool owns it.
- How links are personalised.
- Embedded data.
- How responses return to CRM, CDP, or engagement platform.
- Closed-loop actions for negative feedback.

## Tracking and Reporting

Always include:

- Operational metrics: audience size, eligible audience, suppressed audience, sent, delivered, bounced, failed, entries, exits, step completion.
- Engagement metrics: open, click, SMS click, push open, in-app engagement, web engagement, survey start, survey completion.
- Business metrics: conversion, revenue, revenue per recipient, average order value, repeat purchase, churn reduction, renewal, loyalty upgrade, retention, lifetime value.
- Guardrail metrics: unsubscribe, spam complaint, complaint rate, opt-out, contact frequency, negative feedback, delivery failure.
- Tracking details: events, properties, UTM strategy, conversion windows, attribution logic, dashboard requirements, alert thresholds.

## Governance

Every journey must include checks for:

- Consent by channel.
- Unsubscribe status.
- Suppression lists.
- Frequency caps.
- Age restrictions where relevant.
- Vulnerable customer rules where relevant.
- Complaint or open case suppression.
- Offer eligibility.
- Data minimisation.
- Personalisation safety.
- Legal copy approval.
- Brand approval.
- Accessibility.
- Auditability.

Approval gates:

1. Journey objective and audience approval.
2. Offer approval.
3. Content and creative approval.
4. Data and personalisation approval.
5. Compliance approval.
6. Test plan approval.
7. Final launch approval.

