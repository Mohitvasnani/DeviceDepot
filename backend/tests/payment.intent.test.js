// The amount sent to Stripe must come from the server-side cart, never from
// whatever the client puts in the request body. See REVIEW.md item 2.
jest.mock('stripe', () => {
  const mockPaymentIntents = {
    create: jest.fn().mockResolvedValue({ client_secret: 'secret_test' }),
    retrieve: jest.fn(),
  };
  const Stripe = jest.fn(() => ({ paymentIntents: mockPaymentIntents }));
  Stripe.__mockPaymentIntents = mockPaymentIntents;
  return Stripe;
});

const request = require('supertest');
const app = require('../app');
const { createUser, createProduct, addToCartDirect } = require('./helpers');

const mockPaymentIntents = require('stripe').__mockPaymentIntents;

describe('POST /api/payments/create-payment-intent', () => {
  it('computes the amount from the server-side cart, ignoring a client-sent amount', async () => {
    const { user, token } = await createUser();
    const product = await createProduct({ price: 20 }); // £20 cart
    await addToCartDirect(user, product, 1);

    const res = await request(app)
      .post('/api/payments/create-payment-intent')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1 }); // attacker-controlled, must be ignored

    expect(res.status).toBe(200);
    expect(mockPaymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2000, currency: 'gbp' })
    );
  });

  it('rejects when the cart is empty', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/payments/create-payment-intent')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/payments/create-payment-intent').send({ amount: 100 });
    expect(res.status).toBe(401);
  });
});
