import mongoose from "mongoose";

const TeamsSchema = new mongoose.Schema(
    {
        createBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            require: true,
        },
        name: {
            type: String,
            require: true,
        },
        image: {
            type: String,
        }
    }, { timestamps: true }
)

export const Teams = mongoose.model("Teams"
    , TeamsSchema);