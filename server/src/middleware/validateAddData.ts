import { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

function validateAddData(req: any, res: any, next: NextFunction) {
    const { name, createBy, path } = req.body
    if (!name || !createBy || !path) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: "Missing required fields: name, createBy, path"
        })
    }
    next();
}

export default validateAddData