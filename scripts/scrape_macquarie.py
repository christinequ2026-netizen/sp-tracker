#!/usr/bin/env python3
"""
Macquarie HKEX Warrants & CBBC Scraper
Source: https://www.warrants.com.hk (Macquarie Capital Limited)

Scrapes newly issued Macquarie warrants and CBBCs listed on HKEX from
the HTML tables at:
  - /tc/warrant/new-issue  → Call/Put Warrants (認股證)
  - /tc/cbbc/new-issue     → CBBCs (牛熊證)
"""

import json
import os
from datetime import datetime
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None
    BeautifulSoup = None

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "macquarie_products.json"

BASE_URL = "https://www.warrants.com.hk"
WARRANT_URL = f"{BASE_URL}/tc/warrant/new-issue"
CBBC_URL    = f"{BASE_URL}/tc/cbbc/new-issue"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
    "Referer": f"{BASE_URL}/tc/",
}


def parse_hk_date(date_str: str) -> str | None:
    """Convert DD-MM-YYYY → YYYY-MM-DD."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str.strip(), "%d-%m-%Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


def safe_float(val: str) -> float | None:
    try:
        return float(val.strip().replace(",", ""))
    except (ValueError, AttributeError):
        return None


def fetch_html(url: str) -> str | None:
    """Fetch a page and return HTML text."""
    if not requests:
        print("[Macquarie] requests library not available, skipping")
        return None
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        resp.encoding = "utf-8"
        return resp.text
    except Exception as e:
        print(f"[Macquarie] Error fetching {url}: {e}")
        return None


def parse_warrant_table(html: str, now_str: str) -> list[dict]:
    """Parse the new-issue warrant table (認股證) into product dicts."""
    if not BeautifulSoup:
        return []
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        print("[Macquarie] No warrant table found")
        return []

    products = []
    rows = table.find_all("tr")
    for row in rows[1:]:  # skip header
        cells = row.find_all("td")
        if len(cells) < 8:
            continue

        code           = cells[0].get_text(strip=True)   # 認股證代號
        name_zh        = cells[1].get_text(strip=True)   # 認股證名稱
        underlying_zh  = cells[2].get_text(strip=True)   # 相關資產名稱
        underlying_code= cells[3].get_text(strip=True)   # 相關資產代號
        call_put_zh    = cells[4].get_text(strip=True)   # 認購/認沽
        strike_str     = cells[5].get_text(strip=True)   # 行使價
        conv_ratio_str = cells[6].get_text(strip=True)   # 換股比率
        listing_str    = cells[7].get_text(strip=True)   # 上市日期

        # Extract term sheet link
        term_link = cells[8].find("a") if len(cells) > 8 else None
        term_url  = term_link["href"] if term_link and term_link.get("href") else None
        if term_url and not term_url.startswith("http"):
            term_url = BASE_URL + term_url

        # Individual warrant page link
        row_link = row.find("a", href=lambda h: h and "/warrant/indicator/code/" in h)
        source_url = (BASE_URL + row_link["href"]) if row_link else f"{WARRANT_URL}#{code}"

        listing_date = parse_hk_date(listing_str)
        call_put     = "call" if "認購" in call_put_zh else "put"

        # Estimate maturity: HKEX warrants typically expire within 6 months to 2 years.
        # The product name often encodes the expiry (e.g. "六乙" = 6th month 2026).
        # We leave maturityDate as empty string and let it be filled from detail pages later.
        # For now, use a placeholder of 1 year from listing date.
        if listing_date:
            try:
                ld = datetime.strptime(listing_date, "%Y-%m-%d")
                maturity_est = ld.replace(year=ld.year + 1).strftime("%Y-%m-%d")
            except Exception:
                maturity_est = ""
        else:
            maturity_est = ""

        product = {
            "id":             f"HKEX-{code}",
            "productName":    f"HK Warrant {code} {call_put.upper()} {underlying_zh}",
            "productNameZh":  name_zh,
            "productType":    "warrant",
            "exchange":       "hkex",
            "issuer":         "macquarie",
            "issuerName":     "Macquarie",
            "currency":       "HKD",
            "status":         "active",
            "issueDate":      listing_date or "",
            "maturityDate":   maturity_est,
            "couponRate":     None,
            "couponFrequency":None,
            "notional":       None,
            "strikeLevel":    safe_float(strike_str),
            "knockInLevel":   None,
            "knockOutLevel":  None,
            "conversionRatio":safe_float(conv_ratio_str),
            "callPut":        call_put,
            "underlyings": [{
                "ticker":  underlying_code,
                "name":    underlying_zh,
                "nameZh":  underlying_zh,
                "type":    "index" if not underlying_code.isdigit() else "equity",
            }],
            "worstOf":        False,
            "tags":           ["HKEX", "Warrant", "Macquarie", call_put.capitalize()],
            "sourceUrl":      source_url,
            "sourceExchange": "hkex",
            "termSheetUrl":   term_url,
            "scrapedAt":      now_str,
        }
        products.append(product)

    print(f"[Macquarie] Parsed {len(products)} warrants from new-issue page")
    return products


def parse_cbbc_table(html: str, now_str: str) -> list[dict]:
    """Parse the new-issue CBBC table (牛熊證) into product dicts."""
    if not BeautifulSoup:
        return []
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        print("[Macquarie] No CBBC table found")
        return []

    products = []
    rows = table.find_all("tr")
    for row in rows[1:]:  # skip header
        cells = row.find_all("td")
        if len(cells) < 9:
            continue

        code            = cells[0].get_text(strip=True)   # 牛熊證代號
        name_zh         = cells[1].get_text(strip=True)   # 牛熊證名稱
        underlying_zh   = cells[2].get_text(strip=True)   # 相關資產名稱
        underlying_code = cells[3].get_text(strip=True)   # 相關資產代號
        bull_bear_zh    = cells[4].get_text(strip=True)   # 牛/熊
        strike_str      = cells[5].get_text(strip=True)   # 行使價
        callout_str     = cells[6].get_text(strip=True)   # 收回價 (knock-out)
        conv_ratio_str  = cells[7].get_text(strip=True)   # 換股比率
        listing_str     = cells[8].get_text(strip=True)   # 上市日期

        term_link = cells[9].find("a") if len(cells) > 9 else None
        term_url  = term_link["href"] if term_link and term_link.get("href") else None
        if term_url and not term_url.startswith("http"):
            term_url = BASE_URL + term_url

        row_link   = row.find("a", href=lambda h: h and "/cbbc/indicator/code/" in h)
        source_url = (BASE_URL + row_link["href"]) if row_link else f"{CBBC_URL}#{code}"

        listing_date = parse_hk_date(listing_str)
        is_bull      = "牛" in bull_bear_zh

        if listing_date:
            try:
                ld = datetime.strptime(listing_date, "%Y-%m-%d")
                maturity_est = ld.replace(year=ld.year + 1).strftime("%Y-%m-%d")
            except Exception:
                maturity_est = ""
        else:
            maturity_est = ""

        product = {
            "id":             f"HKEX-{code}",
            "productName":    f"HK CBBC {code} {'Bull' if is_bull else 'Bear'} {underlying_zh}",
            "productNameZh":  name_zh,
            "productType":    "cbbc",
            "exchange":       "hkex",
            "issuer":         "macquarie",
            "issuerName":     "Macquarie",
            "currency":       "HKD",
            "status":         "active",
            "issueDate":      listing_date or "",
            "maturityDate":   maturity_est,
            "couponRate":     None,
            "couponFrequency":None,
            "notional":       None,
            "strikeLevel":    safe_float(strike_str),
            "knockInLevel":   None,
            "knockOutLevel":  safe_float(callout_str),   # 收回價 = mandatory call-out level
            "conversionRatio":safe_float(conv_ratio_str),
            "callPut":        "call" if is_bull else "put",
            "underlyings": [{
                "ticker":  underlying_code,
                "name":    underlying_zh,
                "nameZh":  underlying_zh,
                "type":    "index" if not underlying_code.isdigit() else "equity",
            }],
            "worstOf":        False,
            "tags":           ["HKEX", "CBBC", "Macquarie", "Bull" if is_bull else "Bear"],
            "sourceUrl":      source_url,
            "sourceExchange": "hkex",
            "termSheetUrl":   term_url,
            "scrapedAt":      now_str,
        }
        products.append(product)

    print(f"[Macquarie] Parsed {len(products)} CBBCs from new-issue page")
    return products


def scrape_macquarie() -> list[dict]:
    """Main Macquarie scraping pipeline."""
    print("=" * 60)
    print("Macquarie HKEX Warrants & CBBC Scraper")
    print(f"Date: {datetime.now().isoformat()}")
    print("=" * 60)

    now_str = datetime.utcnow().isoformat() + "Z"
    products = []

    # 1) Fetch warrants
    print(f"[Macquarie] Fetching warrants from {WARRANT_URL}")
    warrant_html = fetch_html(WARRANT_URL)
    if warrant_html:
        products.extend(parse_warrant_table(warrant_html, now_str))

    # 2) Fetch CBBCs
    print(f"[Macquarie] Fetching CBBCs from {CBBC_URL}")
    cbbc_html = fetch_html(CBBC_URL)
    if cbbc_html:
        products.extend(parse_cbbc_table(cbbc_html, now_str))

    if not products:
        print("[Macquarie] No products scraped — no changes written")
        return []

    # 3) Merge with existing data
    os.makedirs(DATA_DIR, exist_ok=True)
    existing = []
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            try:
                existing = json.load(f)
            except json.JSONDecodeError:
                existing = []

    existing_ids = {p.get("id") for p in existing}
    new_products  = [p for p in products if p.get("id") not in existing_ids]

    # Update existing records (refresh scrapedAt / status)
    new_by_id = {p["id"]: p for p in products}
    updated   = [{**p, **new_by_id[p["id"]]} if p["id"] in new_by_id else p for p in existing]
    all_products = updated + new_products

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)

    print(f"\n[Macquarie] ✓ {len(new_products)} new | {len(updated)} updated | {len(all_products)} total")
    print(f"[Macquarie] Saved → {OUTPUT_FILE}")
    return all_products


if __name__ == "__main__":
    scrape_macquarie()
