import { Router, RequestHandler, NextFunction } from "express";
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv';
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "./model/user";

dotenv.config();
const router = Router()

const secret = process.env.ACCESS_TOKEN_SECRET || "";


declare global {
    namespace Express {
        interface Request {
            user?: { name: string; role: string }; // Add `role` to user
        }
    }
}


router.post("/register", async (req, res): Promise<any> => {
    const { userId, name, phoneNumber, email, password } = req.body;

    const errors: Record<string, string> = {};
    if (!userId) errors.userId = "Missing userId";
    if (!name) errors.name = "Missing name";
    if (!phoneNumber) errors.phoneNumber = "Missing phoneNumber";
    if (!email) errors.email = "Missing email";
    if (!password) errors.password = "Missing password";

    // If there are missing fields, return them
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ error: { userId: "User with this userId already taken" } });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            userId,
            name,
            phoneNumber,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const accessToken = jwt.sign(userId, secret)

        res.status(201).json({ message: "User registered successfully", accessToken: accessToken });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post('/login', async (req, res): Promise<any> => {
    const { userId, password } = req.body
    console.log(userId, password)
    const user = await User.findOne({ userId });
    if (!user) {
        console.log('user', user)
        return res.status(401).json({ error: { userId: "Wrong Username" } })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: { password: "Wrong Password" } })
    }
    const role = user.role
    const accessToken = jwt.sign({ userId, role }, secret)
    res.status(200).json({ accessToken })
})


export default router