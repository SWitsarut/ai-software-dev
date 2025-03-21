import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid'



const UnprocessedDataSchema = new mongoose.Schema(
    {
        dataId: {
            type: String,
            unique: true,
            default: uuidv4
        },
        name: {
            type: String,
            require: true
        },
        createBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,

        }, 
        path: {
            type:String,
            require:true
        }
    },
    { timestamps: true }
);



export const UnprocessedData = mongoose.model("unprocessedData", UnprocessedDataSchema);
