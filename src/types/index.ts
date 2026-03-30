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
  /** Where this record came from:
   *  "demo"      = generated seed data, not real
   *  "hkex"      = scraped from HKEX filings
   *  "sgx"       = scraped from SGX
   *  "ubs"       = scraped from UBS Keyinvest APAC
   *  "macquarie" = scraped from Macquarie warrants.com.hk
   *  "manual"    = manually entered
   */
  dataSource?: "demo" | "hkex" | "sgx" | "ubs" | "macquarie" | "manual";

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
export const PRODUCT_TYPE_INFO: Record<ProductType, {
  name: string; nameZh: string; abbr: string;
  desc: string; descZh: string; riskLevel: 1 | 2 | 3 | 4 | 5;
}> = {
  fcn: {
    name: "Fixed Coupon Note", nameZh: "固定票息票据", abbr: "FCN", riskLevel: 3,
    desc: "Pays a fixed periodic coupon (8–30% p.a.) as long as the knock-in barrier is not breached. At maturity: full principal if underlying > strike, otherwise shares delivered at strike. Common structure: Worst-of basket, 60–70% continuous knock-in.",
    descZh: "固定票息票据：每期支付固定票息（年化8–30%），只要标的未触及敲入障碍。到期时若标的高于行权价则足额还本，否则以行权价折股交割。常见结构：最坏情形篮子 + 60–70%持续敲入。",
  },
  acn: {
    name: "Autocallable Note", nameZh: "自动赎回票据", abbr: "ACN", riskLevel: 3,
    desc: "Pays coupons each period. If underlying is above the autocall barrier on an observation date, it is called early and principal returned. Barrier typically steps down over time (Step-down ACN). At maturity if not called: same downside as FCN.",
    descZh: "自动赎回票据：定期支付票息。若标的在观察日高于敲出障碍则提前还本。阶梯式障碍（Step-down）随时间下降。未提前赎回时，到期结构与FCN相同。",
  },
  eln: {
    name: "Equity Linked Note", nameZh: "股票挂钩票据", abbr: "ELN", riskLevel: 2,
    desc: "Short-tenor (1W–6M), no knock-in barrier. Structure is a short European put on the underlying. If underlying falls below strike at expiry, investor receives shares. Coupon = put premium. Lower risk than FCN due to no continuous knock-in.",
    descZh: "股票挂钩票据：短期（1周–6个月），无敲入障碍，结构为卖出欧式看跌期权。到期若低于行权价则交割股票，票息即期权金。无持续敲入，风险低于FCN。",
  },
  drc: {
    name: "Daily Range Accrual", nameZh: "每日区间累计", abbr: "DRC", riskLevel: 2,
    desc: "Coupon accrues only on days when the underlying closes within a predefined range. Higher potential yield than ELN; actual coupon depends on how often the underlying stays in range. Suitable for investors who expect low-volatility, range-bound markets.",
    descZh: "每日区间累计：仅在标的收盘价处于预设区间内的交易日计息。名义票息较高，实际收益取决于标的在区间内停留时间。适合判断标的将在区间内低波动运行的投资者。",
  },
  phoenix: {
    name: "Phoenix Autocall", nameZh: "凤凰式自动赎回", abbr: "Phoenix", riskLevel: 3,
    desc: "Conditional coupon: paid only if underlying is above a coupon barrier (typically 70–80%) on each observation date. If missed, memory coupon variant accumulates unpaid coupons. Also has autocall feature. Balances regular income with protection against moderate declines.",
    descZh: "凤凰式自动赎回：条件票息——仅当标的在观察日高于票息障碍（通常70–80%）时支付。记忆票息变体可累积未付利息。同时具有自动赎回功能。适合接受一定下行风险的收益型投资者。",
  },
  snowball: {
    name: "Snowball", nameZh: "雪球", abbr: "Snowball", riskLevel: 4,
    desc: "Chinese-originated. Monthly coupon accrual like FCN. Knock-out at 100% of initial price (no step-down). If knocked out early: accrued coupon + principal. If knocked in and not knocked out at maturity: significant downside loss proportional to underlying fall. Popular for index products in mainland China.",
    descZh: "雪球：源于中国大陆市场。类似FCN按月计息，敲出障碍通常为初始价100%（无阶梯）。提前敲出则还本付息；若敲入未敲出则亏损与标的跌幅成比例。国内指数类结构产品中极为流行。",
  },
  shark_fin: {
    name: "Shark Fin / Bonus Cert", nameZh: "鲨鱼鳍 / 奖励证书", abbr: "Shark", riskLevel: 2,
    desc: "Capital-protected structure = zero-coupon bond + barrier call option. If the underlying never hits the knock-out barrier, investor earns a bonus return at maturity. If barrier is breached, participation is eliminated. Suitable for mildly bullish investors who prioritize capital preservation.",
    descZh: "鲨鱼鳍/奖励证书：保本结构 = 零息债券 + 障碍看涨期权。若标的未触及敲出障碍，到期获奖励收益；若触及则收益消失。适合温和看多且优先保本的投资者。",
  },
  booster: {
    name: "Booster Note", nameZh: "助推票据", abbr: "Booster", riskLevel: 3,
    desc: "Leveraged upside participation (e.g., 2× gains if underlying rises) with downside risk if underlying falls below barrier. At maturity: leveraged return if above strike, shares at strike if below barrier. Suitable for moderately bullish investors seeking enhanced returns.",
    descZh: "助推票据：标的上涨时享有杠杆收益（如2倍），下跌触及障碍后转为按行权价交割股票承担损失。适合温和看多、追求增强收益的投资者。",
  },
  reverse_convertible: {
    name: "Barrier Reverse Convertible (BRC)", nameZh: "障碍反向可转换", abbr: "BRC", riskLevel: 3,
    desc: "Pays fixed coupon; at maturity returns principal if underlying > strike, otherwise delivers shares at strike. Unlike FCN: no autocall feature — investor is exposed to maturity. European barrier checks only at expiry; American (continuous) barrier checks daily. Higher coupon than ELN due to longer tenor.",
    descZh: "障碍反向可转换（BRC）：支付固定票息，到期时若高于行权价则还本，否则以行权价交割股票。与FCN区别：无自动赎回，投资者持续持有至到期。欧式障碍仅到期判断；美式（持续）障碍每日监测。",
  },
  capital_protected: {
    name: "Capital Protected Note (CPN)", nameZh: "保本票据", abbr: "CPN", riskLevel: 1,
    desc: "Zero-coupon bond (guarantees 90–100% principal) + long call option on underlying. At maturity: principal back plus participation in upside above strike, capped at a maximum. Lowest risk of all structured products. Suitable for conservative investors wanting equity upside without downside.",
    descZh: "保本票据：零息债券（确保90–100%还本）+ 标的看涨期权。到期返还本金并参与超出行权价的涨幅（设有上限）。所有结构化产品中风险最低。适合保守型投资者在保本前提下参与权益上行。",
  },
  warrant: {
    name: "Derivative Warrant (DW)", nameZh: "衍生权证", abbr: "DW", riskLevel: 4,
    desc: "Exchange-listed call or put on a stock or index. Issued by investment banks, traded on HKEX/SGX. High leverage: small underlying move = large % gain or loss. Call warrant profits from rise; put warrant profits from fall. Listed product with daily market price — can be sold before expiry.",
    descZh: "衍生权证：交易所上市的认购/认沽期权，标的为股票或指数。高杠杆：标的小幅波动即引发权证大幅涨跌。认购证从上涨获利，认沽证从下跌获利。上市产品有每日市价，可提前卖出。",
  },
  cbbc: {
    name: "CBBC (Bull/Bear Contract)", nameZh: "牛熊证", abbr: "CBBC", riskLevel: 5,
    desc: "Exchange-listed leveraged tracker on an index or stock. Bull CBBC profits from rises; Bear from falls. MANDATORY CALL: if underlying touches the call price at any time, CBBC is immediately terminated and may have zero residual value. Extremely high leverage, primarily for intraday trading.",
    descZh: "牛熊证：交易所上市的杠杆追踪产品。牛证从上涨获利，熊证从下跌获利。强制收回机制（MC）：标的任何时候触及收回价则立即强制终止，剩余价值可能为零。杠杆极高，主要用于日内交易。",
  },
  other: {
    name: "Other", nameZh: "其他", abbr: "Other", riskLevel: 3,
    desc: "Other structured products including Credit Linked Notes (CLN — exposed to issuer credit risk), Accumulator/KODA (daily forward contracts with 2× downside leverage), and bespoke OTC structures.",
    descZh: "其他结构化产品，包括：信用挂钩票据（CLN，承担发行商信用风险）、累计认购合约/KODA（每日远期合约，下行2倍杠杆）及定制化OTC结构。",
  },
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
