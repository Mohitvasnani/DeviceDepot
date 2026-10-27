// Role permissions enforced at the HTTP layer, against the real app and a
// real (in-memory) database - this is the thing REVIEW.md item 1 found
// missing: endpoints that modified products/banners with no auth at all.
const request = require('supertest');
const app = require('../app');
const { createUser, createAdmin, createProduct } = require('./helpers');

describe('product/banner write endpoints are admin-only', () => {
  it('rejects addproduct with no token', async () => {
    const res = await request(app).post('/api/product/addproduct');
    expect(res.status).toBe(401);
  });

  it('rejects addproduct from an ordinary signed-in user', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/product/addproduct')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('rejects dltproduct from an ordinary user, but allows it for an admin', async () => {
    const { token: userToken } = await createUser();
    const { token: adminToken } = await createAdmin();
    const product = await createProduct();

    const asUser = await request(app)
      .delete(`/api/product/dltproduct/${product._id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(asUser.status).toBe(403);

    const asAdmin = await request(app)
      .delete(`/api/product/dltproduct/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(asAdmin.status).toBe(200);
  });

  it('rejects banner upload from an ordinary user with no token or wrong role', async () => {
    const noToken = await request(app).post('/api/banner/upload');
    expect(noToken.status).toBe(401);

    const { token } = await createUser();
    const asUser = await request(app)
      .post('/api/banner/upload')
      .set('Authorization', `Bearer ${token}`);
    expect(asUser.status).toBe(403);
  });

  it('allows a public, unauthenticated read of the catalogue', async () => {
    await createProduct({ name: 'Visible To Everyone' });
    const res = await request(app).get('/api/product/allproducts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
