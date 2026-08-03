# NTEC LandDesk — Land Management System (Prototype)

> A lightweight, self-contained prototype of a land management & contract
> administration system for Navajo Transitional Energy Company (NTEC), for
> internal demonstration of the intended workflow and UX.

---

## Overview

NTEC LandDesk is a front-end prototype of a **land management & contract
administration system**. It is modeled on the core workflows of established
land/lease systems (Quorum Land, P2/Enterprise Land, iLandMan, Pandell
LandWorks): a **document intake** front door, a searchable/sortable **records
book**, and an **obligation tickler / reminder** engine, plus a PLSS tract map
and an in-app document viewer.

Everything runs in a single HTML file. Data is seeded with realistic
NTEC-style records and persists in the browser's `localStorage`. There is no
backend, no build step, and no runtime dependencies. It exists to demonstrate
the workflow to stakeholders, not to manage real records — see
[Path to production](#path-to-production).

## Owner

| Role | Name | Contact |
|---|---|---|
| Solution Owner | Zachary York | zach.york@navenergy.com |
| Maintaining Team | NTEC IT – Applications (prototype; production owner TBD) | — |

## Data Classification

**Highest data tier handled (prototype):** **Tier 2 — Internal.**
The seeded records are **illustrative/synthetic**. They reflect NTEC's real
operating footprint (Navajo Mine, Four Corners, Spring Creek Mine, Powder
River, solar/transmission development) but the specific parties, dollar
amounts, and instrument references are invented for the demo.

**Production target:** a real deployment would handle **Tier 3 — Confidential**
data, including vendor/lease contracts, mine operational data, and **tribal
government data (regulated Tier 3)**. That tier requires **ARB review before
production** and must follow the NavEnergy **Data Classification Standards**.

> **No data is sent to any AI tool at runtime.** The PDF auto-fill feature (see
> below) parses text entirely **in-browser**; nothing is uploaded and no LLM or
> external service is called.

## ARB Status

| Field | Value |
|---|---|
| ARB Review Required | **Yes — before any production use** (land/contract system handling Tier 3 data in production) |
| ARB Decision | N/A — prototype, not submitted |
| ARB Decision Date | — |
| ARB Record Link | — |
| Post-Deployment Review Date | N/A (prototype) |

This is a **demonstration prototype only**. It must not be used to store or
manage real land records until it has been through ARB review and rebuilt to
the production standards below.

## AI Tools Used

| Tool | Vendor | Model/Version | Purpose |
|---|---|---|---|
| Claude Code | Anthropic | Claude (Opus 4.x) | AI-assisted development of this prototype |

- **Runtime AI:** none. The application makes no calls to any AI service.
- **Build-time AI:** the prototype was drafted with AI assistance. AI-generated
  code has been reviewed by the solution owner.

## Dependencies

| System / Service | Purpose | Owner |
|---|---|---|
| Modern web browser | Runs the app (client-side only) | — |
| Node.js (dev only) | Regenerates mock PDFs via `scripts/gen-docs.js` (dependency-free) | — |
| NTEC design system (`design-system/`) | Official NTEC brand tokens, components, and logo assets — vendored in per the NavEnergy **Design Standards** | NTEC Communications / NAB |
| Leaflet 1.9.4 (`vendor/leaflet/`) | Interactive map for the GIS view — vendored locally, not CDN | — |
| Basemap tile providers (OpenStreetMap / OpenTopoMap / Esri) | Map tiles for the GIS view, fetched at runtime | third-party |

The only runtime network calls are basemap map tiles for the GIS view (see
[ADR-002](./docs/decisions/ADR-002-real-map-dependency.md)). No other CDNs,
APIs, or databases at runtime.

## Setup & Configuration

### Prerequisites
- Any modern browser (Chrome, Edge, Firefox, Safari).

### Environment Variables
None. This is a fully client-side prototype and stores no secrets.

### Run it
Serve the folder and open `index.html`:

```
# from the repo root
python -m http.server 8000
# then browse to http://localhost:8000/index.html
```

Opening `index.html` directly from the file system also works, except the
sidebar logo (loaded from `design-system/`) requires serving over HTTP.

To reset to the seeded demo data, clear the site's local storage or run
`localStorage.removeItem('ntec_landdesk_v4')` in the browser console.

## How to Use

### 1. Document Intake
"New Intake" captures a land instrument with the attributes land departments
actually track: instrument name & **record type** (Coal Lease, Oil & Gas Lease,
Mineral / Surface Lease, Right-of-Way, Easement, Grazing Permit, Royalty
Agreement, Water Agreement, Access / Land Use), **parties** (lessor/grantor and
lessee/grantee), **legal description** (Township / Range / Section, county,
state, acreage), recording number, effective/term-end dates, financials (annual
rental, royalty rate), the **next obligation / reminder**, notes, and an
attached document (drag-and-drop; filename stored).

### 2. Land Records (search & sort)
- **Global search** across name, parties, tract, county, reference, notes
- **Filters** by record type and status, plus an "active reminder" quick filter
- **Click-to-sort** on every column
- Color-coded record types and status badges; click any row for full detail;
  edit / delete from the detail drawer

### 3. Reminders / Tickler
An obligation calendar that classifies every reminder as **Overdue**,
**Due ≤ 30 days**, or **Upcoming** so rental payments, lease renewals, ROW
renewals, royalty reports, compliance filings, option deadlines, and
reclamation milestones don't slip.

### 4. GIS / Tract Map
An **interactive map** (Leaflet) showing each record at its approximate location
as a marker colored by record type; click a marker for a popup and to open the
record. Basemap switcher (Streets / Topographic / Satellite), type/status
filters, a legend, and a "Not mapped" list for records without coordinates. A
**Section grid** toggle switches to the original **Public Land Survey System
(PLSS)** schematic — each record's legal description (`T29N R16W Sec 4–9, 16–21`)
parsed into a township + section list on a 6×6 section grid. New records can be
given coordinates in intake (type them or drop a pin on a map).

> Marker positions are **approximate, illustrative demo locations — not real
> parcel geometry**. Basemap tiles load from public providers at runtime; see
> [ADR-002](./docs/decisions/ADR-002-real-map-dependency.md) for the production
> caveat about tribal-land coordinates.

### 5. Documents + PDF auto-fill on intake
Every seeded record carries **generated mock PDF instruments** that open in an
in-app viewer and can be downloaded. New intake supports drag-and-drop of your
own files (read in-browser, no upload). When you attach a **PDF** during intake,
the app **reads the document text in-browser and pre-fills empty form fields**
(record type, parties, county/state, legal description, acreage, recording
number, dates, rental, royalty). It only fills empty fields and everything stays
editable. Text extraction handles uncompressed and FlateDecode-compressed
streams via the browser's native `DecompressionStream`; parsing is heuristic and
best-effort. **All of this happens locally — no data leaves the browser.**

### 6. Dashboard
Portfolio KPIs (records, acreage under management, overdue/soon obligations,
annual rentals), a feed of upcoming & overdue obligations, and a
portfolio-by-type breakdown.

## Design

The UI uses the **official NTEC design system** vendored into `design-system/`
(brand tokens, components, and the approved logo suite from the NTEC Brand
Standards Guideline, May 2024). The interface is a light theme built from the
NTEC neutral scale with the primary palette (Orange `#DA6227` for CTAs, Steel
`#496A96` for links, plus Sky/Sand/secondary colors) for accents, Franklin
Gothic Medium for display type and Calibri for body. See
[design system README](./design-system/) and `docs/architecture.md`.

## Mock documents

The PDFs under `documents/` (also embedded in `index.html` as data URIs so the
single file is self-contained) are produced by `scripts/gen-docs.js`, a
dependency-free Node PDF writer. Regenerate with `node scripts/gen-docs.js`,
which rewrites `documents/*.pdf` and re-injects the `window.DOC_BLOB` block.

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

## Path to production

This prototype intentionally omits things a production NTEC solution requires.
Before real use it must, per the NavEnergy application standards, add:

- **ARB submission & approval** (Tier 3 data, tribal government data) — required
- **Authentication** via NTEC Entra ID (no local user store)
- A **backend + database** (PostgreSQL default) with committed migrations,
  audit trail, and real document storage
- **TypeScript + ESLint/Prettier**, a **test suite (test-first)**, and a
  **CI/CD pipeline** with a blocking secret-scan gate
- **Structured logging** (Pino) and observability
- Integration with GIS / accounting systems

## Notes for reviewers

- The demo uses a **fixed "today" of 2026-08-03** so the overdue / upcoming
  buckets stay stable regardless of when you open it.
- Seed data is **illustrative only** (see [Data Classification](#data-classification)).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
