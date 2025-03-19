import { PrismaClient, User } from "@prisma/client";
import { Router, Request, Response } from "express";
import {
    comparePassword,
    encryptPassword,
    generateToken,
} from "../utils/auth.utils";
import { sendError } from "../utils/error.util";
import { Decimal } from "@prisma/client/runtime/library";
import { reqE, reqER, reqS } from "../utils/logger.utils";

const prisma = new PrismaClient();

const router = Router();

router.get("/", async (req, res) => {
    reqS("get all users");

    try {
        const users = await prisma.user.findMany({
            include: { currLocation: true },
        });

        console.log("Users :- ", users);

        res.status(200).send(users);
    } catch (error) {
        reqER(error as Error);

        sendError(res, error as Error);
    }

    reqE();
});

router.get("/reset", async (req, res) => {
    reqS("reset database");

    try {
        await prisma.user.deleteMany({});
        res.status(200).send({ message: "Database reset" });
    } catch (error) {
        reqER(error as Error);

        res.status(500).send({ error: "Something went wrong" });
    }

    reqE();
});

router.get("/:id", async (req, res) => {
    reqS("get user by id");

    const { id } = req.params;

    console.log("ID :- ", id);

    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
        });

        console.log("User :- ", user);

        res.status(200).send(user);
    } catch (error) {
        reqER(error as Error);

        res.status(500).send({ error: "Something went wrong" });
    }

    reqE();
});

router.post("/register", async (req: Request, res: Response): Promise<void> => {
    reqS("register user");

    try {
        const userData = { ...req.body };

        console.log("User Data :- ", userData);

        if (!userData.longitude || !userData.latitude) {
            throw new Error("Longitude and Latitude are required.");
        }

        const longitude = new Decimal(userData.longitude);
        const latitude = new Decimal(userData.latitude);

        console.log("Latitude :- ", latitude);
        console.log("Longitude :- ", longitude);

        delete userData.longitude;
        delete userData.latitude;

        let location = await prisma.location.findFirst({
            where: {
                longitude: longitude,
                latitude: latitude,
            },
        });

        console.log("Location If Already There :=", location);

        if (!location) {
            location = await prisma.location.create({
                data: {
                    longitude: longitude,
                    latitude: latitude,
                },
            });
            console.log("Location Created :=", location);
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

        console.log("Created User :=", user);

        const token = await generateToken({ userId: user.id });

        console.log("Generated Token :=", token);

        res.status(201).send({ user, token });
    } catch (error) {
        reqER(error as Error);

        sendError(res, error as Error);
    }
});

router.post("/login", async (req, res) => {
    reqS("login user");

    try {
        const { email, password } = req.body;

        let { longitude, latitude } = req.body;

        if (!email || !password) {
            throw new Error("Email and Password are Required");
        }

        console.log("Email := ", email);
        console.log("Password := ", password);

        if (!longitude || !latitude) {
            throw new Error("Latitude and Longitude are Required");
        }

        longitude = new Decimal(longitude);
        latitude = new Decimal(latitude);

        console.log("Latitude :- ", latitude);
        console.log("Longitude :- ", longitude);

        let location = await prisma.location.findFirst({
            where: {
                longitude: longitude,
                latitude: latitude,
            },
        });

        console.log("Location If Already There :=", location);

        if (!location) {
            location = await prisma.location.create({
                data: {
                    longitude: longitude,
                    latitude: latitude,
                },
            });
            console.log("Location Created :=", location);
        }

        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        console.log("User :- ", user);

        if (!user) {
            throw new Error("User Not Found");
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            throw new Error("Invalid Credentials");
        }

        await prisma.location.delete({
            where: { id: user.locationId },
        });

        console.log("Previous Location Deleted");

        user.locationId = location.id;

        const token = await generateToken({ id: user.id });

        console.log("Generated Token :=", token);

        res.status(200).send({ token });
    } catch (error) {
        reqER(error as Error);

        sendError(res, error as Error);
    }
});

router.put("/:id", async (req, res) => {
    reqS("update user");

    try {
        const { id } = req.params;

        console.log("ID :- ", id);

        const user = prisma.user.findFirst({
            where: { id: id },
        });

        console.log("User :- ", user);

        if (!user) {
            throw new Error("User not found");
        }

        const userData: User = { ...req.body };

        console.log("User Data :- ", userData);

        const token = await generateToken({ userId: userData.id });

        console.log("Generated Token :=", token);

        res.status(201).send({ user, token });
    } catch (error) {
        reqER(error as Error);

        sendError(res, error as Error);
    }
});

router.put("/resetpassword/:id", async (req, res) => {
    reqS("reset password");

    try {
        const { id } = req.params;

        console.log("ID :- ", id);

        const user = await prisma.user.findUnique({
            where: { id: id },
        });

        console.log("User :- ", user);

        if (!user) {
            throw new Error("User not found");
        }

        const { password } = req.body;

        console.log("Password := ", password);

        const encPass = await encryptPassword(password);
        if (!encPass) {
            throw new Error("Error in Password Encryption");
        }

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { password: encPass },
        });

        console.log("Updated User :=", updatedUser);

        res.status(200).send(updatedUser);
    } catch (error) {
        reqER(error as Error);

        sendError(res, error as Error);
    }
});

router.delete("/:id", async (req, res) => {
    reqS("delete user");

    try {
        const { id } = req.params;

        console.log("ID :- ", id);

        await prisma.appointment.deleteMany({ where: { userId: id } });
        await prisma.prescription.deleteMany({ where: { userId: id } });
        await prisma.report.deleteMany({ where: { userId: id } });
        await prisma.ratings.deleteMany({ where: { userId: id } });

        console.log("All Related Data Deleted");

        const deletedUser = await prisma.user.delete({
            where: { id },
        });

        console.log("Deleted User :=", deletedUser);

        await prisma.location.deleteMany({
            where: { id: deletedUser.locationId },
        });

        console.log("Location Deleted");

        res.status(200).send({ message: "User deleted" });
    } catch (error) {
        reqER(error as Error);

        sendError(res, error as Error);
    }
});

export default router;
