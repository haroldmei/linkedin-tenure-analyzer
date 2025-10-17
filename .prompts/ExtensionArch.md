Act as a Principal Chrome Extension Architect (MV3). Design a **compliant** LinkedIn Company Analysis extension with explicit guardrails (respect LinkedIn ToS, no unauthorized scraping; user-consented, on-page parsing only).

## 1. Overview
- Problem statement, goals, non-goals.
- Assumptions (auth, ToS boundaries, rate limits, page structure variability).

## 2. Functional Requirements
- Analyze button visible on company pages: `https://www.linkedin.com/company/{companyname}/`.
- Gather user-consented on-page data for current employees; infer past employees via visible UI filters/navigation only.
- Compute tenure distribution (define tenure precisely); produce summary stats + histograms/percentiles; CSV/JSON export.

## 3. Non-Functional Requirements
- MV3, secure, performant; ≥80% unit test coverage; CI/CD with automated packaging and release gates; accessibility.

## 4. Architecture (MV3)
- Components: service worker, content scripts, popup/options pages, message passing, permissions (`activeTab`, `scripting`, `storage`), CSP, sandboxing.
- Diagrams: data flow, sequence of Analyze action, error paths.
- Storage: schema, caching, persistence boundaries.

## 5. Compliance, Privacy, and Ethics
- ToS, consent UX, data minimization, PII handling, retention policy, user controls, legal review checklist.

## 6. Data Acquisition Strategy
- Robust selectors with fallback strategies; handling page structure variance.
- Pagination, batching, debouncing, exponential backoff, caps, sampling.
- Field dictionary: employee {name, title, start_date, end_date?, location, profile_url, current_or_past, seniority, team, confidence}.

## 7. Analytics
- Tenure definition + calculation; missing-data handling; outlier rules; summary stats; chart-ready bins.

## 8. UX & Accessibility
- Button placement; status indicator; progress; empty/error states; results UI (table + chart); keyboard navigation; i18n hooks.

## 9. Testing (≥80% Coverage)
- Unit: parsing utils, tenure calculators, schema validators.
- Integration: message passing, storage, content ↔ worker workflows.
- E2E: Playwright scenarios (company page variants, errors, rate limits).
- Coverage plan: per-module targets totalling ≥80%.

## 10. CI/CD
- GitHub Actions: lint, type-check, unit + integration + E2E (headless), build (vite/rollup), package MV3, upload artifacts, release tag, semantic versioning.
- Branch protections, required checks, release notes automation.

## 11. Security & Threat Model
- Risks (permission abuse, XSS via DOM injection, leaking PII), mitigations (CSP, sanitization, least privilege, code signing).

## 12. Deliverables
- `manifest.json` (MV3) skeleton with minimal permissions.
- Example content script outline.
- Storage schema (TypeScript types + JSON example).
- CI workflow YAML example.
- Test matrix + coverage mapping table.
- ASCII architecture & sequence diagrams.

## 13. Acceptance Criteria & Review Checklist
- Pass/fail criteria for UX, analytics, coverage, performance, and compliance; stakeholder sign-off list.

Return all sections with explicit, actionable detail and short code/config snippets where helpful (no placeholders like “do X”).
