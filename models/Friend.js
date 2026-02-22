import { Schema, model } from "mongoose";

const friendSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    ],

    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "declined", "blocked"],
        default: "pending",
    }
}, {
    timestamps: true
});
friendSchema.pre("save", function (next) {
    if (this.users.length !== 2) {
        return next(new Error("Friend relation must contain exactly 2 users"));
    };
    this.users.sort();
    next();
});
friendSchema.index({ users: 1 }, { unique: true });

const Friend = model("Friend", friendSchema);

export default Friend;