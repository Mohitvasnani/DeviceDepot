const mongoose = require('mongoose'); 


var userSchema = new mongoose.Schema({
  name: String,
  email: {type:String, unique: true },
  // sparse: without it, a unique index treats every account that omits a
  // phone number as a duplicate null, so the second one fails to register.
  phone: { type: Number, unique: true, sparse: true },
  password: String,
  role: { type: String, default: 'user' },
  admin: { type: Boolean, default: 'false' },
  address1: String,
  address2: String,
  address3: String      
});

//Export the model
module.exports = mongoose.model('User', userSchema);