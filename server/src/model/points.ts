import mongoose from "mongoose";

const Label_Schema = new mongoose.Schema({
    label_num: { type: Number, required: true },
    label_name: { type: String, required: true },
  });
  

const PointSchema = new mongoose.Schema(
    {
        x: {
            type: String,
            unique: true,
            required: true
        },
        y: {
            type: String,
            unique: true,
            required: true,
        },
        z: {
            type: String,
            unique: true,
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
