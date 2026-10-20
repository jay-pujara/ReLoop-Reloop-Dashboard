# ReLoop — Product Requirements Document

**Project:** ReLoop — Carbon-Aware B2B Circular Packaging & Materials Exchange
**Hackathon:** HackOut'26
**Theme:** Circular Carbon Ecosystem
**Problem Statement:** Circular Packaging & Materials Exchange
**Document version:** 1.0
**Status:** Draft for build

---

## 1. Executive summary

ReLoop is a B2B marketplace where manufacturers, retailers, recyclers and logistics operators trade surplus and recyclable packaging materials — corrugated cardboard, plastics, pallets, drums, gaylords, stretch film and strapping.

Unlike a generic classifieds board, every match in ReLoop is scored on **net carbon impact**, not just price. The platform computes the embodied carbon avoided by reusing a material, subtracts the transport emissions required to move it, and refuses to recommend trades where the transport cost exceeds the saving.

This produces the product's defining primitive: the **carbon break-even radius** — the maximum distance a given material can travel before the trade stops being circular.

The platform closes the loop with AI-graded material condition, consolidated multi-stop route optimisation, 3D load planning, and auditable carbon and compliance records issued per transaction.

---

## 2. Problem context

### 2.1 The waste problem

Manufacturing and retail generate very large volumes of packaging waste. A significant share is structurally reusable — pallets with minor damage, single-use gaylords, clean corrugate, HDPE drums — but ends up in landfill or low-value downcycling because there is no efficient mechanism to match a surplus in one facility with a demand in another.

### 2.2 Why existing exchanges fail

A materials exchange is not a technology problem. It is a trust-and-economics problem. Three failure modes kill these platforms:

**Failure 1 — Trust.** A procurement manager will not commit to 400 pallets sight-unseen from an unknown counterparty. Without verified condition assessment and payment protection, listings never convert.

**Failure 2 — Logistics economics.** Recovered corrugate trades at a low value per kilogram. A dedicated truck over any meaningful distance destroys the margin. Small lots are individually uneconomic to move. Without consolidation, only large-lot trades survive, and those already happen through existing broker relationships.

**Failure 3 — Unproven impact.** Buyers and sellers increasingly need to report on circularity and emissions. A platform that says "you diverted 3 tonnes from landfill" without a defensible methodology produces a number nobody can file.

### 2.3 The insight this product is built on

Moving a material is not free. Reuse avoids the embodied carbon of virgin production, but freight emits. Past a certain distance, a "circular" trade emits more carbon than it saves.

Most platforms in this space ignore this entirely and count all diverted tonnage as a win. ReLoop models it explicitly, surfaces it in the interface, and lets it govern the matching engine. A platform that will actively tell a user *not* to make a trade is a platform whose numbers can be trusted.

---

## 3. Goals and non-goals

### 3.1 Goals

- **G1.** Let any business list surplus packaging material in under 90 seconds from a phone in a warehouse yard.
- **G2.** Match listings to requirements automatically on material compatibility, grade, volume, timing and geography.
- **G3.** Compute a defensible net CO₂e figure for every proposed and completed trade.
- **G4.** Prevent carbon-negative trades from being recommended.
- **G5.** Make small-lot trades economically viable through pickup consolidation and backhaul matching.
- **G6.** Issue an auditable impact record per transaction that a sustainability team can actually use.
- **G7.** Reduce the trust gap through AI-assisted condition grading and a dispute-backed transaction flow.

### 3.2 Non-goals (explicitly out of scope for v1)

- Consumer-facing / household recycling.
- Acting as the carrier. ReLoop plans and books routes; it does not own trucks.
- Full payments and settlement infrastructure. v1 models escrow state; real money rails are post-hackathon.
- Hazardous or regulated waste streams.
- Chemical recycling or material reprocessing itself.
- International cross-border trade and customs.

### 3.3 Success metrics

| Metric | Definition | v1 target |
|---|---|---|
| Match conversion rate | Matches accepted / matches surfaced | ≥ 25% |
| Net carbon efficiency | Net CO₂e saved / gross CO₂e avoided | ≥ 0.80 |
| Average truck load factor | Volume used / volume available | ≥ 75% |
| Time to first listing | Signup → first published listing | < 5 min |
| Rejected-for-carbon rate | Matches suppressed by break-even rule | Tracked, not targeted |

---

## 4. Users and personas

### 4.1 Persona A — Priya, Plant Operations Manager (Seller)

Runs a ceramics plant in Morbi. Accumulates 2–4 tonnes of corrugate and 150–200 pallets a month. Currently sells to a local scrap aggregator at whatever rate is offered. Wants: less storage clutter, a better rate, and a number she can put in the company's sustainability report.

**Needs:** fast listing from the yard, price guidance, reliable pickup, documentation.

### 4.2 Persona B — Rajesh, Procurement Lead (Buyer)

Sources packaging for a mid-size FMCG packer in Sanand. Under pressure to cut input costs and raise recycled content. Sceptical about quality of secondary materials.

**Needs:** verified grade, consistent recurring supply, delivery certainty, no procurement risk.

### 4.3 Persona C — Anjali, Recycler / Processor

Operates a plastics reprocessing unit. Needs consistent feedstock of specific polymer grades with low contamination. Will pay a premium for sorted, clean, verified streams.

**Needs:** contamination data, material specification accuracy, volume predictability.

### 4.4 Persona D — Vikram, Logistics Operator

Runs 14 trucks. Roughly a third of his kilometres are empty return legs. Every empty leg is pure loss.

**Needs:** backhaul load discovery, route batching, simple accept/decline, proof of delivery.

### 4.5 Persona E — Sustainability / Compliance Officer

Does not use the marketplace daily. Logs in quarterly to export impact data for internal and regulatory reporting.

**Needs:** exportable, methodologically transparent, auditable records.

---

## 5. Product concept

### 5.1 The core loop

```
List  →  Grade  →  Match  →  Carbon-check  →  Negotiate  →  Consolidate  →  Move  →  Certify
```

1. **List.** Seller posts material with photos, mass, dimensions and availability window.
2. **Grade.** Vision model assigns a condition grade and flags contamination; seller confirms or overrides.
3. **Match.** Hybrid engine finds compatible open requirements and interested buyers.
4. **Carbon-check.** Each candidate match is scored for net CO₂e. Negative-net matches are suppressed or shown with an explicit warning.
5. **Negotiate.** Buyer claims, counter-offers, or enters a reverse auction for large lots.
6. **Consolidate.** Route solver batches nearby pickups into milk runs; 3D packer maximises load factor.
7. **Move.** Carrier accepts, executes, confirms pickup and delivery with photo proof.
8. **Certify.** Platform writes an immutable ledger entry and issues an impact record to both parties.

### 5.2 Differentiators

| Differentiator | Description |
|---|---|
| Carbon break-even radius | Per-listing computed maximum viable haul distance, rendered as a geographic dome. Governs matching. |
| Load-factor-coupled carbon model | Emissions per kg depend on how full the truck is, and load factor comes from the actual 3D packing solution — not a constant. |
| AI condition grading | Photo-derived grade and contamination flags, reducing the trust gap that kills secondary-material trades. |
| Consolidation and backhaul | Turns individually-uneconomic small lots into viable batched routes; monetises empty return legs. |
| Standing supply contracts | Recurring surplus is matched on a schedule rather than relisted manually every cycle. |
| Auditable impact ledger | Hash-chained per-trade carbon records with transparent factor sourcing. |
| Compliance pack export | Structured transaction trail for packaging/EPR reporting obligations. |

---

## 6. Feature specification

### 6.1 P0 — must ship

**F1. Organisation onboarding and verification**
- Company registration with business identifier, facility address, geocoded location, role selection (seller / buyer / recycler / carrier — multi-select).
- Facility can have multiple sites; each site has its own coordinates and operating hours.
- Verification status: unverified → document-submitted → verified. Unverified orgs can browse and list but not transact above a value threshold.

**F2. Listing creation**
- Fields: material category, sub-type, grade (self-declared, then AI-confirmed), mass, unit count, dimensions, packaging state, photos (min 3), availability window, asking price or "open to offers", pickup constraints (dock hours, forklift available, loose vs palletised).
- Mobile-responsive quick-capture flow: camera-first, three taps to a draft listing, complete details later.
- Bulk import via CSV template and a REST endpoint for ERP/WMS integration.
- Draft → published → matched → reserved → in-transit → completed → cancelled state machine.

**F3. Requirement posting (the mirror of a listing)**
- Buyers post standing needs rather than only searching. This makes matching bidirectional and lets the engine notify sellers when new demand appears.
- Fields: material category, minimum acceptable grade, required mass per period, max acceptable price, max acceptable haul distance (or "let ReLoop decide from carbon").

**F4. AI condition grading**
- On photo upload, a vision model returns: condition grade (A/B/C/reject), visible damage types, contamination flags (residue, mixed materials, moisture, labels/tape), and a confidence score.
- Low-confidence results are escalated for manual seller confirmation.
- Grade materially affects price guidance and which requirements the listing can satisfy.

**F5. Matching engine**
- Hard filters: material compatibility, grade floor, mass range, availability window overlap, geographic feasibility.
- Semantic similarity: vector comparison between listing description and requirement description, so "1200×800 EUR pallets, heat treated, minor chipping" matches a buyer asking for "standard euro pallets, reusable condition".
- Composite score: `w1·semantic + w2·grade_fit + w3·price_fit + w4·carbon_score + w5·timing_fit`.
- Results ranked by score, with carbon score visibly weighted.

**F6. Carbon engine**
- Computes gross avoided emissions, reprocessing emissions, transport emissions and net result per candidate match.
- Computes and stores a break-even radius per listing.
- Classifies each match: `carbon_positive`, `marginal` (within 15% of break-even), `carbon_negative`.
- Carbon-negative matches are hidden from default results and shown only under an explicit "show all" toggle with a warning.

**F7. Transaction flow**
- Claim → seller accept/counter → agreed → logistics assignment → in transit → delivered → closed.
- Escrow state machine (modelled, not settled in v1): funds marked held on agreement, released on delivery confirmation, disputed path available for 48 hours post-delivery.
- Dispute path requires photo evidence against the original graded photos.

**F8. Route optimisation and consolidation**
- Vehicle routing solver batches pickups within a geographic cluster into a single multi-stop run, respecting vehicle capacity, dock time windows and driver hours.
- 3D bin packing determines physical arrangement and returns a load factor, which feeds back into the carbon model.
- Backhaul matching: carriers register planned empty return legs; the engine prioritises listings that fit those legs, since their marginal emissions are near zero.

**F9. Impact ledger and certificates**
- Every completed trade writes an immutable, hash-chained record: masses, distances, factors used, factor source references, computed net CO₂e.
- Downloadable PDF certificate per trade.
- Organisation-level dashboard aggregating diverted tonnage, net CO₂e, virgin material displaced, and average load factor.

**F10. 3D visualisation suite** — see section 10.

### 6.2 P1 — build if time allows

- **Standing supply contracts.** Recurring listing generation on a schedule, auto-matched to the same buyer, with drift alerts if volume changes materially.
- **Reverse auction** for large lots: seller posts, buyers bid down over a window.
- **Dynamic price guidance** from internal transaction history plus scrap index reference points.
- **Compliance pack export.** Structured CSV/PDF bundle of transactions categorised for packaging waste reporting obligations. Regulatory category definitions must be verified against current rules before any compliance claim is made in the product copy.
- **Supply forecasting.** Predict a facility's forward surplus from historical listing cadence so buyers can plan.

### 6.3 P2 — roadmap

- Carrier marketplace with competitive bidding on routes.
- IoT / weighbridge integration for automatic mass capture.
- Multi-currency and cross-border.
- Third-party verification partner integration for certificate assurance.
- Public API and partner integrations.

---

## 7. User flows

### 7.1 Seller flow — list to payout

1. Log in → dashboard shows active listings, open claims and impact to date.
2. "New listing" → camera-first capture screen → shoot or upload 3+ photos.
3. Vision grading runs; the proposed grade and contamination flags appear with confidence.
4. Seller confirms or overrides grade, enters mass and unit count, selects material sub-type.
5. Dimensions auto-suggested from material type (e.g. standard pallet footprint), editable.
6. Availability window and pickup constraints set.
7. Price guidance shown; seller sets asking price or opens to offers.
8. Preview shows the listing's break-even radius rendered on the map, with a count of qualifying buyers inside it.
9. Publish. Listing enters the matching pool.
10. Notification when a buyer claims. Accept, counter or decline.
11. On acceptance, a pickup slot is proposed by the route solver. Seller confirms dock availability.
12. Driver arrives, scans the pickup code, uploads loaded photos. State → in transit.
13. On delivery confirmation, escrow releases and the impact record is issued.

### 7.2 Buyer flow — discover to receive

1. Log in → dashboard shows open requirements, incoming matches, inbound shipments.
2. Two discovery paths:
   - **Passive:** post a requirement once; receive ranked matches as they appear.
   - **Active:** browse the Flow Globe or filtered list view.
3. Each result card shows material, grade, mass, distance, price, and a net CO₂e badge.
4. Carbon-negative results are excluded by default; a toggle reveals them with a red warning and the explicit figure.
5. Open a listing → Material Passport 3D view with damage hotspots, full photo set, seller verification status and transaction history.
6. Claim full lot or partial. Optionally counter-offer.
7. On seller acceptance, view the proposed consolidated route and the Truck Load Studio arrangement.
8. Receive delivery, confirm or raise a dispute within 48 hours.
9. Impact record added to organisation dashboard.

### 7.3 Carrier flow

1. Register vehicles with capacity, dimensions and base location.
2. Declare planned routes and empty return legs.
3. Receive proposed multi-stop runs with estimated revenue, distance, load factor and stop sequence.
4. Accept or decline. Accepted runs appear in a driver view with stop-by-stop navigation.
5. At each stop: scan code, capture photos, confirm load. At delivery: capture proof, confirm.

### 7.4 Sustainability officer flow

1. Log in with read-only reporting role.
2. Select date range and facility scope.
3. View aggregate metrics with methodology disclosure: factors used, sources, assumptions.
4. Export the full transaction ledger and the compliance pack.

### 7.5 Admin flow

- Review and approve organisation verification submissions.
- Review flagged listings and disputes.
- Manage emission factor tables and factor versioning.
- Monitor matching engine health and suppressed-match rates.

---

## 8. Information architecture

```
/                         Landing — Flow Globe, live impact counter
/auth/*                   Sign in, register, org setup
/dashboard                Role-adaptive home
/listings                 Browse / filter / map view
/listings/new             Quick-capture creation flow
/listings/[id]            Detail + Material Passport 3D
/requirements             Manage standing requirements
/requirements/new         Create requirement
/matches                  Ranked matches inbox
/matches/[id]             Match detail, carbon breakdown, claim actions
/trades                   Active and historical transactions
/trades/[id]              Transaction timeline, escrow state, documents
/logistics                Route board (carriers) / shipment tracking (others)
/logistics/load/[id]      Truck Load Studio
/impact                   Impact dashboard, Sankey, exports
/impact/certificates/[id] Individual certificate view
/settings/org             Organisation, facilities, verification
/settings/team            Users and roles
/admin/*                  Internal tooling
```

---

## 9. Technical architecture

### 9.1 Architecture style

A modular monolith on the backend with clearly separated service modules, rather than microservices. At hackathon scale, microservice overhead buys nothing and costs integration time. Module boundaries are drawn so that extraction later is straightforward.

### 9.2 Layers

**Client layer**
- Next.js web application (App Router), server components for data-heavy pages, client components for 3D and interactive surfaces.
- Mobile-responsive quick-capture flow as a route within the same app, optimised for a phone camera in a warehouse yard.

**Edge / API layer**
- FastAPI gateway handling authentication, rate limiting, request validation and routing to service modules.
- REST for all CRUD and transactional operations.
- WebSocket channel for live match notifications and shipment status.

**Service modules**

| Module | Responsibility |
|---|---|
| `identity` | Orgs, users, roles, facilities, verification |
| `catalog` | Listings, requirements, material taxonomy, media |
| `grading` | Vision inference, grade assignment, contamination detection |
| `matching` | Hard filters, vector similarity, composite scoring |
| `carbon` | Factor resolution, net CO₂e computation, break-even radius, ledger writes |
| `logistics` | VRP solving, 3D packing, backhaul matching, shipment lifecycle |
| `commerce` | Claims, offers, escrow state machine, disputes |
| `reporting` | Aggregations, certificates, compliance exports |

**Data layer**
- PostgreSQL as the single primary store.
- PostGIS extension for all geospatial queries — radius search, distance matrices, route geometry.
- pgvector extension for semantic listing/requirement embeddings.
- Object storage for photos and generated PDFs.
- Redis for job queues, caching of distance matrices and rate limiting.

**Async workers**
- Vision grading inference.
- Route optimisation runs (VRP is not a request-cycle operation).
- Certificate generation.
- Scheduled matching sweeps for standing requirements.

### 9.3 Why one Postgres instead of several databases

Geospatial queries, vector similarity and relational transaction integrity are all required, and PostGIS plus pgvector gives all three in one engine with real ACID guarantees. A candidate query like "find listings within the carbon break-even radius of this facility, of compatible material, semantically similar to this requirement, available in the next 14 days, ranked by composite score" is a single SQL statement. Splitting this across a document store and a separate vector database would require application-level joins and would be slower and more error-prone.

---

## 10. Frontend and 3D specification

### 10.1 Principle

3D is used only where spatial representation conveys information that a table cannot. Dashboards, forms and lists stay flat, fast and conventional. Four surfaces are 3D.

### 10.2 Surface 1 — Flow Globe

**Purpose:** make the state of the network legible at a glance.

- Dark basemap centred on the operating region.
- Completed and in-progress trades rendered as arcs from origin to destination.
- Arc height encodes tonnage; arc colour encodes net CO₂e outcome (teal = positive, amber = marginal, red = negative).
- Each open listing renders a translucent dome at its break-even radius. Facilities inside the dome are highlighted; facilities outside are dimmed.
- Hovering a facility filters arcs to that node. Clicking opens its listings.
- Time scrubber replays network activity over the selected period.

**Implementation:** deck.gl ArcLayer + ScatterplotLayer + a custom polygon layer for domes, over a vector basemap.

### 10.3 Surface 2 — Truck Load Studio

**Purpose:** turn load factor from an abstract percentage into something the user can see and manipulate.

- Orbit-controllable trailer volume.
- Claimed lots rendered as dimensioned blocks, placed by the 3D bin-packing solver.
- Load factor, used volume, remaining volume and CO₂e per kg displayed live.
- Dragging an additional lot in re-runs packing and updates the carbon figure.
- Unused space is visually emphasised, because unused space is wasted emissions.

**Implementation:** React Three Fiber + drei, with packing computed server-side and returned as a placement list.

### 10.4 Surface 3 — Material Passport

**Purpose:** make condition spatial rather than a dropdown value.

- Parametric 3D model per material archetype: pallet, gaylord, drum, film roll, bale, crate.
- Damage and contamination hotspots from the vision model projected onto the model surface.
- Toggle between 3D view and the underlying photo set.
- Specification panel alongside: dimensions, mass, grade, prior owner verification status.

### 10.5 Surface 4 — Impact Sankey

**Purpose:** show where material actually goes.

- Flows from source facility categories through material types to destination categories.
- Landfill branch rendered in red and visibly shrinking as trades complete.
- Toggle between mass flow and carbon flow.

### 10.6 Frontend stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js (App Router) | Server components cut client bundle on data pages; good defaults for a mixed static/interactive app |
| 3D | React Three Fiber + drei | Declarative Three.js that composes with React state |
| Geospatial | deck.gl | Purpose-built for large-scale geographic overlays, GPU-accelerated |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, accessible primitives |
| Motion | Framer Motion | Page and state transitions |
| Charts | Recharts / D3 | Dashboard visualisations |
| State | TanStack Query + Zustand | Server cache and local UI state separated |
| Forms | React Hook Form + Zod | Shared schema validation with the backend contract |

### 10.7 Performance requirements

- 3D surfaces must degrade gracefully: a 2D fallback map and a flat load summary if WebGL is unavailable.
- Flow Globe must remain interactive with 500+ arcs.
- Listing browse must be usable on a mid-range phone over a 4G connection.
- Initial paint of non-3D pages under 2 seconds.

---

## 11. Data model

### 11.1 Core schema

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE organisations (
  id              UUID PRIMARY KEY,
  legal_name      TEXT NOT NULL,
  business_id     TEXT UNIQUE,
  roles           TEXT[] NOT NULL,
  verification    TEXT NOT NULL DEFAULT 'unverified',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE facilities (
  id              UUID PRIMARY KEY,
  org_id          UUID REFERENCES organisations(id),
  name            TEXT NOT NULL,
  address         TEXT,
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  dock_hours      JSONB,
  has_forklift    BOOLEAN DEFAULT true
);
CREATE INDEX ON facilities USING GIST (location);

CREATE TABLE users (
  id              UUID PRIMARY KEY,
  org_id          UUID REFERENCES organisations(id),
  email           TEXT UNIQUE NOT NULL,
  role            TEXT NOT NULL,
  password_hash   TEXT NOT NULL
);

CREATE TABLE material_types (
  id              TEXT PRIMARY KEY,
  category        TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  default_density NUMERIC,
  ef_virgin       NUMERIC NOT NULL,
  ef_reprocess    NUMERIC NOT NULL,
  factor_source   TEXT NOT NULL,
  factor_version  TEXT NOT NULL
);

CREATE TABLE listings (
  id                  UUID PRIMARY KEY,
  org_id              UUID REFERENCES organisations(id),
  facility_id         UUID REFERENCES facilities(id),
  material_type_id    TEXT REFERENCES material_types(id),
  title               TEXT NOT NULL,
  description         TEXT,
  grade               TEXT NOT NULL,
  grade_source        TEXT NOT NULL,
  grade_confidence    NUMERIC,
  contamination_flags TEXT[],
  mass_kg             NUMERIC NOT NULL,
  unit_count          INTEGER,
  unit_dims_mm        JSONB,
  price_per_kg        NUMERIC,
  open_to_offers      BOOLEAN DEFAULT false,
  available_from      DATE NOT NULL,
  available_until     DATE NOT NULL,
  location            GEOGRAPHY(POINT, 4326) NOT NULL,
  breakeven_radius_km NUMERIC,
  embedding           VECTOR(768),
  status              TEXT NOT NULL DEFAULT 'draft',
  created_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON listings USING GIST (location);
CREATE INDEX ON listings USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE listing_media (
  id           UUID PRIMARY KEY,
  listing_id   UUID REFERENCES listings(id) ON DELETE CASCADE,
  storage_key  TEXT NOT NULL,
  grading_json JSONB
);

CREATE TABLE requirements (
  id               UUID PRIMARY KEY,
  org_id           UUID REFERENCES organisations(id),
  facility_id      UUID REFERENCES facilities(id),
  material_type_id TEXT REFERENCES material_types(id),
  description      TEXT,
  min_grade        TEXT NOT NULL,
  mass_kg_period   NUMERIC NOT NULL,
  period           TEXT NOT NULL,
  max_price_per_kg NUMERIC,
  max_distance_km  NUMERIC,
  use_carbon_limit BOOLEAN DEFAULT true,
  embedding        VECTOR(768),
  status           TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE matches (
  id              UUID PRIMARY KEY,
  listing_id      UUID REFERENCES listings(id),
  requirement_id  UUID REFERENCES requirements(id),
  distance_km     NUMERIC NOT NULL,
  semantic_score  NUMERIC,
  grade_fit       NUMERIC,
  price_fit       NUMERIC,
  carbon_class    TEXT NOT NULL,
  net_co2e_kg     NUMERIC NOT NULL,
  composite_score NUMERIC NOT NULL,
  surfaced        BOOLEAN NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE trades (
  id              UUID PRIMARY KEY,
  match_id        UUID REFERENCES matches(id),
  seller_org_id   UUID REFERENCES organisations(id),
  buyer_org_id    UUID REFERENCES organisations(id),
  agreed_mass_kg  NUMERIC NOT NULL,
  agreed_price    NUMERIC NOT NULL,
  escrow_state    TEXT NOT NULL DEFAULT 'pending',
  status          TEXT NOT NULL DEFAULT 'agreed',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vehicles (
  id             UUID PRIMARY KEY,
  carrier_org_id UUID REFERENCES organisations(id),
  vehicle_class  TEXT NOT NULL,
  capacity_kg    NUMERIC NOT NULL,
  volume_m3      NUMERIC NOT NULL,
  inner_dims_mm  JSONB NOT NULL,
  base_location  GEOGRAPHY(POINT, 4326)
);

CREATE TABLE shipments (
  id             UUID PRIMARY KEY,
  vehicle_id     UUID REFERENCES vehicles(id),
  route_geojson  JSONB,
  total_km       NUMERIC,
  load_factor    NUMERIC,
  packing_plan   JSONB,
  is_backhaul    BOOLEAN DEFAULT false,
  status         TEXT NOT NULL DEFAULT 'planned'
);

CREATE TABLE shipment_stops (
  id            UUID PRIMARY KEY,
  shipment_id   UUID REFERENCES shipments(id),
  trade_id      UUID REFERENCES trades(id),
  sequence      INTEGER NOT NULL,
  stop_type     TEXT NOT NULL,
  facility_id   UUID REFERENCES facilities(id),
  window_start  TIMESTAMPTZ,
  window_end    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  proof_media   TEXT[]
);

CREATE TABLE carbon_ledger (
  id                 UUID PRIMARY KEY,
  trade_id           UUID REFERENCES trades(id) UNIQUE,
  mass_kg            NUMERIC NOT NULL,
  ef_virgin          NUMERIC NOT NULL,
  ef_reprocess       NUMERIC NOT NULL,
  ef_freight         NUMERIC NOT NULL,
  distance_km        NUMERIC NOT NULL,
  load_factor        NUMERIC NOT NULL,
  allocated_km       NUMERIC NOT NULL,
  gross_avoided_kg   NUMERIC NOT NULL,
  transport_kg       NUMERIC NOT NULL,
  net_saved_kg       NUMERIC NOT NULL,
  factor_version     TEXT NOT NULL,
  methodology_note   TEXT,
  prev_hash          TEXT,
  entry_hash         TEXT NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT now()
);
```

### 11.2 Key relationships

- An organisation has many facilities; listings and requirements are anchored to a facility, not the organisation, because distance and therefore carbon depend on the physical site.
- A match is a *candidate*; a trade is a *commitment*. Matches are generated continuously and most never become trades. Keeping them separate lets the platform measure suppression and conversion.
- A shipment can carry stops from multiple trades. This is the consolidation mechanism, and it is why transport emissions must be allocated rather than assigned wholesale.
- The carbon ledger is write-once. Corrections are issued as new compensating entries, never by mutation.

---

## 12. AI and intelligence components

### 12.1 Component 1 — Vision-based condition grading

**Input:** 3+ photographs of the material lot.
**Output:** structured JSON.

```json
{
  "material_detected": "wooden_pallet_euro",
  "grade": "B",
  "confidence": 0.87,
  "damage": [
    {"type": "chipped_board", "severity": "minor", "region": "top_deck_left"},
    {"type": "protruding_nail", "severity": "moderate", "region": "stringer_mid"}
  ],
  "contamination": [],
  "reusable_units_estimate": 182,
  "notes": "Heat-treatment stamp visible, legible."
}
```

**Approach:** a vision-language model prompted with a strict grading rubric per material archetype, constrained to JSON output. The rubric is versioned and stored alongside results so grading is reproducible and auditable.

**Guardrails:**
- Confidence below 0.7 forces manual seller confirmation before publishing.
- Grade is advisory at listing time and binding at dispute time — the graded photos are the reference evidence if the buyer contests condition.
- Buyer-side verification photos on delivery are graded with the same rubric, and a grade drop of more than one level auto-opens a dispute.

**Region output** feeds the Material Passport damage hotspots.

### 12.2 Component 2 — Semantic matching

**Why embeddings are needed:** material descriptions in this industry are inconsistent. "EUR pallet", "euro pallet 1200x800", "standard 4-way entry", and "CP3 pallet" may all refer to compatible items. Exact-match taxonomy alone loses real matches.

**Approach:**
- Embed the concatenation of title, description, material type and specification fields for both listings and requirements.
- Store as `vector(768)` with an IVFFlat cosine index.
- Retrieve top-k candidates by vector similarity *after* applying hard SQL filters, so semantic search never overrides a grade floor or a geographic constraint.

**Composite scoring:**

```
score = 0.25·semantic_similarity
      + 0.20·grade_fit
      + 0.15·price_fit
      + 0.30·carbon_score
      + 0.10·timing_fit
```

Carbon carries the largest single weight. This is a deliberate product statement, and it is the sentence to say in the demo.

`carbon_score` is normalised as `clamp(net_saved / gross_avoided, 0, 1)`, so a trade that retains 90% of its theoretical saving scores 0.9 and one that retains 10% scores 0.1.

### 12.3 Component 3 — Carbon model

See section 13 for the full methodology. Architecturally it is a deterministic calculation service, not a model — which is the point. Its outputs must be reproducible and defensible, so nothing stochastic sits in this path.

### 12.4 Component 4 — Route optimisation

**Problem class:** capacitated vehicle routing with time windows (CVRPTW).

**Approach:** Google OR-Tools routing solver.
- Nodes: pickup facilities and delivery facilities.
- Constraints: vehicle mass capacity, vehicle volume capacity, dock time windows, maximum route duration, pickup-before-delivery precedence.
- Objective: minimise total distance, with a secondary penalty on unused capacity.
- Distance and duration matrix from a routing service, cached in Redis (matrix computation is the expensive part, and facility pairs repeat constantly).

**Backhaul handling:** carrier-declared empty return legs enter the solver as routes with a heavily discounted marginal distance cost, because the vehicle is travelling that path regardless. This is what makes low-value small lots viable.

### 12.5 Component 5 — 3D bin packing

**Problem class:** three-dimensional container loading.

**Approach:** an extreme-point heuristic packer. Items are the dimensioned lots; the container is the vehicle's inner dimensions. Constraints include stackability by material type (film rolls do not bear load; pallets do) and mass distribution.

**Output:** placement list `[{item_id, x, y, z, rotation}]` plus load factor. The placement list is what React Three Fiber renders in the Truck Load Studio, and the load factor is what the carbon model consumes.

### 12.6 Component 6 — Price guidance

Regression over completed internal transactions, keyed on material type, grade, mass band, region and season, with a fallback to reference scrap index values where internal data is thin. Presented as a range with a confidence indicator, never as a single authoritative number.

### 12.7 Component 7 — Supply forecasting (P1)

Time-series model over a facility's historical listing cadence, producing a forward estimate of surplus volume by material type. Enables buyers to plan procurement against secondary supply rather than treating it as opportunistic.

---

## 13. Carbon methodology

### 13.1 Boundary

The assessment covers avoided virgin material production, reprocessing or refurbishment energy, and transport from seller facility to buyer facility. It excludes the emissions of the original production of the material (already incurred, not attributable to this trade), end-of-life beyond this transaction, and facility overheads.

This boundary must be stated on every certificate.

### 13.2 Core calculation

```
gross_avoided_kg = mass_kg × EF_virgin

reprocess_kg     = mass_kg × EF_reprocess

allocated_km     = distance_km × (mass_kg / total_shipment_mass_kg)

transport_kg     = (mass_kg / 1000) × allocated_km × EF_freight / load_factor

net_saved_kg     = gross_avoided_kg − reprocess_kg − transport_kg
```

Two details matter and are the reason this model is more honest than a naive one:

**Allocation.** On a consolidated shipment, a single trade is not responsible for the whole route. Transport emissions are allocated by mass share, so batching genuinely improves every participant's number rather than just the platform's headline.

**Load factor.** Emissions per tonne-kilometre assume a reasonably loaded vehicle. A half-empty truck emits roughly the same absolute amount over the same distance, so the per-kilogram burden roughly doubles. Dividing by load factor captures this, and it is why the Truck Load Studio is a carbon tool rather than a novelty.

### 13.3 Break-even radius

Setting `net_saved_kg = 0` and solving for distance:

```
d_breakeven_km = ((EF_virgin − EF_reprocess) × load_factor × 1000) / EF_freight
```

Note the result is independent of mass, which is what makes it a clean per-listing property that can be drawn as a circle on a map. It depends only on the material and the assumed load factor.

At listing time, a conservative default load factor is assumed. Once a real shipment is planned, the actual load factor is used and the figure is restated in the ledger.

### 13.4 Emission factors

Factors are stored in a versioned table with an explicit source reference per row. Every ledger entry records the factor version used, so historical records remain reproducible when factors are updated.

**Indicative magnitudes for scoping the build — do not ship these numbers without verification:**

| Material | EF_virgin (kg CO₂e/kg) | EF_reprocess (kg CO₂e/kg) |
|---|---|---|
| Corrugated board | ~1.0 | ~0.7 |
| HDPE | ~2.0 | ~0.5 |
| LDPE film | ~2.1 | ~0.6 |
| PP | ~1.9 | ~0.5 |
| Wooden pallet (reuse) | dominated by avoided manufacture | near zero for inspection/repair |

| Freight mode | EF_freight (kg CO₂e per tonne-km) |
|---|---|
| Rigid truck, road | ~0.1–0.2 |
| Articulated truck, road | ~0.07–0.1 |

**Sourcing requirement.** Before the demo, pull actual values from a citable published dataset — UK Government (DEFRA) greenhouse gas conversion factors, ecoinvent, or the India GHG Program — and display the source on screen. A judge with a sustainability background will ask where the numbers came from, and "we looked them up" is a losing answer.

### 13.5 Classification thresholds

| Class | Condition |
|---|---|
| `carbon_positive` | `net_saved_kg > 0.15 × gross_avoided_kg` |
| `marginal` | `0 < net_saved_kg ≤ 0.15 × gross_avoided_kg` |
| `carbon_negative` | `net_saved_kg ≤ 0` |

Only `carbon_positive` and `marginal` are surfaced by default.

---

## 14. API specification

### 14.1 Conventions

- REST, JSON, `/api/v1` prefix.
- Bearer token auth (JWT), organisation scope embedded in claims.
- Cursor pagination on all list endpoints.
- Idempotency keys required on all state-changing commerce endpoints.

### 14.2 Endpoints

**Identity**
```
POST   /auth/register
POST   /auth/login
GET    /orgs/me
PATCH  /orgs/me
POST   /orgs/me/facilities
POST   /orgs/me/verification
```

**Catalog**
```
POST   /listings                       Create draft
POST   /listings/bulk                  CSV / ERP bulk import
PATCH  /listings/{id}
POST   /listings/{id}/publish
GET    /listings                       Filters: material, grade, bbox, radius, carbon_class
GET    /listings/{id}
POST   /listings/{id}/media            Triggers async grading
GET    /listings/{id}/breakeven        Radius + qualifying buyer count

POST   /requirements
GET    /requirements
PATCH  /requirements/{id}
```

**Matching**
```
GET    /matches                        Ranked inbox for the caller's org
GET    /matches/{id}                   Full carbon breakdown included
POST   /matches/{id}/dismiss
```

**Carbon**
```
POST   /carbon/estimate                Ad-hoc what-if calculation
GET    /carbon/factors                 Current factor table + versions
GET    /impact/summary                 Org aggregates, date-ranged
GET    /impact/certificates/{trade_id} PDF
GET    /impact/export                  Ledger CSV + compliance pack
```

**Commerce**
```
POST   /trades                         Claim a match
POST   /trades/{id}/counter
POST   /trades/{id}/accept
POST   /trades/{id}/dispute
GET    /trades/{id}
```

**Logistics**
```
POST   /vehicles
POST   /carriers/backhauls             Declare empty return legs
POST   /logistics/plan                 Run VRP over a set of trades
GET    /shipments/{id}
GET    /shipments/{id}/packing         3D placement list
POST   /shipments/{id}/stops/{sid}/complete
```

### 14.3 Representative response — match detail

```json
{
  "id": "…",
  "listing": { "id": "…", "material": "corrugated_board", "grade": "A", "mass_kg": 3000 },
  "distance_km": 182,
  "carbon": {
    "class": "carbon_positive",
    "gross_avoided_kg": 3060,
    "reprocess_kg": 2100,
    "transport_kg": 74,
    "net_saved_kg": 886,
    "breakeven_radius_km": 421,
    "assumed_load_factor": 0.75,
    "factor_version": "2026.1",
    "sources": ["DEFRA 2026 conversion factors"]
  },
  "composite_score": 0.81
}
```

---

## 15. Security, roles and compliance

### 15.1 Roles

| Role | Permissions |
|---|---|
| `org_admin` | Full org management, verification, team, all transactions |
| `trader` | Create listings/requirements, claim, negotiate, accept |
| `logistics` | Vehicles, routes, shipment execution |
| `reporting` | Read-only access to impact and export endpoints |
| `platform_admin` | Verification review, factor management, dispute arbitration |

### 15.2 Requirements

- Org-scoped row-level access enforced at the query layer, not the controller layer.
- Media uploads served through signed, expiring URLs.
- Full audit log on listings, trades, escrow transitions and factor table changes.
- Carbon ledger entries hash-chained: `entry_hash = SHA256(prev_hash || canonical_entry_json)`. Any retroactive edit breaks the chain and is detectable.
- Rate limiting on grading and matching endpoints (both are compute-expensive).
- Input validation on all uploads, with size and MIME constraints on media.

### 15.3 Compliance posture

The platform produces a structured transaction trail intended to support packaging-waste and producer-responsibility reporting. Product copy must describe this as *supporting* reporting, not as constituting regulatory filing, unless and until the specific current regulatory requirements have been verified and the format validated. Overclaiming here is both a legal and a credibility risk.

---

## 16. Non-functional requirements

| Requirement | Target |
|---|---|
| Listing search latency (p95) | < 400 ms |
| Match generation for a new listing | < 10 s async |
| Vision grading turnaround | < 20 s per listing |
| VRP solve for ≤ 20 stops | < 30 s |
| Flow Globe interactive with | 500+ arcs at 30 fps |
| Availability target | 99% during judging window |
| Graceful degradation | 2D fallback for all 3D surfaces |

---

## 17. Seed data plan

Realistic seed data is worth more to the demo than an additional feature. A sparse map kills the Flow Globe.

- **60–80 listings** distributed across real industrial clusters in the operating region, with plausible material mixes per cluster (ceramics → corrugate and pallets; chemicals → drums and IBCs; textiles → film and bales; FMCG → mixed).
- **25–30 requirements** creating genuine matches, including at least three deliberately carbon-negative pairs to demonstrate the suppression behaviour.
- **12–15 completed historical trades** so the impact dashboard and Sankey are populated on first load.
- **6–8 carriers** with declared backhaul legs.
- Photographs sourced for each material archetype so vision grading has real input.

Include at least one pair that is *marginally* positive and one that is *just* negative, close to the break-even line. The contrast is the demo's most persuasive moment.

---

## 18. Build plan

### Phase 1 — Foundation (hours 0–6)
- Repository, environments, CI.
- Postgres with PostGIS and pgvector; full schema migration.
- Auth, organisations, facilities.
- Listing and requirement CRUD with media upload.
- Seed data loaded.

**Exit criterion:** a listing can be created and retrieved with a location, and it appears on a map.

### Phase 2 — Intelligence (hours 6–14)
- Embedding generation on listing and requirement write.
- Hard-filter + vector matching query.
- Carbon engine: factor table, net calculation, break-even radius.
- Composite scoring and match generation job.
- Flow Globe with arcs and break-even domes.

**Exit criterion:** publishing a listing produces ranked matches with carbon classification, and carbon-negative matches are suppressed.

### Phase 3 — Logistics and grading (hours 14–22)
- Vision grading pipeline and grade override UI.
- OR-Tools VRP with consolidation.
- 3D bin packing service.
- Truck Load Studio.
- Load factor feeding back into the carbon recalculation.

**Exit criterion:** three nearby trades can be batched into one route, load factor rises, and every participant's net CO₂e improves.

### Phase 4 — Closure and proof (hours 22–30)
- Trade lifecycle and escrow state machine.
- Carbon ledger with hash chaining.
- Certificate PDF generation.
- Impact dashboard and Sankey.
- Material Passport.

**Exit criterion:** a trade can be completed end-to-end and produces a downloadable certificate.

### Phase 5 — Polish and rehearsal (hours 30+)
- Empty states, loading states, error handling.
- 2D fallbacks verified.
- Demo script rehearsed three times end-to-end.
- Screenshot and video fallback captured for every key screen in case of network failure during judging.

---

## 19. Demo script

**Duration:** three minutes. Rehearse it until it needs no thought.

**0:00 — Open on the Flow Globe.** Live network, arcs moving, impact counter ticking. No narration beyond one sentence: this is every circular packaging trade in the region, coloured by whether it actually saved carbon.

**0:25 — Create a listing.** A ceramics plant in Morbi has 3 tonnes of corrugate. Photos upload, the vision model returns Grade A with no contamination. Publish.

**0:50 — The break-even dome appears.** Show the radius rendered on the map. Say the number.

**1:10 — The key moment.** Two buyers. One at 180 km, inside the dome, green. One at 600 km, outside, red, with the platform showing the negative net figure and refusing to recommend it. State plainly: most platforms would count both of these as wins. The second one is not a win. It emits more than it saves.

**1:40 — Accept the good match.** Open the Truck Load Studio. The single lot loads at 41%. Show the CO₂e per kilogram.

**2:05 — Consolidate.** Batch two nearby pickups into the route. Load factor jumps to 88%. CO₂e per kilogram drops. Every participant's number improves at once. This is the consolidation mechanism paying off visibly.

**2:35 — Close.** Complete the trade, generate the certificate, show the methodology and factor sources on it, land on the impact dashboard.

**2:55 — One closing line.** The strongest one is about the refusal: a circularity platform that will tell you not to trade is the only kind whose numbers mean anything.

---

## 20. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Emission factors challenged as unsourced | Undermines the entire premise | Cite published datasets on screen; version the factor table; show sources on the certificate |
| VRP solve too slow for live demo | Dead air during judging | Pre-warm the distance matrix cache; cap demo scenario at ≤ 8 stops; have a pre-computed result ready |
| Vision grading returns nonsense on a live photo | Visible failure at the worst moment | Use pre-tested seed photos for the demo path; confidence gate with manual override always visible |
| 3D performance on judging hardware | Hero screen stutters | Cap arc count, test on a low-end device, 2D fallback one keypress away |
| Network failure during judging | Nothing works | Local-first demo environment plus recorded video fallback |
| Scope overrun on P1 features | Core loop unfinished | Phase gates with explicit exit criteria; P1 features are strictly optional |
| Break-even radius seen as a gimmick | Loses the differentiator | Tie it to matching behaviour, not just visualisation — it must actually suppress results |

---

## 21. Open questions

1. Which published emission factor dataset will be cited, and is the licensing compatible with displaying values in-product?
2. What is the conservative default load factor at listing time before a shipment exists — 0.7, 0.75, or material-dependent?
3. Should marginal-class matches be shown by default or behind the same toggle as negative ones?
4. What mass threshold makes a lot eligible for consolidation versus requiring a dedicated run?
5. How is partial-lot claiming handled when the remainder falls below viable shipping mass?
6. What verification evidence is required to move an organisation from unverified to verified?

---

## 22. Appendix — glossary

| Term | Definition |
|---|---|
| Break-even radius | Distance at which transport emissions equal the emissions avoided by reuse |
| Load factor | Fraction of a vehicle's usable volume actually occupied |
| Backhaul | An empty return leg a vehicle travels regardless, available at near-zero marginal emissions |
| Gaylord | Large bulk bin, typically corrugated, used for bulk material handling |
| Milk run | A single route servicing multiple pickup or delivery points |
| Allocation | Apportioning a shared shipment's emissions across the trades it carries |
| EF | Emission factor — CO₂e per unit of mass or tonne-kilometre |
| CVRPTW | Capacitated vehicle routing problem with time windows |
| Material passport | Structured record of a material lot's specification, condition and history |
