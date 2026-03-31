const express = require('express')
const router = express.Router()
const {
    purchase,
    cancelOrder,
    viewOrder,
    allOrders,
    getAllOrdersForAdmin,
    updateOrderStatus
} = require('../controller/orderCtrl')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// User routes
router.post('/purchase', protect, purchase);
router.put('/cancel', protect, cancelOrder);
router.post('/allorders', protect, allOrders);
router.post('/view', protect, viewOrder);

// Admin routes
router.get('/getall', protect, adminOnly, getAllOrdersForAdmin);
router.put('/updatestatus/:id', protect, adminOnly, updateOrderStatus);

module.exports = router;