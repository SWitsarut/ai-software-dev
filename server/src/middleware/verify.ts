import { error } from "console";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// interface CustomJwtPayload extends JwtPayload {
//     name: string;
//     role: string;
// }

// // Extend the Request interface to include the custom user object
// export interface AuthRequest extends Request {
//     user?: CustomJwtPayload;  // Specify the custom type
// }


const verifyToken = (req: { headers: { authorization: string; }; user: string | jwt.JwtPayload; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): any; new(): any; }; }; }, next: () => void) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        req.user = decoded
        next()

    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export default verifyToken;
