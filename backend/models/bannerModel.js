const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var bannerSchema = new mongoose.Schema({
    name:{
        type:String,        
    },
    description:{
        type:String
    },
    categories:{
        type:String
    },
    
    file:{
        type:String,        
    },
});

//Export the model
module.exports = mongoose.model('Banner', bannerSchema);