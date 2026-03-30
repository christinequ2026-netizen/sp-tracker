'use client';

import { useState, useMemo } from 'react';
import StatsPanel from '@/components/StatsPanel';
import FilterBar from '@/components/FilterBar';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/context/Providers';
import type { FilterState, StructuredProduct, DashboardStats } from '@/types';

interface Props {
  products: StructuredProduct[];
  stats: DashboardStats;
  lastUpdated?: string;
}

function applyFilters(products: StructuredProduct[], filters: FilterState): StructuredProduct[] {
  let filtered = [...products];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        (p.productNameZh && p.productNameZh.includes(q)) ||
        (p.isin && p.isin.toLowerCase().includes(q)) ||
        p.issuerName.toLowerCase().includes(q) ||
        p.underlyings.some(
          (u) =>
            u.ticker.toLowerCase().includes(q) ||
            u.name.toLowerCase().includes(q) ||
            (u.nameZh && u.nameZh.includes(q))
        )
    );
  }

  if (filters.exchanges.length > 0) {
    filtered = filtered.filter((p) => filters.exchanges.includes(p.exchange));
  }
  if (filters.issuers.length > 0) {
    filtered = filtered.filter((p) => filters.issuers.includes(p.issuer));
  }
  if (filters.productTypes.length > 0) {
    filtered = filtered.filter((p) => filters.productTypes.includes(p.productType));
  }
  if (filters.currencies.length > 0) {
    filtered = filtered.filter((p) => filters.currencies.includes(p.currency));
  }
  if (filters.status.length > 0) {
    filtered = filtered.filter((p) => filters.status.includes(p.status));
  }

  switch (filters.sortBy) {
    case 'coupon_high':
      filtered.sort((a, b) => (b.couponRate || 0) - (a.couponRate || 0));
      break;
    case 'coupon_low':
      filtered.sort((a, b) => (a.couponRate || 0) - (b.couponRate || 0));
      break;
    case 'maturity_near':
      filtered.sort(
        (a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
      );
      break;
    case 'maturity_far':
      filtered.sort(
        (a, b) => new Date(b.maturityDate).getTime() - new Date(a.maturityDate).getTime()
      );
      break;
    default: // newest
      filtered.sort(
        (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      );
  }

  return filtered;
}

export default function ProductsClient({ products, stats, lastUpdated }: Props) {
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

  const filteredProducts = useMemo(() => applyFilters(products, filters), [products, filters]);

  const updatedText = lastUpdated
    ? new Date(lastUpdated).toLocaleString(lang === 'zh' ? 'zh-HK' : 'en-SG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <>
      {/* Stats */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-8">
        <StatsPanel stats={stats} />
        {updatedText && (
          <p className="text-xs text-zinc-600 mt-2 text-right">
            {lang === 'zh' ? `数据更新于 ${updatedText}` : `Updated ${updatedText}`}
          </p>
        )}
      </section>

      {/* Filters */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-8">
        <FilterBar filters={filters} onChange={setFilters} />
      </section>

      {/* Results count */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-4">
        <p className="text-xs text-zinc-500">
          {lang === 'zh'
            ? `共 ${filteredProducts.length} 个产品`
            : `${filteredProducts.length} products found`}
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
            <p className="text-zinc-500 text-sm">
              {lang === 'zh' ? '暂无匹配产品' : 'No products match your filters'}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
