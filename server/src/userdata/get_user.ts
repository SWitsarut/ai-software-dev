import express from "express";
import verifyToken from "../middleware/verify";

const router = express.Router();



router.get('/', (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token)
    // if (!token ){return }
});

export default router;
