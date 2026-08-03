# Changelog

All notable changes to NTEC LandDesk are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to adhere to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Interactive map for the GIS view** (Leaflet, vendored locally at
  `vendor/leaflet/`): records plotted as type-colored markers at seeded
  approximate coordinates, popup → open record, basemap switcher (Streets /
  Topographic / Satellite), type/status filters, legend, and a "Not mapped"
  list. The original PLSS section grid is retained behind a "Section grid"
  toggle. Intake gains optional Latitude/Longitude with a drop-a-pin helper.
  Basemap tiles are the only runtime network dependency — see
  [ADR-002](./docs/decisions/ADR-002-real-map-dependency.md). Storage key bumped
  to `ntec_landdesk_v4` (records now carry `lat`/`lng`).

- Vendored in the official **NTEC design system** (`design-system/`): brand
  tokens, components, and the approved logo suite (NTEC Brand Standards
  Guideline, May 2024). Web-relevant assets only (CSS + PNG logos); print
  formats (EPS/PDF/JPG) were omitted to keep the repo lean and remain available
  from the bootstrap repo / Communications SharePoint.
- Canonical `.editorconfig` and a hardened `.gitignore` per NavEnergy standards.
- `docs/architecture.md` (with a Mermaid architecture diagram) and
  `docs/decisions/ADR-001-single-file-prototype.md`.
- `CHANGELOG.md` (this file).

### Changed
- **Rebranded the UI to the official NTEC palette and typography.** Replaced the
  ad-hoc "earthen gold / mesa brown" theme and Segoe UI with a light theme built
  from the NTEC neutral scale, the primary palette (Orange `#DA6227` for CTAs,
  Steel `#496A96` for links) for accents, and Franklin Gothic Medium / Calibri
  type stacks. Status colors use the design system's light-surface values.
- Replaced the placeholder "NL" logo tile with the official NTEC horizontal
  (4C) logo.
- Re-mapped record-type data-viz colors to the NTEC secondary palette.
- Expanded `README.md` to the NavEnergy `SOLUTION_README_TEMPLATE` shape: Owner,
  Data Classification, ARB Status, AI Tools Used, Dependencies, and a
  "Path to production" gap list.

## [0.3.0] — Prototype: PDF auto-fill

### Added
- Auto-fill the intake form from an uploaded PDF (in-browser text extraction;
  fills empty fields only). No data leaves the browser.

## [0.2.0] — Prototype: documents & GIS

### Added
- Generated mock PDF instruments for every seeded record, an in-app PDF viewer,
  and multi-document intake.
- GIS / PLSS tract map that plots each record's legal description on a township
  section grid.

## [0.1.0] — Prototype: initial

### Added
- Initial NTEC LandDesk prototype: document intake, searchable/sortable land
  records, obligation tickler/reminders, and dashboard KPIs. Single-file
  client-side app with `localStorage` persistence and seeded demo data.
