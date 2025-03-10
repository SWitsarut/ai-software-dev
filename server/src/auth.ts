import { Router, RequestHandler, NextFunction } from "express";
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv';
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "./model/user";
import authenticateToken from "./middleware/verify";

dotenv.config();
const router = Router()

export const secret = process.env.ACCESS_TOKEN_SECRET || "";


declare global {
    namespace Express {
        interface Request {
            user?: { name: string; role: string; userId: string }; // Added userId
        }
    }
}



// Route to get current user info
router.get('/me', authenticateToken, async (req, res): Promise<any> => {
    try {
        // req.user should be set by the authenticateToken middleware
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userResponse = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        res.status(200).json({ user: userResponse });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


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
            role: "user" // Setting default role
        });

        await newUser.save();

        // Sign token with userId and role like in login
        const role = newUser.role;
        const accessToken = jwt.sign({ userId, role }, secret);

        // Create a user object without sensitive info
        const userResponse = {
            id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
        };

        // Match the login response format
        res.status(201).json({
            accessToken,
            user: userResponse
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/login', async (req, res): Promise<any> => {
    const { userId, password } = req.body;
    console.log(userId, password);

    const user = await User.findOne({ userId });
    if (!user) {
        console.log('user', user);
        return res.status(401).json({ error: { userId: "Wrong Username" } });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: { password: "Wrong Password" } });
    }

    const role = user.role;
    const accessToken = jwt.sign({ userId, role }, secret);

    // Create a user object without sensitive info like password
    const userResponse = {
        id: user._id,
        email: user.email,
        name: user.name || userId, // Fallback to userId if name isn't available
        role: user.role
        // Add any other user properties needed by your client
    };

    // Return both the token and user data
    res.status(200).json({
        accessToken,
        user: userResponse
    });
});


export default router