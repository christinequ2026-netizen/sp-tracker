#!/usr/bin/env python3
"""
SGX Announcements Scraper for Structured Products
Scrapes structured notes from Singapore Exchange announcements.
Target: https://www.sgx.com/securities/company-announcements
"""

import json
import os
import time
import re
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "sgx_products.json"

# SGX API (public JSON endpoint)
SGX_API_BASE = "https://api.sgx.com/announcements/v1.0"

# SGX announcement categories for structured products
SGX_CATEGORIES = [
    "Structured Warrants",
    "Debt Securities",
    "Exchange Traded Notes",
]

ISSUER_MAP = {
    "UBS": "ubs",
    "J.P. Morgan": "jpmorgan",
    "Goldman Sachs": "goldman",
    "Morgan Stanley": "morgan_stanley",
    "Citigroup": "citigroup",
    "Barclays": "barclays",
    "BNP Paribas": "bnp_paribas",
    "Societe Generale": "societe_generale",
    "SG Issuer": "societe_generale",
    "Deutsche Bank": "deutsche_bank",
    "HSBC": "hsbc",
    "Nomura": "nomura",
    "DBS": "other",
    "OCBC": "other",
    "Macquarie": "macquarie",
}

def search_sgx_announcements(days_back: int = 7) -> list:
    """
    Search SGX for recent structured product announcements.

    SGX provides a JSON API for searching announcements:
    GET https://api.sgx.com/announcements/v1.0?
        pagestart=0&pagesize=50
        &category=Structured Warrants
        &announcementdate_from=2026-03-22
        &announcementdate_to=2026-03-29
    """
    print(f"[SGX] Searching announcements from last {days_back} days...")

    date_from = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    date_to = datetime.now().strftime("%Y-%m-%d")

    results = []

    for category in SGX_CATEGORIES:
        print(f"  Category: {category}")

        params = {
            "pagestart": 0,
            "pagesize": 50,
            "category": category,
            "announcementdate_from": date_from,
            "announcementdate_to": date_to,
        }

        # In production:
        # response = requests.get(SGX_API_BASE, params=params)
        # data = response.json()
        # results.extend(data.get("results", []))

        time.sleep(0.5)

    print(f"[SGX] Found {len(results)} announcements")
    return results

def parse_sgx_term_sheet(announcement: dict) -> dict | None:
    """
    Parse a SGX announcement to extract structured product terms.

    SGX term sheets are typically PDFs attached to announcements.
    Steps:
    1. Download the PDF from the attachment URL
    2. Extract text using pdfplumber
    3. Parse structured data using regex patterns
    """
    title = announcement.get("title", "")
    doc_url = announcement.get("attachment_url", "")

    if not doc_url:
        return None

    print(f"  Parsing: {title[:60]}...")

    # In production:
    # pdf_content = requests.get(doc_url).content
    # text = extract_pdf_text(pdf_content)
    # product = {
    #     "id": f"SGX-{datetime.now().strftime('%Y-%m%d')}-{hash(title) % 10000:04d}",
    #     "productName": title,
    #     "exchange": "sgx",
    #     "issuer": detect_issuer(title),
    #     "currency": detect_currency(text),
    #     "couponRate": extract_coupon(text),
    #     ...
    # }

    return None

def scrape_sgx(days_back: int = 7):
    """Main SGX scraping pipeline."""
    print("=" * 60)
    print("SGX Structured Products Scraper")
    print(f"Date: {datetime.now().isoformat()}")
    print("=" * 60)

    announcements = search_sgx_announcements(days_back)

    products = []
    for ann in announcements:
        product = parse_sgx_term_sheet(ann)
        if product:
            products.append(product)

    os.makedirs(DATA_DIR, exist_ok=True)

    existing = []
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, 'r') as f:
            existing = json.load(f)

    existing_ids = {p.get("sourceUrl") for p in existing}
    new_products = [p for p in products if p.get("sourceUrl") not in existing_ids]

    all_products = existing + new_products
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)

    print(f"\n[SGX] Saved {len(new_products)} new products (total: {len(all_products)})")
    return all_products

if __name__ == "__main__":
    scrape_sgx()
