#!/usr/bin/env python3
"""
UBS Keyinvest Asia Structured Products Scraper
Target: https://keyinvest-apac.ubs.com

UBS Keyinvest APAC publishes structured products including:
  FCN (Fixed Coupon Note), Autocallable, ELN, Reverse Convertible,
  Barrier Reverse Convertible, Capital Protection

API discovered via network inspection:
  Base: https://keyinvest-apac.ubs.com/ubs/de/product/search
  Products endpoint: /api/products (with filter params)
"""

import json
import os
import re
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
except ImportError:
    requests = None

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "ubs_products.json"

# UBS Keyinvest APAC base
UBS_BASE     = "https://keyinvest-apac.ubs.com"
UBS_SEARCH   = f"{UBS_BASE}/ubs/de/product/search"

# UBS uses a product search API — typical endpoint patterns for Keyinvest
UBS_API_SEARCH  = f"{UBS_BASE}/api/products"
UBS_API_DETAIL  = f"{UBS_BASE}/api/product"   # + /{isin}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept":          "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer":         UBS_BASE,
}

# Product type codes used by UBS Keyinvest
UBS_PRODUCT_TYPES = {
    "FCN":    "fixed-coupon-note",
    "ACN":    "autocallable",
    "ELN":    "equity-linked-note",
    "BRC":    "barrier-reverse-convertible",
    "RC":     "reverse-convertible",
    "PHOEBE": "phoenix",
    "CP":     "capital-protection",
}

# Active currencies in Asia
CURRENCIES = ["HKD", "USD", "SGD", "CNH", "AUD"]


def detect_product_type(name: str, type_code: str = "") -> str:
    """Map UBS product type names to our schema's ProductType."""
    name_upper = (name + " " + type_code).upper()
    if "SNOWBALL" in name_upper:
        return "Snowball"
    if "PHOENIX" in name_upper:
        return "Phoenix"
    if "AUTOCALL" in name_upper or "ACN" in name_upper:
        return "ACN"
    if "FIXED COUPON" in name_upper or "FCN" in name_upper:
        return "FCN"
    if "SHARK" in name_upper:
        return "SharkFin"
    if "EQUITY LINK" in name_upper or "ELN" in name_upper:
        return "ELN"
    if "BARRIER REVERSE" in name_upper or "BRC" in name_upper:
        return "ELN"
    if "REVERSE CONVERT" in name_upper or "RC" in name_upper:
        return "ELN"
    if "CAPITAL PROTECT" in name_upper or "CPP" in name_upper:
        return "ELN"
    return "FCN"


def fetch_products_page(session: "requests.Session",
                        product_type: str,
                        page: int = 0,
                        page_size: int = 50) -> dict:
    """
    Fetch a page of UBS products.

    UBS Keyinvest APAC uses a JSON search API. Common parameter formats:
      ?productType=FCN&currency=HKD&page=0&size=50&sort=issuanceDate,desc
    """
    params = {
        "productType": product_type,
        "page":        page,
        "size":        page_size,
        "sort":        "issuanceDate,desc",
        "status":      "active",
    }
    try:
        resp = session.get(UBS_API_SEARCH, params=params, headers=HEADERS, timeout=20)
        if resp.status_code == 404:
            # Try alternate endpoint pattern
            alt_url = f"{UBS_BASE}/ubs/de/product/api/search"
            resp = session.get(alt_url, params=params, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  [UBS] API error ({product_type} page {page}): {e}")
        return {}


def fetch_product_detail(session: "requests.Session", isin: str) -> dict:
    """Fetch detail for a single product by ISIN."""
    try:
        resp = session.get(
            f"{UBS_API_DETAIL}/{isin}",
            headers=HEADERS, timeout=20
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  [UBS] Detail error ({isin}): {e}")
        return {}


def parse_product(raw: dict) -> dict | None:
    """
    Convert UBS API product object to our StructuredProduct schema.

    UBS API field names vary by version; we try common patterns.
    """
    if not raw:
        return None

    # Common field name patterns in UBS APIs
    isin          = raw.get("isin") or raw.get("ISIN") or raw.get("productId", "")
    name          = raw.get("name") or raw.get("productName") or raw.get("title", "")
    type_code     = raw.get("productType") or raw.get("type") or raw.get("category", "")
    issuer        = raw.get("issuer") or raw.get("issuerName", "UBS")
    currency      = raw.get("currency") or raw.get("tradingCurrency", "HKD")
    issue_date    = raw.get("issuanceDate") or raw.get("issueDate") or raw.get("listingDate", "")
    maturity_date = raw.get("maturityDate") or raw.get("expiryDate") or raw.get("finalValuationDate", "")
    notional      = raw.get("notional") or raw.get("principalAmount") or raw.get("denomination")
    coupon_rate   = raw.get("couponRate") or raw.get("coupon") or raw.get("fixedCouponRate")
    coupon_freq   = raw.get("couponFrequency") or raw.get("couponPaymentFrequency")

    # Barrier levels
    ki_level      = raw.get("knockInLevel") or raw.get("knockInBarrier") or raw.get("barrierLevel")
    ko_level      = raw.get("knockOutLevel") or raw.get("knockOutBarrier") or raw.get("autocallLevel")
    strike        = raw.get("strikeLevel") or raw.get("strike") or raw.get("initialFixingLevel")
    barrier_type  = raw.get("barrierType") or raw.get("observationType", "")

    # Underlying assets
    underlyings_raw = (raw.get("underlyings") or raw.get("underlyingAssets")
                       or raw.get("basketComponents") or [])
    if isinstance(underlyings_raw, dict):
        underlyings_raw = [underlyings_raw]

    underlyings = []
    for u in underlyings_raw:
        if isinstance(u, str):
            underlyings.append({"code": u, "name": u, "exchange": "", "type": "stock"})
        elif isinstance(u, dict):
            underlyings.append({
                "code":     u.get("ticker") or u.get("code") or u.get("bloombergTicker", ""),
                "name":     u.get("name") or u.get("shortName") or u.get("description", ""),
                "exchange": u.get("exchange") or u.get("market", ""),
                "type":     u.get("type") or u.get("assetClass", "stock"),
                "weight":   u.get("weight") or u.get("basketWeight"),
            })

    if not isin and not name:
        return None

    now_str = datetime.now().isoformat()
    product_type = detect_product_type(name, str(type_code))

    # Determine status
    status = "active"
    if raw.get("status"):
        s = str(raw["status"]).lower()
        if "knock" in s and "in" in s:
            status = "knocked_in"
        elif "knock" in s and "out" in s:
            status = "knocked_out"
        elif "expired" in s or "matured" in s:
            status = "expired"

    return {
        "id":             f"UBS-{isin}" if isin else f"UBS-{hash(name) % 100000:05d}",
        "isin":           isin,
        "productName":    name,
        "productType":    product_type,
        "exchange":       "other",
        "issuer":         "ubs",
        "issuerFull":     str(issuer),
        "currency":       currency,
        "status":         status,
        "issuanceDate":   str(issue_date) if issue_date else "",
        "maturityDate":   str(maturity_date) if maturity_date else "",
        "couponRate":     float(coupon_rate) if coupon_rate else None,
        "couponFrequency":str(coupon_freq) if coupon_freq else None,
        "notional":       float(notional) if notional else None,
        "strike":         float(strike) if strike else None,
        "knockInLevel":   float(ki_level) if ki_level else None,
        "knockOutLevel":  float(ko_level) if ko_level else None,
        "autocallBarrier":float(ko_level) if ko_level else None,
        "barrierType":    barrier_type,
        "underlyings":    underlyings,
        "tags": list(filter(None, [
            "UBS",
            product_type,
            currency,
            "WorstOf" if len(underlyings) > 1 else None,
        ])),
        "sourceUrl":      f"{UBS_BASE}/product/{isin}" if isin else UBS_BASE,
        "scrapedAt":      now_str,
        "lastUpdated":    now_str,
    }


def scrape_ubs(days_back: int = 30) -> list:
    """Main UBS Keyinvest APAC scraping pipeline."""
    print("=" * 60)
    print("UBS Keyinvest APAC Structured Products Scraper")
    print(f"Date: {datetime.now().isoformat()}")
    print("=" * 60)

    if not requests:
        print("[UBS] requests library not available — skipping")
        return []

    session = requests.Session()
    # Establish a session by visiting the main page first
    try:
        session.get(UBS_BASE, headers=HEADERS, timeout=15)
    except Exception as e:
        print(f"[UBS] Could not establish session: {e}")

    all_products = []
    cutoff = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    for pt_key, pt_val in UBS_PRODUCT_TYPES.items():
        print(f"\n[UBS] Fetching {pt_key} ({pt_val})...")
        page = 0
        while True:
            data = fetch_products_page(session, pt_val, page=page, page_size=50)
            if not data:
                break

            # Handle both list and paginated dict responses
            if isinstance(data, list):
                items = data
                has_more = False
            elif isinstance(data, dict):
                items = (data.get("content") or data.get("products")
                         or data.get("items") or data.get("results") or [])
                total_pages = data.get("totalPages", 1)
                has_more = page < (total_pages - 1)
            else:
                break

            print(f"  Page {page}: {len(items)} items")
            for raw in items:
                p = parse_product(raw)
                if p:
                    # Only include recent products
                    if p.get("issuanceDate") and p["issuanceDate"] >= cutoff:
                        all_products.append(p)
                    elif not p.get("issuanceDate"):
                        all_products.append(p)  # include if no date

            if not has_more or not items:
                break
            page += 1

    print(f"\n[UBS] Scraped {len(all_products)} products total")

    # Merge with existing
    os.makedirs(DATA_DIR, exist_ok=True)
    existing = []
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)

    existing_ids = {p.get("id") for p in existing}
    new_products  = [p for p in all_products if p.get("id") not in existing_ids]

    # Refresh existing products
    new_by_id = {p["id"]: p for p in all_products}
    updated_existing = []
    for p in existing:
        if p["id"] in new_by_id:
            updated_existing.append({**p, **new_by_id[p["id"]]})
        else:
            updated_existing.append(p)

    merged = updated_existing + new_products
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    print(f"[UBS] ✓ {len(new_products)} new | {len(updated_existing)} updated | {len(merged)} total")
    return merged


if __name__ == "__main__":
    scrape_ubs()
