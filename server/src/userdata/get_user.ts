import express from "express";
import { User } from "../model/user";
import { StatusCodes } from "http-status-codes";
import authenticateToken from "../middleware/authenticateToken";

const router = express.Router();


/**
 * @swagger
 * /user/{id}:
 *   get:
 *     tags: [User]
 *     summary: Get user information by ID
 *     description: Retrieves public user information based on the provided user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to fetch.
 *     responses:
 *       200:
 *         description: Successfully retrieved user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "user123"
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *       400:
 *         description: No ID was provided.
 *       404:
 *         description: User not found.
 */

router.get('/:id', async (req, res): Promise<any> => {
    const { id } = req.params
    if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "no id provided" })
    }
    const user = await User.findOne({ userId: id }).select('-password -phoneNumber')
    res.status(StatusCodes.OK).json(user)
});



export default router;
