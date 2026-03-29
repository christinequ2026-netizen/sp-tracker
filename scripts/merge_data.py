#!/usr/bin/env python3
"""
Merge scraped data from all sources into unified products.json
"""

import json
import os
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

SOURCE_FILES = {
    "hkex": DATA_DIR / "hkex_products.json",
    "sgx": DATA_DIR / "sgx_products.json",
    "ubs": DATA_DIR / "ubs_products.json",
}

OUTPUT_FILE = DATA_DIR / "products.json"

def merge_all_sources():
    """Merge products from all sources, deduplicate, and save."""
    print("Merging data from all sources...")

    all_products = []

    for source, filepath in SOURCE_FILES.items():
        if filepath.exists():
            with open(filepath, 'r') as f:
                products = json.load(f)
                print(f"  {source}: {len(products)} products")
                all_products.extend(products)
        else:
            print(f"  {source}: no data file found")

    # Deduplicate by ISIN (if available) or sourceUrl
    seen = set()
    unique_products = []
    for p in all_products:
        key = p.get("isin") or p.get("sourceUrl") or p.get("id")
        if key and key not in seen:
            seen.add(key)
            unique_products.append(p)

    # Sort by issue date (newest first)
    unique_products.sort(key=lambda p: p.get("issueDate", ""), reverse=True)

    # Save merged file
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(unique_products, f, indent=2, ensure_ascii=False)

    print(f"\nMerged: {len(unique_products)} unique products (from {len(all_products)} total)")
    print(f"Saved to: {OUTPUT_FILE}")

    # Generate summary stats
    stats = {
        "lastUpdated": datetime.now().isoformat(),
        "totalProducts": len(unique_products),
        "bySource": {},
        "byProductType": {},
        "byIssuer": {},
    }

    for p in unique_products:
        src = p.get("sourceExchange", "unknown")
        pt = p.get("productType", "unknown")
        iss = p.get("issuer", "unknown")
        stats["bySource"][src] = stats["bySource"].get(src, 0) + 1
        stats["byProductType"][pt] = stats["byProductType"].get(pt, 0) + 1
        stats["byIssuer"][iss] = stats["byIssuer"].get(iss, 0) + 1

    stats_file = DATA_DIR / "stats.json"
    with open(stats_file, 'w') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    print(f"Stats saved to: {stats_file}")

if __name__ == "__main__":
    merge_all_sources()
