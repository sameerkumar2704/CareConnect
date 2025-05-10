import { Router } from "express";
import { Hospital, PrismaClient } from "@prisma/client";
import { sendError } from "../utils/error.util";
import {
    comparePassword,
    encryptPassword,
    generateToken,
} from "../utils/auth.utils";
import { Decimal } from "@prisma/client/runtime/library";
import { reqE, reqS } from "../utils/logger.utils";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    console.log("Fetching hospitals...");

    try {
        const { emergency, role, approved } = req.query;

        console.log("Emergency:", emergency);

        let hospitals = null;

        if (emergency)
            hospitals = await prisma.hospital.findMany({
                include: { specialities: true },
                where: emergency === "true" ? { emergency: true } : undefined,
            });

        if (role && approved) {
            hospitals = await prisma.hospital.findMany({
                include: { specialities: true },
                where: {
                    parentId: role === "HOSPITAL" ? null : { not: null },
                    approved: approved === "true" ? true : false,
                },
            });
        }

        if (!hospitals) {
            res.status(404).send({ message: "No hospitals found" });
            return;
        }

        console.log("Hospitals fetched:", hospitals.length);

        res.status(200).send(hospitals);
    } catch (error) {
        console.error("Error fetching hospitals:", error);
        res.status(500).send({ message: "Internal Server Error" });
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

router.get("/top", async (req, res) => {
    try {
        const hospitals = await prisma.hospital.findMany({
            take: 8,
            include: {
                specialities: true,

                _count: {
                    select: {
                        children: true,
                    },
                },
            },
            where: {
                parent: null,
            },
        });

        const hospitalsWithDoctorCount = hospitals.map((hospital) => ({
            ...hospital,
            doctorCount: hospital._count.children,
        }));

        res.status(200).send(hospitalsWithDoctorCount);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching hospitals",
            error,
        });
    }
});

router.get("/:id/timings", async (req, res) => {
    const { id } = req.params;
    try {
        const hospital = await prisma.hospital.findUnique({
            where: { id: id },
            select: { timings: true },
        });

        if (!hospital) {
            res.status(404).send({ message: "Hospital not found" });
            return;
        }

        res.status(200).send(hospital.timings);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const hospital = await prisma.hospital.findUnique({
            where: { id: id },
            include: {
                children: true,
                parent: true,
                appointments: {
                    include: {
                        User: true,
                        Hospital: true,
                    },
                },
                ratings: true,
                currLocation: true,
                specialities: true,
            },
        });

        console.log("Hospital fetched:", hospital);

        res.status(200).send({
            ...hospital,
            role: hospital?.parentId ? "DOCTOR" : "HOSPITAL",
        });
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.post("/register", async (req, res) => {
    reqS("Hospital Registration Request");

    try {
        const hospitalData = { ...req.body };

        console.log("Hospital Data := ", hospitalData);

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
            where: { longitude, latitude },
        });

        if (!location) {
            location = await prisma.location.create({
                data: { longitude, latitude },
            });
        }

        const encPass = await encryptPassword(hospitalData.password);
        if (!encPass) {
            res.status(500).send({ error: "Error in Password Encryption" });
        }
        hospitalData.password = encPass;

        delete hospitalData.confirmPassword;
        const hospitalID = hospitalData.hospital;
        delete hospitalData.hospital;

        const hospital = await prisma.hospital.create({
            data: {
                ...hospitalData,
                locationId: location.id,
                parentId: hospitalID || null,
                fees: Number(hospitalData.fees),
                maxAppointments: Number(hospitalData.maxAppointments),
            },
            include: { parent: true },
        });

        console.log("Created Hospital :=", hospital);

        const token = await generateToken({ userId: hospital.id });

        res.status(201).send({ hospital, token });
    } catch (error) {
        sendError(res, error as Error);
    }

    reqE();
});

router.post("/login", async (req, res) => {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
        res.status(400).send({ error: "Email or Phone is required" });
        return;
    }

    if (!password) {
        res.status(400).send({ error: "Password are required" });
        return;
    }

    try {
        let hospital = null;

        if (email) {
            hospital = await prisma.hospital.findUnique({
                where: { email },
            });
        } else if (phone) {
            hospital = await prisma.hospital.findFirst({
                where: { phone },
            });
        }

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

router.put("/approve/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const hospital = await prisma.hospital.update({
            where: { id: id },
            data: {
                approved: true,
            },
        });

        res.status(200).send(hospital);
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.put("/reject/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const hospital = await prisma.hospital.update({
            where: { id: id },
            data: {
                approved: false,
            },
        });

        res.status(200).send(hospital);
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.put("/:id/timings", async (req, res) => {
    const { id } = req.params;
    const { timings } = req.body;

    try {
        const hospital = await prisma.hospital.update({
            where: { id: id },
            data: {
                timings,
            },
        });

        res.status(200).send(hospital);
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
            data: {
                ...currData,
                timings: currData.timings ?? undefined,
            },
        });

        res.status(200).send(hospital);
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.post("/location", async (req, res) => {
    try {
        const { id, longitude, latitude } = req.body;

        if (!longitude || !latitude) {
            res.status(400).send({
                error: "Longitude and Latitude are required.",
            });
            return;
        }

        const loc = await prisma.location.findFirst({
            where: { longitude, latitude },
        });

        if (!loc) {
            const location = await prisma.location.create({
                data: { longitude, latitude },
            });

            await prisma.hospital.update({
                where: { id },
                data: { locationId: location.id },
            });
        } else {
            await prisma.hospital.update({
                where: { id },
                data: { locationId: loc.id },
            });
        }

        res.status(200).send({ message: "Location updated" });
    } catch (error) {}
});

router.put("/date", async (req, res) => {
    try {
        const { id, date } = req.body;

        if (!date) {
            res.status(400).send({ error: "Date is required" });
            return;
        }

        const hospital = await prisma.hospital.update({
            where: { id },
            data: { freeSlotDate: new Date(date) },
        });

        res.status(200).send(hospital);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedHospital = await prisma.hospital.delete({
            where: { id },
        });

        res.status(200).send({ message: "Hospital deleted" });
    } catch (error) {
        sendError(res, error as Error);
    }
});

export default router;
