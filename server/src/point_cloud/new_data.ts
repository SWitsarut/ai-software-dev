import express, { NextFunction } from "express";
import { UnprocessedData } from "../model/unprocessedData";
import { StatusCodes } from 'http-status-codes'
import validateAddData from "../middleware/validateAddData";
const router = express.Router();




router.post('/new_data', validateAddData, async (req, res): Promise<any> => {

    try {
        const { name, createBy, path } = req.body
        const formatData = {
            name, createBy, path
        }
        await UnprocessedData.create(formatData)
        return res.status(StatusCodes.CREATED)
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: e })
    }

})




export default router