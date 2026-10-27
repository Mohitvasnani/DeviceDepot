const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    description: String,
    price: String,
    quantity: {
        type: Number,
        default: 1
    }
});

const orderSchema = new mongoose.Schema({
    email: {type:String},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    status: String,
    address: {
        type: String,
        required: true
    },
    // Was `totalammount` - the controller always wrote `totalAmount`, so
    // every order saved with this field empty. Fixed name, and it is now
    // always server-computed, never taken from the client as-is.
    totalAmount: Number,
    // Stripe PaymentIntent id backing this order. Unique+sparse so the
    // same successful payment can never be turned into two orders.
    paymentIntentId: {
        type: String,
        unique: true,
        sparse: true
    },
    orderTime: {
        type: Date,
        default: Date.now
    },
    file: String
});

module.exports = mongoose.model('Order', orderSchema);
