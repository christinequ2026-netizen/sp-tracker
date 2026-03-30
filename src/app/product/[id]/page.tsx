import { notFound } from 'next/navigation';
import { loadProducts } from '@/lib/loadData';
import ProductDetailClient from '@/components/ProductDetailClient';

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const products = loadProducts();
  const product = products.find((p) => p.id === decodedId);

  if (!product) {
    notFound();
  }

  const similarProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.productType === product.productType || p.issuer === product.issuer)
    )
    .slice(0, 3);

  return <ProductDetailClient product={product} similarProducts={similarProducts} />;
}
