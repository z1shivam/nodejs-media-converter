import { Request, Response } from "express";
import path from "path";
import { pdfToDocx, pdfToImg } from "../controllers/pdf-converter";
import { CONVERTED_DIR } from "../constants";

interface CustomRequest extends Request {
    file?: Express.Multer.File;
}

const PDF_MIME_TYPE = "application/pdf";
const SUPPORTED_PDF_FORMATS = ["docx", "images"];

export async function doSomethingWithPdf(
    req: CustomRequest,
    res: Response
): Promise<void> {
    if (!req.file) {
        res.status(400).json({ message: "No PDF file uploaded" });
        return;
    }

    if (req.file.mimetype !== PDF_MIME_TYPE) {
        res.status(400).json({
            message: `Invalid file type. Supported format: ${PDF_MIME_TYPE}`,
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
    if (!SUPPORTED_PDF_FORMATS.includes(convertTo)) {
        res.status(400).json({
            message: `Unsupported output format. Supported formats: ${SUPPORTED_PDF_FORMATS.join(
                ", "
            )}`,
        });
        return;
    }

    const reqFilePath = req.file.path;

    try {
        let downloadLink: string | string[];

        if (convertTo === "images") {
            const convertedFilePaths = await pdfToImg(reqFilePath);
            downloadLink = convertedFilePaths.map((filePath) =>
                path.join("/converted", path.relative(CONVERTED_DIR, filePath))
            );
        } else {
            const convertedFilePath = await pdfToDocx(reqFilePath);
            downloadLink = path.join(
                "/converted",
                path.relative(CONVERTED_DIR, convertedFilePath)
            );
        }

        const responseMessage = {
            success: true,
            error: null,
            input_filename: req.file.filename,
            download_link: downloadLink,
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
