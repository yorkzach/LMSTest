# ADR-002: Real map view (Leaflet + online basemap tiles)

**Date:** 2026-08-03
**Status:** Accepted
**Deciders:** Zachary York (solution owner)

---

## Context

The original GIS view was a schematic PLSS section grid, not a real geographic
map. Stakeholders expect "mapping" to mean an actual map — as every off-the-shelf
land system (Quorum, P2, Pandell, iLandMan) provides. [ADR-001](./ADR-001-single-file-prototype.md)
chose a fully self-contained, no-network single-file app. A real basemap
inherently requires map tiles fetched over the network, so this decision
consciously relaxes that property for the map view.

## Decision

Add an interactive **Leaflet** map as the default GIS view, keeping the PLSS
section grid available as a toggle. Leaflet is **vendored locally** under
`vendor/leaflet/` (pinned to 1.9.4 — no CDN), satisfying the security standard's
"no remote scripts" rule and the dependency-pinning rule. **Basemap tiles**
(OpenStreetMap / OpenTopoMap / Esri World Imagery) load from public providers at
runtime — this is the only new network dependency. Tracts render as
type-colored `circleMarker`s (no marker image needed) at seeded, approximate
coordinates.

## Options considered

### A. Keep it fully self-contained (no tiles; draw over embedded outline)
- Pros: preserves ADR-001's offline property.
- Cons: not a real map; doesn't meet the stakeholder expectation.

### B. Leaflet + online basemap tiles ← Selected
- Pros: a real, familiar map; small vendored dependency; markers/popups/filters.
- Cons: relaxes ADR-001 (tiles need network); tile provider receives the map
  viewport.

### C. Full Esri/ArcGIS SDK
- Pros: closest to the production land systems.
- Cons: heavy, licensing, overkill for a prototype.

## Consequences

**Positive:**
- The GIS view now reads as a real map; markers click through to records.
- Leaflet is pinned and vendored — no remote script execution.

**Negative / Trade-offs:**
- ADR-001's "no network calls" no longer holds for the map view (basemap tiles).
- Adds a third-party runtime dependency (Leaflet) and its version to maintain.
- Offline, tiles won't load; the app degrades to markers-on-blank + the Section
  grid + the "Not mapped" list.

**Risks / production caveats:**
- **Do not send real tribal parcel coordinates (regulated Tier 3) to a public
  tile provider.** The prototype uses only approximate, illustrative demo
  coordinates. A production deployment must use an enterprise or self-hosted
  Esri / on-prem tile source and route the design through ARB and IT Security.

## Related decisions

- [ADR-001](./ADR-001-single-file-prototype.md) — the self-contained decision
  this one partially relaxes.
