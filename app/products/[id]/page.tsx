import ProductDetailPage from "./ProductDetailPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <ProductDetailPage params={resolvedParams} />;
}
