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

const PORT = process.env.PORT || 8080; 

connection();

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
