# PriceLK — Compare before you buy

A Sri Lankan price comparison platform. Search for a product, select the **exact configuration**
you want, and compare prices from verified Sri Lankan online retailers — cheapest first.

> **Hybrid data.** Real prices are collected from Wasi.lk, iDealz and Takas by the scraper pipeline
> (`scrapers/`). Products without a live match keep demo placeholder prices until real coverage
> grows. The product architecture is production-ready; PostgreSQL replaces the JSON snapshot later.

## Core journey

```
SEARCH → SELECT PRODUCT → CONFIGURE EXACT VARIANT → COMPARE MATCHING SRI LANKAN RETAILERS → LOWEST PRICE FIRST → VIEW RETAILER
```

- **Sri Lanka only.** The catalogue contains only verified Sri Lankan retailers
  (`country_code = 'LK'`, `is_sri_lankan`, `is_verified`, `is_active`). Search never consults
  external/international sources and never falls back to them.
- **Exact matching only.** A comparison never mixes variants, generations, capacities or pack
  sizes. Selecting `12GB / 256GB / Black` shows only stores selling that exact configuration.
- **Every price has a source.** Each offer links to the original retailer product page.
- **LKR only.** The comparison interface never shows foreign currencies.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion, Lucide |
| Backend | Next.js Server Components + route handlers (`/api/search`, `/api/offers`) |
| Database (planned) | PostgreSQL + Drizzle ORM |
| Cache (planned) | Redis / Upstash |
| Search (planned) | PostgreSQL initially; Meilisearch / Typesense later (search is isolated in `lib/search.ts`) |
| Data collection | Python 3.11 + requests + BeautifulSoup/lxml; WooCommerce Store API adapters live, HTML/Playwright adapters next |
| Hosting (planned) | Vercel, Supabase/Neon, Upstash, separate worker hosting |
| Monitoring / Analytics / Email (planned) | Sentry, PostHog, Resend |

## Architecture

```
Sri Lankan retailer websites
        ↓
Python scraper workers (background, never in user requests)
        ↓
Retailer validation → Data extraction → Product normalization → Product matching
        ↓
PostgreSQL  →  Redis cache  →  Next.js  →  User
```

The consumer web app and the data collection system are fully separated. Scraping never runs
inside user HTTP requests.

## Project structure

```
app/
  page.tsx                  Homepage (hero, search, price drops, popular comparisons)
  search/page.tsx           Search results with category-aware filters + pagination
  products/[slug]/page.tsx  Product page — configuration, comparison, history, alerts
  deals/page.tsx            Today's best deals
  stores/page.tsx           Verified retailer directory
  stores/[store]/page.tsx   Retailer detail
  watchlist/page.tsx        Watchlist (localStorage-backed in the demo)
  categories/[slug]/page.tsx
  api/search/route.ts       Autocomplete + search API (server-side filtering/sorting)
  api/offers/route.ts       Exact-match comparison API
components/
  layout/                   Header, Footer, MobileNav
  search/                   SearchBar with autocomplete, HeaderSearch
  product/                  ConfigPanel, ComparisonSection, OfferList, PriceHistoryChart,
                            DealScore, PriceAlert, WatchlistButton, ProductCard
  filters/                  Category-aware FilterSidebar + mobile sheet, SortSelect
  deals/  stores/  auth/  ui/
lib/
  types.ts                  Domain model (mirrors the future Drizzle schema)
  data/                     Catalogue: retailers, categories, products (seeded, deterministic)
  data/scraped.ts           Real-offer matcher over the scraper snapshot (exact variant matching)
  data/scraped-snapshot.json  Merged scraper output, bundled (regenerate via scrapers/run_batch.py)
  search.ts                 Catalogue search (isolated for Meilisearch/Typesense swap)
  matching.ts               Exact variant matching, dependent options, deal scoring
  format.ts  url.ts  cn.ts
public/products/            Real product photos (JPEG/WebP) for the demo catalogue
scrapers/
  run_batch.py              Batch scrape → scrapers/data/*.json + lib/data/scraped-snapshot.json
  wasi.py  idealz.py        Retailer adapters (WooCommerce Store API)
  takas.py                  Retailer adapter (Magento category listings)
  common/http.py            Polite HTTP session (retries, delays)
  common/normalize.py       Brand aliases, name cleaning, LKR price parsing, attribute extraction
  common/woocommerce.py     WooCommerce Store API client + record normalization
  common/magento.py         Magento category-listing parser (paginated, deduped)
  probe.py  analyze.py  find_urls.py  probe_page.py  show_snapshot.py   Survey/debug tooling
```

## Data model

The domain types in `lib/types.ts` mirror the production schema:

`User · Brand · Category · Product · ProductVariant · ProductAttribute ·
ProductAttributeValue · Retailer · RetailerListing · PriceHistory · Watchlist · PriceAlert`

```
PRODUCT  Samsung Galaxy S25
  └─ VARIANT  12GB / 256GB / Black
       └─ RETAILER LISTINGS  Store A → Rs.184,990 · Store B → Rs.189,990 · Store C → Rs.194,990
            └─ PRICE HISTORY  (never overwritten — every check is stored)
```

Attributes are **not hard-coded** in the UI. Each category defines its own attribute set
(RAM/storage/colour for phones, weight/type/pack for milk powder, size/colour/gender for shoes…)
and the filter sidebar and configuration panel are generated from it.

## Key behaviours

- **Variant selection never reloads the page.** The configuration is encoded in the URL
  (`/products/samsung-galaxy-s25?ram=12GB&storage=256GB&colour=Black`), so bookmarking, sharing,
  refresh and back/forward all preserve the selection. The comparison refetches from
  `/api/offers` with skeleton states.
- **Dependent options.** Selecting `12GB` hides storage sizes that only exist with `8GB`, and
  auto-corrects an incompatible selection instead of silently showing wrong data.
- **Deal score** is computed from the 90-day price history (current vs average). The logic is
  isolated in `lib/matching.ts` so real historical data can replace mock data without UI changes.
- **Price history** is stored per variant (30 points over 90 days in the demo) and powers the
  chart, lowest/average stats and the "X% below average" insight.
- **Search** is debounced, server-side filtered/sorted/paginated, and returns only catalogue
  matches — never a general internet search.

## Scraper pipeline

```
Retailer feeds (WooCommerce Store API: wasi.lk, idealz.lk · Magento listings: takas.lk)
        ↓
scrapers/common/woocommerce.py / magento.py   fetch → normalize (brand, price, sku, image, url, attrs)
        ↓
scrapers/run_batch.py            search subjects per category → dedupe → JSON snapshots
        ↓
lib/data/scraped-snapshot.json   merged, bundled into the app (no fs at runtime)
        ↓
lib/data/scraped.ts              exact-variant match: brand + model tokens + storage/RAM/capacity/screen,
                                 blocks model qualifiers ("S25 Ultra" never matches "S25")
        ↓
lib/data/products.ts             real offers replace demo offers per variant (demo fallback)
```

- Run `python scrapers/run_batch.py` to refresh the snapshot, then rebuild/restart the app.
- Prices arrive in minor units (`"22869900"` with `currency_minor_unit: 2` → Rs.228,699.00).
- Junk listings (order numbers, upgrade placeholders) are filtered in `normalize.is_junk`.
- Scraping is polite: 3 retries, 0.4s delays, 429/5xx backoff (`common/http.py`).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
python -m pip install requests beautifulsoup4 lxml   # scraper deps
python scrapers/run_batch.py                          # refresh real data snapshot
```

## Production roadmap

1. **Database** — Drizzle schema for the entities above on PostgreSQL (Supabase/Neon), with
   indexes on `product_id`, `variant_id`, `retailer_id`, `category_id`, `brand_id`, `slug`,
   `barcode`, `retailer_sku`, `timestamp`, `current_price`. The common query
   ("offers for variant X, price ASC") is served by the database, never sorted in the browser.
2. **Scrapers** — Python worker fleet with one adapter per retailer
   (`scrapers/retailer-a/`, `scrapers/retailer-b/`, `common/`). Priority: official API/feed →
   structured JSON/HTML → HTTP → Playwright only when necessary. Scraper status monitoring;
   consumer site keeps serving the last known good data when a scraper fails.
   **Status:** WooCommerce adapters (Wasi.lk, iDealz) and a Magento adapter (Takas) are live;
   HTML adapters (Abans) and Playwright (Daraz, Softlogic, Singer) are next.
3. **Matching engine** — deterministic first (barcode/EAN/SKU/model number/brand/normalized
   name/attributes), fuzzy where appropriate, AI assistance only for ambiguous cases.
4. **Caching** — Redis with stale-while-revalidate for popular products, searches, categories
   and comparisons.
5. **Search** — swap `lib/search.ts` internals for Meilisearch/Typesense; the API contract stays.
6. **Accounts** — real auth, watchlist and price alerts persisted server-side; Resend for
   notification emails; PostHog for analytics events (`product_search`, `variant_selected`,
   `comparison_viewed`, `retailer_clicked`, …); Sentry for error monitoring.

## Security & trust

- No credentials, API keys or internal URLs in the codebase — everything via environment
  variables.
- Every displayed price shows when it was last checked and links to its source page.
- The platform compares retailers; it does not sell products. Users are redirected to the
  original retailer to purchase.#   p r i c e l k  
 