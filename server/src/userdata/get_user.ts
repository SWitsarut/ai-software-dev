import express from "express";
import { User } from "../model/user";
import { StatusCodes } from "http-status-codes";
import authenticateToken from "../middleware/authenticateToken";

const router = express.Router();



router.get('/:id', async (req, res): Promise<any> => {
    const { id } = req.params
    if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "no id provided" })
    }
    const user = await User.findOne({ userId: id }).select('-password -phoneNumber')
    res.status(StatusCodes.OK).json(user)
});



export default router;
