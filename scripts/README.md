# CheckKal Scripts

## `import-usda.mjs`

Imports **Foundation Foods + SR Legacy** (raw, well-vetted ingredients) from [USDA FoodData Central](https://fdc.nal.usda.gov) into Supabase `foods` table. Idempotent (upserts by `fdc_id`) — safe to re-run anytime.

Complements `import-openfoodfacts.mjs`: OFF covers packaged/branded products (Thai market), USDA covers raw ingredients with accurate macros (chicken, rice, vegetables, etc.).

### Setup (one-time)

1. **Run SQL migration** in Supabase SQL Editor to add `fdc_id` column:
   ```bash
   cat scripts/add-fdc-id-column.sql
   # paste into Supabase Dashboard → SQL Editor → Run
   ```
2. **Get free API key**: https://fdc.nal.usda.gov/api-key-signup
3. Add to `checkkal/.env.local`:
   ```bash
   USDA_API_KEY=your_key_here
   ```

### Run

```bash
# from checkkal/ root

# dry run first — recommend always
node scripts/import-usda.mjs --dry-run --max-pages=3

# live import — full run (both Foundation + SR Legacy)
node scripts/import-usda.mjs

# only Foundation Foods (smaller, more curated)
node scripts/import-usda.mjs --data-type=Foundation

# resume from a specific page
node scripts/import-usda.mjs --start-page=20 --max-pages=30
```

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--dry-run` | off | Fetch + map but skip DB writes |
| `--max-pages=N` | 50 | Stop after N pages |
| `--page-size=N` | 200 | Items per page (max 200) |
| `--start-page=N` | 1 | Resume from page N |
| `--data-type=X` | both | `Foundation` \| `SR Legacy` \| `both` |

### Thai translation

Uses a built-in dictionary (~200 common food words) to translate `name_en` → `name_th`. For items not in the dictionary, the English name is used as `name_th` as a fallback. Admin panel will expose these for manual correction later.

### Expected yield

- **Foundation Foods**: ~400 highly-curated items
- **SR Legacy**: ~7,500 classic raw food items
- **Both**: ~8,000 items total after a full run

All imported with `source='usda'`, `verified=true` (USDA data is vetted).

### Rate limits

USDA allows 1,000 requests/hour with a free API key. Script is rate-limited to 1 req/sec (3,600/hour max) so it'll never hit the ceiling on a single run.

---

## `import-openfoodfacts.mjs`

Imports Thailand-tagged food products from [Open Food Facts](https://world.openfoodfacts.org) into the Supabase `foods` table. Idempotent (upserts by `barcode`) — safe to re-run anytime.

### Setup (one-time)

1. Get your **service role key** from Supabase:
   - Dashboard → Project Settings → API → `service_role` key (secret)
2. Add to `checkkal/.env.local`:

   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

   > ⚠️ Service role key bypasses RLS. **Never** commit it or expose it client-side. `.env.local` is already in `.gitignore`.

### Run

```bash
# from checkkal/ root

# dry run first (no DB writes) — recommend always running this first
node scripts/import-openfoodfacts.mjs --dry-run --max-pages=3

# live import — full run
node scripts/import-openfoodfacts.mjs

# custom range
node scripts/import-openfoodfacts.mjs --start-page=50 --max-pages=20 --page-size=200
```

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--dry-run` | off | Fetch + map but skip DB writes |
| `--max-pages=N` | 100 | Stop after N pages |
| `--page-size=N` | 100 | Items per page (max 1000) |
| `--start-page=N` | 1 | Resume from page N |

### What it does

1. Fetches Thailand-tagged products from OFF API (`countries_tags=thailand`)
2. Extracts barcode, name, brand, nutriments (kcal/protein/fat/carbs/fiber/sodium/sugar), image, categories
3. Maps `categories_tags` → CheckKal category (`protein`, `carb`, `fat`, `vegetable`, `fruit`, `snack`, `drink`, `main`, `dairy`)
4. Upserts into `foods` table by `barcode` — existing rows get updated
5. Rate-limited 1 req/sec to be polite to OFF

### Skipped products

A product is **skipped** (not imported) if it lacks:
- `code` (barcode)
- `product_name` or `product_name_th`
- `nutriments.energy-kcal_100g` (or convertible kJ value)

This is expected — OFF has many incomplete entries.

### Expected yield

Around 3,000–8,000 items after a full run, depending on how many Thailand-tagged products OFF currently has. Run `--dry-run --max-pages=3` first to sanity check mapping before going full throttle.

### Re-running later

Just run again. Barcode-based upsert means existing products get refreshed with latest OFF data, new products get added. No duplicates.

### Troubleshooting

- **`Missing SUPABASE_SERVICE_ROLE_KEY`** — add it to `.env.local`
- **`HTTP 429`** — OFF rate limited you. Wait 10 min, resume with `--start-page=<last page>`
- **Upsert conflict on `slug`** — unlikely since we suffix slug with barcode. If it happens, check the `foods` table for manual entries with duplicate slugs
- **All items skipped** — check API response manually: `curl 'https://world.openfoodfacts.org/api/v2/search?countries_tags=thailand&page_size=1'`

---

## Automation

Scheduled via **Claude Code CronCreate** (in-session scheduler). Jobs are set up each session using the schedule below.

> ⚠️ **Session-only**: CronCreate jobs live only while Claude Code is running. They auto-expire after 7 days. Re-run the Phase 4 setup command to re-register them after restarting.

### Scheduled Jobs

| Job ID | Name | Schedule (Asia/Bangkok) | Command |
|--------|------|------------------------|---------|
| `260fe222` | checkkal-import-off-daily | Every day 06:00 | `node scripts/import-openfoodfacts.mjs --max-pages=5` |
| `f33305b4` | checkkal-import-usda-daily | Every day 07:00 | `node scripts/import-usda.mjs --max-pages=5` |

### Re-register after restart

```
Phase 4 — ตั้ง Claude Code scheduled task ให้รัน import-openfoodfacts.mjs + import-usda.mjs อัตโนมัติทุกวัน

Tasks (ใช้ schedule skill):
1. Task "checkkal-import-off-daily" — ทุกวัน 06:00 Asia/Bangkok — cd checkkal && node scripts/import-openfoodfacts.mjs --max-pages=5
2. Task "checkkal-import-usda-daily" — ทุกวัน 07:00 Asia/Bangkok — cd checkkal && node scripts/import-usda.mjs --max-pages=5
3. List scheduled tasks ให้ดูว่ามีครบ
```

### Manual run (ถ้าต้องการรันเองทันที)

```bash
# จาก checkkal/ root
node scripts/import-openfoodfacts.mjs --max-pages=5
node scripts/import-usda.mjs --max-pages=5
```
