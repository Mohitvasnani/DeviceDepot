const mongoose = require('mongoose')

const connection = ()=>{
    try {
        mongoose.connect(process.env.MONGODB_URL)
        .then((res)=>{
            console.log('db connected');
        }).catch((err)=>{
            console.log(`db not connected`, err);
        })
    } catch (err) {
        console.log(`db not connected`, err);
    }
}
connection()
module.exports = connection