# Design — NTEC LandDesk real interactive map

**Date:** 2026-08-03
**Feature:** Replace the schematic PLSS section-grid GIS view with a real,
interactive geographic map. Feature 1 of a planned four (map → reports/exports →
obligation workflow → ownership/interest); this spec covers the map only.
**Status:** Approved (brainstorm) — pending implementation plan.

---

## Problem

The current **GIS / Tract Map** view (`renderGIS`, ~line 925) draws each township
as an idealized 6×6 grid of 36 sections and shades the sections named in a
record's legal description. It is a useful cadastral schematic but it is **not a
real map**: no geography, no basemap, no true location or scale, no pan/zoom.
Stakeholders asking for "mapping" expect a real map — which is what every
off-the-shelf land system (Quorum, P2, Pandell, iLandMan) provides.

## Goal

A real interactive map that shows each land record in its approximate
real-world location, colored by record type, click-to-open — while keeping the
existing PLSS section grid available as a toggle.

## Non-goals (YAGNI)

- No drawing/editing geometry on the map.
- No shapefile / GeoJSON import or export.
- No real geodetic PLSS → lat/long conversion (demo uses seeded coordinates).
- No layers beyond tract markers + basemap switch.
- No real tribal parcel geometry (see Data classification).

## Decisions (from brainstorm)

- **Basemap:** online tiles via **Leaflet**, with a Streets / Topographic /
  Satellite switcher. Leaflet is **vendored locally** (not CDN). Tiles load from
  public providers at runtime.
- **Tract geometry:** one **marker per record**, colored by record type, with a
  popup and an "Open record" action.
- **Sequencing:** ship this feature on its own (spec → plan → build → verify →
  commit) before the other three.

## UX & behavior

- GIS view leads with a Leaflet map filling the content area. A left rail (reusing
  current styling) shows, **in map mode**: the existing type/status filters +
  global search, the legend, and the "Not mapped" list. The **township selector**
  stays part of **grid mode** (the PLSS schematic), not map mode.
- **Basemap switcher** control (top-right): Streets, Topographic, Satellite.
- **Markers:** each record with coordinates → a marker in its record-type color.
  Popup shows name, type, status badge, parties, acreage, next obligation, and an
  **"Open record"** button that opens the existing detail drawer/modal.
- **Filters/search apply to the map** — filtered-out records are removed from the
  map; the map fits bounds to the visible markers.
- **Legend** of record types present in the current view.
- **"Section grid" toggle** switches to the existing PLSS schematic
  (`renderGIS` logic retained, not removed).
- **Records without coordinates** are listed in a "Not mapped (no coordinates)"
  panel under/beside the map — same spirit as today's `unmapped` handling. Each
  is still clickable to open its record.

## Data model & intake

- Add optional `lat` (number) and `lng` (number) to the record shape.
- **Seed** approximate coordinates for the 12 demo records near their real
  assets (illustrative, hand-placed): e.g. Navajo Mine / Fruitland NM, Four
  Corners, Bisti / San Juan NM, Spring Creek / Big Horn MT, Powder River WY,
  Montezuma CO transmission corridor, etc. Coordinates are approximate and carry
  no real parcel geometry.
- **Intake form:** add optional **Latitude** / **Longitude** fields with a
  "drop a pin on the map" helper (click the map to fill them). Blank → record
  lands in "Not mapped."
- Persistence: `lat`/`lng` flow through the existing `localStorage`
  (`ntec_landdesk_v1`) save/load like any other field; older saved records simply
  lack the fields and render as "Not mapped" until edited.

## Technical approach

- **Leaflet vendored** under `vendor/leaflet/` (pinned version; `leaflet.js`,
  `leaflet.css`, and marker image assets), referenced by relative path. No remote
  `<script>`/`<link>` — satisfies the security standard (no remote scripts) and
  dependency-pinning.
- Map init: create the map, add the default (Streets) tile layer, add a layer
  control for the three basemaps. Markers are built from the filtered record set;
  re-rendered when filters/search change. Marker color uses the existing
  `typeColor()`.
- **Attribution:** each basemap layer carries its provider's required attribution
  (OpenStreetMap for Streets; OpenTopoMap for Topographic; Esri World Imagery for
  Satellite — final providers confirmed at implementation, all free-for-demo with
  attribution).
- Keep the rest of the app self-contained; only basemap tiles require network.

## Standards & data classification

- **ADR-002** will record that this relaxes ADR-001's "no network calls"
  property (basemap tiles), names the new Leaflet dependency, and states the
  production caveats: use an enterprise/self-hosted Esri or on-prem tile source in
  production, never send real tribal parcel coordinates (regulated Tier 3) to a
  public tile provider, and route through ARB / IT Security.
- README/CHANGELOG updated: new `vendor/` dependency, the map feature, and the
  runtime-network note (prototype still Tier 2 / illustrative data only).

## Edge cases

- Record with no `lat`/`lng` → "Not mapped" list, not a marker.
- Tiles fail to load (offline) → map controls still render; markers still plot on
  a blank canvas; the "Section grid" toggle and "Not mapped" list remain usable.
- Filters/search reduce markers to zero → empty-state message; map keeps last
  sensible view.
- Clicking a marker popup's "Open record" and clicking a list row both open the
  same detail drawer.
- Invalid lat/lng entered in intake → basic range validation (lat −90..90,
  lng −180..180); invalid values rejected with the existing form error styling.

## Verification

- Serve locally and drive in a browser: map renders with markers in correct
  type colors; popup → detail drawer works; basemap switch works; grid toggle
  works; type/status filters and search update the markers; a no-coordinate
  record appears under "Not mapped"; intake "drop a pin" fills lat/lng and the new
  record shows on the map.

## Rollout

Single conventional commit (`feat: real interactive map for the GIS view`) plus
the ADR-002 and doc updates, then push and fast-forward `main` — same flow used
for the rebrand and light-mode changes.
