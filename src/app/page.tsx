'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsPanel from '@/components/StatsPanel';
import FilterBar from '@/components/FilterBar';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/context/Providers';
import { t } from '@/i18n/translations';
import { mockProducts, mockStats } from '@/data/mock';
import type { FilterState, StructuredProduct } from '@/types';

function applyFilters(products: StructuredProduct[], filters: FilterState): StructuredProduct[] {
  let filtered = [...products];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      (p.productNameZh && p.productNameZh.includes(q)) ||
      (p.isin && p.isin.toLowerCase().includes(q)) ||
      p.issuerName.toLowerCase().includes(q) ||
      p.underlyings.some(u => u.ticker.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || (u.nameZh && u.nameZh.includes(q)))
    );
  }

  if (filters.exchanges.length > 0) {
    filtered = filtered.filter(p => filters.exchanges.includes(p.exchange));
  }
  if (filters.issuers.length > 0) {
    filtered = filtered.filter(p => filters.issuers.includes(p.issuer));
  }
  if (filters.productTypes.length > 0) {
    filtered = filtered.filter(p => filters.productTypes.includes(p.productType));
  }

  // Sort
  switch (filters.sortBy) {
    case 'coupon_high':
      filtered.sort((a, b) => (b.couponRate || 0) - (a.couponRate || 0));
      break;
    case 'coupon_low':
      filtered.sort((a, b) => (a.couponRate || 0) - (b.couponRate || 0));
      break;
    case 'maturity_near':
      filtered.sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime());
      break;
    case 'maturity_far':
      filtered.sort((a, b) => new Date(b.maturityDate).getTime() - new Date(a.maturityDate).getTime());
      break;
    default: // newest
      filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }

  return filtered;
}

export default function HomePage() {
  const { lang } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    exchanges: [],
    issuers: [],
    productTypes: [],
    currencies: [],
    dateRange: {},
    status: [],
    sortBy: 'newest',
  });

  const filteredProducts = useMemo(() => applyFilters(mockProducts, filters), [filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-10 pb-6">
          <h1 className="text-3xl md:text-4xl font-light text-zinc-100 mb-3 tracking-tight">
            {t("header.title", lang)}
          </h1>
          <p className="text-zinc-500 text-sm max-w-2xl">
            {t("header.subtitle", lang)}
          </p>
        </section>

        {/* Stats */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-8">
          <StatsPanel stats={mockStats} />
        </section>

        {/* Filters */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-8">
          <FilterBar filters={filters} onChange={setFilters} />
        </section>

        {/* Results count */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-4">
          <p className="text-xs text-zinc-500">
            {lang === 'zh' ? `共 ${filteredProducts.length} 个产品` : `${filteredProducts.length} products found`}
          </p>
        </section>

        {/* Product grid */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-12">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product, i) => (
                <div key={product.id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-sm">{lang === 'zh' ? '暂无匹配产品' : 'No products match your filters'}</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
