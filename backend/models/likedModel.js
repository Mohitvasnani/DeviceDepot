const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var likedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name:{
        type:String,
        
    },
    email:{
        type:String,
        
    },
    description:{
        type:String,
        
    },
    price:{
        type:String,
        
    },
    
    file:{
        type:String,
        
    },
});

//Export the model
module.exports = mongoose.model('Like', likedSchema);