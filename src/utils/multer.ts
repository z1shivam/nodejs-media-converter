import multer, { FileFilterCallback, Multer, StorageEngine } from "multer";
import { CONVERTED_DIR, TEMP_DIR, UPLOADED_DIR } from "../constants";
import path from "node:path";
import { Request } from "express";


const storage: StorageEngine = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) => {
        cb(null, UPLOADED_DIR);
    },
    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) => {
        const uniqueSuffix: string = Date.now().toString();
        const ext: string = path.extname(file.originalname);
        const filename: string =
            path.basename(file.originalname, ext) + "-" + uniqueSuffix + ext;
        cb(null, filename);
    },
});

export const imgUpload: Multer = multer({
    storage,
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) => {
        const imgTypes: string[] = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/avif",
            "image/tiff",
            "image/svg+xml",
            "image/bmp",
            "image/heic",
            "image/heif",
            "image/jp2",
            "image/jpx",
            "image/j2k",
            "image/j2c",
            "image/jxl",
        ];
        const isValidType: boolean = imgTypes.includes(file.mimetype);

        if (isValidType) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    `Invalid file type. Expected image (JPEG, PNG, GIF, WebP, AVIF, TIFF, SVG, BMP, HEIC, HEIF, JP2, JPX, J2K, J2C, JXL).`
                )
            );
        }
    },
});

export const pdfUpload: Multer = multer({
    storage,
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) => {
        const pdfTypes: string[] = ["application/pdf"];
        const isValidType: boolean = pdfTypes.includes(file.mimetype);

        if (isValidType) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Expected PDF (application/pdf).`));
        }
    },
});
