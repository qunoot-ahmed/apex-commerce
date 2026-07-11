import {
  BLOG_COUNT,
  BRAND_COUNT,
  COLLECTION_COUNT,
  PRODUCT_COUNT,
} from "@/lib/constants";
import {
  getBlogImage,
  getArchetypeForCategory,
  getBrandLogoUrl,
  getCategoryImage,
  getCollectionImage,
  getProductImageSet,
} from "@/lib/images/catalog-images";
import type {
  BlogPost,
  Brand,
  Catalog,
  Category,
  Collection,
  Product,
  Review,
} from "@/types/catalog";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BRAND_NAMES = [
  "Nike", "Adidas", "Puma", "Reebok", "Under Armour", "New Balance",
  "Apple", "Samsung", "Sony", "LG", "Bose", "JBL", "Dell", "HP", "Lenovo",
  "Levi's", "Zara", "H&M", "Uniqlo", "Gap", "Calvin Klein", "Tommy Hilfiger",
  "North Face", "Patagonia", "Columbia", "Carhartt", "Lululemon", "Gymshark",
  "KitchenAid", "Dyson", "Philips", "Braun", "Oral-B", "Fitbit", "Garmin",
  "Ray-Ban", "Oakley", "Fossil", "Casio", "Seiko", "Citizen", "Timex",
  "Maybelline", "L'Oreal", "Nivea", "Dove", "Olay", "Gillette", "Old Spice",
  "IKEA", "Wayfair", "Crate & Barrel", "Williams Sonoma", "All-Clad",
  "Canon", "Nikon", "GoPro",
];

const BRANDS_BY_ROOT: Record<string, string[]> = {
  fashion: [
    "Nike", "Adidas", "Puma", "Reebok", "Levi's", "Zara", "H&M", "Uniqlo",
    "Gap", "Calvin Klein", "Tommy Hilfiger", "Ray-Ban", "Oakley"
  ],
  electronics: [
    "Apple", "Samsung", "Sony", "LG", "Bose", "JBL", "Dell", "HP",
    "Lenovo", "Fitbit", "Garmin", "Canon", "Nikon", "GoPro"
  ],
  home: [
    "IKEA", "Wayfair", "Crate & Barrel", "Williams Sonoma", "All-Clad",
    "KitchenAid", "Dyson", "Philips", "Braun"
  ],
  sports: [
    "Nike", "Adidas", "Puma", "Reebok", "Under Armour", "New Balance",
    "Lululemon", "Gymshark", "North Face", "Patagonia", "Columbia", "Garmin"
  ],
  beauty: [
    "Maybelline", "L'Oreal", "Nivea", "Dove", "Olay", "Gillette", "Old Spice",
    "Oral-B", "Philips", "Braun"
  ],
  kids: [
    "Nike", "Adidas", "Gap", "H&M", "Uniqlo", "Puma", "New Balance"
  ],
};

const CATEGORY_TREE: { name: string; children?: { name: string; children?: { name: string }[] }[] }[] = [
  { name: "Fashion", children: [
    { name: "Shoes", children: [{ name: "Mens" }, { name: "Womens" }, { name: "Kids" }] },
    { name: "Clothing", children: [{ name: "Tops" }, { name: "Bottoms" }, { name: "Outerwear" }] },
    { name: "Accessories", children: [{ name: "Bags" }, { name: "Belts" }, { name: "Hats" }] },
  ]},
  { name: "Electronics", children: [
    { name: "Phones", children: [{ name: "Smartphones" }, { name: "Accessories" }] },
    { name: "Computers", children: [{ name: "Laptops" }, { name: "Desktops" }, { name: "Tablets" }] },
    { name: "Audio", children: [{ name: "Headphones" }, { name: "Speakers" }] },
    { name: "TV", children: [{ name: "4K" }, { name: "OLED" }] },
  ]},
  { name: "Home", children: [
    { name: "Furniture", children: [{ name: "Living Room" }, { name: "Bedroom" }, { name: "Office" }] },
    { name: "Kitchen", children: [{ name: "Appliances" }, { name: "Cookware" }] },
    { name: "Decor", children: [{ name: "Lighting" }, { name: "Rugs" }] },
  ]},
  { name: "Sports", children: [
    { name: "Running", children: [{ name: "Shoes" }, { name: "Apparel" }] },
    { name: "Training", children: [{ name: "Equipment" }, { name: "Apparel" }] },
    { name: "Outdoor", children: [{ name: "Camping" }, { name: "Hiking" }] },
  ]},
  { name: "Beauty", children: [
    { name: "Skincare", children: [{ name: "Moisturizers" }, { name: "Cleansers" }] },
    { name: "Makeup", children: [{ name: "Face" }, { name: "Eyes" }] },
    { name: "Fragrance", children: [{ name: "Men" }, { name: "Women" }] },
  ]},
  { name: "Kids", children: [
    { name: "Toys", children: [{ name: "Educational" }, { name: "Outdoor" }] },
    { name: "Clothing", children: [{ name: "Boys" }, { name: "Girls" }] },
  ]},
];

function buildCategories(): { flat: Category[]; roots: Category[] } {
  const flat: Category[] = [];
  let idCounter = 0;

  function walk(
    node: { name: string; children?: { name: string; children?: { name: string }[] }[] },
    parentId: string | null,
    path: string[]
  ): Category {
    const slug = slugify(node.name);
    const currentPath = [...path, slug];
    const id = `cat-${++idCounter}`;
    const category: Category = {
      id,
      slug,
      name: node.name,
      description: `Shop ${node.name.toLowerCase()} — curated selection with fast shipping and easy returns.`,
      parentId,
      path: currentPath,
      imageUrl: getCategoryImage(currentPath, id),
      children: [],
    };
    flat.push(category);
    if (node.children) {
      for (const child of node.children) {
        category.children.push(walk(child, id, currentPath));
      }
    }
    return category;
  }

  const roots = CATEGORY_TREE.map((n) => walk(n, null, []));
  return { flat, roots };
}

function buildBrands(): Brand[] {
  return Array.from({ length: BRAND_COUNT }, (_, i) => {
    const name = BRAND_NAMES[i % BRAND_NAMES.length]! + (i >= BRAND_NAMES.length ? ` ${i}` : "");
    const slug = slugify(name);
    return {
      id: `brand-${slug}`,
      slug,
      name,
      description: `${name} — industry-leading quality, innovation, and style for modern shoppers.`,
      logoUrl: getBrandLogoUrl(name),
      productCount: 0,
    };
  });
}

const PRODUCT_ADJECTIVES = ["Pro", "Elite", "Ultra", "Classic", "Premium", "Lite", "Max", "Air", "Flex", "Core"];

function titleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pickBrandForCategory(categoryPath: string[], index: number): Brand {
  const root = categoryPath[0] ?? "fashion";
  const pool = BRANDS_BY_ROOT[root] ?? BRAND_NAMES;
  const name = pool[index % pool.length]!;
  const slug = slugify(name);

  return {
    id: `brand-${slug}`,
    slug,
    name,
    description: `${name} — curated quality, style, and performance for ${root} shoppers.`,
    logoUrl: getBrandLogoUrl(name),
    productCount: 0,
  };
}

function buildProducts(brands: Brand[], categories: Category[]): Product[] {
  const leafCategories = categories.filter((c) => c.children.length === 0);
  return Array.from({ length: PRODUCT_COUNT }, (_, i) => {
    const category = leafCategories[i % leafCategories.length]!;
    const brand = pickBrandForCategory(category.path, i);
    if (!brands.some((b) => b.id === brand.id)) {
      brands.push(brand);
    }
    const archetype = getArchetypeForCategory(category.path, i);
    const adj = PRODUCT_ADJECTIVES[i % PRODUCT_ADJECTIVES.length]!;
    const noun = titleCase(archetype.label);
    const name = `${brand.name} ${adj} ${noun} ${String(i + 1).padStart(3, "0")}`;
    const slug = slugify(name);
    const price = Math.round((29 + rand() * 970) * 100) / 100;
    const discountPercent = rand() > 0.65 ? Math.floor(rand() * 40) + 5 : 0;
    const reviewCount = Math.floor(rand() * 450) + 5;
    const rating = Math.round((3.5 + rand() * 1.5) * 10) / 10;
    const reviews: Review[] = Array.from({ length: Math.min(5, Math.floor(reviewCount / 30) + 1) }, (_, r) => ({
      id: `rev-${i}-${r}`,
      author: `Customer ${i * 3 + r}`,
      rating: Math.min(5, Math.max(1, Math.round(rating + (rand() - 0.5)))),
      title: pick(["Great product", "Love it", "Solid buy", "Exceeded expectations", "Good value"]),
      body: "High quality and fast delivery. Would recommend to friends and family.",
      date: new Date(2024, Math.floor(rand() * 12), Math.floor(rand() * 28) + 1).toISOString().split("T")[0]!,
    }));

    const productImage = getProductImageSet(archetype.key, name, i);

    return {
      id: `prod-${i + 1}`,
      slug,
      sku: `SKU-${100000 + i}`,
      name,
      description: `${name} delivers exceptional performance and style. Engineered for daily use with premium materials, thoughtful design, and backed by our satisfaction guarantee. Ideal for ${category.name.toLowerCase()} enthusiasts who expect more from every purchase.`,
      shortDescription: `Premium ${category.name.toLowerCase()} from ${brand.name}.`,
      price,
      discountPercent,
      image: productImage.image,
      images: productImage.images,
      imageArchetype: archetype.key,
      rating,
      reviewCount,
      reviews,
      stock: Math.floor(rand() * 200) + 1,
      brandId: brand.id,
      brandSlug: brand.slug,
      categoryId: category.id,
      categoryPath: category.path,
      tags: [brand.slug, ...category.path, adj.toLowerCase()],
      featured: i < 40,
    };
  });
}

function buildCollections(products: Product[]): Collection[] {
  const names = [
    "Summer Sale", "Black Friday", "Holiday Gifts", "New Arrivals", "Best Sellers",
    "Clearance", "Staff Picks", "Eco Friendly", "Premium Edit", "Under $50",
    "Running Essentials", "Work From Home", "Outdoor Adventure", "Beauty Must-Haves",
    "Tech Deals", "Kids Favorites", "Luxury Lane", "Flash Sale", "Weekend Wear",
    "Athleisure", "Smart Home", "Fitness Goals", "Travel Ready", "Back to School",
  ];
  return names.slice(0, COLLECTION_COUNT).map((name, i) => {
    const slug = slugify(name);
    const start = (i * 22) % products.length;
    const productIds = products.slice(start, start + 30).map((p) => p.id);
    const heroProduct = products[start];
    return {
      id: `col-${i + 1}`,
      slug,
      name,
      description: `Explore our ${name} collection — hand-picked products with exclusive offers.`,
      imageUrl: heroProduct?.images[0] ?? getCollectionImage(name, i),
      productIds,
    };
  });
}

function buildBlogPosts(categories: Category[]): BlogPost[] {
  const topics = [
    "How to Choose the Right Running Shoes",
    "2026 Fashion Trends You Need to Know",
    "Smart Home Setup Guide",
    "Skincare Routine for Every Season",
    "Gift Ideas for the Holidays",
    "Sustainable Shopping Tips",
    "Tech Buyer Guide",
    "Workout Gear Essentials",
  ];
  return Array.from({ length: BLOG_COUNT }, (_, i) => {
    const title = `${topics[i % topics.length]!} — Part ${Math.floor(i / topics.length) + 1}`;
    const slug = slugify(title);
    const cat = categories[i % categories.length]!;
    return {
      id: `blog-${i + 1}`,
      slug,
      title,
      excerpt: `Expert insights on ${title.toLowerCase()}. Learn strategies, comparisons, and recommendations from our editorial team.`,
      content: `## ${title}\n\nWelcome to the Apex Commerce editorial desk. In this article we cover practical advice, product comparisons, and shopping strategies.\n\n### Key takeaways\n\n- Research before you buy\n- Compare specs and reviews\n- Look for bundle deals\n\nOur merchandising team updates this guide regularly to reflect the latest inventory and seasonal promotions.`,
      author: pick(["Alex Morgan", "Jordan Lee", "Sam Patel", "Riley Chen"]),
      publishedAt: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
      imageUrl: getBlogImage(title, i),
      tags: ["guides", "shopping", cat.slug],
      categorySlug: cat.path[0] ?? cat.slug,
    };
  });
}

function buildStorePaths(categories: Category[], brands: Brand[]): string[][] {
  const paths: string[][] = [];
  const segments = ["men", "women", "kids", "unisex"];
  const leafCats = categories.filter((c) => c.path.length >= 3).slice(0, 40);
  for (const seg of segments) {
    for (const cat of leafCats.slice(0, 15)) {
      const brand = brands[paths.length % brands.length]!;
      paths.push(["store", seg, ...cat.path.slice(0, 3), brand.slug]);
    }
  }
  return paths;
}

export function buildCatalog(): Catalog {
  const { flat: categories, roots } = buildCategories();
  const brands = buildBrands();
  const products = buildProducts(brands, categories);
  const collections = buildCollections(products);
  const blogPosts = buildBlogPosts(categories);

  for (const brand of brands) {
    brand.productCount = products.filter((p) => p.brandId === brand.id).length;
  }

  const categoryByPath = new Map<string, Category>();
  for (const c of categories) {
    categoryByPath.set(c.path.join("/"), c);
  }

  const productBySlug = new Map<string, Product>();
  for (const p of products) {
    productBySlug.set(p.slug, p);
  }

  const storePaths = buildStorePaths(categories, brands);

  return {
    brands,
    categories: roots,
    categoryByPath,
    products,
    productBySlug,
    collections,
    blogPosts,
    storePaths,
  };
}
