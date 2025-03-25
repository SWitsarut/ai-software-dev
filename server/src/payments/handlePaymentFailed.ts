import Stripe from "stripe";
import { PaymentStatus, Project } from "../model/project";


export async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
        const project = await Project.findOne({ paymentId: paymentIntent.id });

        if (!project) {
            console.error("Project not found for failed paymentId:", paymentIntent.id);
            return;
        }

        project.status = PaymentStatus.cancel; // Mark as failed
        project.statusHistory.push({ status: "cancel", updatedAt: new Date() });

        await project.save();
        console.log("❌ Payment failed, project updated:", project._id);
    } catch (error) {
        console.error("Error updating project on payment failure:", error);
    }
}