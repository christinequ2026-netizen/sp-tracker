#!/usr/bin/env python3
"""
SGX Structured Warrants Scraper
Sources:
  1. https://api.sgx.com/marketmetadata/v2/structure-warrants  — full listing (1100+ products)
  2. https://api3.sgx.com/JsonRead/JsonstData?qryId=RSWnew&timeout=60 — newly listed warrants
"""

import json
import os
import re
import time
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
except ImportError:
    requests = None

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "sgx_products.json"

# Confirmed working SGX API endpoints (no auth required)
SGX_METADATA_URL = "https://api.sgx.com/marketmetadata/v2/structure-warrants"
SGX_NEW_WARRANTS_URL = "https://api3.sgx.com/JsonRead/JsonstData?qryId=RSWnew&timeout=60"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Referer": "https://www.sgx.com/",
    "Accept": "application/json, text/plain, */*",
}

# Map SGX issuer name → our issuer key
ISSUER_MAP = {
    "MACQUARIE BANK LIMITED": "macquarie",
    "SG ISSUER": "societe_generale",       # SG Issuer = Societe Generale
    "SOCIÉTÉ GÉNÉRALE": "societe_generale",
    "SOCIETE GENERALE": "societe_generale",
    "UBS AG": "ubs",
    "UBS": "ubs",
    "J.P. MORGAN": "jpmorgan",
    "JP MORGAN": "jpmorgan",
    "GOLDMAN SACHS": "goldman",
    "MORGAN STANLEY": "morgan_stanley",
    "CITIGROUP": "citi",
    "BARCLAYS": "barclays",
    "BNP PARIBAS": "bnp_paribas",
    "DEUTSCHE BANK": "deutsche",
    "HSBC": "hsbc",
    "DBS BANK LTD.": "other",
    "DBS BANK": "other",
    "CREDIT SUISSE": "other",
    "COMMERZBANK": "other",
}

# Map SGX underlying code → our standard underlying name
UNDERLYING_MAP = {
    ".HSI":   "HSI",
    ".HSCEI": "HSCEI",
    ".STI":   "STI",
    "HSI":    "HSI",
    "HSCEI":  "HSCEI",
    "STI":    "STI",
    "NDX":    "NASDAQ",
    "SPX":    "S&P500",
    "NIO":    "NIO",
    "BABA":   "Alibaba",
    "JD":     "JD.com",
    "PDD":    "PDD",
    "BIDU":   "Baidu",
    "TENCENT": "Tencent",
    "700.HK": "Tencent",
    "TSMC":   "TSMC",
    "SAMSUNG": "Samsung",
}


def normalize_issuer(name: str) -> str:
    if not name:
        return "other"
    upper = name.upper().strip()
    for k, v in ISSUER_MAP.items():
        if k.upper() in upper:
            return v
    return "other"


def normalize_underlying(code: str, security_name: str = "") -> str:
    if not code:
        return security_name or "Unknown"
    # Try direct map
    mapped = UNDERLYING_MAP.get(code)
    if mapped:
        return mapped
    # Strip leading dot
    clean = code.lstrip(".")
    # Use security_name if it looks more descriptive
    if security_name and len(security_name) > len(clean):
        return security_name
    return clean


def fetch_full_listing() -> list:
    """
    Fetch all listed structured warrants from SGX metadata API.
    Returns list of raw product dicts.
    """
    print(f"[SGX] Fetching full structured warrants listing...")
    if not requests:
        print("[SGX] requests not available, skipping")
        return []

    try:
        resp = requests.get(SGX_METADATA_URL, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        items = list(data.get("data", {}).values())
        print(f"[SGX] Got {len(items)} items from metadata API")
        return items
    except Exception as e:
        print(f"[SGX] Error fetching full listing: {e}")
        return []


def fetch_new_warrants() -> list:
    """
    Fetch recently listed structured warrants from the 'new' endpoint.
    Returns parsed list of dicts with keys: N, NC, IN, UP, CP, EL, IS, CR, ED, LD, etc.
    """
    print(f"[SGX] Fetching new structured warrants...")
    if not requests:
        print("[SGX] requests not available, skipping")
        return []

    try:
        resp = requests.get(SGX_NEW_WARRANTS_URL, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        text = resp.text

        # Parse the custom JS-object format: {identifier:'ID', label:'...', items:[...]}
        # Extract the items array using regex
        items_match = re.search(r'items:\[(.*)\]', text, re.DOTALL)
        if not items_match:
            print("[SGX] Could not find items in new warrants response")
            return []

        items_str = items_match.group(1)
        # Parse individual item objects
        item_pattern = re.compile(
            r'\{ID:(\d+),N:\'([^\']+)\',NC:\'([^\']*)\',IN:\'([^\']*)\','
            r'UP:\'([^\']*)\',CP:\'([^\']*)\',EL:([\d.]+),CL:\'([^\']*)\','
            r'IS:([\d.]+),CR:\'([^\']*)\',ED:\'([^\']*)\',LTD:\'([^\']*)\','
            r'LD:\'([^\']*)\''
        )
        results = []
        for m in item_pattern.finditer(text):
            results.append({
                "id_idx":    m.group(1),
                "name":      m.group(2),   # e.g. "HSI 26400MBeCW260528"
                "code":      m.group(3),   # SGX counter, e.g. "XV4W"
                "issuer":    m.group(4),   # e.g. "MACQUARIE BANK LIMITED"
                "underlying":m.group(5),   # e.g. ".HSI"
                "call_put":  m.group(6),   # "C" or "P"
                "strike":    float(m.group(7)),
                "last_close":m.group(8),
                "issue_size":float(m.group(9)),
                "conv_ratio":m.group(10),  # e.g. "1200:1"
                "expiry":    m.group(11),  # "2026-05-28"
                "last_trade":m.group(12),
                "list_date": m.group(13),  # "2026-03-27"
            })
        print(f"[SGX] Got {len(results)} newly listed warrants")
        return results

    except Exception as e:
        print(f"[SGX] Error fetching new warrants: {e}")
        return []


def product_from_metadata(item: dict) -> dict | None:
    """Convert a SGX metadata API item to our StructuredProduct schema."""
    stock_code     = item.get("stockCode")
    issuer_raw     = item.get("issuerName", "")
    maturity       = item.get("maturityDate", "")
    security_name  = item.get("securityName", "")
    instrument     = item.get("instrumentSubType", "")
    counter_name   = item.get("tradingCounterName", "")
    list_date      = item.get("listingDate", "")
    warrant_type   = item.get("warrantType", "")
    asset_type     = item.get("assetType", "")
    exercise_value = item.get("exerciseValue")
    conv_from      = item.get("conversionRatioFrom")
    conv_to        = item.get("conversionRatioTo")

    # Skip records without a stock code or listing date (incomplete)
    if not stock_code or not list_date:
        return None

    # Skip very old maturity dates (expired)
    if maturity and maturity < datetime.now().strftime("%Y-%m-%d"):
        return None

    # Determine product type
    if instrument == "DE.DAILY_LEVERAGE_CERTIFICATES":
        product_type = "Warrant"   # DLC — treat as leveraged warrant
        type_label   = f"DLC {item.get('leverageFactor', '')}x"
    else:
        # Standard warrant — CALL/PUT
        product_type = "Warrant"
        type_label   = f"{'Call' if warrant_type == 'CALL' else 'Put'} Warrant"

    # Conversion ratio string
    conv_ratio = ""
    if conv_from and conv_to:
        conv_ratio = f"{conv_from}:{conv_to}"

    # Underlying
    underlying_code = security_name or stock_code
    underlying_name = normalize_underlying(underlying_code, security_name)

    now_str = datetime.now().isoformat()

    return {
        "id":             f"SGX-{stock_code}",
        "productName":    counter_name or f"{underlying_name} {type_label}",
        "productType":    product_type,
        "exchange":       "sgx",
        "issuer":         normalize_issuer(issuer_raw),
        "issuerFull":     issuer_raw,
        "currency":       item.get("tradingCurrency", "SGD"),
        "status":         "active",
        "issuanceDate":   list_date,
        "maturityDate":   maturity,
        "couponRate":     None,
        "couponFrequency":item.get("distributionFrequency"),
        "notional":       None,
        "strike":         float(exercise_value) if exercise_value else None,
        "knockInLevel":   item.get("knockInBarrier"),
        "knockOutLevel":  item.get("autocallBarrier"),
        "autocallBarrier":item.get("autocallBarrier"),
        "barrierType":    item.get("barrierType"),
        "conversionRatio":conv_ratio,
        "leverageFactor": item.get("leverageFactor"),
        "underlyings": [{
            "code":       underlying_code,
            "name":       underlying_name,
            "exchange":   item.get("securityMarketName", ""),
            "type":       asset_type or "stock",
        }],
        "tags": [
            "SGX",
            ("DLC" if instrument == "DE.DAILY_LEVERAGE_CERTIFICATES" else "Warrant"),
            asset_type.lower() if asset_type else "",
            warrant_type.lower() if warrant_type else "",
        ],
        "sourceUrl":  f"https://www.sgx.com/securities/securities-prices?code={stock_code}",
        "scrapedAt":  now_str,
        "lastUpdated": now_str,
    }


def product_from_new_warrant(item: dict) -> dict:
    """Convert a newly-listed warrant (new endpoint format) to StructuredProduct."""
    now_str  = datetime.now().isoformat()
    code     = item.get("code", "")
    issuer   = item.get("issuer", "")
    underly  = item.get("underlying", "")
    cp       = item.get("call_put", "C")
    strike   = item.get("strike")
    expiry   = item.get("expiry", "")
    list_date= item.get("list_date", "")
    name     = item.get("name", "")

    # Parse conversion ratio "1200:1" → from=1200, to=1
    conv_ratio = item.get("conv_ratio", "")

    return {
        "id":             f"SGX-NEW-{code}",
        "productName":    name,
        "productType":    "Warrant",
        "exchange":       "sgx",
        "issuer":         normalize_issuer(issuer),
        "issuerFull":     issuer,
        "currency":       "SGD",
        "status":         "active",
        "issuanceDate":   list_date,
        "maturityDate":   expiry,
        "couponRate":     None,
        "couponFrequency":None,
        "notional":       item.get("issue_size"),
        "strike":         strike,
        "knockInLevel":   None,
        "knockOutLevel":  None,
        "autocallBarrier":None,
        "barrierType":    None,
        "conversionRatio":conv_ratio,
        "leverageFactor": None,
        "underlyings": [{
            "code":   underly,
            "name":   normalize_underlying(underly),
            "exchange": "",
            "type":   "index" if underly.startswith(".") else "stock",
        }],
        "tags": [
            "SGX",
            "Warrant",
            "NewListing",
            "Call" if cp == "C" else "Put",
        ],
        "sourceUrl":   f"https://www.sgx.com/securities/securities-prices?code={code}",
        "scrapedAt":   now_str,
        "lastUpdated": now_str,
    }


def scrape_sgx(days_back: int = 7) -> list:
    """Main SGX scraping pipeline."""
    print("=" * 60)
    print("SGX Structured Products Scraper")
    print(f"Date: {datetime.now().isoformat()}")
    print("=" * 60)

    # 1) Fetch all listed products from metadata API
    all_items = fetch_full_listing()

    # Filter to recent listings only (within days_back)
    cutoff = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    recent_items = [
        i for i in all_items
        if i.get("listingDate") and i.get("listingDate") >= cutoff
    ]
    print(f"[SGX] {len(recent_items)} products listed in last {days_back} days")

    products = []
    for item in recent_items:
        p = product_from_metadata(item)
        if p:
            products.append(p)

    # 2) Fetch new warrants (supplemental, may overlap)
    new_warrants = fetch_new_warrants()
    new_codes = {p["id"] for p in products}
    for item in new_warrants:
        pid = f"SGX-NEW-{item.get('code','')}"
        if pid not in new_codes:
            p = product_from_new_warrant(item)
            products.append(p)
            new_codes.add(pid)

    # 3) Merge with existing data
    os.makedirs(DATA_DIR, exist_ok=True)
    existing = []
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)

    existing_ids = {p.get("id") for p in existing}
    new_products = [p for p in products if p.get("id") not in existing_ids]

    # Update existing products (price / status refresh)
    updated_existing = []
    new_by_id = {p["id"]: p for p in products}
    for p in existing:
        if p["id"] in new_by_id:
            updated_existing.append({**p, **new_by_id[p["id"]]})
        else:
            updated_existing.append(p)

    all_products = updated_existing + new_products

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)

    print(f"\n[SGX] ✓ {len(new_products)} new | {len(updated_existing)} updated | {len(all_products)} total")
    return all_products


if __name__ == "__main__":
    scrape_sgx()
