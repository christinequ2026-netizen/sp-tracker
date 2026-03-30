#!/usr/bin/env python3
"""
Generate realistic seed data for the Asia Structured Products Tracker.

Produces src/data/products.json with FCN, ELN, ACN, Phoenix, Snowball,
BRC, Shark Fin, Warrant, CBBC products from major Asian issuers.

This seed data is used when live scrapers have not yet populated real data,
or to supplement real data with a broader product universe for demo purposes.

Run:
    python scripts/generate_seed_data.py [--count 80] [--output src/data/products.json]
"""

import json
import random
import argparse
from datetime import datetime, timedelta, date
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "products.json"
STATS_FILE  = DATA_DIR / "stats.json"

# ─── Seed for reproducibility ───────────────────────────────────────────────
random.seed(42)

# ─── Reference data ─────────────────────────────────────────────────────────

ISSUERS = [
    ("ubs",              "UBS"),
    ("jpmorgan",         "J.P. Morgan"),
    ("goldman",          "Goldman Sachs"),
    ("morgan_stanley",   "Morgan Stanley"),
    ("bnp_paribas",      "BNP Paribas"),
    ("societe_generale", "Société Générale"),
    ("hsbc",             "HSBC"),
    ("citigroup",        "Citigroup"),
    ("barclays",         "Barclays"),
    ("macquarie",        "Macquarie"),
    ("boci",             "BOCI"),
    ("htisec",           "Haitong Intl"),
    ("nomura",           "Nomura"),
    ("deutsche_bank",    "Deutsche Bank"),
]

# (ticker, name, name_zh, exchange, current_price, currency)
UNDERLYINGS = [
    # HK-listed large caps
    ("0700.HK",  "Tencent Holdings",       "腾讯控股",   "hkex",  435.0,   "HKD"),
    ("9988.HK",  "Alibaba Group",           "阿里巴巴",   "hkex",   92.0,   "HKD"),
    ("0941.HK",  "China Mobile",            "中国移动",   "hkex",   82.5,   "HKD"),
    ("3690.HK",  "Meituan",                 "美团",       "hkex",   72.0,   "HKD"),
    ("9618.HK",  "JD.com",                  "京东集团",   "hkex",  182.0,   "HKD"),
    ("1810.HK",  "Xiaomi",                  "小米集团",   "hkex",   17.8,   "HKD"),
    ("0005.HK",  "HSBC Holdings",           "汇丰控股",   "hkex",   62.5,   "HKD"),
    ("2318.HK",  "Ping An Insurance",       "中国平安",   "hkex",   42.0,   "HKD"),
    ("0388.HK",  "HKEX",                    "香港交易所",  "hkex",  310.0,  "HKD"),
    ("2628.HK",  "China Life Insurance",    "中国人寿",   "hkex",   12.8,   "HKD"),
    # Indices
    ("HSI",      "Hang Seng Index",         "恒生指数",   "hkex",  18500.0, "HKD"),
    ("HSCEI",    "HSCEI",                   "H股指数",    "hkex",   6800.0, "HKD"),
    ("CSI300",   "CSI 300 Index",           "沪深300指数", "other", 4250.0, "CNH"),
    ("CSI500",   "CSI 500 Index",           "中证500指数", "other", 6300.0, "CNH"),
    ("STI",      "Straits Times Index",     "海峡时报指数","sgx",   3700.0, "SGD"),
    ("NIKKEI225","Nikkei 225",              "日经225",    "jpx",  38000.0, "JPY"),
    # Korea / Taiwan
    ("005930.KS","Samsung Electronics",     "三星电子",   "krx",   72000,  "USD"),
    ("000660.KS","SK Hynix",               "SK海力士",   "krx",  190000,  "USD"),
    ("2330.TW",  "TSMC",                    "台积电",     "twse",    990,  "USD"),
    # US tech (USD-denominated HK products)
    ("AAPL",     "Apple Inc.",              "苹果公司",   "other",  175.0,  "USD"),
    ("NVDA",     "NVIDIA Corporation",      "英伟达",     "other",  870.0,  "USD"),
    ("TSLA",     "Tesla Inc.",              "特斯拉",     "other",  185.0,  "USD"),
    # SGX-listed
    ("D05.SI",   "DBS Group",               "星展集团",   "sgx",    36.5,  "SGD"),
    ("O39.SI",   "OCBC Bank",               "华侨银行",   "sgx",    13.2,  "SGD"),
]

PRODUCT_TYPES = [
    ("fcn",               0.28),   # Fixed Coupon Note — most common
    ("acn",               0.22),   # Autocallable Note
    ("eln",               0.12),   # Equity Linked Note
    ("phoenix",           0.10),   # Phoenix Autocall
    ("snowball",          0.10),   # Snowball
    ("reverse_convertible",0.06),  # BRC / Reverse Convertible
    ("warrant",           0.06),   # Warrant
    ("cbbc",              0.04),   # CBBC
    ("shark_fin",         0.02),   # Shark Fin / Bonus Certificate
]

# Coupon rates by product type (annual, as decimal)
COUPON_RANGES = {
    "fcn":                (0.08,  0.30),
    "acn":                (0.10,  0.26),
    "eln":                (0.05,  0.20),
    "phoenix":            (0.10,  0.25),
    "snowball":           (0.08,  0.20),
    "reverse_convertible":(0.06,  0.18),
    "warrant":            (0.08,  0.30),
    "cbbc":               (0.05,  0.15),
    "shark_fin":          (0.10,  0.20),
}

COUPON_FREQS = {
    "fcn":                ["monthly", "quarterly", "semi-annual"],
    "acn":                ["quarterly", "semi-annual"],
    "eln":                ["at_maturity", "quarterly"],
    "phoenix":            ["monthly", "quarterly"],
    "snowball":           ["monthly"],
    "reverse_convertible":["semi-annual", "at_maturity"],
    "warrant":            [],
    "cbbc":               [],
    "shark_fin":          ["at_maturity"],
}

TENORS_MONTHS = {
    "fcn":                [3, 6, 12, 18, 24],
    "acn":                [6, 12, 18, 24],
    "eln":                [1, 3, 6],
    "phoenix":            [6, 12, 18],
    "snowball":           [12, 18, 24],
    "reverse_convertible":[3, 6, 12],
    "warrant":            [3, 6, 9, 12],
    "cbbc":               [3, 6, 9, 12],
    "shark_fin":          [6, 9, 12],
}

KNOCK_IN_LEVELS = {
    "fcn":                (0.50, 0.75),
    "acn":                (0.55, 0.75),
    "eln":                (0.60, 0.80),
    "phoenix":            (0.55, 0.70),
    "snowball":           (0.45, 0.65),
    "reverse_convertible":(0.55, 0.80),
    "warrant":            (0.50, 0.70),
    "cbbc":               (0.50, 0.75),
    "shark_fin":          (0.65, 0.80),
}

KNOCK_IN_TYPES = {
    "fcn":                ["continuous", "at_expiry", "daily_close"],
    "acn":                ["daily_close", "continuous"],
    "eln":                ["at_expiry", "continuous"],
    "phoenix":            ["at_expiry", "daily_close"],
    "snowball":           ["daily_close"],
    "reverse_convertible":["at_expiry", "continuous"],
    "warrant":            ["continuous"],
    "cbbc":               ["continuous"],
    "shark_fin":          ["continuous"],
}

# Which product types have knock-out/autocall
HAS_KNOCK_OUT = {"acn", "phoenix", "snowball"}

CURRENCIES_FOR_TYPE = {
    "fcn":                ["HKD", "USD", "HKD", "USD", "SGD", "CNH"],
    "acn":                ["HKD", "USD", "HKD", "USD"],
    "eln":                ["HKD", "USD", "HKD"],
    "phoenix":            ["HKD", "USD"],
    "snowball":           ["CNH", "HKD", "CNH"],
    "reverse_convertible":["HKD", "USD", "SGD"],
    "warrant":            ["HKD"],
    "cbbc":               ["HKD"],
    "shark_fin":          ["HKD", "USD"],
}

EXCHANGE_FOR_CURRENCY = {
    "HKD": "hkex",
    "USD": "hkex",
    "SGD": "sgx",
    "CNH": "hkex",
    "JPY": "jpx",
}


# ─── Helper functions ─────────────────────────────────────────────────────────

def weighted_choice(choices_weights):
    """Pick from [(item, weight), ...] list."""
    items, weights = zip(*choices_weights)
    total = sum(weights)
    r = random.uniform(0, total)
    cumulative = 0
    for item, weight in zip(items, weights):
        cumulative += weight
        if r <= cumulative:
            return item
    return items[-1]


def rand_date_within(days_back: int, days_forward: int = 0) -> date:
    today = date.today()
    offset = random.randint(-days_back, days_forward)
    return today + timedelta(days=offset)


def fmt_date(d) -> str:
    if isinstance(d, date):
        return d.strftime("%Y-%m-%d")
    return str(d)


def pick_underlyings(product_type: str, currency: str) -> list[dict]:
    """Select 1–3 underlyings appropriate for product type and currency."""
    n_underlyings = 1
    if product_type in ("fcn", "acn", "phoenix"):
        n_underlyings = random.choice([1, 1, 2, 2, 3])  # often worst-of 2-3
    elif product_type in ("snowball", "eln", "reverse_convertible", "shark_fin"):
        n_underlyings = random.choice([1, 1, 1, 2])

    # Filter underlyings by currency compatibility
    eligible = [u for u in UNDERLYINGS if _currency_compatible(u, currency)]
    if not eligible:
        eligible = UNDERLYINGS

    chosen = random.sample(eligible, min(n_underlyings, len(eligible)))

    return [
        {
            "ticker":       u[0],
            "name":         u[1],
            "nameZh":       u[2],
            "type":         "index" if u[0] in ("HSI","HSCEI","CSI300","CSI500","STI","NIKKEI225") else "equity",
            "exchange":     u[3],
            "initialLevel": round(u[4] * random.uniform(0.95, 1.05), 2),
            "currentLevel": round(u[4] * random.uniform(0.90, 1.15), 2),
        }
        for u in chosen
    ]


def _currency_compatible(u: tuple, currency: str) -> bool:
    """Rough compatibility: match the underlying's native currency or allow USD/HKD for most."""
    ticker_ccy = u[5]
    if currency == "USD":
        return ticker_ccy in ("USD", "HKD")
    if currency == "HKD":
        return ticker_ccy in ("HKD", "USD")
    if currency == "SGD":
        return ticker_ccy in ("SGD",)
    if currency == "CNH":
        return u[0] in ("CSI300", "CSI500", "0700.HK", "9988.HK", "3690.HK")
    if currency == "JPY":
        return ticker_ccy in ("JPY",)
    return True


def build_product_name(issuer_name: str, product_type: str, coupon: float, underlyings: list[dict], call_put: str = "") -> tuple[str, str]:
    coupon_str = f"{coupon * 100:.2f}% p.a."
    underlying_names = " & ".join(u["name"] for u in underlyings)
    underlying_names_zh = " + ".join(u["nameZh"] for u in underlyings)

    worst_of = " (Worst-of)" if len(underlyings) > 1 else ""
    worst_of_zh = "（最差表现）" if len(underlyings) > 1 else ""

    type_labels = {
        "fcn":                ("FCN",             "固定票息票据"),
        "acn":                ("Autocallable",     "自动赎回票据"),
        "eln":                ("ELN",              "股票挂钩票据"),
        "phoenix":            ("Phoenix Autocall", "凤凰式自动赎回"),
        "snowball":           ("Snowball",         "雪球"),
        "reverse_convertible":("BRC",              "障碍反向可转换"),
        "warrant":            (f"Warrant ({call_put.upper() or 'CALL'})", "认股权证"),
        "cbbc":               (f"CBBC ({'Bull' if call_put=='call' else 'Bear'})", "牛熊证"),
        "shark_fin":          ("Shark Fin",        "鲨鱼鳍"),
    }
    type_en, type_zh = type_labels.get(product_type, ("Note", "票据"))

    en = f"{issuer_name} {coupon_str} {type_en} on {underlying_names}{worst_of}"
    zh = f"{issuer_name} {coupon * 100:.2f}% {type_zh} 挂钩{underlying_names_zh}{worst_of_zh}"
    return en, zh


def generate_product(seq: int, ref_date: date) -> dict:
    """Generate one realistic structured product."""
    # Choose product type
    product_type = weighted_choice(PRODUCT_TYPES)

    # Choose issuer
    issuer_key, issuer_name = random.choice(ISSUERS)

    # Choose currency
    currency = random.choice(CURRENCIES_FOR_TYPE.get(product_type, ["HKD", "USD"]))

    # Issue date: within past 90 days (most products are recent)
    issue_date = rand_date_within(90, 0)
    # Maturity
    tenor_months = random.choice(TENORS_MONTHS.get(product_type, [12]))
    maturity_date = date(
        issue_date.year + (issue_date.month + tenor_months - 1) // 12,
        ((issue_date.month + tenor_months - 1) % 12) + 1,
        min(issue_date.day, 28)
    )

    # Coupon
    lo, hi = COUPON_RANGES.get(product_type, (0.08, 0.15))
    coupon_rate = round(random.uniform(lo, hi), 4)
    coupon_freq_list = COUPON_FREQS.get(product_type, ["quarterly"])
    coupon_freq = random.choice(coupon_freq_list) if coupon_freq_list else None

    # Barriers
    ki_lo, ki_hi = KNOCK_IN_LEVELS.get(product_type, (0.60, 0.75))
    knock_in_level = round(random.uniform(ki_lo, ki_hi), 4) if product_type not in ("warrant", "cbbc") else None
    knock_out_level = round(random.uniform(1.00, 1.05), 4) if product_type in HAS_KNOCK_OUT else None
    ki_types = KNOCK_IN_TYPES.get(product_type, ["continuous"])
    knock_in_type = random.choice(ki_types) if ki_types and knock_in_level else None

    # Step-down for ACN
    autocall_step_down = None
    autocall_freq = None
    if product_type in ("acn", "phoenix"):
        autocall_freq = random.choice(["monthly", "quarterly"])
        if product_type == "acn":
            autocall_step_down = random.choice([-0.005, -0.01, -0.015, -0.02])

    # Call/put for warrants and CBBCs
    call_put = ""
    if product_type in ("warrant", "cbbc"):
        call_put = random.choice(["call", "put"])

    # Underlyings
    underlyings = pick_underlyings(product_type, currency)
    worst_of = len(underlyings) > 1

    # Exchange
    exchange = EXCHANGE_FOR_CURRENCY.get(currency, "hkex")

    # Notional
    if currency in ("CNH",):
        notional = random.choice([500_000, 1_000_000, 2_000_000, 5_000_000])
    else:
        notional = random.choice([50_000, 100_000, 200_000, 500_000, 1_000_000])

    # Status
    today = date.today()
    age_days = (today - issue_date).days
    if age_days < 0:
        status = "upcoming"
    elif maturity_date < today:
        status = "matured"
    else:
        # Random chance of knock-in for existing products
        r = random.random()
        if knock_in_level and r < 0.08:
            status = "knocked_in"
        elif knock_out_level and r < 0.05:
            status = "knocked_out"
        elif knock_out_level and r < 0.10:
            status = "early_redeemed"
        else:
            status = "active"

    # Distance metrics
    current_price_level = round(random.uniform(88.0, 115.0), 1) if status == "active" else None
    distance_to_ki = None
    distance_to_ko = None
    if knock_in_level and current_price_level:
        distance_to_ki = round(current_price_level - knock_in_level * 100, 1)
    if knock_out_level and current_price_level:
        distance_to_ko = round(knock_out_level * 100 - current_price_level, 1)

    # Build names
    prod_name_en, prod_name_zh = build_product_name(issuer_name, product_type, coupon_rate, underlyings, call_put)

    # ISIN placeholder
    exchange_prefix = {"hkex": "HK", "sgx": "SG", "jpx": "JP", "krx": "KR", "twse": "TW"}.get(exchange, "XX")
    isin = f"{exchange_prefix}{seq:010d}"

    # ID
    prod_id = f"{exchange.upper()}-{issue_date.strftime('%Y%m%d')}-{seq:04d}"

    # Tags
    tags = [issuer_name, product_type.upper(), currency]
    if worst_of:
        tags.append("Worst-of")
    if product_type == "snowball":
        tags.append("Snowball")
    if knock_in_level and knock_in_level <= 0.55:
        tags.append("DeepKI")
    if coupon_rate >= 0.20:
        tags.append("HighCoupon")
    if tenor_months <= 6:
        tags.append("ShortTerm")
    for u in underlyings:
        if u["type"] == "index":
            tags.append("Index")

    # Source URL placeholder
    if exchange == "hkex":
        source_url = f"https://www.hkexnews.hk/announcements/{issue_date.year}/{issue_date.month:02d}/na{issue_date.strftime('%Y%m%d')}{seq % 100:02d}.pdf"
    elif exchange == "sgx":
        source_url = f"https://www.sgx.com/announcements/{issue_date.year}/{issue_date.month:02d}/sgx-{issue_date.strftime('%Y%m%d')}-{seq % 100:03d}.pdf"
    else:
        source_url = f"https://example.com/products/{prod_id}"

    # scrapedAt: simulate scraping time = issue date + few hours
    scraped_at = datetime(
        issue_date.year, issue_date.month, issue_date.day,
        random.randint(7, 20), random.randint(0, 59), 0
    ).isoformat() + "Z"

    product = {
        "id":              prod_id,
        "productName":     prod_name_en,
        "productNameZh":   prod_name_zh,
        "isin":            isin,
        "productType":     product_type,
        "exchange":        exchange,
        "issuer":          issuer_key,
        "issuerName":      issuer_name,
        "currency":        currency,
        "notional":        notional,
        "issueDate":       fmt_date(issue_date),
        "maturityDate":    fmt_date(maturity_date),
        "couponRate":      coupon_rate if coupon_freq_list else None,
        "couponFrequency": coupon_freq,
        "strikeLevel":     100,
        "knockInLevel":    knock_in_level,
        "knockOutLevel":   knock_out_level,
        "knockInType":     knock_in_type,
        "autocallFrequency":  autocall_freq,
        "autocallStepDown":   autocall_step_down,
        "underlyings":     underlyings,
        "worstOf":         worst_of,
        "status":          status,
        "currentPriceLevel":  current_price_level,
        "distanceToKnockIn":  distance_to_ki,
        "distanceToKnockOut": distance_to_ko,
        "sourceUrl":       source_url,
        "sourceExchange":  exchange,
        "scrapedAt":       scraped_at,
        "tags":            tags,
    }

    # Clean up None values (keep them for JSON)
    return product


# ─── Stats builder ─────────────────────────────────────────────────────────

def build_stats(products: list[dict]) -> dict:
    today_str = date.today().strftime("%Y-%m-%d")
    by_product_type: dict = {}
    by_issuer: dict = {}
    by_exchange: dict = {}
    by_currency: dict = {}
    active_count = 0
    knocked_in   = 0

    for p in products:
        pt  = p.get("productType", "other")
        iss = p.get("issuerName") or p.get("issuer", "other")
        exc = p.get("exchange", "other")
        cur = p.get("currency", "other")
        st  = p.get("status", "active")

        by_product_type[pt]  = by_product_type.get(pt, 0) + 1
        by_issuer[iss]       = by_issuer.get(iss, 0) + 1
        by_exchange[exc]     = by_exchange.get(exc, 0) + 1
        by_currency[cur]     = by_currency.get(cur, 0) + 1

        if st == "active":
            active_count += 1
        elif st in ("knocked_in", "knockedIn"):
            knocked_in += 1

    return {
        "lastUpdated":   datetime.now().isoformat(),
        "totalProducts": len(products),
        "activeProducts":active_count,
        "knockedIn":     knocked_in,
        "newToday":      sum(
            1 for p in products
            if (p.get("issueDate") or "")[:10] == today_str
        ),
        "byExchange":     by_exchange,
        "byProductType":  by_product_type,
        "byIssuer":       by_issuer,
        "byCurrency":     by_currency,
    }


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate seed data for sp-tracker")
    parser.add_argument("--count",  type=int, default=80,          help="Number of products to generate")
    parser.add_argument("--output", type=str, default=str(OUTPUT_FILE), help="Output JSON path")
    parser.add_argument("--force",  action="store_true",           help="Overwrite even if file exists")
    args = parser.parse_args()

    out_path = Path(args.output)

    if out_path.exists() and not args.force:
        # Merge: only add products if the existing file is small (≤ 20 items)
        with open(out_path, "r", encoding="utf-8") as f:
            existing = json.load(f)
        if len(existing) >= 20:
            print(f"[seed] {out_path} already has {len(existing)} products — skipping (use --force to overwrite)")
            return

    print(f"[seed] Generating {args.count} structured products…")
    today = date.today()
    products = [generate_product(i + 1, today) for i in range(args.count)]

    # Sort: newest first
    products.sort(key=lambda p: p.get("issueDate", ""), reverse=True)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"[seed] ✓ Saved {len(products)} products → {out_path}")

    # Stats
    stats = build_stats(products)
    stats_path = out_path.parent / "stats.json"
    with open(stats_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    print(f"[seed] ✓ Stats → {stats_path}")
    print(f"\n  By type:    {stats['byProductType']}")
    print(f"  By issuer:  {dict(list(stats['byIssuer'].items())[:6])}")
    print(f"  Active: {stats['activeProducts']} | Knocked-in: {stats['knockedIn']}")


if __name__ == "__main__":
    main()
