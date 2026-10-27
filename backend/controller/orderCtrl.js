const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');
const userModel = require('../models/userModels');
const { computeCartTotalPence } = require('../utils/pricing');

// Checkout is now server-authoritative end to end:
//   1. A paymentIntentId is required - the client can no longer skip
//      payment and call this endpoint directly.
//   2. The PaymentIntent is fetched from Stripe and must have actually
//      succeeded.
//   3. The cart is re-priced from live product prices and must match what
//      was actually charged, so a cart changed after paying (or a
//      PaymentIntent for a different amount) is rejected.
//   4. The same PaymentIntent can only ever produce one order (idempotent
//      retries - a duplicate click or a retried request just returns the
//      existing order instead of charging stock twice).
//   5. Stock is checked and decremented atomically per item, with a
//      best-effort rollback if a later item turns out to be out of stock.
const purchase = async (req, res) => {
    const email = req.user.email;
    const { address, file, paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({ error: 'paymentIntentId is required' });
    }
    if (!address) {
        return res.status(400).json({ error: 'Delivery address is required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Idempotency: if an order already exists for this payment, hand
        // that back rather than creating a second one.
        const existingOrder = await orderModel.findOne({ paymentIntentId });
        if (existingOrder) {
            return res.status(200).json(existingOrder);
        }

        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        } catch (stripeErr) {
            console.error('Could not retrieve PaymentIntent:', stripeErr.message);
            return res.status(400).json({ error: 'Invalid payment reference' });
        }

        if (!paymentIntent || paymentIntent.status !== 'succeeded') {
            return res.status(402).json({ error: 'Payment has not succeeded' });
        }
        if (paymentIntent.metadata?.userId && paymentIntent.metadata.userId !== user._id.toString()) {
            return res.status(403).json({ error: 'This payment does not belong to your account' });
        }

        const { cart, totalPence } = await computeCartTotalPence(user._id);

        if (paymentIntent.currency !== 'gbp' || paymentIntent.amount !== totalPence) {
            // The cart changed after the PaymentIntent was created (or this
            // PaymentIntent was never for this cart) - don't fulfil it.
            return res.status(409).json({ error: 'Payment amount does not match the current cart. Please try again.' });
        }

        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            name: item.productId.name,
            description: item.productId.description,
            price: item.productId.price
        }));

        // Decrement stock atomically per item, refusing to oversell under
        // concurrent requests. Roll back anything already decremented if a
        // later item is out of stock.
        const decremented = [];
        for (const item of orderItems) {
            const updatedProduct = await productModel.findOneAndUpdate(
                { _id: item.productId, quantity: { $gte: item.quantity } },
                { $inc: { quantity: -item.quantity } }
            );
            if (!updatedProduct) {
                for (const done of decremented) {
                    await productModel.findByIdAndUpdate(done.productId, { $inc: { quantity: done.quantity } });
                }
                return res.status(409).json({ error: `Not enough stock for ${item.name}` });
            }
            decremented.push(item);
        }

        const newOrder = new orderModel({
            userId: user._id,
            email,
            items: orderItems,
            status: 'pending',
            address,
            totalAmount: totalPence / 100,
            paymentIntentId,
            file
        });

        let savedOrder;
        try {
            savedOrder = await newOrder.save();
        } catch (saveErr) {
            // Roll back the stock decrement if the order itself failed to
            // save (including a duplicate-paymentIntentId race).
            for (const done of decremented) {
                await productModel.findByIdAndUpdate(done.productId, { $inc: { quantity: done.quantity } });
            }
            if (saveErr.code === 11000) {
                const raceOrder = await orderModel.findOne({ paymentIntentId });
                if (raceOrder) return res.status(200).json(raceOrder);
            }
            throw saveErr;
        }

        await cartModel.findByIdAndDelete(cart._id);

        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error placing order:', error);
        if (error.message === 'Cart is empty' || error.message === 'A product in the cart no longer exists') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const cancelOrder = async (req, res) => {
    const { orderId } = req.body;
    const email = req.user.email;

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
    const email = req.user.email;

    try {
        const orders = await orderModel.find({ email });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const viewOrder = async (req, res) => {
    const { orderId } = req.body;
    const email = req.user.email;

    try {
        const order = await orderModel
            .findOne({ _id: orderId, email })
            .populate('items.productId')
            .populate('userId', '-password');

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
            .populate('userId', '-password')
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