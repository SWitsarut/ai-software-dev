import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // Importing UUID package for random unique userId

enum userRoles {
    user = "user",  // Fix enum values to be strings
    admin = "admin"
}

const UserSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(userRoles),
            default: userRoles.user,
        }
    },
    { timestamps: true }
);



export const User = mongoose.model("Users", UserSchema);
