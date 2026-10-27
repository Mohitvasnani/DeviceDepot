// Server-authoritative pricing. Never trust a client-sent total - always
// recompute from the user's own cart and the product's live price.
//
// Product.price is a Number in pounds. Everything here works in integer
// pence, because that is what Stripe wants and because adding floats is
// how you get a checkout that's a penny off.
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');

const toPence = (pounds) => Math.round(Number(pounds) * 100);

/**
 * Loads the given user's cart, re-prices every line against the live
 * Product documents (ignoring whatever price was denormalised onto the
 * cart item when it was added), and returns the authoritative total.
 *
 * Throws a descriptive Error if there is no cart, the cart is empty, or a
 * product referenced by the cart no longer exists.
 */
const computeCartTotalPence = async (userId) => {
    const cart = await cartModel.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    let totalPence = 0;
    for (const item of cart.items) {
        const product = item.productId;
        if (!product) {
            throw new Error('A product in the cart no longer exists');
        }
        const quantity = Number(item.quantity) || 0;
        if (quantity <= 0) {
            throw new Error('Invalid quantity in cart');
        }
        totalPence += toPence(product.price) * quantity;
    }

    return { cart, totalPence };
};

module.exports = { toPence, computeCartTotalPence };
