import { NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { secret } from "../auth";



export default function authenticateToken(req: any, res: any, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    // console.log('req.headers',req.headers)
    const token = authHeader && authHeader.split(' ')[1];
    // console.log('token',token)
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Make sure decoded contains the required fields
        if (!decoded.userId) {
            return res.status(403).json({ message: "Invalid token payload" });
        }
        req.user = {
            userId: decoded.userId,
            role: decoded.role || 'user', // Default to 'user' if role is not in token
            name: decoded.name || '' // Default empty string if name is not in token
        };

        next();
    });
}