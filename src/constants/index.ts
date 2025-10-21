import path from "path";
import { promises as fsPromises } from "fs";

/**
 * Creates necessary directories for the application.
 * Uses recursive: true to create parent directories if they don't exist.
 */
export async function createFolder() {
    await fsPromises.mkdir(CONVERTED_DIR, { recursive: true });
    await fsPromises.mkdir(TEMP_DIR, { recursive: true });
    await fsPromises.mkdir(UPLOADED_DIR, { recursive: true });
}
export const PORT = process.env.PORT || 8888;

// Directory paths - use path.resolve for cross-platform compatibility
export const CONVERTED_DIR = path.resolve(__dirname, "..", "..", "converted");
export const UPLOADED_DIR = path.resolve(__dirname, "..", "..", "uploads");
export const TEMP_DIR = path.resolve(__dirname, "..", "..", "temp");
export const PDF_PYTHON_SCRIPT = path.resolve(
    __dirname,
    "..",
    "..",
    "python",
    "pdf-to-docx.py"
);
// MIME types accepted for image uploads
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

// Image formats supported for conversion
// Note: BMP is supported through custom converters, not Sharp
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
