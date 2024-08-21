const express = require('express')
const router = express.Router()
const{
    purchase,
    cancelOrder,
    viewOrder,
    allOrders,
    getAllOrdersForAdmin
} = require('../controller/orderCtrl')

// Route for purchasing items (creating an order)
router.post('/purchase', purchase);

// Route for cancelling an order
router.put('/cancel', cancelOrder);

// Route for viewing all orders of a specific user
router.post('/allorders', allOrders);
// Route for viewing a specific order
router.post('/view', viewOrder);

router.get('/getall', getAllOrdersForAdmin);


module.exports = router;