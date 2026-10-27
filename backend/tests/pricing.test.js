// Server-authoritative pricing: the total must come from live product
// prices in the database, not from anything a client sends. See
// REVIEW.md item 2 and utils/pricing.js.
const { toPence, computeCartTotalPence } = require('../utils/pricing');
const { createUser, createProduct, addToCartDirect } = require('./helpers');

describe('toPence', () => {
  it('converts pounds to integer pence, rounding correctly', () => {
    expect(toPence(9.99)).toBe(999);
    expect(toPence(10)).toBe(1000);
    expect(toPence(0.1)).toBe(10);
  });
});

describe('computeCartTotalPence', () => {
  it('sums live product prices x quantity, ignoring the cart\'s denormalised price copy', async () => {
    const { user } = await createUser();
    const product = await createProduct({ price: 50 }); // £50
    await addToCartDirect(user, product, 3); // 3 x £50 = £150

    const { totalPence } = await computeCartTotalPence(user._id);
    expect(totalPence).toBe(15000);
  });

  it('reflects the product\'s CURRENT price even if the cart has a stale denormalised one', async () => {
    const { user } = await createUser();
    const product = await createProduct({ price: 100 });
    await addToCartDirect(user, product, 1);

    // Price changes after it was added to the cart (cart item still says "100" as a string)
    product.price = 200;
    await product.save();

    const { totalPence } = await computeCartTotalPence(user._id);
    expect(totalPence).toBe(20000); // uses the live £200, not the stale £100
  });

  it('throws for an empty cart', async () => {
    const { user } = await createUser();
    await expect(computeCartTotalPence(user._id)).rejects.toThrow('Cart is empty');
  });

  it('throws if a cart item references a deleted product', async () => {
    const { user } = await createUser();
    const product = await createProduct();
    await addToCartDirect(user, product, 1);
    await product.deleteOne();

    await expect(computeCartTotalPence(user._id)).rejects.toThrow('no longer exists');
  });
});
