import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { PORT } from "./utils/constants.utils";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hi There!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
