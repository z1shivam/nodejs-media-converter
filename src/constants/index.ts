import path from "path";
import { promises as fsPromises } from "fs";

export async function createFolder() {
    await fsPromises.mkdir(CONVERTED_DIR, { recursive: true });
    await fsPromises.mkdir(TEMP_DIR, { recursive: true });
    await fsPromises.mkdir(UPLOADED_DIR, { recursive: true });
}
export const PORT = process.env.PORT || 8888;
export const CONVERTED_DIR = path.resolve(__dirname, "..", "..", "converted");
export const UPLOADED_DIR = path.resolve(__dirname, "..", "..", "uploads");
export const TEMP_DIR = path.resolve(__dirname, "..", "..", "temp");
export const IMG_TYPES: string[] = [
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
export const SUPPORTED_FORMATS: string[] = [
    "jpeg",
    "jpg",
    "png",
    "webp",
    "gif",
    "avif",
    "tiff",
    "heic",
    "heif",
    "jp2",
    "jpx",
    "j2k",
    "j2c",
    "jxl",
    "bmp",
];
