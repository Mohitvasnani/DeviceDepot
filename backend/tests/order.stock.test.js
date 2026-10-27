// The checkout path end to end: payment must actually have succeeded, the
// charged amount must match the live cart total, stock is decremented
// atomically with rollback on partial failure, and the same payment can
// never produce two orders. See REVIEW.md item 2.
jest.mock('stripe', () => {
  const mockPaymentIntents = {
    create: jest.fn(),
    retrieve: jest.fn(),
  };
  const Stripe = jest.fn(() => ({ paymentIntents: mockPaymentIntents }));
  Stripe.__mockPaymentIntents = mockPaymentIntents;
  return Stripe;
});

const request = require('supertest');
const app = require('../app');
const ProductModel = require('../models/productModel');
const { createUser, createProduct, addToCartDirect } = require('./helpers');

const mockPaymentIntents = require('stripe').__mockPaymentIntents;

const succeededIntent = (overrides = {}) => ({
  id: 'pi_test_123',
  status: 'succeeded',
  currency: 'gbp',
  amount: 0,
  metadata: {},
  ...overrides,
});

describe('POST /api/orders/purchase', () => {
  it('requires a paymentIntentId', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/orders/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: 'somewhere' });
    expect(res.status).toBe(400);
  });

  it('rejects when the PaymentIntent has not succeeded', async () => {
    const { user, token } = await createUser();
    const product = await createProduct({ price: 10 });
    await addToCartDirect(user, product, 1);

    mockPaymentIntents.retrieve.mockResolvedValueOnce({ status: 'requires_payment_method' });

    const res = await request(app)
      .post('/api/orders/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: 'somewhere', paymentIntentId: 'pi_unpaid' });
    expect(res.status).toBe(402);
  });

  it('rejects when the charged amount does not match the live cart total', async () => {
    const { user, token } = await createUser();
    const product = await createProduct({ price: 10 }); // cart total = 1000p
    await addToCartDirect(user, product, 1);

    mockPaymentIntents.retrieve.mockResolvedValueOnce(
      succeededIntent({ amount: 500, metadata: { userId: String(user._id) } }) // paid for £5, cart is £10
    );

    const res = await request(app)
      .post('/api/orders/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: 'somewhere', paymentIntentId: 'pi_mismatch' });
    expect(res.status).toBe(409);
  });

  it('on success: creates the order with the right total, saves the paymentIntentId, decrements stock, and clears the cart', async () => {
    const { user, token } = await createUser();
    const product = await createProduct({ price: 25, quantity: 10 }); // cart total = 2 x £25 = £50 = 5000p
    await addToCartDirect(user, product, 2);

    mockPaymentIntents.retrieve.mockResolvedValueOnce(
      succeededIntent({ amount: 5000, metadata: { userId: String(user._id) } })
    );

    const res = await request(app)
      .post('/api/orders/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: '123 Test St', paymentIntentId: 'pi_ok' });

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(50);
    expect(res.body.paymentIntentId).toBe('pi_ok');
    expect(res.body.status).toBe('pending');

    const updatedProduct = await ProductModel.findById(product._id);
    expect(updatedProduct.quantity).toBe(8); // 10 - 2

    const cartRes = await request(app)
      .get('/api/product/allcart')
      .set('Authorization', `Bearer ${token}`);
    expect(cartRes.body.items ?? []).toEqual([]);
  });

  it('replaying the same paymentIntentId returns the existing order and does not decrement stock again', async () => {
    const { user, token } = await createUser();
    const product = await createProduct({ price: 10, quantity: 5 });
    await addToCartDirect(user, product, 1);

    mockPaymentIntents.retrieve.mockResolvedValue(
      succeededIntent({ amount: 1000, metadata: { userId: String(user._id) } })
    );

    const first = await request(app)
      .post('/api/orders/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: 'somewhere', paymentIntentId: 'pi_replay' });
    expect(first.status).toBe(201);
    const orderId = first.body._id;

    // Replay with no cart at all this time - still must not fail or double-process
    const second = await request(app)
      .post('/api/orders/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: 'somewhere', paymentIntentId: 'pi_replay' });
    expect(second.status).toBe(200);
    expect(second.body._id).toBe(orderId);

    const updatedProduct = await ProductModel.findById(product._id);
    expect(updatedProduct.quantity).toBe(4); // decremented once, not twice
  });

  it('rejects and rolls back stock when a later item in the cart is out of stock', async () => {
    const { user, token } = await createUser();
    const inStockProduct = await createProduct({ name: 'Has stock', price: 10, quantity: 5 });
    const outOfStockProduct = await createProduct({ name: 'No stock', price: 10, quantity: 0 });
    await addToCartDirect(user, inStockProduct, 1); // decremented first, then rolled back
    await addToCartDirect(user, outOfStockProduct, 1); // fails here

    mockPaymentIntents.retrieve.mockResolvedValueOnce(
      succeededIntent({ amount: 2000, metadata: { userId: String(user._id) } })
    );

    const res = await request(app)
      .post('/api/orders/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: 'somewhere', paymentIntentId: 'pi_oos' });

    expect(res.status).toBe(409);

    const refreshed = await ProductModel.findById(inStockProduct._id);
    expect(refreshed.quantity).toBe(5); // rolled back, not left at 4
  });
});
