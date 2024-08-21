const mongoose = require('mongoose');

// Define the schema for individual cart items
const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    description: {
        type: String
    },
    price: {
        type: String
    },
    quantity: {
        type: Number,
        default: 1
    },
    file:{
        type:String,
        
    }
});

// Define the schema for the cart
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
    file: {
        type: String
    }
});

// Export the model
module.exports = mongoose.model('Cart', cartSchema);
