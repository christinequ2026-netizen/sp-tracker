#!/usr/bin/env python3
"""
HKEX News Scraper for Structured Products
Scrapes derivative warrants and structured notes from HKEX disclosure platform.
Target: https://www.hkexnews.hk
"""

import json
import os
import time
import re
from datetime import datetime, timedelta
from pathlib import Path

# Note: In production, install these:
# pip install requests beautifulsoup4 selenium

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "hkex_products.json"

# HKEX API endpoints (public)
HKEX_BASE = "https://www.hkexnews.hk"
HKEX_SEARCH_API = "https://www1.hkexnews.hk/search/titlesearch.xhtml"

# Known issuer mapping for HKEX structured products
ISSUER_MAP = {
    "UBS AG": "ubs",
    "J.P. Morgan": "jpmorgan",
    "Goldman Sachs": "goldman",
    "Morgan Stanley": "morgan_stanley",
    "Citigroup": "citigroup",
    "Barclays": "barclays",
    "BNP Paribas": "bnp_paribas",
    "Société Générale": "societe_generale",
    "SG Issuer": "societe_generale",
    "Deutsche Bank": "deutsche_bank",
    "HSBC": "hsbc",
    "Nomura": "nomura",
    "Macquarie": "macquarie",
    "BOCI": "boci",
    "Haitong": "htisec",
}

def detect_product_type(title: str) -> str:
    """Detect product type from document title."""
    title_lower = title.lower()
    if "warrant" in title_lower or "衍生权证" in title:
        return "warrant"
    if "bull" in title_lower or "bear" in title_lower or "cbbc" in title_lower or "牛熊" in title:
        return "cbbc"
    if "fixed coupon" in title_lower or "fcn" in title_lower:
        return "fcn"
    if "autocall" in title_lower or "auto-call" in title_lower:
        return "acn"
    if "equity linked" in title_lower or "eln" in title_lower:
        return "eln"
    if "phoenix" in title_lower:
        return "phoenix"
    if "snowball" in title_lower or "雪球" in title:
        return "snowball"
    if "shark" in title_lower or "鲨鱼" in title:
        return "shark_fin"
    if "reverse convertible" in title_lower:
        return "reverse_convertible"
    return "other"

def detect_issuer(title: str) -> tuple:
    """Detect issuer from document title. Returns (issuer_key, issuer_name)."""
    for name, key in ISSUER_MAP.items():
        if name.lower() in title.lower():
            return key, name
    return "other", "Unknown Issuer"

def extract_coupon_rate(text: str) -> float | None:
    """Extract coupon rate from text."""
    patterns = [
        r'(\d+\.?\d*)\s*%\s*p\.?a\.?',
        r'coupon[:\s]+(\d+\.?\d*)\s*%',
        r'fixed\s+coupon[:\s]+(\d+\.?\d*)\s*%',
        r'(\d+\.?\d*)\s*%\s*per\s+annum',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1)) / 100
    return None

def extract_barrier_levels(text: str) -> dict:
    """Extract knock-in and knock-out levels from text."""
    result = {}
    ki_patterns = [
        r'knock[- ]?in[:\s]+(\d+\.?\d*)\s*%',
        r'barrier[:\s]+(\d+\.?\d*)\s*%',
        r'knock[- ]?in\s+level[:\s]+(\d+\.?\d*)\s*%',
    ]
    ko_patterns = [
        r'knock[- ]?out[:\s]+(\d+\.?\d*)\s*%',
        r'autocall[:\s]+(\d+\.?\d*)\s*%',
        r'early\s+redemption[:\s]+(\d+\.?\d*)\s*%',
    ]
    for p in ki_patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            result['knockInLevel'] = float(match.group(1))
            break
    for p in ko_patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            result['knockOutLevel'] = float(match.group(1))
            break
    return result

def search_hkex_filings(days_back: int = 7) -> list:
    """
    Search HKEX News for recent structured product filings.

    In production, this would use requests + BeautifulSoup or Selenium.
    The HKEX search API supports:
    - Document type filter: "Derivative Warrants", "Debt Securities"
    - Date range filter
    - Issuer name search
    """
    print(f"[HKEX] Searching filings from last {days_back} days...")

    # Search parameters for HKEX
    search_params = {
        "lang": "EN",
        "category": "0",  # All categories
        "market": "SEHK",
        "documentType": "-1",
        "from": (datetime.now() - timedelta(days=days_back)).strftime("%Y%m%d"),
        "to": datetime.now().strftime("%Y%m%d"),
        "searchType": "0",
    }

    # Known search terms for structured products
    search_terms = [
        "structured note",
        "fixed coupon note",
        "equity linked note",
        "autocallable",
        "derivative warrant listing",
        "callable bull bear",
    ]

    results = []

    for term in search_terms:
        print(f"  Searching: '{term}'...")
        # In production:
        # response = requests.get(HKEX_SEARCH_API, params={**search_params, "keyword": term})
        # Parse HTML response to extract filing list
        # Each result has: title, date, document URL, issuer

        # Placeholder for demonstration
        # results.extend(parse_search_results(response.text))
        time.sleep(0.5)  # Rate limiting

    print(f"[HKEX] Found {len(results)} filings")
    return results

def parse_filing_document(url: str) -> dict | None:
    """
    Parse a specific filing document (usually PDF/HTML) to extract product terms.

    In production:
    1. Download the document
    2. If PDF, use pdfplumber or PyPDF2 to extract text
    3. If HTML, use BeautifulSoup
    4. Apply regex patterns to extract structured data
    """
    print(f"  Parsing document: {url}")
    # In production:
    # response = requests.get(url)
    # text = extract_text_from_pdf_or_html(response.content)
    # coupon = extract_coupon_rate(text)
    # barriers = extract_barrier_levels(text)
    # underlyings = extract_underlyings(text)
    # ...
    return None

def scrape_hkex(days_back: int = 7):
    """Main HKEX scraping pipeline."""
    print("=" * 60)
    print("HKEX Structured Products Scraper")
    print(f"Date: {datetime.now().isoformat()}")
    print("=" * 60)

    # Step 1: Search for recent filings
    filings = search_hkex_filings(days_back)

    # Step 2: Parse each filing document
    products = []
    for filing in filings:
        product = parse_filing_document(filing.get("url", ""))
        if product:
            products.append(product)

    # Step 3: Save results
    os.makedirs(DATA_DIR, exist_ok=True)

    existing = []
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, 'r') as f:
            existing = json.load(f)

    # Merge new products (deduplicate by ISIN or URL)
    existing_ids = {p.get("sourceUrl") for p in existing}
    new_products = [p for p in products if p.get("sourceUrl") not in existing_ids]

    all_products = existing + new_products
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)

    print(f"\n[HKEX] Saved {len(new_products)} new products (total: {len(all_products)})")
    return all_products

if __name__ == "__main__":
    scrape_hkex()
