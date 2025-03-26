import mongoose from "mongoose";

export enum MembersRoles {
    admin = "Admin",
    user = "User"
}

export const isValidRole = (role: string): role is MembersRoles => {
    return Object.values(MembersRoles).includes(role as MembersRoles);
};

const memberSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
        require: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        require: true,
    },
    role: {
        type: String,
        enum: Object.values(MembersRoles),
        default: MembersRoles.user
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true }
)

memberSchema.index({ teamId: 1, userId: 1 }, { unique: true });

export const TeamsMember = mongoose.model('TeamMembers', memberSchema)