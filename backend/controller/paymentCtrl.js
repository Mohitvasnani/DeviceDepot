const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const userModel = require('../models/userModels');
const { computeCartTotalPence } = require('../utils/pricing');

// The amount is never taken from the request. A modified client used to be
// able to request a PaymentIntent for any amount it liked; now the only
// input that matters is the signed-in user's own cart, read straight from
// the database.
const createPaymentIntent = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { totalPence } = await computeCartTotalPence(user._id);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPence,
            currency: 'gbp',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: user._id.toString(),
                email: user.email,
            },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        if (error.message === 'Cart is empty' || error.message === 'A product in the cart no longer exists') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Stripe error:', error);
        res.status(500).json({ message: 'Payment failed', error: error.message });
    }
};

module.exports = { createPaymentIntent };
