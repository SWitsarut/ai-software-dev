import { Router } from "express";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

dotenv.config();
const router = Router()

const secret = process.env.ACCESS_TOKEN_SECRET || "";


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