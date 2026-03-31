const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');
const userModel = require('../models/userModels');

const purchase = async (req, res) => {
    try {
        const { email, status, address, totalAmount, file } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cart = await cartModel.findOne({ userId: user._id }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            name: item.productId.name,
            description: item.productId.description,
            price: item.productId.price
        }));

        const newOrder = new orderModel({
            userId: user._id,
            email,
            items: orderItems,
            status: status || 'pending',
            address,
            totalAmount,
            file
        });

        const savedOrder = await newOrder.save();
        await cartModel.findByIdAndDelete(cart._id);

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const cancelOrder = async (req, res) => {
    const { email, orderId } = req.body;

    try {
        const order = await orderModel.findOne({ _id: orderId, email });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        order.status = 'cancelled';
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const allOrders = async (req, res) => {
    const { email } = req.body;

    try {
        const orders = await orderModel.find({ email });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const viewOrder = async (req, res) => {
    const { orderId, email } = req.body;

    try {
        const order = await orderModel
            .findOne({ _id: orderId, email })
            .populate('items.productId')
            .populate('userId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getAllOrdersForAdmin = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate('userId')
            .populate('items.productId')
            .sort({ orderTime: -1 }); // newest orders first

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders for admin:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 🆕 New function — update order status from admin dashboard
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const order = await orderModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    purchase,
    cancelOrder,
    viewOrder,
    allOrders,
    getAllOrdersForAdmin,
    updateOrderStatus
};