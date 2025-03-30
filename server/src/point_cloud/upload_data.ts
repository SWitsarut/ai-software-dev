// import { Router } from 'express'
// import { StatusCodes } from 'http-status-codes';
// import multer from "multer";
// import fs from 'fs'
// import path from 'path';
// import authenticateToken from '../middleware/authenticateToken';
// import { uploadImage } from '../middleware/file';

// const router = Router()




// router.post('/single', upload.single('file'), async (req, res): Promise<any> => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded');
//     }
//     res.send('File uploaded successfully: ' + req.file.path);
// });


// // Multiple files upload route
// router.post('/multiple', upload.array('files', 10), async (req, res): Promise<any> => {
//     if (!req.files || req.files.length === 0) {
//         return res.status(400).send('No files uploaded');
//     }
    
//     res.send(`${req.files.length} files uploaded successfully, ${req.files}`);
// });



// // router.post('/', upload.single('file'), async (req, res): Promise<any> => {
// //     if (!req.file) {
// //         return res.status(StatusCodes.BAD_REQUEST).json({
// //             error: 'No file provided'
// //         });
// //     }

// //     // Respond with file information after successful upload
// //     return res.status(StatusCodes.CREATED).json({
// //         message: 'File uploaded successfully',
// //         file: {
// //             filename: req.file.filename,
// //             path: `/uploaded/${req.file.filename}`
// //         }
// //     });
// // });


// export default router