import express, {
    Express,
    Request,
    Response,
    NextFunction,
    urlencoded,
    json,
} from "express";
import cors from "cors";
import { CONVERTED_DIR, createFolder, PORT } from "./constants";
import { imgUpload } from "./utils/multer";
import { doSomethingWithImg } from "./handlers/imgHandler";

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

    app.listen(PORT, () => {
        console.log("server is running");
    });
}

main();
