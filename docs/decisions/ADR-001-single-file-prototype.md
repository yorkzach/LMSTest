# ADR-001: Single-file, client-side prototype

**Date:** 2026-08-03
**Status:** Accepted
**Deciders:** Zachary York (solution owner)

---

## Context

LandDesk needs to demonstrate the land-management workflow and UX to NTEC
stakeholders quickly, with zero infrastructure and no access to real
(Tier 3) land or tribal-government data. The goal is a shareable artifact that
anyone can open and click through, not a system of record. Production concerns
(auth, database, audit) are explicitly out of scope for this phase and will be
gated by ARB review before any real use.

## Decision

We will build the prototype as a **single self-contained `index.html`** —
all markup, CSS, logic, and seed data inline — running entirely in the browser,
persisting to `localStorage`, with **no backend and no runtime dependencies**.
Mock PDF instruments are generated offline by a dependency-free Node script and
embedded as data URIs. Brand styling comes from the vendored NTEC
`design-system/`.

## Options Considered

### Option A: Full-stack app (Next.js + Postgres + Entra ID)
- Pros: production-shaped; closer to the eventual build.
- Cons: heavy for a demo; requires infra, auth, and ARB review before it can
  hold any realistic data; slows down iteration on the actual UX question.

### Option B: SPA framework (React/Vue) with a mock API
- Pros: componentized; easier to grow later.
- Cons: adds a build step and tooling; still not shareable as one file; more
  than the demo needs.

### Option C: Single self-contained HTML file ← Selected
- Pros: opens anywhere; trivial to share and review; no infra/secrets; fast
  iteration; safe (illustrative data only, nothing leaves the browser).
- Cons: not a production architecture; single large file is harder to maintain;
  no tests/typing/CI in this form.

## Consequences

**Positive:**
- Stakeholders can run and evaluate the workflow with zero setup.
- No secrets, no data egress, no ARB dependency for the demo phase.

**Negative / Trade-offs:**
- Diverges from NavEnergy production standards (TypeScript, tests, CI/CD, Entra
  ID, Postgres) — these are deferred, not met. Tracked in the README
  "Path to production" section.
- A single ~4k-line HTML file is not how the production app should be structured.

**Risks:**
- Someone mistakes the prototype for a real system and enters real Tier 3 data.
  Mitigation: README, in-app "PROTOTYPE" tag, and illustrative-only seed data
  make the status explicit.

## Related Decisions

- None yet. A future ADR will record the production stack chosen at ARB time.
