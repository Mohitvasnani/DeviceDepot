// One user can never read or act on another user's cart, likes, profile or
// orders, even by supplying their email/id directly - identity must come
// from the verified token. See REVIEW.md item 1.
const request = require('supertest');
const app = require('../app');
const { createUser, createProduct, addToCartDirect } = require('./helpers');

describe('cart is scoped to the signed-in user', () => {
  it('ignores a different email in the query string and returns the caller\'s own cart', async () => {
    const { user: userA, token: tokenA } = await createUser({ email: 'alice@example.com' });
    const { user: userB } = await createUser({ email: 'bob@example.com' });
    const product = await createProduct();
    await addToCartDirect(userA, product, 2);

    const res = await request(app)
      .get('/api/product/allcart')
      .query({ email: userB.email }) // attacker-controlled, must be ignored
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(String(userA._id));
    expect(res.body.items).toHaveLength(1);
  });

  it('a fresh user with no cart gets an empty cart, not someone else\'s', async () => {
    const { user: userA } = await createUser({ email: 'alice2@example.com' });
    const product = await createProduct();
    await addToCartDirect(userA, product, 1);

    const { token: tokenB } = await createUser({ email: 'bob2@example.com' });
    const res = await request(app)
      .get('/api/product/allcart')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });
});

describe('profile is scoped to the signed-in user', () => {
  it('lets a user read their own profile', async () => {
    const { user, token } = await createUser({ email: 'self@example.com' });
    const res = await request(app)
      .get(`/api/user/profile/${user.email}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('self@example.com');
    expect(res.body.password).toBeUndefined();
  });

  it('blocks a user from reading someone else\'s profile', async () => {
    const { user: victim } = await createUser({ email: 'victim@example.com' });
    const { token: attackerToken } = await createUser({ email: 'attacker@example.com' });

    const res = await request(app)
      .get(`/api/user/profile/${victim.email}`)
      .set('Authorization', `Bearer ${attackerToken}`);
    expect(res.status).toBe(403);
  });

  it('blocks a user from updating someone else\'s account fields', async () => {
    const { user: victim } = await createUser({ email: 'victim2@example.com' });
    const { token: attackerToken } = await createUser({ email: 'attacker2@example.com' });

    const res = await request(app)
      .put(`/api/user/updatedata/${victim._id}`)
      .set('Authorization', `Bearer ${attackerToken}`)
      .send({ name: 'Hacked Name' });
    expect(res.status).toBe(403);
  });

  it('never lets a self-update change role, even if sent', async () => {
    const { user, token } = await createUser({ email: 'selfupdate@example.com', role: 'user' });
    const res = await request(app)
      .put(`/api/user/updatedata/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name', role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('user'); // role field is not in the allowlist
    expect(res.body.user.name).toBe('New Name'); // allowed field did update
  });
});

describe('orders are scoped to the signed-in user', () => {
  it('allorders ignores any email in the body and returns only the caller\'s own orders', async () => {
    const { token } = await createUser({ email: 'orderowner@example.com' });
    const res = await request(app)
      .post('/api/orders/allorders')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'someoneelse@example.com' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
