# Washing Machine Post-Purchase Journey

## Scenario

Use when a customer buys a high-consideration product and needs setup support, feedback capture, and cross-sell. Example stack: Imagino, Hightouch, Braze, Movable Ink, Qualtrics, GA4, Salesforce Service Cloud.

## Journey Strategy

- Objective: Reduce post-purchase anxiety, improve setup, collect CSAT, and create relevant cross-sell.
- Primary KPI: accessory purchase within 30 days.
- Secondary KPIs: CSAT, setup-guide click rate, support contact reduction.
- Entry: purchase event with product_category = washing_machine.
- Exclusions: no consent for selected channel, open complaint, hard bounce, recent similar journey.

## Diagram

```mermaid
flowchart TD
    A[Trigger: Washing machine purchase] --> B[Imagino: audience and attributes]
    B --> C[Hightouch: sync to Braze]
    C --> D{Braze: consent and suppression OK?}
    D -- No --> X[Exit: suppressed]
    D -- Yes --> E[Braze Email 1: thank you and delivery expectations]
    E --> F[Wait until delivery date + 2 days]
    F --> G[Braze Email 2: setup guide with Movable Ink module]
    G --> H[Wait 3 days]
    H --> I{Opened or clicked?}
    I -- Yes --> J[Braze Email 3: care accessories]
    I -- No --> K{SMS consent?}
    K -- Yes --> L[Braze SMS: setup reminder]
    K -- No --> M[Braze Content Card: setup reminder]
    J --> N[Wait 7 days]
    L --> N
    M --> N
    N --> O[Qualtrics CSAT survey]
    O --> P{CSAT score}
    P -- Low --> Q[Salesforce Service Cloud task]
    P -- High --> R[Review or referral request]
```

## Platform Notes

- Braze owns Canvas orchestration, Action Paths, Message Steps, SMS fallback, Content Card fallback, and conversion events.
- Movable Ink owns product recommendation content module and fallback creative.
- Qualtrics owns Survey Project, Embedded Data, Branch Logic, and response-triggered workflows.
- Salesforce Service Cloud owns service recovery task creation for low CSAT.

## YAML Sketch

```yaml
journey:
  name: Washing Machine Post-Purchase Journey
  type: post_purchase
  lifecycle_stage: retention
  primary_kpi: accessory_purchase_rate_30d
  surveys:
    - tool: Qualtrics
      survey_type: CSAT
      trigger: delivery_date_plus_7d
      embedded_data:
        - customer_id
        - order_id
        - product_category
        - journey_id
```

