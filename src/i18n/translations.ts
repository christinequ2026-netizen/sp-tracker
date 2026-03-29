const translations: Record<string, Record<string, string>> = {
  // Navigation
  "nav.home": { zh: "首页", en: "Home" },
  "nav.products": { zh: "产品列表", en: "Products" },
  "nav.issuers": { zh: "发行商", en: "Issuers" },
  "nav.exchanges": { zh: "交易所", en: "Exchanges" },
  "nav.analytics": { zh: "数据分析", en: "Analytics" },

  // Header
  "header.live": { zh: "实时", en: "LIVE" },
  "header.title": { zh: "亚洲结构化产品追踪", en: "Asia Structured Products Tracker" },
  "header.subtitle": { zh: "实时追踪亚洲各大交易所与银行发行的结构化产品", en: "Real-time tracking of structured product issuances across Asian exchanges and banks" },

  // Stats
  "stats.total": { zh: "总产品数", en: "Total Products" },
  "stats.today": { zh: "今日新增", en: "New Today" },
  "stats.week": { zh: "本周新增", en: "This Week" },
  "stats.avgCoupon": { zh: "平均票息", en: "Avg Coupon" },

  // Filters
  "filter.search": { zh: "搜索产品名称、ISIN、标的...", en: "Search by name, ISIN, underlying..." },
  "filter.exchange": { zh: "交易所", en: "Exchange" },
  "filter.issuer": { zh: "发行商", en: "Issuer" },
  "filter.type": { zh: "产品类型", en: "Product Type" },
  "filter.currency": { zh: "币种", en: "Currency" },
  "filter.status": { zh: "状态", en: "Status" },
  "filter.all": { zh: "全部", en: "All" },
  "filter.clear": { zh: "清除筛选", en: "Clear Filters" },
  "filter.sort": { zh: "排序", en: "Sort" },
  "filter.sort.newest": { zh: "最新发行", en: "Newest" },
  "filter.sort.couponHigh": { zh: "票息最高", en: "Highest Coupon" },
  "filter.sort.couponLow": { zh: "票息最低", en: "Lowest Coupon" },
  "filter.sort.maturityNear": { zh: "最近到期", en: "Nearest Maturity" },
  "filter.sort.maturityFar": { zh: "最远到期", en: "Farthest Maturity" },

  // Product card
  "product.coupon": { zh: "票息", en: "Coupon" },
  "product.maturity": { zh: "到期日", en: "Maturity" },
  "product.underlying": { zh: "挂钩标的", en: "Underlying" },
  "product.knockIn": { zh: "敲入", en: "Knock-In" },
  "product.knockOut": { zh: "敲出", en: "Knock-Out" },
  "product.strike": { zh: "行权", en: "Strike" },
  "product.issueDate": { zh: "发行日", en: "Issue Date" },
  "product.tradeDate": { zh: "交易日", en: "Trade Date" },
  "product.notional": { zh: "票面金额", en: "Notional" },
  "product.frequency": { zh: "付息频率", en: "Frequency" },
  "product.autocall": { zh: "自动赎回", en: "Autocall" },
  "product.viewDetails": { zh: "查看详情", en: "View Details" },
  "product.termSheet": { zh: "条款书", en: "Term Sheet" },
  "product.prospectus": { zh: "募集说明书", en: "Prospectus" },
  "product.source": { zh: "来源", en: "Source" },
  "product.worstOf": { zh: "最差表现", en: "Worst-of" },

  // Detail page
  "detail.keyTerms": { zh: "核心条款", en: "Key Terms" },
  "detail.barriers": { zh: "障碍水平", en: "Barrier Levels" },
  "detail.underlyings": { zh: "挂钩标的", en: "Underlying Assets" },
  "detail.dates": { zh: "重要日期", en: "Key Dates" },
  "detail.documents": { zh: "相关文件", en: "Documents" },
  "detail.performance": { zh: "表现监控", en: "Performance Monitor" },
  "detail.backToList": { zh: "返回列表", en: "Back to List" },
  "detail.similar": { zh: "类似产品", en: "Similar Products" },

  // Status
  "status.active": { zh: "存续中", en: "Active" },
  "status.upcoming": { zh: "即将发行", en: "Upcoming" },
  "status.matured": { zh: "已到期", en: "Matured" },
  "status.knockedIn": { zh: "已敲入", en: "Knocked In" },
  "status.knockedOut": { zh: "已敲出", en: "Knocked Out" },
  "status.earlyRedeemed": { zh: "提前赎回", en: "Early Redeemed" },

  // Frequency
  "freq.monthly": { zh: "月付", en: "Monthly" },
  "freq.quarterly": { zh: "季付", en: "Quarterly" },
  "freq.semi-annual": { zh: "半年付", en: "Semi-Annual" },
  "freq.annual": { zh: "年付", en: "Annual" },
  "freq.at_maturity": { zh: "到期一次性", en: "At Maturity" },

  // Footer
  "footer.disclaimer": { zh: "本网站仅供信息参考，不构成任何投资建议。结构化产品属于复杂金融工具，投资前请咨询专业顾问。", en: "This website is for informational purposes only and does not constitute investment advice. Structured products are complex financial instruments. Consult a professional advisor before investing." },
  "footer.sources": { zh: "数据来源", en: "Data Sources" },
  "footer.updated": { zh: "最后更新", en: "Last Updated" },
};

export function t(key: string, lang: 'zh' | 'en'): string {
  return translations[key]?.[lang] ?? key;
}
