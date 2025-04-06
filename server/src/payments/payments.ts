import bodyParser from 'body-parser';
import express from 'express'
import Stripe from 'stripe';
import { PaymentStatus, Project } from '../model/project';
import { handlePaymentSuccess } from './handleSuccess';
import { handlePaymentFailed } from './handlePaymentFailed';
import authenticateToken from '../middleware/authenticateToken';
import { UnprocessedData, UnprocessedDataStatus } from '../model/unprocessedData';
import { StatusCodes } from 'http-status-codes';
import { cal_init_price } from './calculate_price';

const router = express.Router()

// if (false) {

export const stripe = new Stripe(process.env.STRIPE_PRIVATE || "");
const webHookSecret = process.env.WEBHOOK_SECRET || "";


router.get('/buy', authenticateToken, async (req, res) => {
  const aviable_data = await UnprocessedData.find({
    status: UnprocessedDataStatus.PROCESSED, price: { $exists: true }
  }).populate("createBy", "name")
  res.status(StatusCodes.OK).json(aviable_data)
})

router.post('/buy', authenticateToken, async (req, res): Promise<any> => {
  const { dataId, teamId, labels, dataName } = req.body
  if (!dataId || !teamId || !labels) res.status(StatusCodes.BAD_REQUEST).json({ error: "Missig atribute!" })
  const label_price = cal_init_price(labels)

  const data = await UnprocessedData.findById(dataId)
  if (!data) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Data not found!" })

  const project = await Project.create({
    teamId, dataId, amount: ((data?.price || 0) + label_price), targets: labels, isBuy: 1, name: dataName
  })
  if (!project) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "unable to add project!" })
  res.status(StatusCodes.OK).json({ message: 'added to project' })
})
// if (false) {


router.get('/get_public_stripe', (_, res) => {
  res.send(process.env.STRIPE_PUBLIC)
})



router.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res): Promise<any> => {
  const sig = req.headers["stripe-signature"];
  console.log('webhook called')
  if (!sig) {
    return res.status(400).send("Missing Stripe Signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webHookSecret
    );
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Handle specific event types
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await handlePaymentSuccess(paymentIntent, event);
      break;

    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(failedPaymentIntent);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}
);

// }

export default router