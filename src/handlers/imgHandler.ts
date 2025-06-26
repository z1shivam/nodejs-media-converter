import { Request, Response } from "express";
import { IMG_TYPES, SUPPORTED_FORMATS } from "../constants";
import { imageConverter } from "../controllers/img-converter";

interface CustomRequest extends Request {
    file?: Express.Multer.File;
}

export async function doSomethingWithImg(
    req: CustomRequest,
    res: Response
): Promise<void> {
    if (!req.file) {
        res.status(400).json({ message: "No image file uploaded" });
        return;
    }
    if (!IMG_TYPES.includes(req.file.mimetype)) {
        res.status(400).json({
            message: `Invalid file type. Supported formats: ${SUPPORTED_FORMATS.join(
                ", "
            )}`,
        });
        return;
    }
    const convertTo: string | undefined = req.body.convertTo?.toLowerCase();
    if (!convertTo) {
        res.status(400).json({
            message: "convertTo parameter is required in the request body",
        });
        return;
    }
    if (!SUPPORTED_FORMATS.includes(convertTo)) {
        res.status(400).json({
            message: `Unsupported output format. Supported formats: ${SUPPORTED_FORMATS.join(
                ", "
            )}`,
        });
        return;
    }

    const reqFilePath = req.file.path;
    try {
        const convertedFileName = await imageConverter(reqFilePath, convertTo);
        const responseMessage = {
            success: true,
            error: null,
            input_filename: req.file.filename,
            download_link: `/converted/${convertedFileName}`,
        };
        res.status(201).json(responseMessage);
    } catch (error) {
        const responseMessage = {
            success: false,
            error: String(error),
        };
        res.status(500).json(responseMessage);
    }
}
