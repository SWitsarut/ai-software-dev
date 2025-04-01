import Stripe from "stripe";
import { PaymentStatus, Project } from "../model/project";
import axios from "../axios";
import { UnprocessedData, UnprocessedDataStatus } from "../model/unprocessedData";


export async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, event: Stripe.Event) {
    try {
        const projectId = paymentIntent.metadata.projectId;
        const project = await Project.findById(projectId)


        if (!project?.isBuy) {
            await Project.findByIdAndUpdate(projectId, {
                paymentId: paymentIntent.id,
                status: PaymentStatus.processing,
                stripeEvent: event,
                $push: {
                    statusHistory: {
                        status: PaymentStatus.paid,
                        updatedAt: new Date()
                    }
                }
            });
            const data = await UnprocessedData.findById(project?.dataId)
            const processed = await axios.post(`/process`, {
                path: data?.path,
                dataName: data?.name,
                data_id: data?._id,
            })
            await axios.post(`/predict`, {
                path: processed.data.dataPath
            })
            await axios.post(`/potree`, {
                id: project?.dataId,
                las_dir: data?.path,
            })
            await axios.post(`/clustering`, {
                dataId: data?._id,
            })
            await UnprocessedData.findByIdAndUpdate(data?._id, { status: UnprocessedDataStatus.PROCESSED })
            await Project.findByIdAndUpdate(projectId, { status: PaymentStatus.paid });
        } else {
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
        }
        // await project.save();
        console.log("✅ Payment successful, project updated:", projectId);
        // res.json({ received: true });
    } catch (error) {
        console.error("Error updating project on payment success:", error);
    }
}



