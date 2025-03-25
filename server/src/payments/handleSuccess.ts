import Stripe from "stripe";
import { PaymentStatus, Project } from "../model/project";



export async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    try {
        const project = await Project.findOne({ paymentId: paymentIntent.id });

        if (!project) {
            console.error("Project not found for paymentId:", paymentIntent.id);
            return;
        }

        project.status = PaymentStatus.paid; // Update status
        project.stripeEvent = paymentIntent; // Store event data
        project.statusHistory.push({ status: "paid", updatedAt: new Date() });

        await project.save();
        console.log("✅ Payment successful, project updated:", project._id);
    } catch (error) {
        console.error("Error updating project on payment success:", error);
    }
}



