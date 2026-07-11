import { createWriteStream, mkdirSync, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifestPath = join(root, "src", "lib", "images", "product-image-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const SOURCE_PRODUCTS = {
  "running-shoe": [88, 90, 91],
  sneaker: [88, 90, 189],
  hoodie: [83, 86, 87],
  jacket: [83, 85, 87],
  "polo-shirt": [83, 86, 87],
  dress: [177, 180, 181],
  jeans: [177, 178, 180],
  backpack: [172, 173, 175],
  "baseball-cap": [144, 139, 146],
  "water-bottle": [137, 140, 151],
  "yoga-mat": [152, 140, 153],
  smartwatch: [106, 194, 100],
  "bluetooth-speaker": [99, 103, 107],
  "laptop-sleeve": [102, 108, 175],
  smartphone: [121, 122, 123],
  laptop: [78, 79, 80],
  tablet: [167, 168, 169],
  headphones: [100, 101, 107],
  television: [112, 66, 99],
  "accent-chair": [11, 12, 13],
  cookware: [52, 68, 71],
  "table-lamp": [47, 45, 46],
  skincare: [118, 119, 120],
  makeup: [1, 2, 4],
  fragrance: [6, 7, 8],
  toy: [162, 163, 165]
};

const LABEL_OVERRIDES = {
  hoodie: ["shirt", "Shirt product photo"],
  jacket: ["shirt", "Shirt product photo"],
  jeans: ["dress", "Dress product photo"],
  "baseball-cap": ["sports accessory", "Sports accessory product photo"],
  "water-bottle": ["sports accessory", "Sports accessory product photo"],
  "yoga-mat": ["sports accessory", "Sports accessory product photo"],
  "laptop-sleeve": ["mobile accessory", "Mobile accessory product photo"],
  television: ["electronics accessory", "Electronics accessory product photo"],
  "accent-chair": ["furniture", "Furniture product photo"],
  toy: ["kids clothing", "Kids clothing product photo"]
};

function download(url, destination, redirects = 0) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location &&
          redirects < 5
        ) {
          const nextUrl = new URL(response.headers.location, url).toString();
          response.resume();
          download(nextUrl, destination, redirects + 1).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }

        mkdirSync(dirname(destination), { recursive: true });
        const file = createWriteStream(destination);
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

async function productImageUrl(id) {
  const response = await fetch(`https://dummyjson.com/products/${id}`);
  if (!response.ok) throw new Error(`Unable to fetch product ${id}`);
  const product = await response.json();
  return product.images?.[0] ?? product.thumbnail;
}

let downloaded = 0;

for (const archetype of manifest.archetypes) {
  const ids = SOURCE_PRODUCTS[archetype.key];
  if (!ids) throw new Error(`Missing source products for ${archetype.key}`);

  const override = LABEL_OVERRIDES[archetype.key];
  if (override) {
    archetype.label = override[0];
    archetype.alt = override[1];
  }

  archetype.images = ids.map((_, index) => `/images/products/photos/${archetype.key}-${index + 1}.webp`);

  for (const [index, id] of ids.entries()) {
    const url = await productImageUrl(id);
    const destination = join(root, "public", archetype.images[index].replace(/^\//, ""));
    await download(url, destination);
    downloaded += 1;
  }
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Replaced product photo manifest with DummyJSON assets. Downloaded ${downloaded} files.`);
