/**
 * Diagnostic. Run from backend/:  node scripts/check.js
 * Prints what is wrong with the setup. Does not print any passwords or keys.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const net = require('net');
const mongoose = require('mongoose');

const ok = (s) => console.log('  OK   ' + s);
const bad = (s) => console.log('  FAIL ' + s);

function redact(uri) {
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//USER:****@');
}

function portInUse(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', (e) => resolve(e.code === 'EADDRINUSE'));
    srv.once('listening', () => srv.close(() => resolve(false)));
    srv.listen(port, '0.0.0.0');
  });
}

(async () => {
  console.log('\n=== ENV ===');
  const uri = process.env.MONGODB_URL;
  const port = process.env.PORT || 8080;

  if (!uri) {
    bad('MONGODB_URL is not set. Stopping.');
    process.exit(1);
  }
  ok('MONGODB_URL = ' + redact(uri));

  let dbFromUri = null;
  try {
    const afterHost = uri.split('mongodb+srv://')[1].split('/')[1] || '';
    dbFromUri = afterHost.split('?')[0] || null;
  } catch (_) {}
  if (dbFromUri) ok('database name in URL: ' + dbFromUri);
  else bad('NO database name in the URL. Mongoose will use "test".');

  console.log('  PORT =', port);
  for (const k of ['SECRET_KEY', 'CLOUDINARY_CLOUD_NAME', 'STRIPE_SECRET_KEY']) {
    process.env[k] ? ok(k + ' is set') : bad(k + ' is MISSING');
  }

  console.log('\n=== PORT ===');
  if (await portInUse(port)) {
    bad(`port ${port} is already in use by another process.`);
    console.log(`       find it:  netstat -ano | findstr :${port}`);
  } else {
    ok(`port ${port} is free, the server can bind to it`);
  }

  console.log('\n=== DATABASE ===');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    ok('connected, active database = ' + mongoose.connection.name);

    const client = mongoose.connection.getClient();
    const { databases } = await client.db().admin().listDatabases();
    const mine = databases.filter((d) => !['admin', 'local', 'config'].includes(d.name));

    if (!mine.length) {
      bad('this cluster has no user databases at all. Nothing has been written to it.');
    }

    for (const d of mine) {
      const cols = await client.db(d.name).listCollections().toArray();
      console.log(`\n  database: ${d.name}`);
      if (!cols.length) console.log('    (no collections)');
      for (const c of cols) {
        const n = await client.db(d.name).collection(c.name).countDocuments();
        console.log(`    ${c.name}: ${n} documents`);
      }
    }

    const live = mongoose.connection.name;
    const count = await client.db(live).collection('products').countDocuments();
    console.log('\n=== VERDICT ===');
    if (count === 18) {
      ok(`"${live}" has 18 products. The database is fine; the problem is the server or the frontend.`);
    } else if (count === 0) {
      bad(`"${live}" has 0 products. Run:  node scripts/seedProducts.js --wipe --admin`);
    } else {
      console.log(`  "${live}" has ${count} products (expected 18).`);
    }
  } catch (err) {
    bad('could not connect: ' + err.message);
    if (/bad auth|authentication failed/i.test(err.message))
      console.log('       -> wrong username or password in the connection string');
    else if (/ENOTFOUND|querySrv/i.test(err.message))
      console.log('       -> hostname is wrong, or no internet / DNS');
    else if (/timed out|ETIMEDOUT|ServerSelection/i.test(err.message))
      console.log('       -> your IP is not in Atlas Network Access. Add 0.0.0.0/0');
  }

  await mongoose.disconnect().catch(() => {});
  console.log('');
  process.exit(0);
})();
