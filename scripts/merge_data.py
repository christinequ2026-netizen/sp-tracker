#!/usr/bin/env python3
"""
Merge scraped data from all sources into unified products.json + stats.json
Sources: sgx_products.json, ubs_products.json, macquarie_products.json
         + existing products.json (preserves seed / previously scraped data)
"""

import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

SOURCE_FILES = {
    "sgx":       DATA_DIR / "sgx_products.json",
    "ubs":       DATA_DIR / "ubs_products.json",
    "macquarie": DATA_DIR / "macquarie_products.json",
}

OUTPUT_FILE = DATA_DIR / "products.json"
STATS_FILE  = DATA_DIR / "stats.json"

# IDs that come from seed data start with these prefixes — preserved in merge
SEED_SOURCES = {"hkex", "sgx", "jpx", "krx", "twse", "other"}


def merge_all_sources():
    """Merge products from all sources, deduplicate, sort, and save."""
    print("=" * 50)
    print("Merging structured products data")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 50)

    # Load existing products.json as base (includes seed data + previous scrapes)
    existing_products = []
    if OUTPUT_FILE.exists():
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                existing_products = json.load(f)
            print(f"  existing products.json: {len(existing_products)} products (base)")
        except Exception as e:
            print(f"  existing products.json: error reading ({e})")

    all_products = list(existing_products)

    for source, filepath in SOURCE_FILES.items():
        if filepath.exists():
            with open(filepath, "r", encoding="utf-8") as f:
                products = json.load(f)
            print(f"  {source}: {len(products)} products")
            all_products.extend(products)
        else:
            print(f"  {source}: no data file (skipped)")

    # Deduplicate by ID (primary), then ISIN, then sourceUrl
    seen = set()
    unique_products = []
    for p in all_products:
        key = p.get("id") or p.get("isin") or p.get("sourceUrl")
        if key and key not in seen:
            seen.add(key)
            unique_products.append(p)
        elif not key:
            unique_products.append(p)   # keep keyless items

    # Sort by issuance date, newest first
    def sort_key(p):
        d = p.get("issuanceDate") or p.get("issueDate") or ""
        return d

    unique_products.sort(key=sort_key, reverse=True)

    # Save merged products
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(unique_products, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Merged: {len(unique_products)} unique products")
    print(f"  Saved: {OUTPUT_FILE}")

    # ---------- Generate stats ----------
    by_source       = {}
    by_product_type = {}
    by_issuer       = {}
    by_exchange     = {}
    by_currency     = {}
    active_count    = 0
    knocked_in      = 0

    for p in unique_products:
        src = p.get("exchange", "unknown")
        pt  = p.get("productType", "unknown")
        iss = p.get("issuer", "unknown")
        cur = p.get("currency", "unknown")
        st  = p.get("status", "active")

        by_source[src]        = by_source.get(src, 0) + 1
        by_product_type[pt]   = by_product_type.get(pt, 0) + 1
        by_issuer[iss]        = by_issuer.get(iss, 0) + 1
        by_exchange[src]      = by_exchange.get(src, 0) + 1
        by_currency[cur]      = by_currency.get(cur, 0) + 1

        if st == "active":
            active_count += 1
        elif st in ("knocked_in", "knockedIn"):
            knocked_in += 1

    stats = {
        "lastUpdated":   datetime.now().isoformat(),
        "totalProducts": len(unique_products),
        "activeProducts":active_count,
        "knockedIn":     knocked_in,
        "newToday":      sum(
            1 for p in unique_products
            if (p.get("issuanceDate") or "")[:10] == datetime.now().strftime("%Y-%m-%d")
        ),
        "byExchange":     by_exchange,
        "byProductType":  by_product_type,
        "byIssuer":       by_issuer,
        "byCurrency":     by_currency,
    }

    with open(STATS_FILE, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    print(f"  Stats:  {STATS_FILE}")
    print(f"\n  Active: {active_count}  |  Knocked-in: {knocked_in}")
    print(f"  By exchange: {by_exchange}")
    print(f"  By type:     {by_product_type}")

    return unique_products


if __name__ == "__main__":
    merge_all_sources()
