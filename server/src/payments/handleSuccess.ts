import Stripe from "stripe";
import { PaymentStatus, Project } from "../model/project";



export async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, event: Stripe.Event) {
    try {
        const projectId = paymentIntent.metadata.projectId;
        // const project = await Project.findById(projectId);

        // if (!project) {
        //     console.error("Project not found for paymentId:", paymentIntent.id);
        //     return;
        // }

        await Project.findByIdAndUpdate(projectId, {
            paymentId: paymentIntent.id,
            status: PaymentStatus.paid,
            stripeEvent: event,
            $push: {
                statusHistory: {
                    status: PaymentStatus.paid,
                    updatedAt: new Date()
                }
            }
        });

        // project.status = PaymentStatus.paid; // Update status
        // project.stripeEvent = paymentIntent; // Store event data
        // project.statusHistory.push({ status: "paid", updatedAt: new Date() });

        // await project.save();
        console.log("✅ Payment successful, project updated:", projectId);
        // res.json({ received: true });
    } catch (error) {
        console.error("Error updating project on payment success:", error);
    }
}



