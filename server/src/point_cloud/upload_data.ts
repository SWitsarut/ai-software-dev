import { Router } from 'express'
import { StatusCodes } from 'http-status-codes';
import multer from "multer";
import path from 'path';
import authenticateToken from '../middleware/authenticateToken';
import { uploadImage } from '../middleware/file';

const router = Router()



const uploadDir = "/app/uploaded";


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage })


router.post('/image',authenticateToken, uploadImage.single('image'), async (req, res): Promise<any> => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" })
    }
    // console.log(req.user?.)
    res.json({ message: "Image uploaded", fileName: req.file.filename,header:req.user?.userId });
})

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