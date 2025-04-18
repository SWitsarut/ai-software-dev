import { Router, RequestHandler, NextFunction } from "express";
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv';
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "./model/user";
import authenticateToken from "./middleware/authenticateToken";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { uploadImage } from "./middleware/file";

dotenv.config();
const router = Router()

export const secret = process.env.ACCESS_TOKEN_SECRET || "";


declare global {
    namespace Express {
        interface Request {
            user?: { name: string; role: string; userId: string };
            dataId?: { storedData: any };
            uniqueFolderPath?: string; // Add this new property
        }
    }
}

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get currently authenticated user info
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *       401:
 *         description: Unauthorized or missing token
 *       404:
 *         description: User not found
 */

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
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar
        };

        res.status(200).json({ user: userResponse });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *               - phoneNumber
 *               - email
 *               - password
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "john123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "+123456789"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Validation errors or userId already taken
 *       500:
 *         description: Server error
 */

router.post("/register", async (req, res): Promise<any> => {
    const { userId, name, phoneNumber, email, password } = req.body;
    // console.log('req.body', req.body)
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with userId and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - password
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "john123"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successful login with access token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res): Promise<any> => {
    const { userId, password } = req.body;
    // console.log('req.body', req.body)
    const user = await User.findOne({ userId });
    if (!user) {
        // console.log('user', user);
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
        userId: user.userId,
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

/**
 * @swagger
 * /auth/update:
 *   post:
 *     summary: Update current user's profile (name or avatar)
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully updated user profile
 *       400:
 *         description: No image or name provided
 *       500:
 *         description: Server error
 */
router.post('/update', authenticateToken, uploadImage.single('image'), async (req, res): Promise<any> => {
    // console.log('here')
    const { name } = req.body;
    const image = req.file;
    if (!image && !name) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Need new image or new name' });
    }


    try {
        let filepath = undefined
        if (image) {
            const filename = image.filename;
            filepath = `${filename}`
        }
        const newUserData = await User.findOneAndUpdate({ userId: req.user?.userId }, { name, avatar: filepath || "" }, { new: true, runValidators: true });

        const userResponse = {
            id: newUserData?._id,
            userId: newUserData?.userId,
            email: newUserData?.email,
            name: newUserData?.name,
            role: newUserData?.role,
            avatar: newUserData?.avatar,
        };

        return res.status(StatusCodes.OK).json({ user: userResponse });

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update user' });
    }

})


export default router