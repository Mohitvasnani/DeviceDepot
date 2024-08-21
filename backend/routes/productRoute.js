const express = require('express');
const upload = require('../middleware/upload');
const {
    addProduct,
    getAllProduct, 
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

router.post('/addproduct', upload.array('files', 6), addProduct);
router.put('/update/:id', upload.array('files', 6), updateProduct);
router.get('/allproducts', getAllProduct);
router.delete('/dltproduct/:id', dltProducts )


router.post('/addcart', upload.single('file'), addToCart);
router.get('/allcart', viewCarts);
router.post('/increment/:id', incrementQuantity);
router.post('/decrement/:id', decrementQuantity);
router.delete('/remove/:itemId', removeItem);

router.post('/addlike', upload.single('file'), addLike);
router.get('/viewlike', viewLike);
router.get('/getlike/:email', getUserLike);
router.delete('/removelike', removeLike);

module.exports = router;
