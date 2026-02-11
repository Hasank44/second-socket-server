import User from '../models/User.js';

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';


export const getUserController = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid User ID'
            });
        };
        const user = await User.findById(_id);
        return res.status(200).json({
            message: 'User Fetched Successfully',
            result: user
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const userRegisterController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, Email and Password are required'
            });
        };
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long'
            });
        };
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Invalid Email Address'
            });
        };
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email is already registered'
            });
        };
        const hashedPassword = await bcrypt.hash(password, 11);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        return res.status(201).json({
            message: 'Registered Successfully',
            result: newUser
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const userLoginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and Password are required'
            });
        };
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Invalid Email or Password'
            });
        };
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid Email or Password'
            });
        };
        user.isLoggedIn = true;
        await user.save();
        const token = jwt.sign({
            _id: user._id
        }, process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.status(200).json({
            message: 'Logged in Successfully',
            result: user,
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const userLogoutController = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid User ID'
            });
        };
        const user = await User.findById(_id);
        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        };
        user.isLoggedIn = false;
        await user.save();
        return res.status(200).json({
            message: 'Logged out Successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const userUpdateController = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid User ID"
            });
        };
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        };
        const { name, email, password } = req.body;
        if (name) user.name = name;
        if (email) {
            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    message: "Invalid Email Address"
                });
            };
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== _id) {
                return res.status(400).json({
                    message: "Email already in use"
                });
            };
            user.email = email;
        };
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters long",
                });
            };
            const isSamePassword = await bcrypt.compare(password, user.password);
            if (isSamePassword) {
                return res.status(400).json({
                    message: "New password must be different from old password",
                });
            };
            user.password = await bcrypt.hash(password, 11);
        };
        await user.save();
        return res.status(200).json({
            message: "User Updated Successfully",
            result: user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred"
        });
    };
};