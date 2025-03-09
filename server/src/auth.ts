import { Router, RequestHandler, NextFunction } from "express";
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv';
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "./model/user";

dotenv.config();
const router = Router()

const secret = process.env.ACCESS_TOKEN_SECRET || "";

// const  verifyToken: RequestHandler =(req, res, next)=> {
//     const token = req.header('Authorization');
//     if (!token) return res.status(401).json({ error: 'Access denied' });
//     try {
//         const decoded = jwt.verify(token, 'your-secret-key');
//         req.userId = decoded.userId;
//         next();
//     } catch (error) {
//         res.status(401).json({ error: 'Invalid token' });
//     }
// };

declare global {
    namespace Express {
        interface Request {
            user?: { name: string; role: string }; // Add `role` to user
        }
    }
}

// const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//     const authorization = req.headers.get('authorization');
//     const token = authorization && authorization.split(' ')[1];

//     if (!token) {
//         return next; // Unauthorized if no token
//     }

//     jwt.verify(token, secret, (err, user: JwtPayload | string | undefined) => {
//         if (err) {
//             return res.sendStatus(403); // Forbidden if token verification fails
//         }

//         if (user && typeof user !== 'string' && 'name' in user && 'role' in user) {
//             req.user = { name: user.name, role: user.role }; // Add both name and role to req.user
//             next();
//         } else {
//             return res.sendStatus(403); // Forbidden if invalid token structure
//         }
//     });
// };

// Example of role-based route protection (optional)
// const adminOnly: RequestHandler = (req, res, next) => {
//     if (req.user?.role !== 'admin') {
//         return res.status(403).json({ message: 'You do not have permission to access this resource' });
//     }
//     next(); // If role is admin, allow access
// };

// router.get('/test', authenticateToken, (req, res) => {
//     if (req.user.name === 'Jane Doe') {
//         return res.send('Yes');
//     } else {
//         res.send('No');
//     }
// });

// router.post('/register', async (req, res):Promise<any> => {
//     const { userId, name } = req.body
//     return res.status(200).json({})
// })


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
            password: hashedPassword, // Use hashed password
        });

        // Save the user to the database
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
    const accessToken = jwt.sign(userId, secret)
    res.status(200).json({ accessToken })
})


export default router