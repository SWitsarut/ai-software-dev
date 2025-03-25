import mongoose from "mongoose";

const Label_Schema = new mongoose.Schema({
    label_num: { type: Number, required: true },
    label_name: { type: String, required: true },
  });
  

const PointSchema = new mongoose.Schema(
    {
        x: {
            type: String,
            required: true
        },
        y: {
            type: String,
            required: true,
        },
        z: {
            type: String,
            required: true
        },
       label:{
            type: Label_Schema,
            require:true
       }
    },
    { timestamps: true }
);



export const User = mongoose.model("Points", PointSchema);
