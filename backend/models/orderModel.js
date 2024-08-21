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
    totalammount:Number,
    orderTime: {
        type: Date,
        default: Date.now
    },
    file: String
});

module.exports = mongoose.model('Order', orderSchema);
