import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Objects } from '../model/objects'

const router = express.Router()

router.post('/new', async (req, res): Promise<any> => {
    console.log('adding new objects')
    const { dataId, centroid, objectId, corners } = req.body
    if (!dataId || !centroid || !objectId || !corners) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required." })
    await Objects.create({ dataId, centroid, objectId, corners })
    res.status(StatusCodes.OK).send("success")
})


export default router