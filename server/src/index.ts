import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import Stripe from "stripe";
import { visible_label } from './aviable_label';
import auth_router from './auth'
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
const app = express();

dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', auth_router)
// app.use('/user')

const PORT: number = 8080;

const stripeKey = process.env.STRIPE_PRIVATE || "";
const stripe = new Stripe(stripeKey);

// If you're using Express.js on your backend
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

// Serve static files
app.set('views', "views");
app.set('view engine', 'ejs');
app.use("/potree", express.static("public"));


app.post('/', (req, res) => {
  const dataValue =  req.body.data

  // console.log(dataValue)
  // Parse the selected labels from the request body
  let selectedLabelsArray = []; 

  try {
    if (req.body.selectedLabels) {
      const parsedLabels = JSON.parse(req.body.selectedLabels);
      console.log(parsedLabels)
      if (Array.isArray(parsedLabels) && parsedLabels.length > 0) {
        selectedLabelsArray = parsedLabels;
      }
    }
  } catch (err) {
    console.error("Error parsing selectedLabels:", err);
  }


  const data = {
    data: dataValue,
    libpath: `http://localhost:${PORT}/potree`,
    interest_scheme: visible_label(selectedLabelsArray)
  }
  if (req.body.data.split('/').length == 1) {
    res.render('index', data);
  } else {
    res.render('special', data);
  }
}
);

app.post("/checkout", async (_, res) => {

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "thb",
          product_data: {
            name: "item1"
          },
          unit_amount: 400
        },
        quantity: 5
      }, {
        price_data: {
          currency: "thb",
          product_data: {
            name: "item2"
          },
          unit_amount: 200
        },
        quantity: 1
      }
    ],
    success_url: `http://localhost/success.html`,
    cancel_url: `http://localhost/cancel.html`,
  })
  console.log(session)
  res.json(session)

})



// app.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}`);
// })
app.listen(PORT, async () => {
  console.log(`🗄️ Server Fire on http:localhost:${PORT}`);
  // Connect To The Database
  const uri = 'mongodb://root:example123@mongo:27017/'
  // const uri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  console.log(uri)

  try {
    // await mongoose.connect(DB_CONNECT_URL);
    await mongoose.connect(uri, {});

    console.log("🛢️ Connected To Database");
    // dropPhoneNumberIndex()
  } catch (error) {
    console.log("⚠️ Error to connect Database", error);
  }
});
