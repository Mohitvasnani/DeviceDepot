/**
 * Generates the product artwork for the catalogue.
 *
 *   node scripts/make-product-art.mjs
 *
 * Writes one SVG per product into public/products/. The catalogue is
 * fictional, so the artwork is drawn rather than photographed: flat device
 * illustrations in the site's own palette, which keeps the grid consistent
 * in a way mixed stock photography never is.
 *
 * Re-run after editing SHAPES or PRODUCTS. Output is deterministic.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'products');

// Palette, matching src/index.css
const INK = '#141412';
const SLATE = '#3f3e38';
const LINE = '#d7d4ca';
const WELL = '#f3f1ea';
const PAPER = '#ffffff';
const SIGNAL = '#f5ce2e';

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img">\n` +
  `  <rect width="800" height="600" fill="${WELL}"/>\n${body}</svg>\n`;

/* ---------------------------------------------------------------- shapes */

const laptop = ({ body, screen, accent, thick = false }) => {
  const baseY = thick ? 408 : 400;
  const h = thick ? 26 : 18;
  return `
  <rect x="190" y="150" width="420" height="258" rx="10" fill="${body}"/>
  <rect x="204" y="164" width="392" height="216" rx="4" fill="${screen}"/>
  <rect x="228" y="192" width="150" height="10" rx="5" fill="${accent}" opacity="0.9"/>
  <rect x="228" y="214" width="250" height="7" rx="3.5" fill="${PAPER}" opacity="0.28"/>
  <rect x="228" y="232" width="200" height="7" rx="3.5" fill="${PAPER}" opacity="0.18"/>
  <rect x="228" y="250" width="226" height="7" rx="3.5" fill="${PAPER}" opacity="0.18"/>
  <circle cx="400" cy="158" r="3" fill="${PAPER}" opacity="0.4"/>
  <rect x="150" y="${baseY}" width="500" height="${h}" rx="${h / 2}" fill="${body}"/>
  <rect x="352" y="${baseY + h - 4}" width="96" height="6" rx="3" fill="${INK}" opacity="0.25"/>
  ${thick ? `<rect x="214" y="${baseY + 6}" width="60" height="5" rx="2.5" fill="${accent}" opacity="0.8"/>
  <rect x="526" y="${baseY + 6}" width="60" height="5" rx="2.5" fill="${accent}" opacity="0.8"/>` : ''}`;
};

const phone = ({ body, screen, accent, island = 'pill' }) => `
  <rect x="312" y="96" width="176" height="408" rx="30" fill="${body}"/>
  <rect x="324" y="108" width="152" height="384" rx="22" fill="${screen}"/>
  ${
    island === 'pill'
      ? `<rect x="372" y="124" width="56" height="14" rx="7" fill="${body}"/>`
      : `<circle cx="400" cy="131" r="7" fill="${body}"/>`
  }
  <rect x="346" y="172" width="80" height="9" rx="4.5" fill="${accent}" opacity="0.9"/>
  <rect x="346" y="196" width="108" height="7" rx="3.5" fill="${PAPER}" opacity="0.22"/>
  <rect x="346" y="214" width="84" height="7" rx="3.5" fill="${PAPER}" opacity="0.14"/>
  <rect x="346" y="264" width="108" height="64" rx="8" fill="${PAPER}" opacity="0.08"/>
  <rect x="346" y="342" width="108" height="64" rx="8" fill="${PAPER}" opacity="0.08"/>
  <rect x="340" y="408" width="120" height="30" rx="8" fill="${accent}" opacity="0.85"/>
  <rect x="300" y="168" width="6" height="42" rx="3" fill="${body}"/>
  <rect x="494" y="150" width="6" height="28" rx="3" fill="${body}"/>`;

const headphones = ({ body, accent }) => `
  <path d="M248 346 V272 a152 152 0 0 1 304 0 V346" fill="none" stroke="${body}" stroke-width="28" stroke-linecap="round"/>
  <path d="M286 264 a114 114 0 0 1 228 0" fill="none" stroke="${PAPER}" stroke-width="10" stroke-linecap="round" opacity="0.14"/>
  <rect x="204" y="312" width="96" height="148" rx="36" fill="${body}"/>
  <rect x="500" y="312" width="96" height="148" rx="36" fill="${body}"/>
  <rect x="220" y="330" width="64" height="112" rx="28" fill="${accent}" opacity="0.92"/>
  <rect x="516" y="330" width="64" height="112" rx="28" fill="${accent}" opacity="0.92"/>
  <rect x="236" y="348" width="32" height="76" rx="16" fill="${INK}" opacity="0.18"/>
  <rect x="532" y="348" width="32" height="76" rx="16" fill="${INK}" opacity="0.18"/>`;

const keyboard = ({ body, accent }) => {
  let keys = '';
  const cols = 14;
  const rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wide = r === 4 && c > 3 && c < 10;
      if (r === 4 && c > 4 && c < 10) continue;
      const x = 168 + c * 34;
      const y = 212 + r * 34;
      const w = wide ? 34 * 6 - 6 : 28;
      const isAccent = (r === 0 && c === 13) || (r === 2 && c === 0);
      keys += `  <rect x="${x}" y="${y}" width="${w}" height="28" rx="4" fill="${isAccent ? accent : PAPER}" opacity="${isAccent ? 1 : 0.92}"/>\n`;
    }
  }
  return `
  <rect x="150" y="194" width="500" height="212" rx="14" fill="${body}"/>
${keys}`;
};

const mouse = ({ body, accent }) => `
  <path d="M400 118 c80 0 122 64 122 154 v92 c0 88-54 134-122 134 s-122-46-122-134 v-92 c0-90 42-154 122-154 z" fill="${body}"/>
  <path d="M400 118 c-62 0-98 42-112 104 a118 118 0 0 0 -4 26 h108 z" fill="${PAPER}" opacity="0.09"/>
  <path d="M400 118 c62 0 98 42 112 104 a118 118 0 0 1 4 26 h-108 z" fill="${PAPER}" opacity="0.05"/>
  <path d="M400 118 V248" stroke="${INK}" stroke-width="3" opacity="0.35"/>
  <path d="M284 248 h232" stroke="${INK}" stroke-width="3" opacity="0.25"/>
  <rect x="391" y="166" width="18" height="58" rx="9" fill="${accent}"/>
  <rect x="396" y="178" width="8" height="34" rx="4" fill="${INK}" opacity="0.3"/>
  <rect x="268" y="300" width="14" height="56" rx="7" fill="${INK}" opacity="0.3"/>`;

const powerBank = ({ body, accent }) => `
  <rect x="262" y="128" width="276" height="344" rx="22" fill="${body}"/>
  <rect x="294" y="168" width="212" height="92" rx="10" fill="${INK}"/>
  <text x="400" y="230" font-family="DejaVu Sans, Arial, sans-serif" font-size="54" font-weight="700" fill="${accent}" text-anchor="middle">140W</text>
  <rect x="294" y="296" width="212" height="8" rx="4" fill="${PAPER}" opacity="0.16"/>
  <rect x="310" y="402" width="52" height="22" rx="6" fill="${INK}" opacity="0.55"/>
  <rect x="374" y="402" width="52" height="22" rx="6" fill="${INK}" opacity="0.55"/>
  <rect x="438" y="402" width="52" height="22" rx="6" fill="${INK}" opacity="0.55"/>`;

const ssd = ({ body, accent }) => `
  <rect x="222" y="206" width="356" height="212" rx="24" fill="${body}"/>
  <rect x="252" y="236" width="296" height="152" rx="14" fill="${PAPER}" opacity="0.07"/>
  <rect x="282" y="276" width="104" height="12" rx="6" fill="${accent}"/>
  <rect x="282" y="302" width="150" height="9" rx="4.5" fill="${PAPER}" opacity="0.22"/>
  <rect x="282" y="322" width="118" height="9" rx="4.5" fill="${PAPER}" opacity="0.14"/>
  <rect x="566" y="296" width="20" height="32" rx="5" fill="${INK}"/>
  <circle cx="520" cy="356" r="7" fill="${accent}" opacity="0.8"/>`;

const dock = ({ body, accent }) => {
  let ports = '';
  for (let i = 0; i < 7; i++) {
    ports += `  <rect x="${216 + i * 54}" y="270" width="34" height="16" rx="4" fill="${INK}" opacity="0.6"/>\n`;
  }
  for (let i = 0; i < 5; i++) {
    ports += `  <rect x="${244 + i * 66}" y="322" width="44" height="20" rx="5" fill="${INK}" opacity="0.45"/>\n`;
  }
  return `
  <rect x="180" y="214" width="440" height="172" rx="18" fill="${body}"/>
${ports}  <rect x="180" y="214" width="440" height="6" rx="3" fill="${accent}"/>`;
};


const tablet = ({ body, screen, accent }) => `
  <rect x="214" y="124" width="372" height="352" rx="22" fill="${body}"/>
  <rect x="230" y="140" width="340" height="320" rx="12" fill="${screen}"/>
  <rect x="258" y="176" width="120" height="11" rx="5.5" fill="${accent}" opacity="0.9"/>
  <rect x="258" y="204" width="210" height="8" rx="4" fill="${PAPER}" opacity="0.2"/>
  <rect x="258" y="248" width="130" height="92" rx="8" fill="${PAPER}" opacity="0.08"/>
  <rect x="402" y="248" width="130" height="92" rx="8" fill="${PAPER}" opacity="0.08"/>
  <rect x="258" y="360" width="274" height="64" rx="8" fill="${PAPER}" opacity="0.06"/>
  <rect x="470" y="492" width="116" height="12" rx="6" fill="${body}" opacity="0.6"/>`;

const earbuds = ({ body, accent }) => `
  <rect x="286" y="268" width="228" height="148" rx="40" fill="${body}"/>
  <path d="M286 318 h228" stroke="${INK}" stroke-width="3" opacity="0.3"/>
  <circle cx="400" cy="396" r="9" fill="${accent}"/>
  <g>
    <circle cx="256" cy="212" r="42" fill="${body}"/>
    <rect x="240" y="236" width="32" height="74" rx="16" fill="${body}"/>
    <circle cx="256" cy="212" r="18" fill="${accent}" opacity="0.9"/>
  </g>
  <g>
    <circle cx="544" cy="212" r="42" fill="${body}"/>
    <rect x="528" y="236" width="32" height="74" rx="16" fill="${body}"/>
    <circle cx="544" cy="212" r="18" fill="${accent}" opacity="0.9"/>
  </g>`;

const watch = ({ body, screen, accent }) => `
  <rect x="344" y="88" width="112" height="112" rx="34" fill="${body}" opacity="0.75"/>
  <rect x="344" y="400" width="112" height="112" rx="34" fill="${body}" opacity="0.75"/>
  <rect x="306" y="178" width="188" height="244" rx="48" fill="${body}"/>
  <rect x="322" y="194" width="156" height="212" rx="38" fill="${screen}"/>
  <text x="400" y="288" font-family="DejaVu Sans, Arial, sans-serif" font-size="52" font-weight="700" fill="${PAPER}" text-anchor="middle">9:41</text>
  <rect x="348" y="312" width="104" height="8" rx="4" fill="${accent}"/>
  <rect x="494" y="236" width="12" height="44" rx="6" fill="${body}"/>`;

const monitor = ({ body, screen, accent }) => `
  <rect x="128" y="122" width="544" height="312" rx="14" fill="${body}"/>
  <rect x="144" y="138" width="512" height="268" rx="6" fill="${screen}"/>
  <rect x="176" y="176" width="170" height="12" rx="6" fill="${accent}" opacity="0.9"/>
  <rect x="176" y="206" width="300" height="8" rx="4" fill="${PAPER}" opacity="0.2"/>
  <rect x="176" y="228" width="240" height="8" rx="4" fill="${PAPER}" opacity="0.13"/>
  <rect x="176" y="272" width="200" height="100" rx="8" fill="${PAPER}" opacity="0.07"/>
  <rect x="400" y="272" width="224" height="100" rx="8" fill="${PAPER}" opacity="0.07"/>
  <rect x="368" y="434" width="64" height="54" fill="${body}"/>
  <rect x="294" y="488" width="212" height="18" rx="9" fill="${body}"/>`;

const speaker = ({ body, accent }) => `
  <rect x="300" y="110" width="200" height="380" rx="48" fill="${body}"/>
  <circle cx="400" cy="226" r="62" fill="${INK}" opacity="0.45"/>
  <circle cx="400" cy="226" r="26" fill="${accent}" opacity="0.85"/>
  <circle cx="400" cy="372" r="44" fill="${INK}" opacity="0.35"/>
  <rect x="344" y="446" width="112" height="8" rx="4" fill="${PAPER}" opacity="0.2"/>`;

const webcam = ({ body, accent }) => `
  <rect x="268" y="206" width="264" height="152" rx="60" fill="${body}"/>
  <circle cx="400" cy="282" r="58" fill="${INK}"/>
  <circle cx="400" cy="282" r="34" fill="${SLATE}"/>
  <circle cx="400" cy="282" r="15" fill="${accent}"/>
  <circle cx="486" cy="250" r="8" fill="${accent}" opacity="0.7"/>
  <path d="M300 358 v52 h200 v-52" fill="none" stroke="${body}" stroke-width="22" stroke-linejoin="round"/>`;

const charger = ({ body, accent }) => `
  <rect x="286" y="188" width="228" height="228" rx="40" fill="${body}"/>
  <rect x="322" y="236" width="156" height="60" rx="10" fill="${INK}" opacity="0.5"/>
  <text x="400" y="280" font-family="DejaVu Sans, Arial, sans-serif" font-size="38" font-weight="700" fill="${accent}" text-anchor="middle">100W</text>
  <rect x="330" y="334" width="60" height="22" rx="6" fill="${INK}" opacity="0.5"/>
  <rect x="410" y="334" width="60" height="22" rx="6" fill="${INK}" opacity="0.5"/>
  <rect x="352" y="140" width="22" height="52" rx="6" fill="${SLATE}"/>
  <rect x="426" y="140" width="22" height="52" rx="6" fill="${SLATE}"/>`;

const stand = ({ body, accent }) => `
  <path d="M190 400 L400 236 L610 400" fill="none" stroke="${body}" stroke-width="30" stroke-linejoin="round" stroke-linecap="round"/>
  <rect x="268" y="226" width="264" height="26" rx="13" fill="${accent}"/>
  <rect x="170" y="400" width="140" height="22" rx="11" fill="${body}"/>
  <rect x="490" y="400" width="140" height="22" rx="11" fill="${body}"/>`;

const SHAPES = { laptop, phone, tablet, headphones, earbuds, watch, monitor, speaker,
  webcam, charger, stand, keyboard, mouse, powerBank, ssd, dock };

/* -------------------------------------------------------------- products */

const PRODUCTS = [
  // Aerlite, laptops
  { slug: 'aerlite-slate-13',    shape: 'laptop', body: '#c6c3b9', screen: '#1f2429', accent: SIGNAL },
  { slug: 'aerlite-slate-15',    shape: 'laptop', body: '#b0ada3', screen: '#1b1f24', accent: '#6fb7d6' },
  { slug: 'aerlite-carbon-14',   shape: 'laptop', body: '#2a2926', screen: '#0f1216', accent: '#e05a4a' },
  { slug: 'aerlite-forge-16',    shape: 'laptop', body: '#1c1b18', screen: '#0d1014', accent: '#7ee081', thick: true },
  { slug: 'aerlite-forge-18',    shape: 'laptop', body: '#141412', screen: '#0b0e11', accent: '#e05a4a', thick: true },
  { slug: 'aerlite-field-15',    shape: 'laptop', body: '#86837a', screen: '#23282e', accent: '#b9a0e0' },
  { slug: 'aerlite-field-14',    shape: 'laptop', body: '#7c7a72', screen: '#20252b', accent: '#6fb7d6' },
  { slug: 'aerlite-modular-13',  shape: 'laptop', body: '#d8d5cc', screen: '#1f2429', accent: '#ff8a3d' },
  { slug: 'aerlite-studio-16',   shape: 'laptop', body: '#3f3e38', screen: '#13171c', accent: '#f0c674' },
  { slug: 'aerlite-slate-mini',  shape: 'laptop', body: '#e7e4db', screen: '#262b31', accent: '#7ee081' },
  { slug: 'aerlite-flip-14',     shape: 'tablet', body: '#b0ada3', screen: '#1b1f24', accent: SIGNAL },
  { slug: 'aerlite-canvas-12',   shape: 'tablet', body: '#2a2926', screen: '#101418', accent: '#b9a0e0' },

  // Kestrix, phones
  { slug: 'kestrix-pulse-9',     shape: 'phone', body: '#3f3e38', screen: '#111419', accent: SIGNAL,     island: 'pill' },
  { slug: 'kestrix-pulse-9-pro', shape: 'phone', body: '#1c1b18', screen: '#0c0f13', accent: '#6fb7d6', island: 'pill' },
  { slug: 'kestrix-pulse-8',     shape: 'phone', body: '#5c5a53', screen: '#13171c', accent: '#f0c674', island: 'pill' },
  { slug: 'kestrix-vista-8',     shape: 'phone', body: '#86837a', screen: '#14181d', accent: '#7ee081', island: 'dot' },
  { slug: 'kestrix-vista-8-pro', shape: 'phone', body: '#706e66', screen: '#11151a', accent: '#e05a4a', island: 'dot' },
  { slug: 'kestrix-edge-7',      shape: 'phone', body: '#2a2926', screen: '#0f1216', accent: '#e05a4a', island: 'dot' },
  { slug: 'kestrix-edge-7-plus', shape: 'phone', body: '#23221e', screen: '#0d1115', accent: '#ff8a3d', island: 'dot' },
  { slug: 'kestrix-lumen',       shape: 'phone', body: '#d8d5cc', screen: '#171b20', accent: '#b9a0e0', island: 'pill' },
  { slug: 'kestrix-lumen-lite',  shape: 'phone', body: '#e7e4db', screen: '#1b2026', accent: '#6fb7d6', island: 'pill' },
  { slug: 'kestrix-core-6',      shape: 'phone', body: '#5c5a53', screen: '#13171c', accent: '#ff8a3d', island: 'dot' },
  { slug: 'kestrix-core-6-plus', shape: 'phone', body: '#4c4a44', screen: '#12161b', accent: '#7ee081', island: 'dot' },
  { slug: 'kestrix-slate-pad',   shape: 'tablet', body: '#3f3e38', screen: '#0f1317', accent: SIGNAL },

  // Halden, accessories
  { slug: 'halden-drift-anc',    shape: 'headphones', body: '#2a2926', accent: SIGNAL },
  { slug: 'halden-drift-studio', shape: 'headphones', body: '#86837a', accent: '#e05a4a' },
  { slug: 'halden-micro-buds',   shape: 'earbuds',    body: '#3f3e38', accent: SIGNAL },
  { slug: 'halden-tactile-75',   shape: 'keyboard',   body: '#3f3e38', accent: SIGNAL },
  { slug: 'halden-tactile-65',   shape: 'keyboard',   body: '#2a2926', accent: '#6fb7d6' },
  { slug: 'halden-glide-pro',    shape: 'mouse',      body: '#2a2926', accent: SIGNAL },
  { slug: 'halden-reserve-24',   shape: 'powerBank',  body: '#3f3e38', accent: SIGNAL },
  { slug: 'halden-vault-2tb',    shape: 'ssd',        body: '#2a2926', accent: SIGNAL },
  { slug: 'halden-hub-18',       shape: 'dock',       body: '#3f3e38', accent: SIGNAL },
  { slug: 'halden-view-27',      shape: 'monitor',    body: '#2a2926', screen: '#101418', accent: SIGNAL },
  { slug: 'halden-track-watch',  shape: 'watch',      body: '#3f3e38', screen: '#0f1317', accent: SIGNAL },
  { slug: 'halden-frame-cam',    shape: 'webcam',     body: '#2a2926', accent: SIGNAL },
];

mkdirSync(OUT, { recursive: true });

for (const p of PRODUCTS) {
  const draw = SHAPES[p.shape];
  if (!draw) throw new Error(`Unknown shape "${p.shape}" for ${p.slug}`);
  writeFileSync(join(OUT, `${p.slug}-1.svg`), svg(draw(p)));
}

console.log(`Wrote ${PRODUCTS.length} SVGs to public/products/`);

/* ----------------------------------------------------- about page panels */

const ABOUT = {
  delivery: `
  <rect width="800" height="600" fill="${INK}"/>
  <rect x="150" y="250" width="330" height="190" rx="14" fill="${PAPER}" opacity="0.92"/>
  <rect x="480" y="300" width="170" height="140" rx="14" fill="${PAPER}" opacity="0.72"/>
  <rect x="500" y="320" width="90" height="60" rx="8" fill="${INK}" opacity="0.25"/>
  <circle cx="242" cy="462" r="40" fill="${SLATE}"/><circle cx="242" cy="462" r="17" fill="${PAPER}"/>
  <circle cx="568" cy="462" r="40" fill="${SLATE}"/><circle cx="568" cy="462" r="17" fill="${PAPER}"/>
  <rect x="150" y="250" width="330" height="20" rx="6" fill="${SIGNAL}"/>
  <path d="M60 330 h70 M40 376 h90 M70 422 h60" stroke="${SIGNAL}" stroke-width="10" stroke-linecap="round" opacity="0.75"/>
  <text x="400" y="150" font-family="DejaVu Sans, Arial, sans-serif" font-size="46" font-weight="700" fill="${PAPER}" text-anchor="middle">Next-day delivery</text>`,

  quality: `
  <rect width="800" height="600" fill="${INK}"/>
  <path d="M400 200 l150 62 v110 c0 92-64 150-150 178 c-86-28-150-86-150-178 V262 z" fill="${PAPER}" opacity="0.1"/>
  <path d="M400 200 l150 62 v110 c0 92-64 150-150 178 c-86-28-150-86-150-178 V262 z" fill="none" stroke="${SIGNAL}" stroke-width="8"/>
  <path d="M332 372 l46 48 96 -104" fill="none" stroke="${SIGNAL}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="400" y="150" font-family="DejaVu Sans, Arial, sans-serif" font-size="46" font-weight="700" fill="${PAPER}" text-anchor="middle">Two-year warranty</text>`,

  secure: `
  <rect width="800" height="600" fill="${INK}"/>
  <rect x="268" y="296" width="264" height="196" rx="18" fill="${PAPER}" opacity="0.1"/>
  <rect x="268" y="296" width="264" height="196" rx="18" fill="none" stroke="${SIGNAL}" stroke-width="8"/>
  <path d="M330 296 v-50 a70 70 0 0 1 140 0 v50" fill="none" stroke="${SIGNAL}" stroke-width="18" stroke-linecap="round"/>
  <circle cx="400" cy="378" r="22" fill="${SIGNAL}"/>
  <rect x="390" y="394" width="20" height="54" rx="10" fill="${SIGNAL}"/>
  <text x="400" y="150" font-family="DejaVu Sans, Arial, sans-serif" font-size="46" font-weight="700" fill="${PAPER}" text-anchor="middle">Secure checkout</text>`,
};

const ABOUT_OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'about');
mkdirSync(ABOUT_OUT, { recursive: true });
for (const [name, body] of Object.entries(ABOUT)) {
  writeFileSync(join(ABOUT_OUT, `${name}.svg`), svg(body));
}
console.log(`Wrote ${Object.keys(ABOUT).length} SVGs to public/about/`);
