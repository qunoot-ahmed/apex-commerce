import { createWriteStream, existsSync, mkdirSync } from "fs";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifestPath = join(root, "src", "lib", "images", "product-image-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const KEYWORDS = {
  "running-shoe": ["running-shoe", "sneaker", "product"],
  sneaker: ["sneaker", "shoe", "product"],
  hoodie: ["hoodie", "clothing", "product"],
  jacket: ["jacket", "clothing", "product"],
  "polo-shirt": ["polo-shirt", "clothing", "product"],
  dress: ["dress", "clothing", "product"],
  jeans: ["jeans", "denim", "product"],
  backpack: ["backpack", "bag", "product"],
  "baseball-cap": ["baseball-cap", "hat", "product"],
  "water-bottle": ["water-bottle", "product"],
  "yoga-mat": ["yoga-mat", "fitness", "product"],
  smartwatch: ["smartwatch", "watch", "product"],
  "bluetooth-speaker": ["bluetooth-speaker", "speaker", "product"],
  "laptop-sleeve": ["laptop-sleeve", "bag", "product"],
  smartphone: ["smartphone", "phone", "product"],
  laptop: ["laptop", "computer", "product"],
  tablet: ["tablet", "computer", "product"],
  headphones: ["headphones", "audio", "product"],
  television: ["television", "tv", "product"],
  "accent-chair": ["accent-chair", "furniture", "product"],
  cookware: ["cookware", "kitchen", "product"],
  "table-lamp": ["table-lamp", "lighting", "product"],
  skincare: ["skincare", "cosmetics", "product"],
  makeup: ["makeup", "cosmetics", "product"],
  fragrance: ["perfume", "fragrance", "product"],
  toy: ["toy", "children", "product"]
};

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function remoteUrl(key, variant) {
  const keywords = KEYWORDS[key] ?? ["product"];
  const lock = (hashString(`${key}-${variant}`) % 100000) + 1000;
  return `https://loremflickr.com/800/800/${keywords.join(",")}?lock=${lock}`;
}

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

        const contentType = response.headers["content-type"] ?? "";
        if (!String(contentType).startsWith("image/")) {
          response.resume();
          reject(new Error(`Non-image response for ${url}: ${contentType}`));
          return;
        }

        mkdirSync(dirname(destination), { recursive: true });
        const file = createWriteStream(destination);
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
        file.on("error", reject);
      })
      .on("error", reject);
  });
}

let downloaded = 0;
let skipped = 0;

for (const archetype of manifest.archetypes) {
  for (const [index, imagePath] of archetype.images.entries()) {
    const destination = join(root, "public", imagePath.replace(/^\//, ""));
    if (existsSync(destination)) {
      skipped += 1;
      continue;
    }
    const url = remoteUrl(archetype.key, index + 1);
    await download(url, destination);
    downloaded += 1;
    console.log(`Downloaded ${imagePath}`);
  }
}

console.log(`Product photos ready. Downloaded ${downloaded}, skipped ${skipped}.`);
