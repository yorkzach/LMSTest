# NTEC LandDesk — Land Management System (Prototype)

A lightweight, self-contained prototype of a **land management & contract
administration system** for NTEC (Navajo Transitional Energy Company). It is
modeled on the core workflows of established land/lease systems (Quorum Land,
P2/Enterprise Land, iLandMan, Pandell LandWorks): a **document intake** front
door, a searchable/sortable **records book**, and an **obligation tickler /
reminder** engine.

> **Prototype** — everything runs in a single HTML file. Data is seeded with
> realistic NTEC-style records and persists in the browser's `localStorage`.
> No backend, no build step, no dependencies.

## Run it

Open `index.html` in any modern browser. That's it.

(To reset to the seeded demo data, clear the site's local storage or run
`localStorage.removeItem('ntec_landdesk_v1')` in the console.)

## What it does

### 1. Document Intake
"New Intake" captures a land instrument with the attributes land departments
actually track:

- Instrument name & **record type** — Coal Lease, Oil & Gas Lease, Mineral /
  Surface Lease, Right-of-Way, Easement, Grazing Permit, Royalty Agreement,
  Water Agreement, Access / Land Use
- **Parties** — Lessor/Grantor and Lessee/Grantee (tribal, allottee, BLM/BIA,
  private, county)
- **Legal description** — Township / Range / Section, county, state, acreage
- Recording / instrument number
- Effective date and term end (expiration)
- Financials — annual rental and royalty rate
- **Next obligation / reminder** (drives the tickler)
- Notes and an attached document (drag-and-drop; filename stored)

### 2. Land Records (search & sort)
A records table with:

- **Global search** across name, parties, tract, county, reference, notes
- **Filters** by record type and status, plus an "active reminder" quick filter
- **Click-to-sort** on every column (name, type, status, parties, location,
  acreage, term end, next obligation)
- Color-coded record types and status badges; click any row for full detail
- Edit / delete from the detail drawer

### 3. Reminders / Tickler
An obligation calendar that classifies every reminder as **Overdue**,
**Due ≤ 30 days**, or **Upcoming** — the classic land "tickler" so rental
payments, lease renewals, ROW renewals, royalty reports, compliance filings,
option deadlines, and reclamation milestones don't slip.

### 4. Dashboard
Portfolio KPIs (records, acreage under management, overdue/soon obligations,
annual rentals), a feed of upcoming & overdue obligations, and a
portfolio-by-type breakdown.

## Data model (per record)

| Field | Notes |
|---|---|
| `name`, `type`, `status` | instrument + classification |
| `lessor`, `lessee` | grantor / grantee |
| `county`, `state`, `legal`, `acres` | location & tract |
| `ref` | recording / instrument number |
| `eff`, `exp` | effective & term-end dates |
| `rental`, `royalty` | annual rental $, royalty % |
| `obType`, `obDate` | next obligation → tickler reminder |
| `notes`, `file` | free text + attached filename |

## Notes for reviewers

- The demo uses a **fixed "today" of 2026-08-03** so the overdue / upcoming
  buckets stay stable regardless of when you open it.
- Seed data reflects NTEC's real operating footprint (Navajo Mine, Four
  Corners, Spring Creek Mine in Montana, Powder River, solar/transmission
  development) but the specific parties, numbers, and instrument references are
  **illustrative only**.
- This is a front-end prototype meant to demonstrate the workflow and UX. A
  production build would add a real backend, authentication, document storage,
  audit trail, and integration with GIS / accounting systems.
