const mongoose = require('mongoose');

const connection = () => {
    return mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log('db connected');
        })
        .catch((err) => {
            console.log('db not connected', err);
        });
};

// Do not call connection() here. index.js calls it on boot, and invoking it
// at module load as well opened two connections, which made every error
// appear twice and printed a success and a failure for the same database.
module.exports = connection;
