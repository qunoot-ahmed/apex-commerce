import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "images");

const PALETTES = {
  shoes: [
    ["#1e3a5f", "#e11d48", "#f97316"],
    ["#0f172a", "#38bdf8", "#f43f5e"],
    ["#312e81", "#a78bfa", "#fb7185"],
    ["#134e4a", "#2dd4bf", "#fbbf24"],
  ],
  apparel: [
    ["#1f2937", "#6366f1", "#c084fc"],
    ["#3f3f46", "#f472b6", "#fda4af"],
    ["#1e293b", "#60a5fa", "#93c5fd"],
    ["#422006", "#f59e0b", "#fcd34d"],
  ],
  electronics: [
    ["#0f172a", "#3b82f6", "#60a5fa"],
    ["#111827", "#8b5cf6", "#a78bfa"],
    ["#172554", "#06b6d4", "#67e8f9"],
    ["#1e1b4b", "#6366f1", "#818cf8"],
  ],
  accessories: [
    ["#292524", "#a8a29e", "#d6d3d1"],
    ["#1c1917", "#78716c", "#f5f5f4"],
    ["#44403c", "#eab308", "#fde047"],
    ["#27272a", "#71717a", "#e4e4e7"],
  ],
  home: [
    ["#365314", "#84cc16", "#bef264"],
    ["#713f12", "#d97706", "#fcd34d"],
    ["#3f6212", "#65a30d", "#a3e635"],
    ["#451a03", "#ea580c", "#fdba74"],
  ],
  sports: [
    ["#14532d", "#22c55e", "#86efac"],
    ["#164e63", "#06b6d4", "#67e8f9"],
    ["#1e3a8a", "#2563eb", "#93c5fd"],
    ["#7c2d12", "#f97316", "#fdba74"],
  ],
  beauty: [
    ["#831843", "#ec4899", "#f9a8d4"],
    ["#701a75", "#d946ef", "#f0abfc"],
    ["#9d174d", "#f43f5e", "#fda4af"],
    ["#4a044e", "#c026d3", "#e879f9"],
  ],
  kids: [
    ["#1d4ed8", "#facc15", "#f472b6"],
    ["#15803d", "#fde047", "#38bdf8"],
    ["#c2410c", "#fbbf24", "#4ade80"],
    ["#7e22ce", "#fb7185", "#fbbf24"],
  ],
  default: [
    ["#111827", "#6b7280", "#d1d5db"],
    ["#1f2937", "#9ca3af", "#e5e7eb"],
    ["#374151", "#4b5563", "#f3f4f6"],
    ["#0f172a", "#64748b", "#cbd5e1"],
  ],
};

const SHAPES = {
  shoes: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <ellipse cx="400" cy="560" rx="280" ry="70" fill="${a}" opacity="0.35"/>
    <path d="M180 520 Q260 420 400 400 Q540 420 620 520 L580 580 Q400 620 220 580 Z" fill="${a}"/>
    <path d="M220 500 Q320 460 400 470 Q480 460 580 500" stroke="${b}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <circle cx="320" cy="490" r="18" fill="${b}"/>
  `,
  apparel: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <path d="M280 220 L320 180 H480 L520 220 L560 360 L400 760 L240 360 Z" fill="${a}"/>
    <path d="M320 180 Q400 260 480 180" stroke="${b}" stroke-width="10" fill="none"/>
    <rect x="360" y="300" width="80" height="180" rx="20" fill="${b}" opacity="0.5"/>
  `,
  electronics: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <rect x="180" y="220" width="440" height="300" rx="28" fill="${a}"/>
    <rect x="220" y="260" width="360" height="220" rx="12" fill="${b}" opacity="0.85"/>
    <circle cx="400" cy="620" r="90" fill="${a}"/>
    <rect x="340" y="560" width="120" height="24" rx="12" fill="${b}"/>
  `,
  accessories: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <rect x="250" y="240" width="300" height="360" rx="40" fill="${a}"/>
    <rect x="300" y="180" width="200" height="80" rx="20" fill="${b}"/>
    <circle cx="400" cy="420" r="60" fill="${b}" opacity="0.45"/>
  `,
  home: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <rect x="160" y="420" width="480" height="220" rx="16" fill="${a}"/>
    <rect x="220" y="300" width="140" height="120" rx="8" fill="${b}"/>
    <rect x="440" y="300" width="140" height="120" rx="8" fill="${b}" opacity="0.7"/>
    <polygon points="400,160 600,300 200,300" fill="${a}"/>
  `,
  sports: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <circle cx="400" cy="400" r="180" fill="none" stroke="${a}" stroke-width="28"/>
    <path d="M400 220 V580 M220 400 H580" stroke="${b}" stroke-width="16" stroke-linecap="round"/>
    <circle cx="400" cy="400" r="40" fill="${b}"/>
  `,
  beauty: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <rect x="340" y="200" width="120" height="420" rx="60" fill="${a}"/>
    <ellipse cx="400" cy="200" rx="90" ry="40" fill="${b}"/>
    <circle cx="280" cy="520" r="70" fill="${b}" opacity="0.55"/>
    <circle cx="520" cy="540" r="55" fill="${a}" opacity="0.55"/>
  `,
  kids: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <circle cx="300" cy="360" r="100" fill="${a}"/>
    <circle cx="500" cy="360" r="100" fill="${b}"/>
    <rect x="220" y="460" width="360" height="200" rx="100" fill="${a}" opacity="0.8"/>
    <polygon points="400,180 460,280 340,280" fill="${b}"/>
  `,
  default: ([bg, a, b]) => `
    <rect width="800" height="800" fill="${bg}"/>
    <rect x="200" y="260" width="400" height="320" rx="24" fill="${a}"/>
    <rect x="260" y="320" width="280" height="200" rx="12" fill="${b}" opacity="0.75"/>
  `,
};

function svg(label, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="${label}">
  ${inner}
  <text x="400" y="740" text-anchor="middle" fill="#ffffff" font-family="Segoe UI,Arial,sans-serif" font-size="28" font-weight="600" opacity="0.9">${label}</text>
</svg>`;
}

function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

ensureDir(join(OUT, "products"));
ensureDir(join(OUT, "categories"));
ensureDir(join(OUT, "brands"));

for (const [type, palettes] of Object.entries(PALETTES)) {
  const shape = SHAPES[type] ?? SHAPES.default;
  palettes.forEach((colors, i) => {
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    writeFileSync(
      join(OUT, "products", `${type}-${i + 1}.svg`),
      svg(label, shape(colors))
    );
  });
}

for (const type of Object.keys(PALETTES)) {
  if (type === "default") continue;
  const colors = PALETTES[type][0];
  const shape = SHAPES[type] ?? SHAPES.default;
  writeFileSync(
    join(OUT, "categories", `${type}.svg`),
    svg(type.charAt(0).toUpperCase() + type.slice(1), shape(colors))
  );
}

for (let i = 1; i <= 3; i++) {
  const colors = PALETTES.apparel[i - 1];
  writeFileSync(
    join(OUT, `editorial-${i}.svg`),
    svg("Editorial", SHAPES.apparel(colors))
  );
}

for (let i = 1; i <= 6; i++) {
  const colors = Object.values(PALETTES)[i % 8][0];
  writeFileSync(
    join(OUT, "brands", `badge-${i}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Brand">
      <rect width="120" height="120" rx="24" fill="${colors[0]}"/>
      <circle cx="60" cy="60" r="34" fill="${colors[1]}" opacity="0.85"/>
      <text x="60" y="68" text-anchor="middle" fill="#fff" font-family="Segoe UI,Arial,sans-serif" font-size="22" font-weight="700">BR</text>
    </svg>`
  );
}

writeFileSync(
  join(OUT, "og-default.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Apex Commerce">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827"/><stop offset="50%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient></defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <text x="600" y="300" fill="#fff" font-family="Segoe UI,Arial,sans-serif" font-size="72" font-weight="700" text-anchor="middle">Apex Commerce</text>
    <text x="600" y="370" fill="#e5e7eb" font-family="Segoe UI,Arial,sans-serif" font-size="28" text-anchor="middle">Premium shopping for every lifestyle</text>
  </svg>`
);

console.log("Generated local SVG images in public/images/");
