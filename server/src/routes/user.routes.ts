import { PrismaClient, User } from "@prisma/client";
import { Router } from "express";
import {
    comparePassword,
    encryptPassword,
    generateToken,
} from "../utils/auth.utils";
import { sendError } from "../utils/error.util";

const prisma = new PrismaClient();

const router = Router();

router.get("/", async (req, res) => {
    console.log("Getting all users");

    try {
        const users = await prisma.user.findMany();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.get("/rt", async (req, res) => {
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

router.post("/", async (req, res) => {
    const currData: User = { ...req.body };

    try {
        const encPass = await encryptPassword(currData.password);

        if (encPass) {
            currData.password = encPass;
        } else {
            res.status(500).send({ error: "Error in Password Field" });
            return;
        }

        const user = await prisma.user.create({ data: currData });

        const token = await generateToken({ userId: user.id });
        res.status(201).send({ user, token });
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
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
        await prisma.user.delete({
            where: { id: id },
        });

        res.status(200).send({ message: "User deleted" });
    } catch (error) {
        sendError(res, error as Error);
    }
});

export default router;
