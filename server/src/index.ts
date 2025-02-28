import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import Stripe from "stripe";

const app = express();

dotenv.config()
app.use(cors())
app.use(express.json())

const PORT: number = 8080;

const stripeKey = process.env.STRIPE_PRIVATE || "";
const stripe = new Stripe(stripeKey);

app.get('/', (_, res) => {
  // res.send('Express + TypeScript Server');
  res.json({ "msg": "SIGMA" })
});

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
