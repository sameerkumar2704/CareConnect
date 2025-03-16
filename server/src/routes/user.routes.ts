import { PrismaClient, User } from "@prisma/client";
import { Router, Request, Response } from "express";
import {
    comparePassword,
    encryptPassword,
    generateToken,
} from "../utils/auth.utils";
import { sendError } from "../utils/error.util";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const router = Router();

router.get("/", async (req, res) => {
    console.log("Getting all users");

    try {
        const users = await prisma.user.findMany({
            include: { currLocation: true },
        });
        res.status(200).send(users);
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.get("/reset", async (req, res) => {
    console.log("Resetting database");

    try {
        await prisma.user.deleteMany({});
        res.status(200).send({ message: "Database reset" });
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
        });
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.post("/register", async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = { ...req.body }; // Extract user details and location

        if (!userData.longitude || !userData.latitude) {
            res.status(400).send({
                error: "Longitude and Latitude are required.",
            });
            return;
        }

        const longitude = new Decimal(userData.longitude);
        const latitude = new Decimal(userData.latitude);

        delete userData.longitude;
        delete userData.latitude;

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

        const encPass = await encryptPassword(userData.password);
        if (!encPass) {
            res.status(500).send({ error: "Error in Password Encryption" });
            return;
        }
        userData.password = encPass;

        const user = await prisma.user.create({
            data: {
                ...userData,
                locationId: location.id,
            },
        });

        const token = await generateToken({ userId: user.id });

        res.status(201).send({ user, token });
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    let { longitude, latitude } = req.body;

    if (!email || !password) {
        res.status(400).send({ error: "Email and Password are required" });
        return;
    }

    if (!longitude || !latitude) {
        res.status(400).send({
            error: "Longitude and Latitude are required.",
        });
        return;
    }

    try {
        longitude = new Decimal(longitude);
        latitude = new Decimal(latitude);

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

        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            res.status(404).send({ error: "User not found" });
            return;
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            res.status(401).send({ error: "Invalid Credentials" });
            return;
        }

        await prisma.location.delete({
            where: { id: user.locationId },
        });

        user.locationId = location.id;

        const token = await generateToken({ id: user.id });
        res.status(200).send({ token });
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const currData: User = { ...req.body };

    try {
        const user = await prisma.user.update({
            where: { id: id },
            data: currData,
        });

        res.status(200).send(user);
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

        const deletedUser = await prisma.user.delete({
            where: { id },
        });

        await prisma.location.deleteMany({
            where: { id: deletedUser.locationId },
        });

        res.status(200).send({ message: "User deleted" });
    } catch (error) {
        sendError(res, error as Error);
    }
});

export default router;
