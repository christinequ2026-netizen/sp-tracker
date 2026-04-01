import fs from 'fs';
import path from 'path';
import type { StructuredProduct, DashboardStats, Exchange, ProductType, Issuer, Currency } from '@/types';
import { mockProducts, mockStats } from '@/data/mock';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

// ---------------------------------------------------------------------------
// Normalise a raw scraped object → StructuredProduct
// Handles both the scraper schema (issuanceDate, code, etc.) and the TypeScript
// schema (issueDate, ticker, etc.)
// ---------------------------------------------------------------------------
function normalizeProduct(raw: Record<string, unknown>): StructuredProduct {
  // Normalise underlyings
  const rawUnderlyings = Array.isArray(raw.underlyings) ? raw.underlyings : [];
  const underlyings = rawUnderlyings.map((u: Record<string, unknown>) => ({
    ticker: String(u.ticker || u.code || u.stockCode || ''),
    name: String(u.name || u.securityName || ''),
    nameZh: u.nameZh as string | undefined,
    type: (u.type || 'equity') as 'equity' | 'index' | 'fx' | 'commodity' | 'rate' | 'crypto' | 'basket',
    exchange: u.exchange as string | undefined,
    initialLevel: u.initialLevel as number | undefined,
    currentLevel: u.currentLevel as number | undefined,
  }));

  // Product type: lowercase + map common aliases
  const rawType = String(raw.productType || 'other').toLowerCase().trim();
  const typeMap: Record<string, string> = {
    'warrant': 'warrant',
    'call warrant': 'warrant',
    'put warrant': 'warrant',
    'dlc': 'warrant',
    'cbbc': 'cbbc',
    'fcn': 'fcn',
    'acn': 'acn',
    'eln': 'eln',
    'phoenix': 'phoenix',
    'snowball': 'snowball',
    'brc': 'reverse_convertible',
    'reverse convertible': 'reverse_convertible',
    'rc': 'reverse_convertible',
    'capital protection': 'capital_protected',
    'cp': 'capital_protected',
  };
  const productType = (typeMap[rawType] || rawType || 'other') as ProductType;

  // Exchange
  const rawExchange = String(raw.exchange || raw.sourceExchange || 'other').toLowerCase();
  const exchangeMap: Record<string, string> = { sgx: 'sgx', hkex: 'hkex', ubs: 'other' };
  const exchange = (exchangeMap[rawExchange] || 'other') as Exchange;

  // Issuer key
  const issuer = String(raw.issuer || 'other').toLowerCase() as Issuer;
  const issuerName = String(raw.issuerFull || raw.issuerName || raw.issuer || '');

  // Dates: handle issuanceDate / issueDate / listingDate
  const issueDate = String(
    raw.issueDate || raw.issuanceDate || raw.listingDate || raw.tradeDate || ''
  );

  // Currency
  const currency = (String(raw.currency || 'other').toUpperCase()) as Currency;

  // Status
  const rawStatus = String(raw.status || 'active').toLowerCase();
  const statusMap: Record<string, string> = {
    active: 'active',
    matured: 'matured',
    knocked_in: 'knocked_in',
    knockedin: 'knocked_in',
    knocked_out: 'knocked_out',
    knockedout: 'knocked_out',
    early_redeemed: 'early_redeemed',
    upcoming: 'upcoming',
  };
  const status = (statusMap[rawStatus] || 'active') as StructuredProduct['status'];

  return {
    id: String(raw.id || ''),
    productName: String(raw.productName || raw.securityName || raw.name || ''),
    productNameZh: raw.productNameZh as string | undefined,
    isin: raw.isin as string | undefined,
    productType,
    exchange,
    issuer,
    issuerName,
    currency,
    notional: raw.notional as number | undefined,
    issueDate,
    maturityDate: String(raw.maturityDate || raw.expiryDate || ''),
    tradeDate: raw.tradeDate as string | undefined,
    couponRate: raw.couponRate as number | undefined,
    couponFrequency: raw.couponFrequency as string | undefined,
    strikeLevel: (raw.strikeLevel ?? raw.strike ?? raw.exerciseValue) as number | undefined,
    knockInLevel: raw.knockInLevel as number | undefined,
    knockOutLevel: (raw.knockOutLevel ?? raw.autocallBarrier) as number | undefined,
    knockInType: raw.knockInType as StructuredProduct['knockInType'],
    autocallFrequency: raw.autocallFrequency as string | undefined,
    underlyings,
    worstOf: raw.worstOf as boolean | undefined,
    status,
    currentPriceLevel: raw.currentPriceLevel as number | undefined,
    distanceToKnockIn: raw.distanceToKnockIn as number | undefined,
    distanceToKnockOut: raw.distanceToKnockOut as number | undefined,
    termSheetUrl: (raw.termSheetUrl ?? raw.termsheet_url) as string | undefined,
    prospectusUrl: raw.prospectusUrl as string | undefined,
    factSheetUrl: raw.factSheetUrl as string | undefined,
    sourceUrl: String(raw.sourceUrl || raw.source_url || ''),
    sourceExchange: exchange,
    scrapedAt: String(raw.scrapedAt || raw.lastUpdated || new Date().toISOString()),
    tags: Array.isArray(raw.tags)
      ? (raw.tags as unknown[]).map(String).filter(Boolean)
      : [],
  };
}

// ---------------------------------------------------------------------------
// Derive stats from products (fills in fields the scraper doesn't output)
// ---------------------------------------------------------------------------
function deriveStats(
  products: StructuredProduct[],
  rawStats: Record<string, unknown>
): DashboardStats {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const newThisWeek = products.filter(
    (p) => p.issueDate >= weekAgo
  ).length;

  // Average coupon of FCN/ACN/ELN products only
  const couponProducts = products.filter((p) => typeof p.couponRate === 'number' && p.couponRate > 0);
  const avgCoupon =
    couponProducts.length > 0
      ? couponProducts.reduce((sum, p) => sum + (p.couponRate ?? 0), 0) / couponProducts.length
      : 0;

  // Top issuer by count
  const issuerCounts: Record<string, number> = {};
  for (const p of products) issuerCounts[p.issuerName || p.issuer] = (issuerCounts[p.issuerName || p.issuer] || 0) + 1;
  const topIssuer = Object.entries(issuerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  // Top product type by count
  const typeCounts: Record<string, number> = {};
  for (const p of products) typeCounts[p.productType] = (typeCounts[p.productType] || 0) + 1;
  const topProductType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return {
    totalProducts: (rawStats.totalProducts as number) ?? products.length,
    newToday: (rawStats.newToday as number) ?? products.filter((p) => p.issueDate === today).length,
    newThisWeek,
    avgCoupon,
    topIssuer,
    topProductType,
    byExchange: (rawStats.byExchange as Record<Exchange, number>) ?? {},
    byProductType: (rawStats.byProductType as Record<ProductType, number>) ?? {},
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function loadProducts(): StructuredProduct[] {
  try {
    const filePath = path.join(DATA_DIR, 'products.json');
    if (!fs.existsSync(filePath)) return [];
    const raw: Record<string, unknown>[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeProduct).filter((p) => p.id && p.productName);
  } catch (err) {
    console.error('[loadData] Failed to load products.json:', err);
    return [];
  }
}

export function loadStats(products?: StructuredProduct[]): DashboardStats {
  let rawStats: Record<string, unknown> = {};
  try {
    const filePath = path.join(DATA_DIR, 'stats.json');
    if (fs.existsSync(filePath)) {
      rawStats = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error('[loadData] Failed to load stats.json:', err);
  }

  const resolvedProducts = products ?? loadProducts();
  return deriveStats(resolvedProducts, rawStats);
}
