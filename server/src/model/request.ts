import mongoose from "mongoose";

const Label_Schema = new mongoose.Schema({
    label_num: { type: Number, required: true },
    label_name: { type: String, required: true },
});


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
