import mongoose from "mongoose";


const RequestSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Types.ObjectId,
            ref: "Teams",
            require: true
        },
        dataId: {
            type: mongoose.Types.ObjectId,
            ref: "unprocessedData",
            require: true
        }

    },
    { timestamps: true }
);



export const Request = mongoose.model("Request", RequestSchema);
