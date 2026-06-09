---
name: release-readiness-review
display_name: Release Readiness Review
description: Reviews a planned software release for risk, missing checks, rollout gaps, and rollback readiness.
license: Proprietary
version: 0.1.0
tags:
  - release
  - qa
  - operations
  - engineering
compatibility:
  - claude
  - codex
  - chatgpt
---

# Release Readiness Review

## Purpose

Use this skill when a user wants a structured assessment of whether a release is ready to ship.

This skill is for operational review, not for writing feature code. It helps identify release risk, missing validation, rollout gaps, dependency issues, and rollback weaknesses before deployment.

## When to Use

Use this skill when the user wants to:

- review a release candidate
- assess deployment readiness
- evaluate a change list for operational risk
- verify test and rollout coverage
- prepare a go or no-go recommendation
- create a release checklist from existing context

## Inputs

- release summary or PR list
- deployment target or environment
- known dependencies or migrations
- test evidence, if available
- rollout plan, if available
- rollback plan, if available

## Process

1. Identify the scope of the release.
2. Separate product changes, infrastructure changes, configuration changes, and data changes.
3. Check whether the release includes risky elements such as schema changes, auth changes, billing changes, background jobs, or external integrations.
4. Review validation evidence:
   - automated tests
   - manual QA
   - staging verification
   - monitoring or alert coverage
5. Review rollout safety:
   - phased rollout or all-at-once
   - feature flags
   - blast radius
   - stakeholder communication
6. Review rollback safety:
   - rollback steps
   - reversibility of data changes
   - dependency ordering
7. Produce a clear readiness recommendation with blocking issues separated from non-blocking concerns.

## Review Priorities

### Highest Risk Areas

Pay particular attention to:

- schema or migration changes
- secrets or auth configuration changes
- third-party API behavior changes
- background processing changes
- changes to user-critical paths
- incomplete observability

### Evidence Standards

Do not treat vague claims such as "should be fine" as evidence.

Prefer concrete proof:

- test runs
- staged screenshots
- health checks
- migration plans
- dashboards or alert expectations

## Output Format

Return:

- Release scope
- Key risks
- Missing checks
- Rollout assessment
- Rollback assessment
- Blocking issues
- Non-blocking concerns
- Recommendation: go, go with conditions, or no-go
- Next step
