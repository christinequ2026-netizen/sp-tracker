import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsClient from '@/components/ProductsClient';
import { loadProducts, loadStats } from '@/lib/loadData';

// Revalidate every 5 minutes so Vercel ISR picks up fresh scrapes quickly
export const revalidate = 300;

export default function HomePage() {
  const products = loadProducts();
  const stats = loadStats(products);

  // Pass lastUpdated from the first product's scrapedAt if available
  const lastUpdated = products[0]?.scrapedAt ?? undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-10 pb-6">
          <h1 className="text-3xl md:text-4xl font-light text-zinc-100 mb-3 tracking-tight">
            Asia Structured Products Tracker
          </h1>
          <p className="text-zinc-500 text-sm max-w-2xl">
            Real-time data on newly issued FCN, Autocallable, ELN, Warrants &amp; CBBC from SGX and UBS Asia
          </p>
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
