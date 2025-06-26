import cors from "cors";
import express, { Express, json, Request, Response, urlencoded } from "express";
import { CONVERTED_DIR, createFolder, PORT } from "./constants";
import { doSomethingWithImg } from "./handlers/imgHandler";
import { doSomethingWithPdf } from "./handlers/pdfHandler";
import { imgUpload, pdfUpload } from "./utils/multer";

async function main() {
    const app: Express = express();
    await createFolder();
    app.use(urlencoded({ extended: true }));
    app.use(json());
    app.use(cors());
    app.use("/converted", express.static(CONVERTED_DIR));

    app.get("/", (_req: Request, res: Response) => {
        res.status(200).json({ message: "Server is up and running" });
    });

    app.post(
        "/img-convert",
        imgUpload.single("uploaded_img"),
        doSomethingWithImg
    );
    app.post(
        "/pdf-convert",
        pdfUpload.single("uploaded_pdf"),
        doSomethingWithPdf
    );

    app.listen(PORT, () => {
        console.log("server is running");
    });
}

main();
