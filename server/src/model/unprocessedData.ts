import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid'


export enum UnprocessedDataStatus {
    CREATED = "Created",
    UPLOADED = "Uploaded",
    MANUAL = "Manual",
    PROCESSED = "Processed"
}


const UnprocessedDataSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true
        },
        createBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            require: true,

        },
        price: {
            type: Number,
        },
        path: {
            type: String,
            require: true
        }, status: {
            type: String,
            enum: Object.values(UnprocessedDataStatus),
            default: UnprocessedDataStatus.CREATED
        }

    },
    { timestamps: true }
);



export const UnprocessedData = mongoose.model("unprocessedData", UnprocessedDataSchema);
