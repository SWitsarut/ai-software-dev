import mongoose from "mongoose";

export enum PaymentStatus {
    cancel = 'cancel',
    paid = 'paid',
    waiting = 'waiting'
}

const ProjectSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teams",
            required: true,
        },
        dataid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "unprocessedData",
            required: true,
        },
        paymentId: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true, // Amount paid in the smallest currency unit (e.g., cents for USD)
        },
        currency: {
            type: String,
            required: true,
            default: "thb"
        },
        stripeEvent: {
            type: mongoose.Schema.Types.Mixed,
        },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.waiting,
        },
        statusHistory: [
            {
                status: { type: String, enum: Object.values(PaymentStatus) },
                updatedAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

// Indexing for faster queries

ProjectSchema.index({ teamId: 1, paymentId: 1 }, { unique: true });

export const Project = mongoose.model("Project", ProjectSchema);
