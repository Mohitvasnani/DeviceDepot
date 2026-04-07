const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const dotenv = require('dotenv').config();
const authRouter = require('./routes/authRoute.js');
const connection = require('./database/dbConnect.js');
const productRouter = require('./routes/productRoute.js');
const bannerRouter = require('./routes/bannerRoute.js')
const emailRouter = require('./routes/emailRoutes.js')
const orderRouter = require('./routes/orderRoute.js')
const paymentRouter = require('./routes/paymentRoute.js')

const PORT = process.env.PORT || 8080; 

connection();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://device-depot-gilt.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Allow localhost
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow ALL Vercel deployments for this project
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

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/emails", emailRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
