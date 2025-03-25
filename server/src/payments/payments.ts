import bodyParser from 'body-parser';
import express from 'express'
import Stripe from 'stripe';
import { PaymentStatus, Project } from '../model/project';
import { handlePaymentSuccess } from './handleSuccess';
import { handlePaymentFailed } from './handlePaymentFailed';

const router = express.Router()


if (false) {

  const stripe = new Stripe(process.env.STRIPE_PRIVATE || "");
  const webHookSecret = process.env.WEBHOOK_SECRET || "";


  router.get('/get_public_stripe', (_, res) => {
    res.send(process.env.STRIPE_PUBLIC)
  })

  router.post("/create-payment-intent", async (req, res): Promise<any> => {
    try {
      const { projectId, amount, currency } = req.body;

      // Validate request data
      if (!projectId || !amount || !currency) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Find project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: { projectId: project._id.toString() },
      });

      // Update project with paymentId
      project.paymentId = paymentIntent.id;
      project.amount = amount;
      project.currency = currency;
      await project.save();

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });

    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post(
    "/webhook",
    bodyParser.raw({ type: "application/json" }),
    async (req, res): Promise<any> => {
      const sig = req.headers["stripe-signature"];

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
          await handlePaymentSuccess(paymentIntent);
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

}
export default router