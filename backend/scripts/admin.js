/**
 * User and admin management from the command line.
 * Run from backend/.
 *
 *   node scripts/admin.js list
 *   node scripts/admin.js whoami <email>
 *   node scripts/admin.js create <email> <password> [name] [phone]
 *   node scripts/admin.js promote <email>
 *   node scripts/admin.js demote <email>
 *   node scripts/admin.js password <email> <newPassword>
 *   node scripts/admin.js delete <email>
 *
 * "create" makes an admin by default. Add --user for a normal account.
 * Use this instead of editing documents in Compass.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModels');

const [, , command, ...args] = process.argv;
const asUser = process.argv.includes('--user');

const USAGE = `
DeviceDepot user management

  node scripts/admin.js list
  node scripts/admin.js whoami    <email>
  node scripts/admin.js create    <email> <password> [name] [phone]   [--user]
  node scripts/admin.js promote   <email>
  node scripts/admin.js demote    <email>
  node scripts/admin.js password  <email> <newPassword>
  node scripts/admin.js delete    <email>
  node scripts/admin.js fix-indexes
`;

const need = (n, what) => {
  if (args.filter((a) => !a.startsWith('--')).length < n) {
    console.error(`Missing argument: ${what}`);
    console.error(USAGE);
    process.exit(1);
  }
};

const find = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No user with email ${email}. Run "list" to see who exists.`);
    process.exit(1);
  }
  return user;
};

const commands = {
  async list() {
    const users = await User.find({}).select('name email phone role admin').lean();
    if (!users.length) {
      console.log('No users yet. Create one:');
      console.log('  node scripts/admin.js create you@example.com YourPassword123');
      return;
    }
    const pad = (s, n) => String(s ?? '').padEnd(n);
    console.log('');
    console.log(pad('ROLE', 7) + pad('EMAIL', 34) + pad('NAME', 20) + 'PHONE');
    console.log('-'.repeat(78));
    for (const u of users) {
      console.log(pad(u.role || 'user', 7) + pad(u.email, 34) + pad(u.name, 20) + (u.phone ?? ''));
    }
    console.log(`\n${users.length} user(s)`);
  },

  async whoami() {
    need(1, '<email>');
    const u = await find(args[0]);
    console.log({ name: u.name, email: u.email, phone: u.phone, role: u.role, admin: u.admin, id: u._id.toString() });
  },

  async create() {
    need(2, '<email> <password>');
    const [email, password, name, phone] = args;

    if (await User.findOne({ email })) {
      console.error(`${email} already exists. To change its password:`);
      console.error(`  node scripts/admin.js password ${email} <newPassword>`);
      process.exit(1);
    }

    const role = asUser ? 'user' : 'admin';
    await User.create({
      name: name || email.split('@')[0],
      email,
      phone: Number(phone) || Math.floor(7000000000 + Math.random() * 999999999),
      password: await bcrypt.hash(password, 10),
      role,
      admin: role === 'admin',
    });
    console.log(`Created ${role}: ${email}`);
  },

  async promote() {
    need(1, '<email>');
    const u = await find(args[0]);
    if (u.role === 'admin') return console.log(`${u.email} is already an admin.`);
    u.role = 'admin';
    u.admin = true;
    await u.save();
    console.log(`${u.email} is now an admin. Log out and back in, the role is baked into the token.`);
  },

  async demote() {
    need(1, '<email>');
    const u = await find(args[0]);
    u.role = 'user';
    u.admin = false;
    await u.save();
    console.log(`${u.email} is now a normal user.`);
  },

  async password() {
    need(2, '<email> <newPassword>');
    const [email, newPassword] = args;
    const u = await find(email);
    u.password = await bcrypt.hash(newPassword, 10);
    await u.save();
    console.log(`Password updated for ${email}.`);
  },

  async delete() {
    need(1, '<email>');
    const u = await find(args[0]);
    await User.deleteOne({ _id: u._id });
    console.log(`Deleted ${u.email}.`);
  },

  // Changing a schema does not change an index that already exists in Mongo.
  // The phone index was created unique but not sparse, which made every
  // account without a phone number collide on null. This drops it so
  // Mongoose can rebuild it from the current schema.
  async 'fix-indexes'() {
    const collection = User.collection;
    const indexes = await collection.indexes();
    const phone = indexes.find((i) => i.key && i.key.phone === 1);

    if (!phone) {
      console.log('No phone index found, nothing to drop.');
    } else if (phone.sparse) {
      console.log('Phone index is already sparse, nothing to do.');
    } else {
      await collection.dropIndex(phone.name);
      console.log(`Dropped non-sparse index "${phone.name}".`);
    }

    await User.syncIndexes();
    console.log('Indexes rebuilt from the schema:');
    for (const i of await collection.indexes()) {
      console.log(`  ${i.name}  unique=${Boolean(i.unique)}  sparse=${Boolean(i.sparse)}`);
    }
  },
};

(async () => {
  if (!command || !commands[command]) {
    console.log(USAGE);
    process.exit(command ? 1 : 0);
  }
  if (!process.env.MONGODB_URL) {
    console.error('MONGODB_URL is not set in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URL);
  try {
    await commands[command]();
  } finally {
    await mongoose.disconnect();
  }
})().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
