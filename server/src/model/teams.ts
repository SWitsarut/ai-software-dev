import { timeStamp } from "console";
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const TeamsSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            default: uuidv4
        },
        createBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        name: {
            type: String,
            require: true,
        }
    }, { timestamps: true }
)

export const Teams = mongoose.model("Teams", TeamsSchema);