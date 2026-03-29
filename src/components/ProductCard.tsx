'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/Providers';
import { t } from '@/i18n/translations';
import { formatCoupon, formatDate, getStatusClass, daysUntil } from '@/lib/utils';
import { PRODUCT_TYPE_INFO, EXCHANGE_INFO, ISSUER_INFO } from '@/types';
import type { StructuredProduct } from '@/types';

interface Props {
  product: StructuredProduct;
}

export default function ProductCard({ product }: Props) {
  const { lang } = useLanguage();
  const typeInfo = PRODUCT_TYPE_INFO[product.productType];
  const exchangeInfo = EXCHANGE_INFO[product.exchange];
  const issuerInfo = ISSUER_INFO[product.issuer];
  const maturityDays = daysUntil(product.maturityDate);

  const statusLabels: Record<string, string> = {
    active: t("status.active", lang),
    upcoming: t("status.upcoming", lang),
    matured: t("status.matured", lang),
    knocked_in: t("status.knockedIn", lang),
    knocked_out: t("status.knockedOut", lang),
    early_redeemed: t("status.earlyRedeemed", lang),
  };

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-[#111113] border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/80 hover:bg-[#141416] transition-all group">
        {/* Top row: type + exchange + issuer + status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase" style={{ backgroundColor: `${issuerInfo.color}20`, color: issuerInfo.color, border: `1px solid ${issuerInfo.color}30` }}>
              {typeInfo.abbr}
            </span>
            <span className="text-xs text-zinc-500">{exchangeInfo.flag} {exchangeInfo.name}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-500">{lang === 'zh' ? issuerInfo.nameZh : issuerInfo.name}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusClass(product.status)}`}>
            {statusLabels[product.status] || product.status}
          </span>
        </div>

        {/* Product name */}
        <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors mb-3 line-clamp-2">
          {lang === 'zh' && product.productNameZh ? product.productNameZh : product.productName}
        </h3>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t("product.coupon", lang)}</p>
            <p className="text-lg font-light text-[#c8a97e]">
              {product.couponRate ? `${(product.couponRate * 100).toFixed(1)}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{t("product.maturity", lang)}</p>
            <p className="text-sm text-zinc-300">{formatDate(product.maturityDate)}</p>
            {maturityDays !== null && maturityDays > 0 && (
              <p className="text-[10px] text-zinc-500">{maturityDays}d</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">{product.currency}</p>
            <p className="text-sm text-zinc-300">
              {product.notional ? new Intl.NumberFormat('en', { notation: 'compact' }).format(product.notional) : '—'}
            </p>
          </div>
        </div>

        {/* Barrier visualization */}
        {(product.knockInLevel || product.knockOutLevel) && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] text-zinc-600 mb-1">
              {product.knockInLevel && <span>{t("product.knockIn", lang)} {product.knockInLevel}%</span>}
              {product.strikeLevel && <span>{t("product.strike", lang)} {product.strikeLevel}%</span>}
              {product.knockOutLevel && <span>{t("product.knockOut", lang)} {product.knockOutLevel}%</span>}
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full relative overflow-hidden">
              {product.knockInLevel && (
                <div className="absolute left-0 h-full bg-red-500/40 rounded-full" style={{ width: `${product.knockInLevel}%` }} />
              )}
              {product.knockOutLevel && (
                <div className="absolute right-0 h-full bg-emerald-500/40 rounded-full" style={{ width: `${100 - (product.knockOutLevel || 100)}%` }} />
              )}
              {product.currentPriceLevel && (
                <div className="absolute h-full w-0.5 bg-[#c8a97e]" style={{ left: `${Math.min(product.currentPriceLevel, 100)}%` }} />
              )}
            </div>
          </div>
        )}

        {/* Underlyings */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.underlyings.map((u) => (
            <span key={u.ticker} className="px-2 py-0.5 bg-zinc-800/50 border border-zinc-700/30 rounded text-[10px] text-zinc-400">
              {u.ticker} {lang === 'zh' && u.nameZh ? u.nameZh : u.name}
            </span>
          ))}
          {product.worstOf && (
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-400">
              {t("product.worstOf", lang)}
            </span>
          )}
        </div>

        {/* View details */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
          <span className="text-[10px] text-zinc-600">{formatDate(product.issueDate)}</span>
          <span className="text-xs text-zinc-500 group-hover:text-[#c8a97e] transition-colors">
            {t("product.viewDetails", lang)} →
          </span>
        </div>
      </div>
    </Link>
  );
}
