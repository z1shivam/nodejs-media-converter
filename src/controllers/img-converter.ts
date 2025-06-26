import sharp, { FormatEnum } from "sharp";
import path from "path";
import { promises as fsPromises } from "fs";
import * as fs from "fs";
import * as bmp from "bmp-js";
import { PNG } from "pngjs";
import { CONVERTED_DIR, SUPPORTED_FORMATS, TEMP_DIR } from "../constants";

interface BmpData {
    data: Buffer;
    width: number;
    height: number;
}

async function convertBMPtoPNG(
    inputPath: string,
    outputDir: string
): Promise<string> {
    if (
        !fs.existsSync(inputPath) ||
        path.extname(inputPath).toLowerCase() !== ".bmp"
    ) {
        throw new Error("Input file must be a valid BMP file");
    }

    if (!fs.existsSync(outputDir)) {
        await fsPromises.mkdir(outputDir, { recursive: true });
    }

    const bmpBuffer = fs.readFileSync(inputPath);
    const bmpData = bmp.decode(bmpBuffer);
    const { width, height, data } = bmpData;
    const rgbaData = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
        rgbaData[i] = data[i + 2]; // R
        rgbaData[i + 1] = data[i + 1]; // G
        rgbaData[i + 2] = data[i]; // B
        rgbaData[i + 3] = data[i + 3]; // A
    }

    const fileName =
        path.basename(inputPath, path.extname(inputPath)) + "_temp.png";
    const outputPath = path.join(outputDir, fileName);

    await sharp(rgbaData, { raw: { width, height, channels: 4 } })
        .toFormat("png", { compressionLevel: 9 })
        .toFile(outputPath);

    return outputPath;
}

async function convertToBMP(
    inputPath: string,
    outputDir: string
): Promise<string> {
    if (!fs.existsSync(outputDir)) {
        await fsPromises.mkdir(outputDir, { recursive: true });
    }

    const pngBuffer = fs.readFileSync(inputPath);
    const png = PNG.sync.read(pngBuffer);
    const bmpData: BmpData = {
        width: png.width,
        height: png.height,
        data: Buffer.from(png.data),
    };

    const bmpBuffer = bmp.encode(bmpData);
    const fileName = path.basename(inputPath, path.extname(inputPath)) + ".bmp";
    const outputPath = path.join(outputDir, fileName);

    await fsPromises.writeFile(outputPath, bmpBuffer.data);
    return outputPath;
}

export const imageConverter = async (
    inputFilePath: string,
    convertTo: string
): Promise<string> => {
    try {
        if (!fs.existsSync(inputFilePath)) {
            throw new Error("Input file does not exist");
        }

        const targetFormat = convertTo.toLowerCase();
        if (!SUPPORTED_FORMATS.includes(targetFormat)) {
            throw new Error(
                `Unsupported output format. Supported formats: ${SUPPORTED_FORMATS.join(
                    ", "
                )}`
            );
        }

        const inputExt = path
            .extname(inputFilePath)
            .toLowerCase()
            .replace(".", "");
        if (!SUPPORTED_FORMATS.includes(inputExt) && inputExt !== "bmp") {
            throw new Error(`Unsupported input format: ${inputExt}`);
        }

        const originalFilename = path
            .basename(inputFilePath, path.extname(inputFilePath))
            .replace(/\s+/g, "-");
        const outputFilename = `${originalFilename}_${Date.now()}_converted.${targetFormat}`;
        const outputPath = path.join(CONVERTED_DIR, outputFilename);
        let tempPngPath: string | null = null;

        try {
            // Case 1: Input is BMP, output is not BMP
            if (inputExt === "bmp" && targetFormat !== "bmp") {
                tempPngPath = await convertBMPtoPNG(inputFilePath, TEMP_DIR);
                await sharp(tempPngPath)
                    .toFormat(targetFormat as keyof FormatEnum)
                    .toFile(outputPath);
            }
            // Case 2: Input is not BMP, output is BMP
            else if (targetFormat === "bmp" && inputExt !== "bmp") {
                tempPngPath = path.join(
                    TEMP_DIR,
                    `${originalFilename}_temp.png`
                );
                await sharp(inputFilePath).png().toFile(tempPngPath);
                await convertToBMP(tempPngPath, CONVERTED_DIR);
                const bmpOutputPath = path.join(
                    CONVERTED_DIR,
                    `${originalFilename}_temp.bmp`
                );
                await fsPromises.rename(bmpOutputPath, outputPath);
            }
            // Case 3: Input is BMP, output is BMP
            else if (inputExt === "bmp" && targetFormat === "bmp") {
                await fsPromises.copyFile(inputFilePath, outputPath);
            }
            // Case 4: Any other format conversion
            else {
                await sharp(inputFilePath)
                    .toFormat(targetFormat as keyof FormatEnum)
                    .toFile(outputPath);
            }

            return outputFilename;
        } finally {
            if (tempPngPath && fs.existsSync(tempPngPath)) {
                try {
                    await fsPromises.unlink(tempPngPath);
                } catch (err) {
                    console.warn(
                        `Failed to delete temp file ${tempPngPath}:`,
                        err
                    );
                }
            }
        }
    } catch (error) {
        console.error(`Error in imageConverter: ${(error as Error).message}`);
        throw error;
    }
};
