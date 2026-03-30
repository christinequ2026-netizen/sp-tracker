'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/Providers';
import { t } from '@/i18n/translations';
import { formatDate, getStatusClass, daysUntil, formatCurrency } from '@/lib/utils';
import { PRODUCT_TYPE_INFO, EXCHANGE_INFO, ISSUER_INFO } from '@/types';
import type { StructuredProduct } from '@/types';

interface Props {
  product: StructuredProduct;
  similarProducts: StructuredProduct[];
}

export default function ProductDetailClient({ product, similarProducts }: Props) {
  const { lang } = useLanguage();

  const typeInfo  = PRODUCT_TYPE_INFO[product.productType]  ?? { abbr: product.productType, name: product.productType, nameZh: product.productType };
  const exchInfo  = EXCHANGE_INFO[product.exchange]          ?? { name: product.exchange, nameZh: product.exchange, flag: '🌐', url: '#' };
  const issuerInfo = ISSUER_INFO[product.issuer]             ?? { name: product.issuerName, nameZh: product.issuerName, color: '#6B7280' };
  const maturityDays = daysUntil(product.maturityDate);

  const statusLabels: Record<string, string> = {
    active:         t('status.active', lang),
    upcoming:       t('status.upcoming', lang),
    matured:        t('status.matured', lang),
    knocked_in:     t('status.knockedIn', lang),
    knocked_out:    t('status.knockedOut', lang),
    early_redeemed: t('status.earlyRedeemed', lang),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-6 pb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-300 transition-colors">{t('nav.home', lang)}</Link>
            <span>/</span>
            <Link href="/" className="hover:text-zinc-300 transition-colors">{t('nav.products', lang)}</Link>
            <span>/</span>
            <span className="text-zinc-400">{typeInfo.abbr}</span>
          </div>
        </div>

        {/* Product header */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2.5 py-1 rounded text-[11px] font-medium tracking-wider uppercase"
              style={{ backgroundColor: `${issuerInfo.color}20`, color: issuerInfo.color, border: `1px solid ${issuerInfo.color}30` }}>
              {typeInfo.abbr}
            </span>
            <span className="text-sm text-zinc-400">{exchInfo.flag} {exchInfo.name}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-sm text-zinc-400">{lang === 'zh' ? issuerInfo.nameZh : issuerInfo.name}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStatusClass(product.status)}`}>
              {statusLabels[product.status] || product.status}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-zinc-100 tracking-tight mb-2">
            {lang === 'zh' && product.productNameZh ? product.productNameZh : product.productName}
          </h1>
          {product.isin && <p className="text-xs text-zinc-500 font-mono">ISIN: {product.isin}</p>}
        </section>

        <div className="accent-line" />

        {/* Main content grid */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Terms */}
              <div className="bg-[#111113] border border-zinc-800/60 rounded-xl p-6">
                <h2 className="text-sm font-medium text-zinc-300 tracking-wider uppercase mb-6">{t('detail.keyTerms', lang)}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t('product.coupon', lang)}</p>
                    <p className="text-2xl font-light text-[#c8a97e]">
                      {product.couponRate ? `${(product.couponRate * 100).toFixed(2)}%` : '—'}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">p.a.</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t('product.frequency', lang)}</p>
                    <p className="text-sm text-zinc-300">
                      {product.couponFrequency ? t(`freq.${product.couponFrequency}`, lang) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t('product.notional', lang)}</p>
                    <p className="text-sm text-zinc-300">{formatCurrency(product.notional, product.currency)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t('product.strike', lang)}</p>
                    <p className="text-sm text-zinc-300">{product.strikeLevel ? `${product.strikeLevel}%` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t('product.knockIn', lang)}</p>
                    <p className="text-sm text-red-400">{product.knockInLevel ? `${product.knockInLevel}%` : '—'}</p>
                    {product.knockInType && <p className="text-[10px] text-zinc-500 mt-0.5">{product.knockInType}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t('product.knockOut', lang)}</p>
                    <p className="text-sm text-emerald-400">{product.knockOutLevel ? `${product.knockOutLevel}%` : '—'}</p>
                  </div>
                  {product.autocallFrequency && (
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t('product.autocall', lang)}</p>
                      <p className="text-sm text-zinc-300">{t(`freq.${product.autocallFrequency}`, lang)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Barrier visualization */}
              {(product.knockInLevel || product.knockOutLevel) && (
                <div className="bg-[#111113] border border-zinc-800/60 rounded-xl p-6">
                  <h2 className="text-sm font-medium text-zinc-300 tracking-wider uppercase mb-6">{t('detail.barriers', lang)}</h2>
                  <div className="relative h-16 bg-zinc-900 rounded-lg overflow-hidden">
                    {[0, 25, 50, 75, 100].map(level => (
                      <div key={level} className="absolute top-0 bottom-0 w-px bg-zinc-800" style={{ left: `${level}%` }}>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-zinc-600">{level}%</span>
                      </div>
                    ))}
                    {product.knockInLevel && (
                      <div className="absolute top-0 bottom-0 bg-red-500/10 border-r-2 border-red-500/40" style={{ left: 0, width: `${product.knockInLevel}%` }}>
                        <span className="absolute top-1 right-2 text-[10px] text-red-400 font-medium">KI {product.knockInLevel}%</span>
                      </div>
                    )}
                    {product.knockOutLevel && (
                      <div className="absolute top-0 bottom-0 bg-emerald-500/10 border-l-2 border-emerald-500/40" style={{ left: `${product.knockOutLevel}%`, right: 0 }}>
                        <span className="absolute top-1 left-2 text-[10px] text-emerald-400 font-medium">KO {product.knockOutLevel}%</span>
                      </div>
                    )}
                    {product.strikeLevel && (
                      <div className="absolute top-0 bottom-0 w-0.5 bg-[#c8a97e]" style={{ left: `${product.strikeLevel}%` }}>
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-[#c8a97e] font-medium whitespace-nowrap">Strike</span>
                      </div>
                    )}
                    {product.currentPriceLevel && (
                      <div className="absolute top-0 bottom-0 w-1 bg-white/80 rounded" style={{ left: `${Math.min(product.currentPriceLevel, 120) / 1.2}%` }}>
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white font-medium whitespace-nowrap">
                          {product.currentPriceLevel.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Underlyings table */}
              <div className="bg-[#111113] border border-zinc-800/60 rounded-xl p-6">
                <h2 className="text-sm font-medium text-zinc-300 tracking-wider uppercase mb-6">{t('detail.underlyings', lang)}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Ticker</th>
                        <th className="text-left py-2 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{lang === 'zh' ? '名称' : 'Name'}</th>
                        <th className="text-right py-2 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{lang === 'zh' ? '初始价格' : 'Initial'}</th>
                        <th className="text-right py-2 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{lang === 'zh' ? '当前价格' : 'Current'}</th>
                        <th className="text-right py-2 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{lang === 'zh' ? '变动' : 'Change'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.underlyings.map((u, i) => {
                        const change = u.initialLevel && u.currentLevel
                          ? ((u.currentLevel - u.initialLevel) / u.initialLevel * 100)
                          : null;
                        return (
                          <tr key={u.ticker || i} className="border-b border-zinc-800/50">
                            <td className="py-3 font-mono text-zinc-300">{u.ticker || '—'}</td>
                            <td className="py-3 text-zinc-400">{lang === 'zh' && u.nameZh ? u.nameZh : u.name}</td>
                            <td className="py-3 text-right text-zinc-400">{u.initialLevel?.toFixed(2) ?? '—'}</td>
                            <td className="py-3 text-right text-zinc-300">{u.currentLevel?.toFixed(2) ?? '—'}</td>
                            <td className={`py-3 text-right font-medium ${change !== null ? (change >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-zinc-500'}`}>
                              {change !== null ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {product.worstOf && (
                  <p className="mt-3 text-[10px] text-amber-400/80 flex items-center gap-1">
                    ⚠ {lang === 'zh' ? '最差表现结构：回报取决于表现最差的标的' : 'Worst-of structure: payoff linked to the worst performing underlying'}
                  </p>
                )}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Key dates */}
              <div className="bg-[#111113] border border-zinc-800/60 rounded-xl p-6">
                <h2 className="text-sm font-medium text-zinc-300 tracking-wider uppercase mb-5">{t('detail.dates', lang)}</h2>
                <div className="space-y-4">
                  {[
                    { label: t('product.tradeDate', lang),  value: formatDate(product.tradeDate) },
                    { label: t('product.issueDate', lang),  value: formatDate(product.issueDate) },
                    { label: t('product.maturity', lang),   value: formatDate(product.maturityDate), highlight: true },
                  ].map(d => (
                    <div key={d.label} className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">{d.label}</span>
                      <span className={`text-xs ${d.highlight ? 'text-[#c8a97e] font-medium' : 'text-zinc-300'}`}>{d.value}</span>
                    </div>
                  ))}
                  {maturityDays !== null && maturityDays > 0 && (
                    <div className="pt-3 border-t border-zinc-800/50 text-center">
                      <p className="text-2xl font-light text-zinc-200">{maturityDays}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{lang === 'zh' ? '距到期日（天）' : 'Days to Maturity'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents / source link */}
              <div className="bg-[#111113] border border-zinc-800/60 rounded-xl p-6">
                <h2 className="text-sm font-medium text-zinc-300 tracking-wider uppercase mb-5">{t('detail.documents', lang)}</h2>
                <div className="space-y-2">
                  {product.termSheetUrl && (
                    <a href={product.termSheetUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/60 transition-colors group">
                      <span className="text-lg">📄</span>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200">{t('product.termSheet', lang)}</span>
                      <span className="text-zinc-600 ml-auto">↗</span>
                    </a>
                  )}
                  {product.prospectusUrl && (
                    <a href={product.prospectusUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/60 transition-colors group">
                      <span className="text-lg">📋</span>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200">{t('product.prospectus', lang)}</span>
                      <span className="text-zinc-600 ml-auto">↗</span>
                    </a>
                  )}
                  {product.sourceUrl && (
                    <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/60 transition-colors group">
                      <span className="text-lg">🔗</span>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-200">{t('product.source', lang)}</span>
                      <span className="text-zinc-600 ml-auto">↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="bg-[#111113] border border-zinc-800/60 rounded-xl p-6">
                  <h2 className="text-sm font-medium text-zinc-300 tracking-wider uppercase mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-zinc-800/50 border border-zinc-700/30 rounded-full text-[10px] text-zinc-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-12">
            <div className="accent-line mb-8" />
            <h2 className="text-sm font-medium text-zinc-300 tracking-wider uppercase mb-6">{t('detail.similar', lang)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similarProducts.map(p => {
                const si = ISSUER_INFO[p.issuer] ?? { color: '#6B7280', name: p.issuerName, nameZh: p.issuerName };
                const ti = PRODUCT_TYPE_INFO[p.productType] ?? { abbr: p.productType };
                const ei = EXCHANGE_INFO[p.exchange] ?? { flag: '🌐', name: p.exchange };
                return (
                  <Link key={p.id} href={`/product/${encodeURIComponent(p.id)}`}
                    className="block bg-[#111113] border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/80 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ backgroundColor: `${si.color}20`, color: si.color }}>
                        {ti.abbr}
                      </span>
                      <span className="text-xs text-zinc-500">{ei.flag} {lang === 'zh' ? si.nameZh : si.name}</span>
                    </div>
                    <p className="text-xs text-zinc-300 mb-2 line-clamp-2">
                      {lang === 'zh' && p.productNameZh ? p.productNameZh : p.productName}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-[#c8a97e] text-sm">{p.couponRate ? `${(p.couponRate * 100).toFixed(1)}%` : '—'}</span>
                      <span className="text-zinc-500 text-xs">{formatDate(p.maturityDate)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
