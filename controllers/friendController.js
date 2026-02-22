import Friend from "../models/Friend.js";
import User from '../models/User.js';
import mongoose from "mongoose";

export const getAllFriends = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        };
        const friends = await Friend.find({ status: "accepted", users: { $in: [userId] }})
        .populate("users", "name email")
        .lean();
        if (!friends.length) {
            return res.status(200).json({
                message: "No friends found",
                result: []
            });
        };
        const friendData = friends.map(friend => {
            const otherUser = friend.users.find(u => u._id.toString() !== userId.toString());
            return {
                _id: otherUser._id,
                name: otherUser.name,
                email: otherUser.email
            };
        });
        return res.status(200).json({
            message: "Friends Retrieved Successfully",
            result: friendData
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred"
        });
    };
};

export const getAllRequests = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        };
        const requests = await Friend.find({ status: "pending", users: { $in: [userId] }, requestedBy: { $ne: userId } })
            .populate("requestedBy", "name email")
            .lean();
        if (!requests.length) {
            return res.status(200).json({
                message: "No friend requests",
                result: []
            });
        };
        const requestData = requests.map(request => ({
            _id: request.requestedBy?._id,
            name: request.requestedBy?.name,
            email: request.requestedBy?.email,
            requestId: request?._id
        }));
        return res.status(200).json({
            message: "Requests Retrieved Successfully",
            result: requestData
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred"
        });
    };
};

export const sendFriendRequest = async (req, res) => {
    try {
        const { _id: senderId } = req.user;
        const { email } = req.params;
        if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        };
        if (!email || typeof email !== 'string') {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        };
        const sender = await User.findById(senderId).select("_id name email").lean();
        if (!sender) {
            return res.status(404).json({
                message: "Sender not found"
            });
        };
        const receiver = await User.findOne({ email }).select("_id name email").lean();
        if (!receiver) {
            return res.status(404).json({
                message: "Receiver not found"
            });
        };
        if (sender._id.equals(receiver._id)) {
            return res.status(400).json({
                message: "You cannot add yourself"
            });
        };
        const users = [sender._id, receiver._id].sort();
        const existing = await Friend.findOne({
            users: users,
            status: { $in: ["pending", "accepted"] }
        });
        if (existing) {
            return res.status(400).json({
                message: existing.status === "pending"
                    ? "Friend request already sent"
                    : "You are already friends"
            });
        };
        const newFriend = await Friend.create({
            users: users,
            requestedBy: sender._id,
            status: "pending"
        });
        return res.status(201).json({
            message: "Friend request sent",
            result: newFriend
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred"
        });
    };
};

export const approveRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId } = req.params;
        const { status } = req.body;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        };
        if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        };
        const allowedStatus = ["accepted", "declined"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Status must be accepted or declined"
            });
        };
        const request = await Friend.findById(requestId);
        if (!request) {
            return res.status(404).json({
                message: "Friend request not found"
            });
        };
        const receiverId = request.users.find(id => id.toString() !== request.requestedBy.toString());
        if (!receiverId.equals(userId)) {
            return res.status(403).json({
                message: "You are not authorized to update this request"
            });
        };
        if (request.status !== "pending") {
            return res.status(400).json({
                message: "Request already processed"
            });
        };
        request.status = status;
        await request.save();
        return res.status(200).json({
            message: `Request ${status} successfully`,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred"
        });
    };
};