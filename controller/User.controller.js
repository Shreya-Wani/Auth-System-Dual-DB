import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const registerUser = async (req, res) => {
    //get data
    const { name, email, password } = req.body || {}

    //validate
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    //check if user already exists
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        //create user in database
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        if (!user) {
            return res.status(400).json({
                message: "User not registered",
            });
        }

        //create a verification token
        const token = crypto.randomBytes(32).toString("hex");

        //save token in database
        user.verificationToken = token
        await user.save();

        //send token as email to user
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure: false, // Use true for port 465, false for port 587
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });

        const mailOptions = await transporter.sendMail({
            from: process.env.MAILTRAP_SENDERMAIL,
            to: user.email,
            subject: "Verify your email",
            text: `Please click on the following link: ${process.env.BASE_URL}/api/v1/users/verify/${token}`
        })

        //send success status to user
        res.status(201).json({
            message: "User Registered Successfully",
            success: true
        });

    } catch (error) {
        res.status(400).json({
            message: "User not Registered",
            success: false
        });
    }
};



export { registerUser };