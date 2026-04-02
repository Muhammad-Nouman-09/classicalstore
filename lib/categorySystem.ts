type CategorySource = {
  category?: string | null;
  subcategory?: string | null;
};

export type CategoryDirectoryEntry = {
  name: string;
  subtitle: string;
  image: string;
  subcategories: string[];
  productCount: number;
};

type CategoryBlueprint = {
  name: string;
  subtitle: string;
  image: string;
  subcategories: string[];
};

const DEFAULT_CATEGORY_BLUEPRINTS: CategoryBlueprint[] = [
  {
    name: "Clothes",
    subtitle: "Tailored layers and everyday essentials",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    subcategories: ["Dresses", "Tops", "Bottoms", "Co-ords", "Outerwear"],
  },
  {
    name: "Shoes",
    subtitle: "Statement pairs built for long days",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
    subcategories: ["Heels", "Flats", "Slides", "Sneakers", "Sandals"],
  },
  {
    name: "Bags",
    subtitle: "Clean silhouettes with practical storage",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    subcategories: ["Totes", "Crossbody", "Shoulder Bags", "Mini Bags", "Travel"],
  },
  {
    name: "Jewellery",
    subtitle: "Finishing pieces with shine and texture",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80",
    subcategories: ["Necklaces", "Earrings", "Bracelets", "Rings", "Sets"],
  },
  {
    name: "Cosmetics",
    subtitle: "Glow-focused beauty and makeup picks",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    subcategories: ["Lipsticks", "Foundations", "Palettes", "Brushes", "Kits"],
  },
  {
    name: "Accessories",
    subtitle: "Everyday extras that complete the look",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    subcategories: ["Belts", "Scarves", "Sunglasses", "Hair Accessories", "Wallets"],
  },
  {
    name: "Home & Skincare",
    subtitle: "Daily rituals for calm, polished living",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    subcategories: ["Cleansers", "Serums", "Moisturisers", "Candles", "Bath & Body"],
  },
];

function normalizeValue(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function sortUnique(values: string[]) {
  return Array.from(new Set(values.map((value) => normalizeValue(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function buildFallbackSubtitle(name: string) {
  return `${name} picks curated for fast storefront browsing.`;
}

function buildFallbackImage(name: string) {
  const normalizedName = encodeURIComponent(name.toLowerCase());
  return `https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80&category=${normalizedName}`;
}

export function buildProductsFilterHref({
  query,
  category,
  subcategory,
}: {
  query?: string | null;
  category?: string | null;
  subcategory?: string | null;
}) {
  const params = new URLSearchParams();

  if (normalizeValue(query)) {
    params.set("q", normalizeValue(query));
  }

  if (normalizeValue(category)) {
    params.set("category", normalizeValue(category));
  }

  if (normalizeValue(subcategory)) {
    params.set("subcategory", normalizeValue(subcategory));
  }

  const queryString = params.toString();
  return queryString ? `/products?${queryString}` : "/products";
}

export function buildCategoryDirectory(products: CategorySource[] = []): CategoryDirectoryEntry[] {
  const directory = new Map<string, CategoryDirectoryEntry>();
  const normalizedNameLookup = new Map<string, string>();

  for (const blueprint of DEFAULT_CATEGORY_BLUEPRINTS) {
    const entry: CategoryDirectoryEntry = {
      name: blueprint.name,
      subtitle: blueprint.subtitle,
      image: blueprint.image,
      subcategories: sortUnique(blueprint.subcategories),
      productCount: 0,
    };

    directory.set(entry.name, entry);
    normalizedNameLookup.set(entry.name.toLowerCase(), entry.name);
  }

  for (const product of products) {
    const category = normalizeValue(product.category);
    const subcategory = normalizeValue(product.subcategory);

    if (!category) {
      continue;
    }

    const normalizedCategory = category.toLowerCase();
    const existingName = normalizedNameLookup.get(normalizedCategory);
    const entryName = existingName ?? category;

    if (!existingName) {
      directory.set(entryName, {
        name: entryName,
        subtitle: buildFallbackSubtitle(entryName),
        image: buildFallbackImage(entryName),
        subcategories: [],
        productCount: 0,
      });
      normalizedNameLookup.set(normalizedCategory, entryName);
    }

    const entry = directory.get(entryName);

    if (!entry) {
      continue;
    }

    entry.productCount += 1;

    if (subcategory) {
      entry.subcategories = sortUnique([...entry.subcategories, subcategory]);
    }
  }

  return Array.from(directory.values()).sort((a, b) => {
    if (a.productCount !== b.productCount) {
      return b.productCount - a.productCount;
    }

    return a.name.localeCompare(b.name);
  });
}

export function findCategoryEntry(directory: CategoryDirectoryEntry[], selectedCategory?: string | null) {
  const normalizedCategory = normalizeValue(selectedCategory).toLowerCase();
  return directory.find((entry) => entry.name.toLowerCase() === normalizedCategory) ?? null;
}

export function findSubcategoryName(
  directory: CategoryDirectoryEntry[],
  selectedCategory?: string | null,
  selectedSubcategory?: string | null
) {
  const categoryEntry = findCategoryEntry(directory, selectedCategory);
  const normalizedSubcategory = normalizeValue(selectedSubcategory).toLowerCase();

  if (!categoryEntry || !normalizedSubcategory) {
    return "";
  }

  return categoryEntry.subcategories.find((subcategory) => subcategory.toLowerCase() === normalizedSubcategory) ?? "";
}
