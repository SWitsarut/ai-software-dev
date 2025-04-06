import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Objects } from '../model/objects'

const router = express.Router()



/**
 * @swagger
 * /objects/new:
 *   post:
 *     summary: Create a new object for a data item
 *     tags: [Objects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataId
 *               - centroid
 *               - objectId
 *               - corners
 *             properties:
 *               dataId:
 *                 type: string
 *                 description: ID of the associated unprocessed data
 *                 example: "660f86e2b6cbe234c8d99e10"
 *               centroid:
 *                 type: object
 *                 description: Coordinates of the object centroid
 *                 example: { "x": 1.23, "y": 4.56, "z": 7.89 }
 *               objectId:
 *                 type: string
 *                 description: Identifier for the object
 *                 example: "building_42"
 *               corners:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x:
 *                       type: number
 *                     y:
 *                       type: number
 *                     z:
 *                       type: number
 *                 description: List of 3D corner points defining the object
 *                 example:
 *                   - { "x": 1.0, "y": 2.0, "z": 3.0 }
 *                   - { "x": 4.0, "y": 5.0, "z": 6.0 }
 *     responses:
 *       200:
 *         description: Object successfully created
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: success
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error while saving object
 */

// router.post('/new', async (req, res): Promise<any> => {
//     // consolen.log('adding new objects')
//     const { dataId, centroid, objectId, corners } = req.body
//     console.log(centroid)
//     if (!dataId || !centroid || !objectId || !corners) return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required." })
//     await Objects.create({ dataId, centroid, objectId, corners })
//     res.status(StatusCodes.OK).send("success")
// })


router.post('/new', async (req, res): Promise<any> => {
    const { dataId, centroid, objectId, corners } = req.body
    console.log(centroid)
    
    if (!dataId || !centroid || !objectId || !corners) 
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required." })
    
    // Transform the array into an object with x, y, z properties
    const formattedCentroid = Array.isArray(centroid) ? 
        { x: centroid[0], y: centroid[1], z: centroid[2] } : 
        centroid;
    
    await Objects.create({ dataId, centroid: formattedCentroid, objectId, corners })
    res.status(StatusCodes.OK).send("success")
})
export default router