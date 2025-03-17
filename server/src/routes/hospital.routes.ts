import { Router } from "express";
import { Hospital, PrismaClient } from "@prisma/client";
import { sendError } from "../utils/error.util";
import {
    comparePassword,
    encryptPassword,
    generateToken,
} from "../utils/auth.utils";
import { Decimal } from "@prisma/client/runtime/library";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const hospitals = await prisma.hospital.findMany();
        res.status(200).send(hospitals);
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.get("/reset", async (req, res) => {
    console.log("Resetting database");

    try {
        await prisma.hospital.deleteMany({});
        res.status(200).send({ message: "Database reset" });
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const hospital = await prisma.hospital.findUnique({
            where: { id: id },
        });
        res.status(200).send(hospital);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.post("/register", async (req, res) => {
    try {
        const hospitalData = { ...req.body };

        if (!hospitalData.longitude || !hospitalData.latitude) {
            res.status(400).send({
                error: "Longitude and Latitude are required.",
            });
            return;
        }

        const longitude = new Decimal(hospitalData.longitude);
        const latitude = new Decimal(hospitalData.latitude);

        delete hospitalData.longitude;
        delete hospitalData.latitude;

        let location = await prisma.location.findFirst({
            where: {
                longitude: longitude,
                latitude: latitude,
            },
        });

        if (!location) {
            location = await prisma.location.create({
                data: {
                    longitude: longitude,
                    latitude: latitude,
                },
            });
        }

        const encPass = await encryptPassword(hospitalData.password);
        if (!encPass) {
            res.status(500).send({ error: "Error in Password Encryption" });
            return;
        }
        hospitalData.password = encPass;

        const hospital = await prisma.hospital.create({
            data: {
                ...hospitalData,
                locationId: location.id,
            },
        });

        const token = await generateToken({ userId: hospital.id });

        res.status(201).send({ hospital, token });
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send({ error: "Email and Password are required" });
        return;
    }

    try {
        const hospital = await prisma.hospital.findUnique({
            where: { email: email },
        });

        if (!hospital) {
            res.status(404).send({ error: "Hospital not found" });
            return;
        }

        const isMatch = await comparePassword(password, hospital.password);

        if (!isMatch) {
            res.status(401).send({ error: "Invalid Credentials" });
            return;
        }

        const token = await generateToken({ id: hospital.id });
        res.status(200).send({ token });
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const currData: Hospital = { ...req.body };

    try {
        const hospital = await prisma.hospital.update({
            where: { id: id },
            data: currData,
        });

        res.status(200).send(hospital);
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.appointment.deleteMany({ where: { userId: id } });
        await prisma.prescription.deleteMany({ where: { userId: id } });
        await prisma.report.deleteMany({ where: { userId: id } });
        await prisma.ratings.deleteMany({ where: { userId: id } });

        const deletedHospital = await prisma.hospital.delete({
            where: { id },
        });

        await prisma.location.deleteMany({
            where: { id: deletedHospital.locationId },
        });

        res.status(200).send({ message: "Hospital deleted" });
    } catch (error) {
        sendError(res, error as Error);
    }
});

export default router;
