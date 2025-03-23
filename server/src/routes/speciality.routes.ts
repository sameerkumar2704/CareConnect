import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const specialities = await prisma.speciality.findMany();
        res.status(200).send(specialities);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching specialities",
            error,
        });
    }
});

router.get("/top", async (req, res) => {
    try {
        const specialities = await prisma.speciality.findMany({
            take: 8,
        });
        res.status(200).send(specialities);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching specialities",
            error,
        });
    }
});

router.get("/reset", async (req, res) => {
    try {
        await prisma.speciality.deleteMany({});
        res.status(200).send({ message: "Database reset" });
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.post("/", async (req, res) => {
    try {
        const data = await prisma.speciality.createMany({
            data: req.body,
        });
        res.status(201).send(data);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching specialities",
            error,
        });
    }
});

export default router;
