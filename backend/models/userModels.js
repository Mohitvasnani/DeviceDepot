const mongoose = require('mongoose'); 


var userSchema = new mongoose.Schema({
  name: String,
  email: {type:String, unique: true },
  phone: {type:Number, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  admin: { type: Boolean, default: 'false' },
  address1: String,
  address2: String,
  address3: String      
});

//Export the model
module.exports = mongoose.model('User', userSchema);