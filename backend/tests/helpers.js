const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModels');
const ProductModel = require('../models/productModel');
const CartModel = require('../models/cartModel');

let counter = 0;
const unique = () => `${Date.now()}-${counter++}`;

// Creates a real user document (so ownership/role checks are exercised
// against an actual record, not a stub) and signs a token exactly the way
// userCtrl.userLogin does, so it is interchangeable with a real login.
const createUser = async ({ role = 'user', email, name = 'Test User' } = {}) => {
  const finalEmail = email || `user-${unique()}@example.com`;
  const passwordHash = await bcrypt.hash('password123', 4); // low cost factor - tests, not production
  const user = await UserModel.create({
    name,
    email: finalEmail,
    password: passwordHash,
    role,
  });
  const token = jwt.sign({ email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
  return { user, token };
};

const createAdmin = (overrides) => createUser({ ...overrides, role: 'admin' });

const createProduct = (overrides = {}) =>
  ProductModel.create({
    name: 'Test Product',
    rating: 4,
    description: 'A product used in tests.',
    quantity: 10,
    price: 100, // pounds
    categories: 'accessories',
    files: ['https://example.com/test.png'],
    ...overrides,
  });

// Adds a product straight into a user's cart, bypassing the HTTP layer -
// useful for tests that are about checkout/pricing, not about addcart.
const addToCartDirect = async (user, product, quantity = 1) => {
  let cart = await CartModel.findOne({ userId: user._id });
  if (!cart) {
    cart = new CartModel({ userId: user._id, items: [], file: '' });
  }
  cart.items.push({
    productId: product._id,
    name: product.name,
    description: product.description,
    price: String(product.price),
    quantity,
    file: product.files[0],
  });
  return cart.save();
};

module.exports = { createUser, createAdmin, createProduct, addToCartDirect };
