import mongoose from "mongoose";

const PointSchema = new mongoose.Schema({
    x: {
        type: Number
    }, y: {
        type: Number
    },
    z: {
        type: Number
    },
});


const ObjectsSchema = new mongoose.Schema(
    {
        dataId: {
            type: mongoose.Types.ObjectId,
            ref: "unprocessedData",
            require: true,
        },
        objectId: {
            type: Number,
            require: true,
        },
        centroid: {
            type: PointSchema,
            require: true,
        },
        corners: {
            type: [PointSchema],
            require: true
        }
    },
    { timestamps: true }
);



export const Objects = mongoose.model("Objects", ObjectsSchema);
