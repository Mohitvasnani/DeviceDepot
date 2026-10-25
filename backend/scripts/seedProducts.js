/**
 * Seed the DeviceDepot database.
 *
 *   node scripts/seedProducts.js                    insert products, keep existing
 *   node scripts/seedProducts.js --wipe             delete all products first
 *   node scripts/seedProducts.js --admin            also create an admin user
 *   node scripts/seedProducts.js --wipe --admin     both (use this on a fresh cluster)
 *
 * Reads MONGODB_URL from backend/.env.
 *
 * Images: placeholder URLs by default, so the catalogue renders immediately on a
 * fresh cluster. Replace them with real Cloudinary URLs by re-uploading through
 * the admin "Add Products" screen, or by editing IMAGE_OVERRIDES below.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Product = require('../models/productModel');
const User = require('../models/userModels');

const WIPE = process.argv.includes('--wipe');
const MAKE_ADMIN = process.argv.includes('--admin');

const ADMIN = {
  name: process.env.SEED_ADMIN_NAME || 'Admin',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@devicedepot.test',
  phone: Number(process.env.SEED_ADMIN_PHONE || 7000000000),
  password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
};

// Map a product name to one or more real image URLs to override the placeholder.
// e.g. 'MacBook Air M3': ['https://res.cloudinary.com/<cloud>/image/upload/v1/devicedepot/mba-1.jpg']
const IMAGE_OVERRIDES = {};

const placeholder = (name, i = 1) =>
  `https://placehold.co/800x800/f1f3f5/212529/png?text=${encodeURIComponent(name)}+${i}`;

const images = (name, count = 2) =>
  IMAGE_OVERRIDES[name] || Array.from({ length: count }, (_, i) => placeholder(name, i + 1));

// categories must be exactly 'laptop', 'mobile' or 'accessories'.
// Anything else is invisible on the category pages.
const products = [
  {
    name: 'MacBook Air M3 13"',
    categories: 'laptop',
    price: 1099,
    rating: 5,
    quantity: 12,
    description:
      'Apple M3 chip with an 8-core CPU and 10-core GPU, 16GB unified memory and a 512GB SSD. Fanless, 1.24kg, and genuinely all-day battery.',
    feature1: 'Apple M3, 8-core CPU / 10-core GPU',
    feature2: '13.6" Liquid Retina, 500 nits',
    feature3: 'Up to 18 hours battery',
  },
  {
    name: 'Dell XPS 14',
    categories: 'laptop',
    price: 1649,
    rating: 4,
    quantity: 7,
    description:
      'Core Ultra 7 with RTX 4050 graphics in a 1.7kg CNC aluminium chassis. Aimed at developers who also want a usable GPU.',
    feature1: 'Intel Core Ultra 7 155H',
    feature2: 'RTX 4050 6GB, 32GB LPDDR5X',
    feature3: '14.5" 3K OLED touch, 120Hz',
  },
  {
    name: 'ThinkPad X1 Carbon Gen 12',
    categories: 'laptop',
    price: 1799,
    rating: 5,
    quantity: 5,
    description:
      'The business workhorse. 1.09kg carbon fibre, the best keyboard on any laptop, and Linux support that actually works out of the box.',
    feature1: 'Core Ultra 7, 32GB RAM',
    feature2: '14" 2.8K OLED, anti-glare',
    feature3: 'MIL-STD-810H tested, 1.09kg',
  },
  {
    name: 'ASUS ROG Zephyrus G16',
    categories: 'laptop',
    price: 2099,
    rating: 4,
    quantity: 4,
    description:
      'RTX 4070 gaming performance in a 1.85kg body you can carry to a lecture. 240Hz OLED panel with full DCI-P3 coverage.',
    feature1: 'RTX 4070 8GB, 165W TGP',
    feature2: '16" 2.5K OLED, 240Hz',
    feature3: '90Wh battery, USB-C charging',
  },
  {
    name: 'HP Pavilion 15',
    categories: 'laptop',
    price: 549,
    rating: 3,
    quantity: 20,
    description:
      'Budget all-rounder for coursework, browsing and light dev work. Ryzen 5, 16GB RAM and a 512GB SSD at an entry-level price.',
    feature1: 'AMD Ryzen 5 7530U',
    feature2: '16GB DDR4, 512GB NVMe',
    feature3: '15.6" FHD IPS, 250 nits',
  },
  {
    name: 'Framework Laptop 13',
    categories: 'laptop',
    price: 1249,
    rating: 4,
    quantity: 6,
    description:
      'Fully repairable and upgradeable. Swap the ports, replace the mainboard, change the screen. Every part has a QR code to a spare.',
    feature1: 'Core Ultra 5, user-replaceable',
    feature2: 'Swappable expansion cards',
    feature3: '13.5" 3:2 display, 2256x1504',
  },

  {
    name: 'iPhone 16 Pro',
    categories: 'mobile',
    price: 999,
    rating: 5,
    quantity: 15,
    description:
      'A18 Pro with a 48MP main sensor, 5x tetraprism telephoto and a titanium frame. ProMotion down to 1Hz for the always-on display.',
    feature1: 'A18 Pro, 8GB RAM',
    feature2: '48MP main + 5x telephoto',
    feature3: '6.3" ProMotion, 1-120Hz',
  },
  {
    name: 'Samsung Galaxy S25 Ultra',
    categories: 'mobile',
    price: 1249,
    rating: 5,
    quantity: 11,
    description:
      '200MP sensor, built-in S Pen and seven years of OS updates. The flattest, squarest Ultra yet with a titanium frame.',
    feature1: '200MP main, 5x periscope',
    feature2: '6.9" QHD+ AMOLED, 120Hz',
    feature3: 'S Pen included, 5000mAh',
  },
  {
    name: 'Google Pixel 9 Pro',
    categories: 'mobile',
    price: 899,
    rating: 4,
    quantity: 13,
    description:
      'Tensor G4 and the best computational photography in the business. Seven years of updates, and clean Android with no skin.',
    feature1: 'Tensor G4, 16GB RAM',
    feature2: '50MP main, 48MP 5x tele',
    feature3: '7 years of OS updates',
  },
  {
    name: 'OnePlus 13',
    categories: 'mobile',
    price: 899,
    rating: 4,
    quantity: 9,
    description:
      'Snapdragon 8 Elite with 100W wired charging that fills a 6000mAh battery in about 36 minutes. Flagship speed without flagship price.',
    feature1: 'Snapdragon 8 Elite',
    feature2: '6000mAh, 100W SuperVOOC',
    feature3: '6.82" LTPO AMOLED, 120Hz',
  },
  {
    name: 'Nothing Phone (3)',
    categories: 'mobile',
    price: 579,
    rating: 4,
    quantity: 14,
    description:
      'Transparent back with the Glyph LED interface. Nothing OS is the most opinionated Android skin going, in a good way.',
    feature1: 'Snapdragon 7s Gen 3',
    feature2: 'Glyph LED interface',
    feature3: '6.7" AMOLED, 120Hz',
  },
  {
    name: 'Xiaomi Redmi Note 14 Pro',
    categories: 'mobile',
    price: 299,
    rating: 4,
    quantity: 25,
    description:
      'Hard to beat under £300. 120Hz AMOLED, 5110mAh battery and a 200MP sensor, with the usual mid-range software compromises.',
    feature1: 'Dimensity 7300 Ultra',
    feature2: '200MP main camera',
    feature3: '5110mAh, 45W charging',
  },

  {
    name: 'Sony WH-1000XM6',
    categories: 'accessories',
    price: 399,
    rating: 5,
    quantity: 18,
    description:
      'Still the reference for noise cancelling over-ears. Thirty hours of battery, multipoint pairing and a folding hinge back again.',
    feature1: 'Industry-leading ANC',
    feature2: '30h battery, 3min quick charge',
    feature3: 'Bluetooth multipoint, LDAC',
  },
  {
    name: 'Keychron K2 Pro',
    categories: 'accessories',
    price: 109,
    rating: 5,
    quantity: 22,
    description:
      '75% hot-swappable mechanical keyboard, fully QMK/VIA programmable. Gasket mount, aluminium case, wired or Bluetooth.',
    feature1: 'Hot-swappable, QMK/VIA',
    feature2: '75% layout, gasket mount',
    feature3: 'Bluetooth 5.1 + USB-C',
  },
  {
    name: 'Logitech MX Master 3S',
    categories: 'accessories',
    price: 99,
    rating: 5,
    quantity: 30,
    description:
      'The mouse most developers end up with. MagSpeed scroll wheel, 8K DPI, quiet clicks and three device channels.',
    feature1: '8000 DPI, any-surface tracking',
    feature2: 'MagSpeed electromagnetic scroll',
    feature3: '70 days per charge, 3 devices',
  },
  {
    name: 'Anker 737 Power Bank',
    categories: 'accessories',
    price: 129,
    rating: 4,
    quantity: 26,
    description:
      '24,000mAh with 140W output, enough to fast-charge a MacBook Pro. Smart display shows exact wattage in and out.',
    feature1: '24,000mAh, 140W max output',
    feature2: 'Charges a 16" MacBook Pro',
    feature3: 'Digital wattage display',
  },
  {
    name: 'Samsung T7 Shield 2TB',
    categories: 'accessories',
    price: 159,
    rating: 4,
    quantity: 17,
    description:
      'Rugged portable SSD, 1050MB/s read, IP65 rated and drop-tested to 3m. Hardware AES-256 encryption.',
    feature1: '1050MB/s read, 1000MB/s write',
    feature2: 'IP65, 3m drop resistance',
    feature3: 'AES-256 hardware encryption',
  },
  {
    name: 'CalDigit TS4 Thunderbolt Dock',
    categories: 'accessories',
    price: 379,
    rating: 5,
    quantity: 8,
    description:
      'Eighteen ports and 98W host charging over a single Thunderbolt 4 cable. Drives two 6K displays. The one-cable desk setup.',
    feature1: '18 ports, 98W host charging',
    feature2: 'Dual 6K @ 60Hz support',
    feature3: '2.5GbE, SD 4.0, 3x TB4',
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

  const docs = products.map((p) => ({
    ...p,
    instock: p.quantity > 0,
    files: images(p.name),
  }));

  const inserted = await Product.insertMany(docs);
  console.log(`inserted ${inserted.length} products`);

  const counts = inserted.reduce((acc, p) => {
    acc[p.categories] = (acc[p.categories] || 0) + 1;
    return acc;
  }, {});
  console.log('  by category:', counts);

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
