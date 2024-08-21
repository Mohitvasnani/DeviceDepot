const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    name:{
        type:String
    },
    rating:{
        type:Number
    },
    description:{
        type:String
    },    
    feature1:{
        type:String
    },    
    feature2:{
        type:String
    },    
    feature3:{
        type:String
    },    
       
    quantity:{
        type:Number
    },
    instock:{
        type:Boolean,
        default:true
    },
    
    price:{
        type:Number
    },
    categories:{
        type:String
    },
    files:[{
        type:String
    }]
});

//Export the model
module.exports = mongoose.model('Product', productSchema);