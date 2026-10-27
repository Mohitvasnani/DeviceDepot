// The Express app itself, separate from index.js's job of connecting to
// Mongo and listening on a port. Keeping this file free of both means it
// can be require()'d directly by the test suite (via supertest) without
// opening a real network connection or binding a real port.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRouter = require('./routes/authRoute.js');
const productRouter = require('./routes/productRoute.js');
const bannerRouter = require('./routes/bannerRoute.js');
const emailRouter = require('./routes/emailRoutes.js');
const orderRouter = require('./routes/orderRoute.js');
const paymentRouter = require('./routes/paymentRoute.js');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://device-depot-gilt.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {


    if (!origin) return callback(null, true);


    if (origin.includes('localhost')) return callback(null, true);


    if (origin.includes('vercel.app')) return callback(null, true);

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use('/static' , express.static(__dirname + '/public/Images'))
app.use(express.static('public/Images'))

app.options('*', cors(corsOptions));

// Lightweight wake-up and keep-alive endpoint. Pinged by the portfolio,
// the frontend on load, and an optional scheduler. Touching Mongo as well
// keeps the Atlas cluster counted as active.
app.get('/health', (req, res) => {
  const db = mongoose.connection;
  if (db.readyState === 1 && db.db) {
    db.db.admin().ping().catch(() => {});
  }
  res.json({ ok: true, db: db.readyState === 1 });
});

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/emails", emailRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);

module.exports = app;
