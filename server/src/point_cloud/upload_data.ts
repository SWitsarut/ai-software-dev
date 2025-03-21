import { Router } from 'express'
import { StatusCodes } from 'http-status-codes';
import multer from "multer";
import path from 'path';

const router = Router()



const uploadDir = "/app/uploaded";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files in `public/point_cloud/las`
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Rename file
    }
});

const upload = multer({ storage })


router.post('/', upload.single('file'), async (req, res): Promise<any> => {
    if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'No file provided'
        });
    }

    // Respond with file information after successful upload
    return res.status(StatusCodes.CREATED).json({
        message: 'File uploaded successfully',
        file: {
            filename: req.file.filename,
            path: `/uploaded/${req.file.filename}`
        }
    });
});


export default router