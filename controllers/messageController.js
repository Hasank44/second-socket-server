import Message from "../models/Message.js";
import Friend from "../models/Friend.js";
import mongoose from "mongoose";

export const getMessages = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { conversationId, limit = 50, page = 1 } = req.params;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        };
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                message: "Invalid conversation ID"
            });
        };
        const friendRelation = await Friend.findById(conversationId);
        if (!friendRelation || !friendRelation.users.includes(userId)) {
            return res.status(403).json({
                message: "You are not authorized to view these messages"
            });
        };
        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 })
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            message: messages.length ? "Messages retrieved successfully" : "No messages found",
            result: messages
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred"
        });
    };
};

export const sendMessage = async (req, res) => {
    try {
        const { _id: senderId } = req.user;
        const { conversationId } = req.params;
        const { text } = req.body;
        if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({
                message: "Invalid sender ID"
            });
        };
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                message: "Invalid conversation ID"
            });
        };
        if (!text || text.trim() === "") {
            return res.status(400).json({
                message: "Message text cannot be empty"
            });
        };
        const friendRelation = await Friend.findById(conversationId);
        if (!friendRelation || !friendRelation.users.includes(senderId)) {
            return res.status(403).json({
                message: "You are not authorized to send messages in this conversation"
            });
        };
        const receiverId = friendRelation.users.find(u => u.toString() !== senderId.toString());
        const newMessage = await Message.create({
            conversation: conversationId,
            sender: senderId,
            receiver: receiverId,
            text: text.trim(),
            status: "sent"
        });
        return res.status(201).json({
            message: "Message sent successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred"
        });
    };
};