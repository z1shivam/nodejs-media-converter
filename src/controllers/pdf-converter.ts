import path from "path";
import { promises as fsPromises } from "fs";
import pdf from "pdf-poppler";
import { spawn } from "child_process";
import { CONVERTED_DIR, PDF_PYTHON_SCRIPT } from "../constants";

interface PdfConvertOptions {
    format: string;
    out_dir: string;
    out_prefix: string;
    page: number | null;
}

export async function pdfToImg(inputFilePath: string): Promise<string[]> {
    const outputDir: string = path.join(CONVERTED_DIR, "images");
    const outputPrefix: string = path.parse(inputFilePath).name;

    // Ensure output directory exists
    await fsPromises.mkdir(outputDir, { recursive: true });

    const opts: PdfConvertOptions = {
        format: "jpeg",
        out_dir: outputDir,
        out_prefix: outputPrefix,
        page: null,
    };

    try {
        await pdf.convert(inputFilePath, opts);
        const files: string[] = await fsPromises.readdir(outputDir);
        const imageFiles: string[] = files
            .filter((file: string) => file.startsWith(outputPrefix))
            .map((file: string) => path.join(outputDir, file));
        return imageFiles;
    } catch (err: unknown) {
        throw new Error(
            `Error converting PDF to images: ${(err as Error).message}`
        );
    }
}

export async function pdfToDocx(inputFilePath: string): Promise<string> {
    const outputDir: string = path.join(CONVERTED_DIR, "docx");
    const outputFileName: string = `${path.parse(inputFilePath).name}.docx`;
    const outputPath: string = path.join(outputDir, outputFileName);

    // Ensure output directory exists
    await fsPromises.mkdir(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
        const pythonCommand =
            process.platform === "win32" ? "python" : "python3";
        const pythonProcess = spawn(pythonCommand, [
            PDF_PYTHON_SCRIPT,
            inputFilePath,
            outputPath,
        ]);

        pythonProcess.stdout.on("data", (data: Buffer) => {
            console.log(`Python stdout: ${data}`);
        });

        pythonProcess.stderr.on("data", (data: Buffer) => {
            console.error(`Python stderr: ${data}`);
        });

        pythonProcess.on("close", (code: number) => {
            if (code === 0) {
                resolve(outputPath);
            } else {
                reject(new Error("Error converting PDF to DOCX"));
            }
        });
    });
}
