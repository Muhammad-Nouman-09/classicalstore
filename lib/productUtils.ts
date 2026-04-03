export type ProductRecord = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
  category?: string | null;
  subcategory?: string | null;
  rating?: number | null;
  rating_count?: number | null;
  in_stock?: boolean | null;
  featured?: boolean | null;
};

type RatingRow = {
  product_id: string;
  rating: number;
};

export const DEFAULT_PRODUCT_RATING = 4.5;

export function formatPrice(value: number) {
  const minimumFractionDigits = Number.isInteger(value) ? 0 : 2;

  return `Rs ${new Intl.NumberFormat("en-PK", {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export function normalizeProduct<T extends ProductRecord>(
  product: T
): T & { rating: number; rating_count: number; in_stock: boolean } {
  return {
    ...product,
    rating: typeof product.rating === "number" ? product.rating : DEFAULT_PRODUCT_RATING,
    rating_count: typeof product.rating_count === "number" ? product.rating_count : 0,
    in_stock: typeof product.in_stock === "boolean" ? product.in_stock : true,
  };
}

export function getRatingStars(rating: number) {
  const filledStars = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => (index < filledStars ? "*" : ".")).join("");
}

export function mergeProductRatings<T extends ProductRecord>(
  products: T[],
  ratingRows: RatingRow[] | null | undefined
): Array<T & { rating: number; rating_count: number; in_stock: boolean }> {
  const groupedRatings = new Map<string, { total: number; count: number }>();

  for (const row of ratingRows ?? []) {
    const current = groupedRatings.get(row.product_id) ?? { total: 0, count: 0 };
    current.total += row.rating;
    current.count += 1;
    groupedRatings.set(row.product_id, current);
  }

  return products.map((product) => {
    const summary = groupedRatings.get(product.id);

    if (!summary || summary.count === 0) {
      return normalizeProduct(product);
    }

    return normalizeProduct({
      ...product,
      rating: Math.round((summary.total / summary.count) * 10) / 10,
      rating_count: summary.count,
    });
  });
}
