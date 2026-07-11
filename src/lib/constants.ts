export const SITE_NAME = "Apex Commerce";
export const SITE_TAGLINE = "Premium shopping for every lifestyle";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGINATION_PAGES = 50;
export const PRODUCT_COUNT = 520;
export const BRAND_COUNT = 55;
export const BLOG_COUNT = 110;
export const COLLECTION_COUNT = 24;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
] as const;

export const UTM_SOURCES = ["google", "facebook", "instagram", "email", "twitter"];
export const UTM_CAMPAIGNS = ["spring_sale", "black_friday", "summer_clearance", "loyalty"];

export const SEARCH_SUGGESTIONS = [
  "shoes",
  "nike",
  "running",
  "dress",
  "laptop",
  "headphones",
  "winter jacket",
  "smartwatch",
  "yoga",
  "backpack",
  "sneakers",
  "adidas",
  "sale",
  "electronics",
  "beauty",
];
