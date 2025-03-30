import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid'


export enum UnprocessedDataStatus {
    CREATED = "Created",
    UPLOADED = "Uploaded",
    MANUAL = "Manual"
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
