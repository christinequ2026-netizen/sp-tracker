# SP Tracker Scraping - Quick Start

## 30-Second Setup

```bash
# Navigate to project
cd /path/to/sp-tracker

# Install dependencies
pip install -r scripts/requirements.txt

# Prepare data directory
mkdir -p src/data/logs

# Run all scrapers
./scripts/run_all_scrapers.sh
```

## That's it!

Your data will be in:
- `src/data/products.json` - Combined product catalog
- `src/data/stats.json` - Summary statistics
- `src/data/logs/` - Execution logs with timestamps

## Individual Scrapers

Run just one exchange:
```bash
python3 scripts/scrape_hkex.py
python3 scripts/scrape_sgx.py
python3 scripts/scrape_ubs.py
```

## Specify Date Range

Look back 14 days instead of 7:
```bash
./scripts/run_all_scrapers.sh 14
```

## Check Logs

```bash
tail -f src/data/logs/*.log
```

## What Gets Scraped

1. **HKEX** - Hong Kong Exchange derivative warrants & structured notes
2. **SGX** - Singapore Exchange announcements & structured products
3. **UBS** - UBS Keyinvest portals (HK, Singapore, Global)

## Output Format

Each product includes:
- Product name, ISIN, type
- Issuer and exchange
- Coupon rate and payment frequency
- Underlying assets and barrier levels
- Issue and maturity dates
- Source URL and last updated timestamp

## Next Steps

See `SCRAPING_GUIDE.md` for:
- Detailed feature descriptions
- Production implementation steps
- Output schema reference
- Troubleshooting guide
- Contributing guidelines

---

**Ready to collect data?**

```bash
./scripts/run_all_scrapers.sh
```

View results:
```bash
head -50 src/data/products.json
cat src/data/stats.json | python3 -m json.tool
```
