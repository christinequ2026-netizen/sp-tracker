'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/Providers';
import { t } from '@/i18n/translations';
import { EXCHANGE_INFO, ISSUER_INFO, PRODUCT_TYPE_INFO } from '@/types';
import type { FilterState, Exchange, Issuer, ProductType } from '@/types';

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const { lang } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const toggleExchange = (ex: Exchange) => {
    const next = filters.exchanges.includes(ex)
      ? filters.exchanges.filter(e => e !== ex)
      : [...filters.exchanges, ex];
    onChange({ ...filters, exchanges: next });
  };

  const toggleIssuer = (issuer: Issuer) => {
    const next = filters.issuers.includes(issuer)
      ? filters.issuers.filter(i => i !== issuer)
      : [...filters.issuers, issuer];
    onChange({ ...filters, issuers: next });
  };

  const toggleProductType = (pt: ProductType) => {
    const next = filters.productTypes.includes(pt)
      ? filters.productTypes.filter(p => p !== pt)
      : [...filters.productTypes, pt];
    onChange({ ...filters, productTypes: next });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      exchanges: [],
      issuers: [],
      productTypes: [],
      currencies: [],
      dateRange: {},
      status: [],
      sortBy: 'newest',
    });
  };

  const hasFilters = filters.search || filters.exchanges.length || filters.issuers.length || filters.productTypes.length;

  // Only show main exchanges and issuers (not "other")
  const exchangeKeys = (Object.keys(EXCHANGE_INFO) as Exchange[]).filter(k => k !== 'other');
  const issuerKeys = (Object.keys(ISSUER_INFO) as Issuer[]).filter(k => k !== 'other').slice(0, 12);
  const productTypeKeys = (Object.keys(PRODUCT_TYPE_INFO) as ProductType[]).filter(k => k !== 'other');

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          placeholder={t("filter.search", lang)}
          className="w-full bg-[#111113] border border-zinc-800/60 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#c8a97e]/40 transition-colors"
        />
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Exchange filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('exchange')}
            className={`px-3 py-1.5 rounded-lg border text-xs tracking-wide transition-all ${
              filters.exchanges.length > 0 ? 'border-[#c8a97e]/50 text-[#c8a97e] bg-[#c8a97e]/10' : 'border-zinc-700/50 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {t("filter.exchange", lang)} {filters.exchanges.length > 0 && `(${filters.exchanges.length})`}
          </button>
          {openDropdown === 'exchange' && (
            <div className="absolute top-full mt-2 left-0 bg-[#18181b] border border-zinc-700 rounded-xl p-3 z-50 min-w-[200px] shadow-xl">
              {exchangeKeys.map(ex => (
                <label key={ex} className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded cursor-pointer">
                  <input type="checkbox" checked={filters.exchanges.includes(ex)} onChange={() => toggleExchange(ex)} className="rounded border-zinc-600 accent-[#c8a97e]" />
                  <span className="text-xs text-zinc-300">{EXCHANGE_INFO[ex].flag} {EXCHANGE_INFO[ex].name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Issuer filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('issuer')}
            className={`px-3 py-1.5 rounded-lg border text-xs tracking-wide transition-all ${
              filters.issuers.length > 0 ? 'border-[#c8a97e]/50 text-[#c8a97e] bg-[#c8a97e]/10' : 'border-zinc-700/50 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {t("filter.issuer", lang)} {filters.issuers.length > 0 && `(${filters.issuers.length})`}
          </button>
          {openDropdown === 'issuer' && (
            <div className="absolute top-full mt-2 left-0 bg-[#18181b] border border-zinc-700 rounded-xl p-3 z-50 min-w-[240px] max-h-[300px] overflow-y-auto shadow-xl">
              {issuerKeys.map(iss => (
                <label key={iss} className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded cursor-pointer">
                  <input type="checkbox" checked={filters.issuers.includes(iss)} onChange={() => toggleIssuer(iss)} className="rounded border-zinc-600 accent-[#c8a97e]" />
                  <span className="text-xs text-zinc-300">{lang === 'zh' ? ISSUER_INFO[iss].nameZh : ISSUER_INFO[iss].name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Product Type filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('type')}
            className={`px-3 py-1.5 rounded-lg border text-xs tracking-wide transition-all ${
              filters.productTypes.length > 0 ? 'border-[#c8a97e]/50 text-[#c8a97e] bg-[#c8a97e]/10' : 'border-zinc-700/50 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {t("filter.type", lang)} {filters.productTypes.length > 0 && `(${filters.productTypes.length})`}
          </button>
          {openDropdown === 'type' && (
            <div className="absolute top-full mt-2 left-0 bg-[#18181b] border border-zinc-700 rounded-xl p-3 z-50 min-w-[240px] max-h-[300px] overflow-y-auto shadow-xl">
              {productTypeKeys.map(pt => (
                <label key={pt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded cursor-pointer">
                  <input type="checkbox" checked={filters.productTypes.includes(pt)} onChange={() => toggleProductType(pt)} className="rounded border-zinc-600 accent-[#c8a97e]" />
                  <span className="text-xs text-zinc-300">{PRODUCT_TYPE_INFO[pt].abbr} — {lang === 'zh' ? PRODUCT_TYPE_INFO[pt].nameZh : PRODUCT_TYPE_INFO[pt].name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={filters.sortBy}
          onChange={e => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
          className="px-3 py-1.5 rounded-lg border border-zinc-700/50 text-xs text-zinc-400 bg-transparent hover:border-zinc-600 transition-all focus:outline-none focus:border-[#c8a97e]/40 cursor-pointer"
        >
          <option value="newest">{t("filter.sort.newest", lang)}</option>
          <option value="coupon_high">{t("filter.sort.couponHigh", lang)}</option>
          <option value="coupon_low">{t("filter.sort.couponLow", lang)}</option>
          <option value="maturity_near">{t("filter.sort.maturityNear", lang)}</option>
          <option value="maturity_far">{t("filter.sort.maturityFar", lang)}</option>
        </select>

        {/* Clear button */}
        {hasFilters && (
          <button onClick={clearFilters} className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            {t("filter.clear", lang)} ✕
          </button>
        )}
      </div>
    </div>
  );
}
