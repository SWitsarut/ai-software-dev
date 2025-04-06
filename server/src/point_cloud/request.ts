import express from 'express'
import authenticateToken from '../middleware/authenticateToken'
import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { User } from '../model/user';
import { Teams } from '../model/teams';
import { v4 as uuidv4 } from 'uuid';  // Import UUID generator
import { MembersRoles, TeamsMember } from '../model/teamMembers';
import { StatusCodes } from 'http-status-codes';
import { Request } from '../model/request';
import { UnprocessedData, UnprocessedDataStatus } from '../model/unprocessedData';
import { Project } from '../model/project';
import axios from '../axios';
import { cal_init_price } from '../payments/calculate_price';

const router = express.Router()




const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Only create new folder and data record for the first file in the request
        if (!req.dataId) {
            const today = new Date();
            const folderName = today.toISOString().split('T')[0]; // e.g., '2025-03-29'
            const uniqueSubfolder = uuidv4();  // Generate unique ID once per request

            // Store the subfolder path in the request object for reuse
            req.uniqueFolderPath = path.join('/app/uploaded', folderName, uniqueSubfolder);

            // Create the database record once per request
            const storedData = await UnprocessedData.create({});
            req.dataId = { storedData: storedData._id };

            // Create the directory once
            fs.mkdirSync(req.uniqueFolderPath, { recursive: true });
        }

        if (!req.uniqueFolderPath) {
            return cb(new Error('Upload path not defined'), '');
        }

        cb(null, req.uniqueFolderPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage })


/**
 * @swagger
 * /request:
 *   post:
 *     summary: Upload unprocessed data and create a project request
 *     tags: [Request]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *               - dataName
 *               - files
 *               - selectedLabels
 *             properties:
 *               teamId:
 *                 type: string
 *                 description: ID of the team making the request
 *                 example: "60f7c812c2e599001c8c57b3"
 *               dataName:
 *                 type: string
 *                 description: A name for the uploaded dataset
 *                 example: "urban_buildings_set_01"
 *               selectedLabels:
 *                 type: string
 *                 description: JSON stringified array of selected label names
 *                 example: "[\"building\", \"tree\"]"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Point cloud data files to upload
 *     responses:
 *       200:
 *         description: Project request successfully created with pricing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   example: "assigned price"
 *                 project:
 *                   type: object
 *                   description: The created project with assigned price
 *       400:
 *         description: Missing required fields (e.g., files, teamId, or dataName)
 *       401:
 *         description: Unauthorized - user not found or invalid token
 *       403:
 *         description: Forbidden - user is not a team admin
 *       500:
 *         description: Server error or price calculation failed
 */

router.post('/request', authenticateToken, upload.array('files'), async (req, res): Promise<any> => {
    const { teamId, dataName } = req.body;
    if (!req.files || req.files.length == 0 || !dataName) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing files/dataName." })

    // check teamId
    if (!teamId) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing teamId." })

    // check user exist
    const user = await User.findOne({ userId: req.user?.userId })
    if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "User not found." })

    // check permission
    const membership = await TeamsMember.findOne({ teamId, userId: user._id })
    if (membership?.role !== MembersRoles.admin) return res.status(StatusCodes.FORBIDDEN).json({ error: "You don't have permission" })

    //add file to database and update request
    const updatedData = await UnprocessedData.findByIdAndUpdate(
        req.dataId?.storedData,
        {
            name: dataName,
            createBy: user._id,
            path: req.uniqueFolderPath,
            status: UnprocessedDataStatus.UPLOADED
        },
        { new: true }
    );
    if (!updatedData) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Unable to update UnprocessedData" })
    const request = await Request.create({ teamId, dataId: updatedData._id })

    res.status(StatusCodes.OK).json({data: "data uploaded"})

    const selectedLabels = JSON.parse(req.body.selectedLabels);
    const createdProject = await Project.create({
        teamId,
        dataId: updatedData._id,
        targets: selectedLabels,
        name: dataName
    });



    const label_price = cal_init_price(selectedLabels)


    const price = await axios.post<{ price: string | number }>(`/calculate_price`, {
        path: updatedData.path,
    }).catch(error => {
        console.error("Error in calculating price:", error);
        res.status(500).json({ error: "Error calculating price." });
    });
    const pricedData = await UnprocessedData.findByIdAndUpdate(updatedData._id, {
        price: price?.data.price
    })

    const updatedProject = await Project.findByIdAndUpdate(createdProject._id, {
        amount: Number(price?.data.price ?? 50) + label_price
    }, { new: true })

    // res.status(StatusCodes.OK).json({
    //     data: "assigned price", project: updatedProject
    // })
})



export default router
