# SP Tracker Data Scraping Scripts

## Overview
Comprehensive data scraping infrastructure for collecting structured product information from Asian financial exchanges and bank portals. The system is modular, with individual exchange scrapers that feed into a unified data pipeline.

## Scripts Created

### 1. scrape_hkex.py
HKEX News scraper for derivative warrants and structured notes from the Hong Kong Exchange.

**Features:**
- Searches HKEX News platform for recent filings
- Detects product types (warrants, CBBCs, FCNs, ACNs, ELNs, Phoenixes, Snowballs, etc.)
- Identifies issuers from major investment banks
- Extracts coupon rates and barrier levels
- Deduplicates by ISIN and source URL
- Maintains persistent JSON database

**Key Functions:**
- `search_hkex_filings()` - Search recent filings by date range
- `detect_product_type()` - Classify products from document titles
- `detect_issuer()` - Extract issuer information
- `extract_coupon_rate()` - Parse coupon rates from text
- `extract_barrier_levels()` - Extract knock-in/knock-out levels
- `parse_filing_document()` - Extract detailed product terms from PDFs

### 2. scrape_sgx.py
Singapore Exchange announcements scraper for structured products.

**Features:**
- Queries SGX public API for announcements
- Filters by product categories (Structured Warrants, Debt Securities, ETNs)
- Parses term sheets from announcement PDFs
- Supports date range filtering
- Integrates with issuer mapping

**Key Functions:**
- `search_sgx_announcements()` - Query SGX API with category and date filters
- `parse_sgx_term_sheet()` - Extract product data from PDFs
- Deduplication by sourceUrl

### 3. scrape_ubs.py
UBS Asia structured products portal scraper.

**Features:**
- Targets multiple UBS Keyinvest portals (HK, SG, Global)
- Searches products by type, currency, and region
- Parses product detail pages
- Extracts ISINs, underlyings, coupon rates
- Monitors barrier levels

**Key Functions:**
- `search_ubs_products()` - Query product search with filters
- `parse_ubs_product_page()` - Extract detailed product information
- Deduplication by ISIN

### 4. merge_data.py
Unified data aggregation and deduplication.

**Features:**
- Merges data from all source scrapers
- Deduplicates by ISIN or sourceUrl
- Generates summary statistics
- Sorts by issue date (newest first)
- Outputs `products.json` and `stats.json`

**Output Files:**
- `products.json` - Complete product catalog
- `stats.json` - Summary statistics by source, type, issuer

### 5. run_all_scrapers.sh
Master orchestration script to run all scrapers in sequence.

**Usage:**
```bash
./scripts/run_all_scrapers.sh [days_back]
```

**Default:** 7 days back

**Features:**
- Executes all scrapers in order
- Captures logs with timestamps
- Runs merge operation automatically
- Creates log directory structure

**Log Output:**
```
src/data/logs/
├── hkex_YYYYMMDD_HHMMSS.log
├── sgx_YYYYMMDD_HHMMSS.log
├── ubs_YYYYMMDD_HHMMSS.log
└── merge_YYYYMMDD_HHMMSS.log
```

## Data Pipeline

```
HKEX News      SGX API        UBS Keyinvest
    ↓            ↓               ↓
scrape_hkex   scrape_sgx     scrape_ubs
    ↓            ↓               ↓
hkex_products  sgx_products   ubs_products
    └─────────────┬─────────────┘
                  ↓
            merge_data.py
                  ↓
        products.json + stats.json
```

## Installation

### 1. Install Dependencies
```bash
cd /path/to/sp-tracker
pip install -r scripts/requirements.txt
```

**Required packages:**
- `requests` - HTTP requests
- `beautifulsoup4` - HTML parsing
- `lxml` - XML/HTML processing
- `pdfplumber` - PDF text extraction
- `selenium` - JavaScript-heavy page automation
- `webdriver-manager` - Automatic WebDriver management
- `schedule` - Task scheduling

### 2. Prepare Data Directory
```bash
mkdir -p src/data/logs
```

## Usage

### Run All Scrapers
```bash
./scripts/run_all_scrapers.sh
```

Alternatively, specify days back:
```bash
./scripts/run_all_scrapers.sh 14  # Last 2 weeks
```

### Run Individual Scraper
```bash
python3 scripts/scrape_hkex.py
python3 scripts/scrape_sgx.py
python3 scripts/scrape_ubs.py
```

### Merge Data Only
```bash
python3 scripts/merge_data.py
```

## Output Schema

Each product in `products.json` contains:

```json
{
  "id": "HKEX-20260329-1234",
  "isin": "XS1234567890",
  "productName": "UBS Fixed Coupon Note 2024-2026",
  "productType": "fcn",
  "exchange": "hkex",
  "issuer": "ubs",
  "currency": "USD",
  "issueDate": "2024-03-15",
  "maturityDate": "2026-03-15",
  "couponRate": 0.06,
  "couponFrequency": "quarterly",
  "underlyings": [
    {
      "code": "HSI",
      "name": "Hang Seng Index",
      "type": "index"
    }
  ],
  "barriers": {
    "knockInLevel": 0.70,
    "knockOutLevel": 1.00,
    "barrierType": "single"
  },
  "sourceUrl": "https://www.hkexnews.hk/...",
  "sourceExchange": "hkex",
  "lastUpdated": "2026-03-29T12:34:56"
}
```

## Implementation Notes

### Production Readiness

**Currently:** Skeleton implementations with detailed structure and regex patterns ready.

**To activate:**

1. **HKEX Scraper** - Use `requests` + `BeautifulSoup` to parse HKEX search results, or implement Selenium for dynamic content.

2. **SGX Scraper** - Replace placeholder API calls with actual `requests.get()` calls to SGX endpoints. Download and parse PDFs using `pdfplumber`.

3. **UBS Scraper** - Implement Selenium WebDriver to navigate Keyinvest platform, interact with search filters, and extract JavaScript-rendered content.

4. **PDF Extraction** - Implement `pdfplumber` for parsing term sheets:
   ```python
   import pdfplumber
   with pdfplumber.open(pdf_path) as pdf:
       text = "".join(page.extract_text() for page in pdf.pages)
   ```

5. **Error Handling** - Add try-catch blocks and logging for production robustness.

6. **Rate Limiting** - Implement backoff strategies to respect exchange rate limits.

### Testing Skeleton

The current implementation validates:
- Product type detection algorithm
- Issuer recognition patterns
- Coupon rate extraction regex
- Barrier level extraction patterns
- Data deduplication logic
- Output file generation

### Scheduling (Future)

Can be integrated with `schedule` or cron:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/sp-tracker && ./scripts/run_all_scrapers.sh
```

## Common Issues & Solutions

### Module Not Found
```bash
pip install -r scripts/requirements.txt
```

### Permission Denied
```bash
chmod +x scripts/run_all_scrapers.sh
```

### Data Directory Missing
```bash
mkdir -p src/data/logs
```

### Selenium Timeout
Increase timeout in WebDriver initialization:
```python
driver.implicitly_wait(10)  # 10 seconds
```

## Contributing

When adding new scrapers:
1. Follow the naming pattern: `scrape_[exchange].py`
2. Implement `search_*()` function for data discovery
3. Implement `parse_*()` function for detail extraction
4. Add deduplication logic by ISIN or URL
5. Save output to `src/data/[exchange]_products.json`
6. Add source to `merge_data.py` SOURCE_FILES dict
7. Update this documentation

## License
SP Tracker Scraping Suite - 2026
