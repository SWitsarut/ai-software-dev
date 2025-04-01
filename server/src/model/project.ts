import mongoose from "mongoose";

export enum PaymentStatus {
    cancel = 'cancel',
    paid = 'paid',
    waiting = 'waiting',
    processing = 'processing'
}

const ProjectSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teams",
            required: true,
        },
        dataId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "unprocessedData",
            required: true,
        },
        isBuy: {
            type: Number,
        },
        name: {
            type: String,
            default: "",
            require: true,
        },
        paymentId: {
            type: String,
            default: null
        },
        amount: {
            type: Number,
            required: false, // Make this optional for initial creation
            default: 0
        },
        currency: {
            type: String,
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
        ],
        targets: {
            type: [Number],
        }
    },
    { timestamps: true }
);

// Indexing for faster queries

// ProjectSchema.index({ teamId: 1, paymentId: 1 }, { unique: true });

export const Project = mongoose.model("Project", ProjectSchema);
