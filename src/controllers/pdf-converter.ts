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

/**
 * Converts PDF to individual JPEG images (one per page).
 * Uses pdf-poppler library which is a Node.js wrapper around poppler-utils.
 */
export async function pdfToImg(inputFilePath: string): Promise<string[]> {
    const outputDir: string = path.join(CONVERTED_DIR, "images");
    // Sanitize filename: remove slashes and replace spaces with hyphens
    const outputPrefix: string = path.parse(inputFilePath).name.replace("/","").replace(" ","-");

    await fsPromises.mkdir(outputDir, { recursive: true });

    const opts: PdfConvertOptions = {
        format: "jpeg",
        out_dir: outputDir,
        out_prefix: outputPrefix,
        page: null, // null means convert all pages
    };

    try {
        await pdf.convert(inputFilePath, opts);
        const files: string[] = await fsPromises.readdir(outputDir);
        // Filter to only return files that match our prefix
        const imageFiles: string[] = files
            .filter((file: string) => file.startsWith(outputPrefix))
            .map((file: string) => file);
        return imageFiles;
    } catch (err: unknown) {
        throw new Error(
            `Error converting PDF to images: ${(err as Error).message}`
        );
    }
}

/**
 * Converts PDF to DOCX format by spawning a Python subprocess.
 * 
 * Challenge: No reliable Node.js library exists for PDF to DOCX with good formatting.
 * Solution: Use Python's pdf2docx library via child process spawning.
 * 
 * The function returns a Promise that resolves when the Python script completes successfully,
 * or rejects if the conversion fails.
 */
export async function pdfToDocx(inputFilePath: string): Promise<string> {
    const outputDir: string = path.join(CONVERTED_DIR, "docx");
    // Extract just the base name, removing any extra spaces
    const outputFileName: string = `${path.parse(inputFilePath).name.split(" ")[0]}.docx`;
    const outputPath: string = path.join(outputDir, outputFileName);

    await fsPromises.mkdir(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
        // Cross-platform Python command detection
        // Windows typically uses 'python', Unix-like systems use 'python3'
        const pythonCommand =
            process.platform === "win32" ? "python" : "python3";
        
        // Spawn Python process with script path and arguments
        const pythonProcess = spawn(pythonCommand, [
            PDF_PYTHON_SCRIPT,
            inputFilePath,
            outputPath,
        ]);

        // Capture standard output for debugging
        pythonProcess.stdout.on("data", (data: Buffer) => {
            console.log(`Python stdout: ${data}`);
        });

        // Capture error output for debugging
        pythonProcess.stderr.on("data", (data: Buffer) => {
            console.error(`Python stderr: ${data}`);
        });

        // Handle process completion
        pythonProcess.on("close", (code: number) => {
            if (code === 0) {
                // Success: exit code 0
                resolve(outputFileName);
            } else {
                // Failure: non-zero exit code
                reject(new Error("Error converting PDF to DOCX"));
            }
        });
    });
}
