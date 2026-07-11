export interface Brand {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string;
  productCount: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentId: string | null;
  path: string[];
  imageUrl: string;
  children: Category[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPercent: number;
  image: ProductImage;
  images: string[];
  imageArchetype: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  stock: number;
  brandId: string;
  brandSlug: string;
  categoryId: string;
  categoryPath: string[];
  tags: string[];
  featured: boolean;
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  category: string;
  productType: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  productIds: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  tags: string[];
  categorySlug: string;
}

export interface Catalog {
  brands: Brand[];
  categories: Category[];
  categoryByPath: Map<string, Category>;
  products: Product[];
  productBySlug: Map<string, Product>;
  collections: Collection[];
  blogPosts: BlogPost[];
  storePaths: string[][];
}

export type SortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "newest";

export interface ProductFilters {
  category?: string;
  brand?: string;
  q?: string;
  sort?: SortOption;
  page?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
