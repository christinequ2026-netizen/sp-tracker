import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsClient from '@/components/ProductsClient';
import { loadProducts, loadStats } from '@/lib/loadData';
import type { StructuredProduct } from '@/types';

// Revalidate every 5 minutes so Vercel ISR picks up fresh scrapes quickly
export const revalidate = 300;

// Source legend config (server component — no 'use client' needed)
const SOURCE_LEGEND = [
  { key: "hkex",      label: "HKEX",  labelZh: "港交所",   color: "#10b981", desc: "港交所公告",       descEn: "HKEX filings" },
  { key: "sgx",       label: "SGX",   labelZh: "新交所",   color: "#f59e0b", desc: "新交所结构性产品", descEn: "SGX structured products" },
  { key: "ubs",       label: "UBS",   labelZh: "瑞银",     color: "#ef4444", desc: "瑞银 Keyinvest",  descEn: "UBS Keyinvest APAC" },
  { key: "macquarie", label: "MQG",   labelZh: "麦格理",   color: "#8b5cf6", desc: "麦格理权证网站",   descEn: "Macquarie warrants.com.hk" },
  { key: "demo",      label: "DEMO",  labelZh: "演示",     color: "#6366f1", desc: "演示用模拟数据",   descEn: "Simulated demo data" },
] as const;

export default function HomePage() {
  const products = loadProducts();
  const stats = loadStats(products);

  // Pass lastUpdated from the first product's scrapedAt if available
  const lastUpdated = products[0]?.scrapedAt ?? undefined;

  // Compute source breakdown
  const sourceCounts: Record<string, number> = {};
  for (const p of products) {
    const src = ((p as unknown) as Record<string,string>).dataSource ?? 'unknown';
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-10 pb-4">
          <h1 className="text-3xl md:text-4xl font-light text-zinc-100 mb-2 tracking-tight">
            Asia Structured Products Tracker
          </h1>
          <p className="text-zinc-500 text-sm max-w-2xl mb-4">
            FCN、Autocallable、ELN、Phoenix、Snowball、权证和牛熊证 — 亚洲主要交易所与发行商
          </p>

          {/* Data source legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center py-3 border-t border-b border-zinc-800/50">
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest shrink-0">
              数据来源 / Sources
            </span>
            {SOURCE_LEGEND.map(src => {
              const count = sourceCounts[src.key] ?? 0;
              if (count === 0) return null;
              return (
                <div key={src.key} className="flex items-center gap-1.5" title={src.descEn}>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider"
                    style={{
                      backgroundColor: `${src.color}18`,
                      color: src.color,
                      border: `1px solid ${src.color}30`,
                    }}
                  >
                    {src.label}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {src.desc}
                    <span className="ml-1 text-zinc-700">({count})</span>
                  </span>
                </div>
              );
            })}
            {sourceCounts['demo'] !== undefined && (
              <span className="text-[10px] text-zinc-700 ml-1">
                · 演示数据仅供参考，不代表真实市场报价
              </span>
            )}
          </div>
        </section>

        {/* All interactive content (stats + filters + grid) */}
        <ProductsClient
          products={products}
          stats={stats}
          lastUpdated={lastUpdated}
        />
      </main>
      <Footer />
    </div>
  );
}
