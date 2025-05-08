import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const specialities = await prisma.speciality.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: { hospitals: true },
                },
            },
        });

        // Optionally format the response if needed
        const formatted = specialities.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            hospitalCount: s._count.hospitals,
        }));

        res.status(200).send(formatted);
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
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: { hospitals: true },
                },
            },
        });

        // Optionally format the response if needed
        const formatted = specialities.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            hospitalCount: s._count.hospitals,
        }));

        res.status(200).send(formatted);
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
