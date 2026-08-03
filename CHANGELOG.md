# Changelog

All notable changes to NTEC LandDesk are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to adhere to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
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
  ad-hoc "earthen gold / mesa brown" theme and Segoe UI with a dark theme built
  from the NTEC Navy family, the primary palette (Orange `#DA6227`, Sky
  `#69BDE2`, Sand `#D8C9A3`) for accents, and Franklin Gothic Medium / Calibri
  type stacks.
- Replaced the placeholder "NL" logo tile with the official NTEC horizontal
  (4C, white-text) logo, used correctly on the dark sidebar.
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
