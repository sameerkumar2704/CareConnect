import express from "express";
import userRouter from "./routes/user.routes";
import hospitalRouter from "./routes/hospital.routes";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const app = express();

const prisma = new PrismaClient();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use("/api/users", userRouter);
app.use("/api/hospitals", hospitalRouter);

app.get("/reset", async (req, res) => {
    // Reset the database

    await prisma.user.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.hospital.deleteMany({});

    res.status(200).send({ message: "Database reset" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
