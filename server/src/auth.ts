import { NextFunction, Router, RequestHandler } from "express";
import dotenv from 'dotenv';
import jwt, { JwtPayload } from "jsonwebtoken";

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
            user: {
                name: string
            } // Add the user property to the Request interface
        }
    }
}

const authenticateToken: RequestHandler = (req, res, next): any => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

router.get('/test', authenticateToken, (req, res) => {
    if (req.user.name === 'Jane Doe') {
        return res.send('Yes');
    } else {
        res.send('No');
    }
});



router.post('/login', (req, res) => {
    const { username } = req.body
    if (!username) {
        res.status(400).json({ error: 'Username is required' })
    }
    const user = { name: username }
    const accessToken = jwt.sign(user, secret)
    res.status(200).json({ accessToken })
})


export default router