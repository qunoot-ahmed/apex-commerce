import { existsSync } from "fs";
import { join } from "path";
import manifest from "../src/lib/images/product-image-manifest.json";
import { getCatalog } from "../src/lib/data/catalog";

interface Archetype {
  key: string;
  label: string;
  category: string;
  alt: string;
  allowedRoots: string[];
  allowedSegments: string[];
  images: string[];
}

const rootDir = process.cwd();
const archetypes = manifest.archetypes as Archetype[];
const archetypeByKey = new Map(archetypes.map((item) => [item.key, item]));
const errors: string[] = [];
const warnings: string[] = [];
const imageUsage = new Map<string, number>();

function fail(message: string) {
  errors.push(message);
}

function warn(message: string) {
  warnings.push(message);
}

function localPathExists(src: string): boolean {
  return existsSync(join(rootDir, "public", src.replace(/^\//, "")));
}

function pathMatchesArchetype(path: string[], archetype: Archetype): boolean {
  const root = path[0]?.toLowerCase();
  const segments = path.map((part) => part.toLowerCase().replace(/\s+/g, "-"));

  return (
    archetype.allowedRoots.includes(root ?? "") ||
    archetype.allowedSegments.some((segment) => segments.includes(segment))
  );
}

for (const archetype of archetypes) {
  for (const src of archetype.images) {
    if (!src.startsWith("/images/products/")) {
      fail(`${archetype.key} uses a non-product path: ${src}`);
    }
    if (!localPathExists(src)) {
      fail(`${archetype.key} references missing local asset: ${src}`);
    }
    if (!archetype.alt.trim()) {
      fail(`${archetype.key} has empty alt text.`);
    }
  }
}

const catalog = getCatalog();

for (const product of catalog.products) {
  const context = `${product.id} (${product.name})`;
  const archetype = archetypeByKey.get(product.imageArchetype);

  if (!archetype) {
    fail(`${context} has unknown image archetype: ${product.imageArchetype}`);
    continue;
  }

  if (!product.image) {
    fail(`${context} is missing product.image.`);
    continue;
  }

  if (!product.image.src) fail(`${context} has empty image src.`);
  if (!product.image.alt?.trim()) fail(`${context} has empty image alt.`);
  if (product.image.width !== 800 || product.image.height !== 800) {
    fail(`${context} image dimensions must be 800x800.`);
  }
  if (product.image.productType !== archetype.key) {
    fail(`${context} image productType does not match archetype.`);
  }
  if (product.image.category !== archetype.category) {
    fail(`${context} image category does not match archetype category.`);
  }
  if (!archetype.images.includes(product.image.src)) {
    fail(`${context} primary image is not listed in its archetype manifest.`);
  }
  if (product.images[0] !== product.image.src) {
    fail(`${context} does not use the same primary image in product.images[0].`);
  }
  for (const src of product.images) {
    if (!src.startsWith("/") && !src.startsWith("https://")) {
      fail(`${context} has invalid image URL: ${src}`);
    }
    if (src.startsWith("/") && !localPathExists(src)) {
      fail(`${context} references missing local image: ${src}`);
    }
    if (src.startsWith("http://")) {
      fail(`${context} uses non-HTTPS remote image: ${src}`);
    }
  }
  if (!pathMatchesArchetype(product.categoryPath, archetype)) {
    fail(
      `${context} maps ${product.categoryPath.join("/")} to incompatible image archetype ${archetype.key}.`
    );
  }
  if (!product.name.toLowerCase().includes(archetype.label.toLowerCase())) {
    fail(`${context} name does not include archetype label "${archetype.label}".`);
  }

  imageUsage.set(product.image.src, (imageUsage.get(product.image.src) ?? 0) + 1);
}

for (const [src, count] of imageUsage.entries()) {
  if (count > 30) {
    warn(`${src} is used by ${count} products; verify this is intentional.`);
  }
}

const roots = new Set(catalog.products.map((product) => product.categoryPath[0]));

console.log(`Validated ${catalog.products.length} products.`);
console.log(`Validated ${archetypes.length} image archetypes.`);
console.log(`Category roots covered: ${Array.from(roots).sort().join(", ")}`);
console.log(`Unique primary product images: ${imageUsage.size}`);

if (warnings.length) {
  console.warn("Warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error("Image validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Product image validation passed.");
