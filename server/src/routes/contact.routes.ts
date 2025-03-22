import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const messages = await prisma.feedback.findMany();

        res.status(200).send(messages);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        const currMessage = await prisma.feedback.create({
            data: {
                name,
                email,
                phone,
                message,
            },
        });

        res.status(201).send(currMessage);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

export default router;
