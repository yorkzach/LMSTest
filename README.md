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

### 4. GIS / Tract Map
A **Public Land Survey System (PLSS)** view. Each record's legal description
(`T29N R16W Sec 4–9, 16–21`) is parsed into a township + section list and
plotted on a 6×6 section grid (36 sections / township), with each tract's
footprint shaded in its record-type color. Pick a township from the sidebar,
see its tracts and acreage, and click any shaded parcel (or a tract in the
list) to open the record.

### 5. Documents (real, openable PDFs) + PDF auto-fill on intake
Every seeded record carries **generated mock PDF instruments** — lease
agreements, ROW grants, easements, permits, royalty agreements, plus a few
Land Department memos. They open in an in-app PDF viewer and can be
downloaded. New intake supports **drag-and-drop of your own files** (read
in-browser, no upload) which then open the same way.

When you attach a **PDF** during intake, the app **reads the document text
in-browser and pre-fills the form** — record type, lessor/grantor,
lessee/grantee, county/state, legal description, acreage, recording number,
effective & term-end dates, rental, and royalty rate. It only fills **empty**
fields, flashes what it guessed, and shows a summary banner — everything
stays editable, so any guess can be overridden. Text extraction handles both
uncompressed and FlateDecode-compressed streams (via the browser's native
`DecompressionStream`); parsing is heuristic and best-effort for arbitrary
real-world PDFs.

### 6. Dashboard
Portfolio KPIs (records, acreage under management, overdue/soon obligations,
annual rentals), a feed of upcoming & overdue obligations, and a
portfolio-by-type breakdown.

## Mock documents

The PDFs under `documents/` (and embedded in `index.html` as data URIs so the
single file is fully self-contained) are produced by
`scripts/gen-docs.js` — a dependency-free Node PDF writer. Regenerate them
with:

```
node scripts/gen-docs.js
```

This rewrites `documents/*.pdf` and re-injects the `window.DOC_BLOB` block in
`index.html`.

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
| `notes`, `docs[]` | free text + attached documents (`{name, kind, data}`) |

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
