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

// Serve static files
app.set('views', "views");
app.set('view engine', 'ejs');
app.use("/potree", express.static("public"));


app.get('/', (req, res) => {
  res.send(`
    <form id="dataForm" action="/" method="POST">
        <input type="hidden" name="data" id="dataInput">
        <button type="button" onclick="submitForm('14')">Load Data 14</button>
        <button type="button" onclick="submitForm('out')">Load Data out</button>
    </form>

     <script>
        function submitForm(dataValue) {
            document.getElementById("dataInput").value = dataValue;
            document.getElementById("dataForm").submit();
        }
    </script>
    `)
})

app.post('/', (req, res) => {
  const dataValue = "point_cloud/" + req.body.data
  console.log(dataValue)
  const data = {
    data: dataValue,
    libpath: `http://localhost:${PORT}/potree`,
    interest_scheme: visible_label([23, 24, 12, 1])
  }
  res.render('index', data);
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
