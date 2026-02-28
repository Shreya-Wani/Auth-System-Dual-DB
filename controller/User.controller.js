import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
                success: false,
            });
        }

        // create user
        const user = await User.create({ name, email, password });

        // create verification token
        const token = crypto.randomBytes(32).toString("hex");
        user.verificationToken = token;
        await user.save();

        // TRY sending email (but don't fail registration)
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.MAILTRAP_HOST,
                port: process.env.MAILTRAP_PORT,
                auth: {
                    user: process.env.MAILTRAP_USERNAME,
                    pass: process.env.MAILTRAP_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: process.env.MAILTRAP_SENDERMAIL,
                to: user.email,
                subject: "Verify your email",
                text: `Verify here: ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
            });
        } catch (emailError) {
            console.error("Email failed:", emailError.message);
        }

        return res.status(201).json({
            message: "User registered successfully. Please verify email.",
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Registration failed",
            success: false,
        });
    }
};

const verifyUser = async (req, res) => {
    try {
        // get token from url
        const { token } = req.params;

        // validate token
        if (!token) {
            return res.status(400).json({
                message: "Invalid or missing token",
                success: false
            });
        }

        // find user based on token
        const user = await User.findOne({
            verificationToken: token
        });

        // if user not found
        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired token",
                success: false
            });
        }

        // mark user as verified
        user.isVerified = true;

        // remove verification token
        user.verificationToken = undefined;

        // save user
        await user.save();

        // success response
        return res.status(200).json({
            message: "User verified successfully",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error verifying user",
            success: false
        });
    }
};

const loginUser = async (req, res) => {
    //get data
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            })
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role
        },
            process.env.JWT_SECRET,
            {
                expiresIn: '24h'
            }
        );

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 20 * 60 * 60 * 1000
        }

        res.cookie("token", token, cookieOptions)

        res.status(200).json({
            success: true,
            message: "Login Successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Login failed",
            success: false
        });
    }
}

const getMe = async (req, res) => {
    try {
        console.log("reached at profile level");

        res.status(200).json({
            success: true,
            user: req.user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile"
        });
    }
}

const logoutUser = async (req, res) => {
    try {
        res.cookie('token', '', {});
        res.status(200).json({
            success: true,
            message: "Logout Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed. Please try again."
        });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        // Don't reveal whether user exists (security best practice)
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If this email exists, a reset link has been sent."
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Send reset email
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD
            }
        });

        const resetURL = `${process.env.BASE_URL}/api/v1/users/reset/${resetToken}`;

        await transporter.sendMail({
            from: process.env.MAILTRAP_SENDERMAIL,
            to: user.email,
            subject: "Password Reset",
            text: `Reset your password using this link: ${resetURL}`
        });

        return res.status(200).json({
            success: true,
            message: "Reset password link sent to email."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Forgot password failed"
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required"
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Reset password failed"
        });
    }
}
export { registerUser, verifyUser, loginUser, getMe, logoutUser, forgotPassword, resetPassword };