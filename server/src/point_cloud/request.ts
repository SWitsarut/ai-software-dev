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

    res.status(StatusCodes.OK).json({
        data: "assigned price", project: updatedProject
    })
})



export default router
