const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');
const likedModel = require('../models/likedModel');
const userModel = require('../models/userModels');
const IMG_BASE_URL = 'http://localhost:8080/';

const addProduct = (req, res) => {
    const { name, rating, description, quantity, price, categories } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'File is not provided' });
    }

    const fileUrls = req.files.map(file => IMG_BASE_URL + file.filename);

    productModel.create({
        name,
        rating,
        description,
        quantity,
        price,
        categories,
        files: fileUrls
    })
    .then(createdProduct => {
        res.json({ success: true, product: createdProduct });
    })
    .catch(err => {
        console.error('Error adding product:', err);
        res.status(500).json({ error: 'Failed to add product', details: err.message });
    });
};
const getAllProduct = (req, res) => {
    productModel.find({})
    .then(products => {
        res.json(products);
    })
    .catch(error => {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
};

const dltProducts = (req, res) => {
    const productId = req.params.id;
    productModel.findByIdAndDelete(productId)
    .then(deletedProduct => {
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log(`Product deleted: ${productId}`);
        res.json({ success: true, message: `Product ${productId} deleted successfully` });
    })
    .catch(err => {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Failed to delete product', details: err.message });
    });
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = req.body;

        // Validate required fields
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // Check if a new file is uploaded
        if (req.file) {
            updates.file = IMG_BASE_URL + req.file.filename;
        }

        // Find and update product
        const updatedProduct = await productModel.findByIdAndUpdate(
            productId,
            updates,
            { new: true, runValidators: true }
        );

        // If product not found
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Success response
        res.json({ success: true, product: updatedProduct });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product', details: err.message });
    }
};


const Cart = require('../models/cartModel');

const removeItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { 'items._id': itemId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    ).populate('items.productId');

    if (!updatedCart) {
      return res.status(404).json({ error: 'Cart not found or item not in cart' });
    }

    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart', details: error.message });
  }
};





const addToCart = async (req, res) => {
    try {
        const { productId, email } = req.body;

        // Find the product
        const foundProduct = await productModel.findById(productId);
        if (!foundProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find the user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find or create the cart for the user
        let cart = await cartModel.findOne({ userId: user._id });
        if (!cart) {
            cart = new cartModel({ userId: user._id, emailId: user.email, items: [], file: "" });
        }

        // Add the product to the cart
        cart.items.push({
            productId: productId,
            name: foundProduct.name,
            description: foundProduct.description,
            price: foundProduct.price,
            quantity: 1,
            file: foundProduct.files[0]
        });

        // Save the cart
        const savedCart = await cart.save();

        res.json({ success: true, cart: savedCart });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Failed to add to cart', details: err.message });
    }
};

const viewCarts = async (req, res) => {
    try {
        const { email } = req.query;

        // Find the user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the cart for the user
        const cart = await cartModel.findOne({ userId: user._id }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};





const incrementQuantity = async (req, res) => {
    try {
        const cartId = req.params.id;
        const cart = await cartModel.findOneAndUpdate(
            { "items._id": cartId },
            { $inc: { "items.$.quantity": 1 } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ success: true, cart });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

const decrementQuantity = async (req, res) => {
    try {
        const cartId = req.params.id;
        const cart = await cartModel.findOne({ "items._id": cartId });

        if (!cart) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const item = cart.items.id(cartId);
        if (item.quantity <= 1) {
            return res.json({ error: 'Cannot decrease' });
        }

        item.quantity -= 1;
        await cart.save();

        res.json({ success: true, cart });
    } catch (err) {
        console.error('Error decreasing quantity:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

// const removeFromCart = async (req, res) => {
    //     try {
    //         const { productId, email } = req.body;
    
    //         // Validate inputs
    //         if (!productId || !email) {
    //             return res.status(400).json({ error: 'Missing productId or email in request body' });
    //         }
    
    //         // Find the user
    //         const user = await userModel.findOne({ email });
    //         if (!user) {
    //             return res.status(404).json({ error: 'User not found' });
    //         }
    
    //         // Find the cart for the user
    //         const cart = await cartModel.findOne({ userId: user._id });
    //         if (!cart) {
    //             return res.status(404).json({ error: 'Cart not found' });
    //         }
    
    //         // Find the index of the item to be removed
    //         const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    //         if (itemIndex === -1) {
    //             return res.status(404).json({ error: 'Item not found in cart' });
    //         }
    
    //         // Remove the item from the cart
    //         cart.items.splice(itemIndex, 1);
    
    //         // Save the updated cart
    //         const savedCart = await cart.save();
    
    //         res.json({ success: true, cart: savedCart });
    //     } catch (err) {
    //         console.error('Error removing from cart:', err);
    //         res.status(500).json({ error: 'Failed to remove from cart', details: err.message });
    //     }
    // };
    // // const dltCart = async (req, res) => {
    // //     try {
    // //         const cartId = req.params.id;
    
    // //         // Find and delete the cart item
    // //         const cart = await cartModel.findOneAndUpdate(
    // //             { 'items._id': cartId },
    // //             { $pull: { items: { _id: cartId } } },
    // //             { new: true }
    // //         );
    
    // //         if (!cart) {
    // //             return res.status(404).json({ error: 'Item not found' });
    // //         }
    
    // //         console.log(`Item ${cartId} deleted`);
    // //         res.json({ success: true, message: `Item ${cartId} deleted` });
    // //     } catch (err) {
    // //         console.error('Error deleting item:', err);
    // //         res.status(500).json({ error: 'Failed to delete item', details: err.message });
    // //     }
    // // };
// const incrementQuantity = async (req,res) =>{
//     try {
//         const { email, itemId } = req.body;

//         // Find the user
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Find the cart for the user
//         const cart = await cartModel.findOne({ userId: user._id });
//         if (!cart) {
//             return res.status(404).json({ error: 'Cart not found' });
//         }

//         // Find the item in the cart and increment the quantity
//         const item = cart.items.id(itemId);
//         if (item) {
//             item.quantity += 1;
//             await cart.save();
//             return res.json({ success: true, cart });
//         } else {
//             return res.status(404).json({ error: 'Item not found' });
//         }
//     } catch (error) {
//         console.error('Error incrementing item quantity:', error);
//         res.status(500).json({ error: 'Internal Server Error', details: error.message });
//     }
// }

// const decrementQuantity = async (req,res) =>{
//     try {
//         const { email, itemId } = req.body;

//         // Find the user
//         const user = await userModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Find the cart for the user
//         const cart = await cartModel.findOne({ userId: user._id });
//         if (!cart) {
//             return res.status(404).json({ error: 'Cart not found' });
//         }

//         // Find the item in the cart and decrement the quantity
//         const item = cart.items.id(itemId);
//         if (item) {
//             if (item.quantity > 1) {
//                 item.quantity -= 1;
//             } else {
//                 item.remove();
//             }
//             await cart.save();
//             return res.json({ success: true, cart });
//         } else {
//             return res.status(404).json({ error: 'Item not found' });
//         }
//     } catch (error) {
//         console.error('Error decrementing item quantity:', error);
//         res.status(500).json({ error: 'Internal Server Error', details: error.message });
//     }
// }
















const addLike = async (req, res) => {
    const { productId, email } = req.body;

    try {
        console.log(`Adding like for product ID: ${productId}, email: ${email}`);
        
        if (!productId || !email) {
            return res.status(400).json({ error: 'Product ID and email are required' });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingLike = await likedModel.findOne({ userId: user._id, productId });
        if (existingLike) {
            return res.status(409).json({ error: 'Item already liked' });
        }

        const likeItem = await likedModel.create({
            userId: user._id,
            productId,
            name: product.name,
            email,
            description: product.description,
            price: product.price,
            file: product.files[0]
        });

        res.status(200).json({ success: true, likeItem });
    } catch (err) {
        console.error('Error adding like:', err);
        res.status(500).json({ error: 'Failed to add like', details: err.message });
    }
};

// View Likes
const viewLike = async (req, res) => {
    const { email } = req.query;

    try {
        console.log(`Fetching likes for email: ${email}`);
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const likes = await likedModel.find({ userId: user._id });
        res.json(likes);
    } catch (error) {
        console.error('Error fetching liked items:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
const getUserLike = async (req, res) => {
    const userEmail = req.params.email;

    try {
        // Validate input
        if (!userEmail) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user
        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find likes
        const items = await likedModel.find({ userId: user._id });
        res.json(items.length ? items : []);
    } catch (err) {
        console.error('Error fetching liked items:', err);
        res.status(500).json({ error: 'Failed to fetch liked items', details: err.message });
    }
};

const removeLike = async (req, res) => {
    const { productId, email } = req.body;

    try {
        if (!productId || !email) {
            return res.status(400).json({ error: 'Product ID and email are required' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const item = await likedModel.findOneAndDelete({ userId: user._id, productId });
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ success: true, message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete item', details: err.message });
    }
};

module.exports = {
    addProduct,
    getAllProduct,
    updateProduct,
    addToCart,
    viewCarts,
    dltProducts,
  removeItem,
    addLike,
    viewLike,
    removeLike,
    getUserLike,
    incrementQuantity,
    decrementQuantity
};
