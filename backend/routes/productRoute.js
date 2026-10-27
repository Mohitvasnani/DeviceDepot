const express = require('express');
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    addProduct,
    getAllProduct, 
    getProductById,
    addToCart,
    viewCarts,
    dltProducts,
    addLike,
    viewLike,
    removeLike,
    getUserLike,
    updateProduct,
    incrementQuantity,
    decrementQuantity,
    removeItem
    
} = require('../controller/productCtrl');


const router = express.Router();

// Admin only - product and banner catalogue management
router.post('/addproduct', protect, adminOnly, upload.array('files', 6), addProduct);
router.put('/update/:id', protect, adminOnly, upload.array('files', 6), updateProduct);
router.get('/allproducts', getAllProduct);
router.delete('/dltproduct/:id', protect, adminOnly, dltProducts)


// Authenticated users only - cart is scoped to the signed-in account
router.post('/addcart', protect, upload.single('file'), addToCart);
router.get('/allcart', protect, viewCarts);
router.post('/increment/:id', protect, incrementQuantity);
router.post('/decrement/:id', protect, decrementQuantity);
router.delete('/remove/:itemId', protect, removeItem);

router.post('/addlike', protect, upload.single('file'), addLike);
router.get('/viewlike', protect, viewLike);
router.get('/getlike/:email', protect, getUserLike);
router.delete('/removelike', protect, removeLike);

// Catch-all single-product lookup for the /products/:id page. Kept last so
// it never shadows the literal routes above (allproducts, allcart, etc.),
// which Express matches in declaration order.
router.get('/:id', getProductById);

module.exports = router;
