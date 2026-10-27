// Runs once per test file, before any test in it, and after the file's own
// top-level requires have already pulled in app.js/controllers - so these
// env vars must be set at the TOP LEVEL here (not inside a hook) to exist
// before anything calls require('stripe')(...) or signs a JWT.
process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret-key-not-for-real-use';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_tests';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 60000);

// Isolate tests from each other without paying for a fresh server each time.
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}, 30000);
