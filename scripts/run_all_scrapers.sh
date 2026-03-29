#!/bin/bash
# SP Tracker - Run All Scrapers
# Usage: ./scripts/run_all_scrapers.sh [days_back]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../src/data/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAYS_BACK=${1:-7}

echo "====================================="
echo "SP Tracker Data Collection"
echo "Date: $(date)"
echo "Days back: $DAYS_BACK"
echo "====================================="

# Run HKEX scraper
echo ""
echo "[1/3] Running HKEX scraper..."
python3 "$SCRIPT_DIR/scrape_hkex.py" 2>&1 | tee "$LOG_DIR/hkex_$TIMESTAMP.log"

# Run SGX scraper
echo ""
echo "[2/3] Running SGX scraper..."
python3 "$SCRIPT_DIR/scrape_sgx.py" 2>&1 | tee "$LOG_DIR/sgx_$TIMESTAMP.log"

# Run UBS scraper
echo ""
echo "[3/3] Running UBS scraper..."
python3 "$SCRIPT_DIR/scrape_ubs.py" 2>&1 | tee "$LOG_DIR/ubs_$TIMESTAMP.log"

# Merge all data into unified format
echo ""
echo "[Merge] Combining all sources..."
python3 "$SCRIPT_DIR/merge_data.py" 2>&1 | tee "$LOG_DIR/merge_$TIMESTAMP.log"

echo ""
echo "====================================="
echo "Data collection complete!"
echo "Logs saved to: $LOG_DIR"
echo "====================================="
