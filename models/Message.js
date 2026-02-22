import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    conversation: {
        type: Schema.Types.ObjectId,
        ref: "Friend",
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        trim: true,
        required: true
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    }
}, {
    timestamps: true
});

const Message = model("Message", messageSchema);

export default Message;