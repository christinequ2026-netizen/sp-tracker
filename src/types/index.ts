// ====== 交易所来源 Exchange Source ======
export type Exchange = "hkex" | "sgx" | "jpx" | "krx" | "twse" | "other";

// ====== 发行商 Issuer ======
export type Issuer =
  | "ubs" | "jpmorgan" | "goldman" | "morgan_stanley" | "citigroup"
  | "barclays" | "bnp_paribas" | "societe_generale" | "deutsche_bank"
  | "hsbc" | "credit_suisse" | "nomura" | "daiwa" | "macquarie"
  | "boci" | "htisec" | "icbc_intl" | "cmb_intl" | "citic_securities"
  | "other";

// ====== 产品类型 Product Type ======
export type ProductType =
  | "fcn"           // Fixed Coupon Note
  | "acn"           // Autocallable Note
  | "eln"           // Equity Linked Note
  | "drc"           // Daily Range Accrual
  | "phoenix"       // Phoenix Autocall
  | "snowball"      // Snowball (雪球)
  | "shark_fin"     // Shark Fin (鲨鱼鳍)
  | "booster"       // Booster Note
  | "reverse_convertible" // Reverse Convertible
  | "capital_protected"   // Capital Protected Note
  | "warrant"       // Warrant (衍生权证)
  | "cbbc"          // Callable Bull/Bear Contract (牛熊证)
  | "other";

// ====== 挂钩标的类型 Underlying Type ======
export type UnderlyingType = "equity" | "index" | "fx" | "commodity" | "rate" | "crypto" | "basket";

// ====== 货币 Currency ======
export type Currency = "USD" | "HKD" | "SGD" | "JPY" | "CNY" | "CNH" | "EUR" | "AUD" | "KRW" | "TWD" | "other";

// ====== 产品状态 Product Status ======
export type ProductStatus = "upcoming" | "active" | "matured" | "knocked_in" | "knocked_out" | "early_redeemed";

// ====== 结构化产品核心数据 ======
export interface StructuredProduct {
  id: string;
  // Basic info
  productName: string;
  productNameZh?: string;
  isin?: string;
  cusip?: string;
  productType: ProductType;
  exchange: Exchange;
  issuer: Issuer;
  issuerName: string;
  currency: Currency;
  notional?: number;

  // Dates
  tradeDate?: string;
  issueDate: string;
  maturityDate: string;
  finalValuationDate?: string;

  // Terms
  couponRate?: number;          // Annual coupon rate (e.g., 0.12 for 12%)
  couponFrequency?: string;     // "monthly" | "quarterly" | "semi-annual" | "annual" | "at_maturity"
  strikeLevel?: number;         // Strike as % of initial (e.g., 100)
  knockInLevel?: number;        // Knock-in barrier as % (e.g., 60)
  knockOutLevel?: number;       // Knock-out/autocall barrier as % (e.g., 100)
  knockInType?: "continuous" | "at_expiry" | "daily_close";
  autocallFrequency?: string;   // "monthly" | "quarterly" | "semi-annual"
  autocallStepDown?: number;    // Step-down per observation (e.g., -1 means 1% lower each period)

  // Underlying
  underlyings: Underlying[];
  worstOf?: boolean;            // Worst-of structure

  // Status & Performance
  status: ProductStatus;
  currentPriceLevel?: number;   // Current price as % of initial
  distanceToKnockIn?: number;   // Distance to knock-in barrier (%)
  distanceToKnockOut?: number;  // Distance to knock-out barrier (%)

  // Document links
  termSheetUrl?: string;
  prospectusUrl?: string;
  factSheetUrl?: string;

  // Source info
  sourceUrl: string;
  sourceExchange: Exchange;
  scrapedAt: string;            // ISO datetime

  // Tags
  tags: string[];
}

// ====== 挂钩标的 ======
export interface Underlying {
  ticker: string;
  name: string;
  nameZh?: string;
  type: UnderlyingType;
  exchange?: string;
  initialLevel?: number;
  currentLevel?: number;
}

// ====== 发行商详情 ======
export const ISSUER_INFO: Record<Issuer, { name: string; nameZh: string; logo?: string; color: string }> = {
  ubs:              { name: "UBS",                nameZh: "瑞银",       color: "#E60000" },
  jpmorgan:         { name: "J.P. Morgan",        nameZh: "摩根大通",   color: "#0A3D8F" },
  goldman:          { name: "Goldman Sachs",      nameZh: "高盛",       color: "#6D9BC3" },
  morgan_stanley:   { name: "Morgan Stanley",     nameZh: "摩根士丹利", color: "#002D62" },
  citigroup:        { name: "Citigroup",          nameZh: "花旗",       color: "#003B70" },
  barclays:         { name: "Barclays",           nameZh: "巴克莱",     color: "#00AEEF" },
  bnp_paribas:      { name: "BNP Paribas",       nameZh: "法国巴黎银行", color: "#009A44" },
  societe_generale: { name: "Société Générale",   nameZh: "法兴银行",   color: "#E60028" },
  deutsche_bank:    { name: "Deutsche Bank",      nameZh: "德意志银行", color: "#0018A8" },
  hsbc:             { name: "HSBC",               nameZh: "汇丰",       color: "#DB0011" },
  credit_suisse:    { name: "Credit Suisse",      nameZh: "瑞信",       color: "#003B7C" },
  nomura:           { name: "Nomura",             nameZh: "野村",       color: "#ED1B24" },
  daiwa:            { name: "Daiwa",              nameZh: "大和",       color: "#002D5F" },
  macquarie:        { name: "Macquarie",          nameZh: "麦格理",     color: "#000000" },
  boci:             { name: "BOCI",               nameZh: "中银国际",   color: "#C41E3D" },
  htisec:           { name: "Haitong Intl",       nameZh: "海通国际",   color: "#004B87" },
  icbc_intl:        { name: "ICBC International", nameZh: "工银国际",   color: "#C40F1F" },
  cmb_intl:         { name: "CMB International",  nameZh: "招银国际",   color: "#D42A1F" },
  citic_securities: { name: "CITIC Securities",   nameZh: "中信证券",   color: "#003B7C" },
  other:            { name: "Other",              nameZh: "其他",       color: "#6B7280" },
};

// ====== 交易所详情 ======
export const EXCHANGE_INFO: Record<Exchange, { name: string; nameZh: string; flag: string; url: string }> = {
  hkex:  { name: "HKEX",  nameZh: "港交所",       flag: "🇭🇰", url: "https://www.hkexnews.hk" },
  sgx:   { name: "SGX",   nameZh: "新交所",       flag: "🇸🇬", url: "https://www.sgx.com" },
  jpx:   { name: "JPX",   nameZh: "日本交易所",   flag: "🇯🇵", url: "https://www.jpx.co.jp" },
  krx:   { name: "KRX",   nameZh: "韩国交易所",   flag: "🇰🇷", url: "https://www.krx.co.kr" },
  twse:  { name: "TWSE",  nameZh: "台湾证交所",   flag: "🇹🇼", url: "https://www.twse.com.tw" },
  other: { name: "Other", nameZh: "其他",         flag: "🌐", url: "#" },
};

// ====== 产品类型详情 ======
export const PRODUCT_TYPE_INFO: Record<ProductType, { name: string; nameZh: string; abbr: string }> = {
  fcn:                 { name: "Fixed Coupon Note",       nameZh: "固定票息票据",   abbr: "FCN" },
  acn:                 { name: "Autocallable Note",       nameZh: "自动赎回票据",   abbr: "ACN" },
  eln:                 { name: "Equity Linked Note",      nameZh: "股票挂钩票据",   abbr: "ELN" },
  drc:                 { name: "Daily Range Accrual",     nameZh: "每日区间累计",   abbr: "DRC" },
  phoenix:             { name: "Phoenix Autocall",        nameZh: "凤凰式自动赎回", abbr: "Phoenix" },
  snowball:            { name: "Snowball",                nameZh: "雪球",           abbr: "Snowball" },
  shark_fin:           { name: "Shark Fin",               nameZh: "鲨鱼鳍",         abbr: "Shark" },
  booster:             { name: "Booster Note",            nameZh: "助推票据",       abbr: "Booster" },
  reverse_convertible: { name: "Reverse Convertible",     nameZh: "反向可转换票据", abbr: "RC" },
  capital_protected:   { name: "Capital Protected Note",  nameZh: "保本票据",       abbr: "CPN" },
  warrant:             { name: "Warrant",                 nameZh: "衍生权证",       abbr: "DW" },
  cbbc:                { name: "CBBC",                    nameZh: "牛熊证",         abbr: "CBBC" },
  other:               { name: "Other",                   nameZh: "其他",           abbr: "Other" },
};

// ====== 筛选器状态 ======
export interface FilterState {
  search: string;
  exchanges: Exchange[];
  issuers: Issuer[];
  productTypes: ProductType[];
  currencies: Currency[];
  dateRange: { from?: string; to?: string };
  status: ProductStatus[];
  sortBy: "newest" | "coupon_high" | "coupon_low" | "maturity_near" | "maturity_far";
}

// ====== 统计数据 ======
export interface DashboardStats {
  totalProducts: number;
  newToday: number;
  newThisWeek: number;
  avgCoupon: number;
  topIssuer: string;
  topProductType: string;
  byExchange: Record<Exchange, number>;
  byProductType: Record<ProductType, number>;
}
