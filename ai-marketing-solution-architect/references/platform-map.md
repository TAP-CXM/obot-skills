# Platform Map

Use this reference when the user names marketing technology platforms or asks for implementation notes.

## Capability Matrix

When tools are named, create a platform capability matrix:

| Capability | Recommended owner | Backup option | Notes |
|---|---|---|---|
| Audience definition | CDP, warehouse, Imagino, SF Data Cloud, AEP, or platform segment | Engagement platform segment | Choose the system with the most reliable identity, consent, and attributes. |
| Audience activation | Hightouch, Census, native connector, or CDP activation | Manual import only for controlled cases | Include match key, field mapping, sync schedule, and error handling. |
| Journey orchestration | Braze Canvas, SFMC Journey Builder, AJO Journey, Bloomreach Scenario, Dotdigital Program | Batch workflow or campaign if real-time is unavailable | Match trigger latency and decision needs to the platform. |
| Messaging | Engagement platform channel steps | Specialist channel tool | Check consent, templates, sender, localisation, quiet hours, and frequency. |
| Dynamic content | Movable Ink, Adobe Target, Dynamic Yield, Optimizely, native platform personalisation | Static variants | Include data source, rules, fallback creative, and rendering QA. |
| Survey | Qualtrics, Medallia, Dotdigital forms, SurveyMonkey Enterprise | Manual form or CRM case capture | Include embedded data and closed-loop response handling. |
| Analytics | GA4, Adobe Analytics, Amplitude, Mixpanel, Power BI, Tableau, Looker | Platform reporting | Combine journey events with business outcomes. |
| CRM or service recovery | Salesforce Service Cloud, Zendesk, Dynamics, Genesys | Manual service queue | Define escalation trigger, owner, SLA, and feedback loop. |
| Compliance | Platform rules plus central policy | Manual QA | Consent and suppression checks must precede sending. |

## Platform Ownership Patterns

### Braze

Use terms such as Canvas, Canvas Flow, Canvas Entry Criteria, Entry Audience, Audience Paths, Action Paths, Experiment Paths, Delay step, Message step, Email, SMS, Push, In-app message, Content Card, Webhook, Liquid personalisation, Connected Content, Catalogs, Intelligent Timing, Frequency Capping, Subscription Groups, Custom Events, Custom Attributes, Purchase Events, Conversion Events, and Currents.

Typical ownership:

- Real-time or event-triggered journey orchestration.
- Cross-channel sequencing and behavioural branching.
- Email, SMS, push, in-app, content card, and webhook steps.
- Conversion events and engagement exports.

### Adobe Campaign Classic or v8

Use terms such as Campaign, Workflow, Query activity, Enrichment, Split activity, Scheduler, Test activity, Delivery activity, Recurring delivery, Continuous delivery, Typology rules, Pressure rules, Seed addresses, Proofs, Control Group, Target Mapping, Broadlog, Tracking logs, Exclusion, Suppression, and Delivery indicators.

Typical ownership:

- Batch or recurring campaign orchestration.
- Audience query, enrichment, and delivery execution.
- Typology, pressure, exclusions, proofs, and audit trail.

### Adobe Journey Optimizer

Use terms such as Journey, Event, Audience, Condition, Wait, Action, Channel Surface, Decision Management, Offer Decisioning, Fragments, Content Templates, Landing Pages, and Journey Reporting.

Typical ownership:

- Real-time journeys and event-triggered experiences.
- Channel actions and decisioning.
- Offer selection and reporting.

### Salesforce Marketing Cloud Engagement

Use terms such as Journey Builder, Entry Source, Data Extension, Contact Builder, Contact Key, Decision Split, Engagement Split, Wait Activity, Email Activity, SMS Activity, Push Activity, Update Contact Activity, Goal, Exit Criteria, Journey History, Automation Studio, SQL Query Activity, Send Classification, Publication List, Suppression List, Einstein Send Time Optimization, and CloudPages.

Typical ownership:

- Journey Builder orchestration.
- Data Extension-based entry and segmentation.
- Email, SMS, and push delivery.
- Journey goals, exits, and engagement splits.

### Bloomreach Engagement

Use terms such as Scenario, node, trigger, condition, wait, Email node, SMS node, Webhook node, experiments, predictions, recommendations, customer attributes, events, catalogs, segments, weblayers, and consent categories.

Typical ownership:

- Behaviour-based scenarios.
- Personalised email, SMS, webhook, and web journeys.
- Predictions, recommendations, catalogs, and web personalisation.

### Dotdigital

Use terms such as Program Builder, Program, enrolment, Start node, Decision node, Delay node, Campaign, Address Book, Segment, Contact Data Fields, Insight Data, ConsentInsight, Email Campaign, SMS Campaign, Surveys, Pages and Forms, Web Behaviour Tracking, and External Dynamic Content.

Typical ownership:

- Email and SMS program automation.
- Contact segmentation, surveys, forms, and web-triggered programs.

### Imagino

Use terms such as Customer 360, Unified Customer Profile, Identity Resolution, Audiences, Segments, Calculated Attributes, Aggregates, Data Model, Connectors, Exports, and Activations.

Typical ownership:

- Customer data unification.
- Audience definition and calculated attributes.
- Segment activation to engagement tools.

### Hightouch

Use terms such as Model, Sync, Destination, Source, Reverse ETL, Audience, Parent Model, Match Key, Field Mapping, Sync Schedule, Sync Runs, and Error Records.

Typical ownership:

- Activating warehouse audiences into marketing platforms.
- Syncing attributes and events.
- Maintaining suppressions and enrichment fields.

### Qualtrics

Use terms such as Survey Project, Survey Flow, Embedded Data, XM Directory, Contact List, Distribution, Anonymous Link, Personal Link, Branch Logic, Display Logic, Response Triggers, Workflows, NPS, CSAT, CES, Dashboard, and Closed-loop Feedback.

Typical ownership:

- Survey design and feedback capture.
- NPS, CSAT, and CES measurement.
- Response-triggered closed-loop actions.

### Movable Ink

Use terms such as Content Module, Data Source, Rules, Real-time Content, Contextual Data, Personalised Image, Countdown Timer, Poll, Scratch-off, Social Proof, Product Recommendations, Creative Variants, and Fallback Creative.

Typical ownership:

- Real-time dynamic content inside email or mobile messages.
- Product recommendation modules.
- Live pricing, stock, countdowns, store, weather, or contextual creative.

