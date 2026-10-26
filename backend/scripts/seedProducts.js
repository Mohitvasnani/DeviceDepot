/**
 * Seed the DeviceDepot database.
 *
 *   node scripts/seedProducts.js                    insert products, keep existing
 *   node scripts/seedProducts.js --wipe             delete all products first
 *   node scripts/seedProducts.js --admin            also create an admin user
 *   node scripts/seedProducts.js --wipe --admin     both (use this on a fresh cluster)
 *   node scripts/seedProducts.js --placeholders     ignore local images, use placehold.co
 *
 * Reads MONGODB_URL from backend/.env.
 *
 * IMAGES
 * Each product points at site-project/public/products/<slug>-1.svg and so on,
 * served by Vite in development and by Vercel in production. `images` is how
 * many files exist for that product. If a file is missing the frontend's
 * onError handler falls back to a placeholder, so a partly filled folder
 * still renders.
 *
 * CATALOGUE
 * Aerlite, Kestrix and Halden are invented brands, and so is every product.
 * The artwork in public/products/ is drawn to match, by
 * site-project/scripts/make-product-art.mjs. Nothing here is a real device,
 * which keeps the names and the pictures telling the same story.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Product = require('../models/productModel');
const User = require('../models/userModels');

const WIPE = process.argv.includes('--wipe');
const MAKE_ADMIN = process.argv.includes('--admin');
const FORCE_PLACEHOLDERS = process.argv.includes('--placeholders');

const ADMIN = {
  name: process.env.SEED_ADMIN_NAME || 'Admin',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@devicedepot.test',
  phone: Number(process.env.SEED_ADMIN_PHONE || 7000000000),
  password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
};

const placeholder = (name, i) =>
  `https://placehold.co/800x600/f3f4f6/6b737d/png?text=${encodeURIComponent(name)}+${i}`;

const filesFor = (p) =>
  FORCE_PLACEHOLDERS
    ? Array.from({ length: 2 }, (_, i) => placeholder(p.name, i + 1))
    : Array.from({ length: p.images || 1 }, (_, i) => `/products/${p.slug}-${i + 1}.svg`);

// categories must be exactly 'laptop', 'mobile' or 'accessories'.
// Anything else is invisible on the category pages.
const products = [

  // ------------------------------------------------- Aerlite, laptops
  {
    slug: 'aerlite-slate-13',
    name: 'Aerlite Slate 13',
    categories: 'laptop',
    price: 999,
    rating: 5,
    quantity: 12,
    images: 1,
    description:
      'A fanless ultraportable at 1.2kg that still runs a full development stack. Silent under load, and the battery genuinely lasts a working day.',
    feature1: '8-core processor, 16GB memory',
    feature2: '13.3" 2.5K matte, 500 nits',
    feature3: 'Fanless, 1.2kg, 18h battery',
  },
  {
    slug: 'aerlite-slate-15',
    name: 'Aerlite Slate 15',
    categories: 'laptop',
    price: 1149,
    rating: 4,
    quantity: 9,
    images: 1,
    description:
      'The Slate with room to work. Same silent design and a larger panel, with a second memory slot for people who keep too many windows open.',
    feature1: '8-core processor, 32GB memory',
    feature2: '15.3" 2.8K matte, 500 nits',
    feature3: 'Upgradeable memory and storage',
  },
  {
    slug: 'aerlite-slate-mini',
    name: 'Aerlite Slate Mini',
    categories: 'laptop',
    price: 849,
    rating: 4,
    quantity: 15,
    images: 1,
    description:
      'The smallest machine Aerlite makes. Under a kilogram, fits a small bag, and still has a full-size keyboard rather than a cramped one.',
    feature1: '6-core processor, 16GB memory',
    feature2: '12.4" 2K matte',
    feature3: '0.98kg, 16h battery',
  },
  {
    slug: 'aerlite-carbon-14',
    name: 'Aerlite Carbon 14',
    categories: 'laptop',
    price: 1599,
    rating: 5,
    quantity: 6,
    images: 1,
    description:
      'Carbon fibre lid, a keyboard with real travel, and a chassis tested to military shock standards. Built for opening on a train every day.',
    feature1: '12-core processor, 32GB memory',
    feature2: '14" 2.8K OLED, anti-glare',
    feature3: 'Carbon fibre, 1.09kg',
  },
  {
    slug: 'aerlite-studio-16',
    name: 'Aerlite Studio 16',
    categories: 'laptop',
    price: 2099,
    rating: 5,
    quantity: 5,
    images: 1,
    description:
      'A colour-accurate panel and enough sustained power to render without throttling. Aimed at editors rather than gamers, though it handles both.',
    feature1: '12-core processor, 64GB memory',
    feature2: '16" 4K OLED, 100% DCI-P3',
    feature3: 'Colour calibrated at the factory',
  },
  {
    slug: 'aerlite-forge-16',
    name: 'Aerlite Forge 16',
    categories: 'laptop',
    price: 1899,
    rating: 4,
    quantity: 4,
    images: 1,
    description:
      'Desktop-class graphics in something you can still carry. The 240Hz OLED covers the full DCI-P3 range, so it grades as happily as it games.',
    feature1: 'Discrete 8GB graphics, 140W',
    feature2: '16" 2.5K OLED, 240Hz',
    feature3: '90Wh battery, USB-C charging',
  },
  {
    slug: 'aerlite-forge-18',
    name: 'Aerlite Forge 18',
    categories: 'laptop',
    price: 2399,
    rating: 4,
    quantity: 3,
    images: 1,
    description:
      'The big one. A vapour chamber and twin fans keep the graphics at full power indefinitely, at the cost of any pretence of portability.',
    feature1: 'Discrete 12GB graphics, 175W',
    feature2: '18" 2.5K Mini LED, 240Hz',
    feature3: 'Vapour chamber cooling, 3.1kg',
  },
  {
    slug: 'aerlite-field-15',
    name: 'Aerlite Field 15',
    categories: 'laptop',
    price: 549,
    rating: 3,
    quantity: 22,
    images: 1,
    description:
      'The sensible one. Coursework, browsing and light development without paying flagship money, in a case that survives being thrown in a bag.',
    feature1: '6-core processor, 16GB memory',
    feature2: '15.6" FHD IPS, 250 nits',
    feature3: '512GB SSD, spill-resistant',
  },
  {
    slug: 'aerlite-field-14',
    name: 'Aerlite Field 14',
    categories: 'laptop',
    price: 479,
    rating: 3,
    quantity: 26,
    images: 1,
    description:
      'The cheapest machine here that is still worth owning. Slower than the rest and honest about it, but it boots fast and runs cool.',
    feature1: '4-core processor, 8GB memory',
    feature2: '14" FHD IPS',
    feature3: '256GB SSD, 1.4kg',
  },
  {
    slug: 'aerlite-modular-13',
    name: 'Aerlite Modular 13',
    categories: 'laptop',
    price: 1249,
    rating: 4,
    quantity: 7,
    images: 1,
    description:
      'Designed to be opened. Swap the ports, replace the mainboard, change the screen. Every component is a part you can order on its own.',
    feature1: '10-core processor, user-serviceable',
    feature2: 'Swappable USB-C port cards',
    feature3: '13.5" 3:2, 2256 x 1504',
  },
  {
    slug: 'aerlite-flip-14',
    name: 'Aerlite Flip 14',
    categories: 'laptop',
    price: 1099,
    rating: 4,
    quantity: 8,
    images: 1,
    description:
      'A convertible that folds flat into a tablet. The hinge holds any angle, and the pen clips magnetically to the side rather than rolling off the desk.',
    feature1: '10-core processor, 16GB memory',
    feature2: '14" 2.8K touch, 360 degree hinge',
    feature3: 'Pen included, magnetic dock',
  },
  {
    slug: 'aerlite-canvas-12',
    name: 'Aerlite Canvas 12',
    categories: 'laptop',
    price: 899,
    rating: 4,
    quantity: 11,
    images: 1,
    description:
      'A detachable tablet with a proper keyboard cover. Light enough to read on, capable enough to answer email and edit a document on.',
    feature1: '8-core processor, 12GB memory',
    feature2: '12.3" 2K touch, 120Hz',
    feature3: 'Keyboard cover included',
  },

  // ------------------------------------------------- Kestrix, phones
  {
    slug: 'kestrix-pulse-9',
    name: 'Kestrix Pulse 9',
    categories: 'mobile',
    price: 749,
    rating: 4,
    quantity: 16,
    images: 1,
    description:
      'The everyday flagship. A 120Hz panel that drops to 1Hz when nothing moves, seven years of updates, and a camera that forgives a shaky hand.',
    feature1: '50MP main, 12MP ultrawide',
    feature2: '6.3" LTPO AMOLED, 1-120Hz',
    feature3: '7 years of OS updates',
  },
  {
    slug: 'kestrix-pulse-9-pro',
    name: 'Kestrix Pulse 9 Pro',
    categories: 'mobile',
    price: 1049,
    rating: 5,
    quantity: 10,
    images: 1,
    description:
      'The Pulse with the telephoto. A 5x periscope lens, a titanium frame and the fastest silicon Kestrix makes, for people who use the long end.',
    feature1: '50MP main, 5x periscope',
    feature2: '6.8" LTPO AMOLED, 1-120Hz',
    feature3: 'Titanium frame, 5200mAh',
  },
  {
    slug: 'kestrix-pulse-8',
    name: 'Kestrix Pulse 8',
    categories: 'mobile',
    price: 549,
    rating: 4,
    quantity: 21,
    images: 1,
    description:
      'Last year\'s flagship at this year\'s price. Slower to charge and one camera short, but the panel and the build are unchanged.',
    feature1: '50MP main, 12MP ultrawide',
    feature2: '6.3" AMOLED, 120Hz',
    feature3: '5 years of OS updates',
  },
  {
    slug: 'kestrix-vista-8',
    name: 'Kestrix Vista 8',
    categories: 'mobile',
    price: 849,
    rating: 4,
    quantity: 12,
    images: 1,
    description:
      'Built around the camera. A 200MP sensor with pixel binning that holds detail in poor light, and manual controls deeper than anything at the price.',
    feature1: '200MP main, pixel binning',
    feature2: 'Full manual camera controls',
    feature3: '6.7" AMOLED, 120Hz',
  },
  {
    slug: 'kestrix-vista-8-pro',
    name: 'Kestrix Vista 8 Pro',
    categories: 'mobile',
    price: 1099,
    rating: 5,
    quantity: 7,
    images: 1,
    description:
      'The Vista with a second sensor and a faster lens. Shoots raw to a 1TB internal drive, which is the part photographers actually care about.',
    feature1: '200MP main, 48MP 3x telephoto',
    feature2: '10-bit raw capture, 1TB storage',
    feature3: '6.9" AMOLED, 120Hz',
  },
  {
    slug: 'kestrix-edge-7',
    name: 'Kestrix Edge 7',
    categories: 'mobile',
    price: 599,
    rating: 4,
    quantity: 18,
    images: 1,
    description:
      'Charges from flat to full in about half an hour. A 6000mAh cell and 100W wired charging, so the battery stops being something you think about.',
    feature1: '6000mAh, 100W wired',
    feature2: 'Full charge in roughly 30 min',
    feature3: '6.8" AMOLED, 120Hz',
  },
  {
    slug: 'kestrix-edge-7-plus',
    name: 'Kestrix Edge 7 Plus',
    categories: 'mobile',
    price: 699,
    rating: 4,
    quantity: 13,
    images: 1,
    description:
      'The Edge with a bigger cell and wireless charging added. Two days of normal use, three if you are careful with the screen.',
    feature1: '6800mAh, 120W wired, 50W wireless',
    feature2: 'Two-day battery under normal use',
    feature3: '6.9" AMOLED, 120Hz',
  },
  {
    slug: 'kestrix-lumen',
    name: 'Kestrix Lumen',
    categories: 'mobile',
    price: 679,
    rating: 4,
    quantity: 14,
    images: 1,
    description:
      'The one that looks like nothing else. A translucent back, a light strip that handles notifications without waking the screen, and a deliberately plain interface.',
    feature1: 'Translucent back panel',
    feature2: 'Notification light strip',
    feature3: '6.7" AMOLED, 120Hz',
  },
  {
    slug: 'kestrix-lumen-lite',
    name: 'Kestrix Lumen Lite',
    categories: 'mobile',
    price: 429,
    rating: 4,
    quantity: 20,
    images: 1,
    description:
      'The Lumen design at half the price. Same translucent back and light strip, a slower chip, and a camera that is fine rather than good.',
    feature1: 'Translucent back panel',
    feature2: 'Notification light strip',
    feature3: '6.6" AMOLED, 120Hz',
  },
  {
    slug: 'kestrix-core-6',
    name: 'Kestrix Core 6',
    categories: 'mobile',
    price: 279,
    rating: 4,
    quantity: 30,
    images: 1,
    description:
      'Hard to argue with under £300. A 120Hz AMOLED panel and a two-day battery, with the mid-range compromises you expect and none you do not.',
    feature1: '8-core processor, 8GB memory',
    feature2: '5110mAh, 45W charging',
    feature3: '6.6" AMOLED, 120Hz',
  },
  {
    slug: 'kestrix-core-6-plus',
    name: 'Kestrix Core 6 Plus',
    categories: 'mobile',
    price: 329,
    rating: 4,
    quantity: 24,
    images: 1,
    description:
      'The Core with more memory and storage. The same honest, unexciting phone, with enough room to stop deleting photos every month.',
    feature1: '8-core processor, 12GB memory',
    feature2: '256GB storage, 45W charging',
    feature3: '6.7" AMOLED, 120Hz',
  },
  {
    slug: 'kestrix-slate-pad',
    name: 'Kestrix Slate Pad',
    categories: 'mobile',
    price: 499,
    rating: 4,
    quantity: 10,
    images: 1,
    description:
      'A tablet that does not pretend to be a laptop. Good for reading, drawing and video, with speakers that are better than they need to be.',
    feature1: '11" 2.2K LCD, 120Hz',
    feature2: 'Quad speakers, Dolby tuned',
    feature3: '8000mAh, pen supported',
  },

  // ------------------------------------------------- Halden, accessories
  {
    slug: 'halden-drift-anc',
    name: 'Halden Drift ANC',
    categories: 'accessories',
    price: 329,
    rating: 5,
    quantity: 20,
    images: 1,
    description:
      'Over-ear noise cancelling that holds up on a long flight. Thirty hours a charge, pairs with two devices at once, and the hinge folds flat.',
    feature1: 'Adaptive noise cancelling',
    feature2: '30h battery, 3min quick charge',
    feature3: 'Bluetooth multipoint, folds flat',
  },
  {
    slug: 'halden-drift-studio',
    name: 'Halden Drift Studio',
    categories: 'accessories',
    price: 249,
    rating: 4,
    quantity: 16,
    images: 1,
    description:
      'Open-back wired headphones for mixing, not commuting. No noise cancelling, no battery, and a soundstage the sealed pair cannot match.',
    feature1: 'Open-back, 250 ohm',
    feature2: 'Wired 3.5mm and 6.35mm',
    feature3: 'Replaceable pads and cable',
  },
  {
    slug: 'halden-micro-buds',
    name: 'Halden Micro Buds',
    categories: 'accessories',
    price: 149,
    rating: 4,
    quantity: 28,
    images: 1,
    description:
      'Earbuds small enough to forget you are wearing. Eight hours in the bud, thirty in the case, and a fit test that tells you if the seal is wrong.',
    feature1: '8h buds, 30h with case',
    feature2: 'Adaptive noise cancelling',
    feature3: 'IPX4, wireless charging case',
  },
  {
    slug: 'halden-tactile-75',
    name: 'Halden Tactile 75',
    categories: 'accessories',
    price: 109,
    rating: 5,
    quantity: 24,
    images: 1,
    description:
      'A 75% mechanical board with hot-swappable switches and a gasket mount, so you can change how it feels without soldering anything.',
    feature1: 'Hot-swappable switches',
    feature2: '75% layout, gasket mount',
    feature3: 'Bluetooth and USB-C',
  },
  {
    slug: 'halden-tactile-65',
    name: 'Halden Tactile 65',
    categories: 'accessories',
    price: 89,
    rating: 4,
    quantity: 27,
    images: 1,
    description:
      'The Tactile with the function row removed. Smaller desk footprint, same switches and the same gasket mount.',
    feature1: 'Hot-swappable switches',
    feature2: '65% layout, gasket mount',
    feature3: 'Bluetooth and USB-C',
  },
  {
    slug: 'halden-glide-pro',
    name: 'Halden Glide Pro',
    categories: 'accessories',
    price: 89,
    rating: 5,
    quantity: 32,
    images: 1,
    description:
      'A mouse shaped for eight-hour days. Near-silent clicks, a wheel that free-spins through long files, and three devices on a button.',
    feature1: '8000 DPI, tracks on glass',
    feature2: 'Free-spin scroll wheel',
    feature3: '70 days per charge, 3 devices',
  },
  {
    slug: 'halden-reserve-24',
    name: 'Halden Reserve 24',
    categories: 'accessories',
    price: 109,
    rating: 4,
    quantity: 26,
    images: 1,
    description:
      '24,000mAh with 140W output, enough to fast-charge a 16-inch laptop rather than trickle it. The display shows exactly what is going in and out.',
    feature1: '24,000mAh, 140W output',
    feature2: 'Charges a 16" laptop',
    feature3: 'Live wattage display',
  },
  {
    slug: 'halden-vault-2tb',
    name: 'Halden Vault 2TB',
    categories: 'accessories',
    price: 139,
    rating: 4,
    quantity: 19,
    images: 1,
    description:
      'A portable SSD built to be carried badly. 1050MB/s reads, rated against dust and water, and tested to survive a three metre drop.',
    feature1: '1050MB/s read, 1000MB/s write',
    feature2: 'IP65, 3m drop tested',
    feature3: 'AES-256 hardware encryption',
  },
  {
    slug: 'halden-hub-18',
    name: 'Halden Hub 18',
    categories: 'accessories',
    price: 299,
    rating: 5,
    quantity: 11,
    images: 1,
    description:
      'Eighteen ports and 98W of charging down one cable, driving two 6K displays. The dock that turns a laptop into a desk setup.',
    feature1: '18 ports, 98W host charging',
    feature2: 'Dual 6K at 60Hz',
    feature3: '2.5GbE, SD 4.0, 3 x USB-C',
  },
  {
    slug: 'halden-view-27',
    name: 'Halden View 27',
    categories: 'accessories',
    price: 449,
    rating: 5,
    quantity: 9,
    images: 1,
    description:
      'A 27-inch 4K panel that arrives calibrated, with a single USB-C cable carrying video, data and 90W of charge to the laptop.',
    feature1: '27" 4K IPS, 99% sRGB',
    feature2: 'USB-C with 90W passthrough',
    feature3: 'Height, tilt and pivot stand',
  },
  {
    slug: 'halden-track-watch',
    name: 'Halden Track Watch',
    categories: 'accessories',
    price: 199,
    rating: 4,
    quantity: 23,
    images: 1,
    description:
      'A fitness watch with a week of battery instead of a day. Tracks the usual metrics, and the screen stays readable in direct sun.',
    feature1: '7-day battery, always-on display',
    feature2: 'GPS, heart rate, sleep tracking',
    feature3: '5ATM water resistance',
  },
  {
    slug: 'halden-frame-cam',
    name: 'Halden Frame Cam',
    categories: 'accessories',
    price: 129,
    rating: 4,
    quantity: 21,
    images: 1,
    description:
      'A 4K webcam that handles a badly lit room. Auto-framing keeps you centred when you move, and the privacy shutter is physical.',
    feature1: '4K 30fps, 1080p 60fps',
    feature2: 'Auto-framing and light correction',
    feature3: 'Physical privacy shutter',
  },
];

async function main() {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error('MONGODB_URL is not set in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`connected to ${mongoose.connection.name}`);

  if (WIPE) {
    const { deletedCount } = await Product.deleteMany({});
    console.log(`wiped ${deletedCount} existing products`);
  }

  const docs = products.map(({ slug, images, ...p }) => ({
    ...p,
    instock: p.quantity > 0,
    files: filesFor({ slug, images, name: p.name }),
  }));

  const inserted = await Product.insertMany(docs);
  console.log(`inserted ${inserted.length} products`);

  const counts = inserted.reduce((acc, p) => {
    acc[p.categories] = (acc[p.categories] || 0) + 1;
    return acc;
  }, {});
  console.log('  by category:', counts);
  console.log(
    FORCE_PLACEHOLDERS
      ? '  images: placehold.co'
      : '  images: /products/<slug>-N.svg from site-project/public/products/'
  );

  if (MAKE_ADMIN) {
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      existing.role = 'admin';
      existing.admin = true;
      await existing.save();
      console.log(`promoted existing user ${ADMIN.email} to admin`);
    } else {
      await User.create({
        name: ADMIN.name,
        email: ADMIN.email,
        phone: ADMIN.phone,
        password: await bcrypt.hash(ADMIN.password, 10),
        role: 'admin',
        admin: true,
      });
      console.log(`created admin ${ADMIN.email} / ${ADMIN.password}`);
      console.log('  change this password after first login');
    }
  }

  await mongoose.disconnect();
  console.log('done');
}

main().catch(async (err) => {
  console.error('seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
