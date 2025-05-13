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
        else if (role && approved) {
            hospitals = await prisma.hospital.findMany({
                include: { specialities: true },
                where: {
                    parentId: role === "HOSPITAL" ? null : { not: null },
                    approved: approved === "true" ? true : false,
                },
            });
        } else {
            hospitals = await prisma.hospital.findMany({
                include: { specialities: true },
                where: {
                    parentId: null,
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
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            res.status(400).send({
                message: "Latitude and Longitude are required in query params.",
            });
            return;
        }

        const lat = parseFloat(latitude as string);
        const lon = parseFloat(longitude as string);

        const hospitals = await prisma.$queryRawUnsafe<any[]>(`
            SELECT h.id, h.email, h.name, h.password, h."parentId",
                ST_AsText(h."location") AS location,  
                h."currLocation", h."createdAt", h."updatedAt", h."timings",
                h."approved", h."freeSlotDate", h."maxAppointments", h."emergency",
                h."fees", h."phone", h."documents",
                ST_DistanceSphere(
                    ST_MakePoint(CAST(h."currLocation"->>'longitude' AS DOUBLE PRECISION), 
                                CAST(h."currLocation"->>'latitude' AS DOUBLE PRECISION)),
                    ST_MakePoint(${lon}, ${lat})
                ) AS distance,

                (
                    SELECT COUNT(*)::INT
                    FROM "Hospital" AS child 
                    WHERE child."parentId" = h.id
                ) AS "doctorCount",

                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', s.id,
                            'name', s.name,
                            'description', s.description
                        )
                    ) FILTER (WHERE s.id IS NOT NULL),
                    '[]'
                ) AS specialities

            FROM "Hospital" h
            LEFT JOIN "HospitalSpeciality" hs ON hs."hospitalId" = h.id
            LEFT JOIN "Speciality" s ON s.id = hs."specialityId"
            WHERE h."parentId" IS NULL
            GROUP BY h.id
            ORDER BY distance
            LIMIT 8;
        `);

        res.status(200).send(hospitals);
    } catch (error) {
        console.error("Error fetching top hospitals:", error);
        res.status(500).send({
            message: "An error occurred while fetching top hospitals",
            error,
        });
    }
});

router.get("/doctors", async (req, res) => {
    try {
        const now = new Date();
        const nextSevenDays = new Date(now);
        nextSevenDays.setDate(now.getDate() + 7);

        const hospitals = await prisma.hospital.findMany({
            include: {
                specialities: true,
                parent: true,
            },
            where: {
                parentId: { not: null },
                freeSlotDate: {
                    gte: now,
                    lte: nextSevenDays,
                },
            },
        });

        res.status(200).send(hospitals);
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
                children: {
                    include: {
                        specialities: true,
                        parent: true,
                    },
                },
                parent: true,
                appointments: {
                    include: {
                        User: true,
                        Hospital: true,
                    },
                },
                ratings: {
                    include: {
                        Speciality: true,
                        User: true,
                    },
                },
                specialities: true,
            },
        });

        if (!hospital) {
            res.status(404).send({ message: "Hospital not found" });
            return;
        }

        if (hospital.parent !== null) {
            if (hospital.freeSlotDate == null) {
                const freeSlotDate = new Date();
                freeSlotDate.setDate(freeSlotDate.getDate() + 1);
                hospital.freeSlotDate = freeSlotDate;

                await prisma.hospital.update({
                    where: { id: hospital.id },
                    data: { freeSlotDate: freeSlotDate },
                });
            } else {
                const freeSlotDate = new Date(hospital.freeSlotDate);
                const now = new Date();

                if (freeSlotDate < now) {
                    freeSlotDate.setDate(freeSlotDate.getDate() + 1);
                    hospital.freeSlotDate = freeSlotDate;

                    await prisma.hospital.update({
                        where: { id: hospital.id },
                        data: { freeSlotDate: freeSlotDate },
                    });
                }
            }
        }

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

        const newHospitalData = {
            ...hospitalData,
            currLocation: {
                longitude: longitude,
                latitude: latitude,
            },
        };

        const encPass = await encryptPassword(newHospitalData.password);
        if (!encPass) {
            res.status(500).send({ error: "Error in Password Encryption" });
        }
        newHospitalData.password = encPass;

        delete newHospitalData.confirmPassword;
        const hospitalID = newHospitalData.hospital;
        delete newHospitalData.hospital;

        const hospital = await prisma.hospital.create({
            data: {
                ...newHospitalData,
                parentId: hospitalID || null,
                fees: Number(newHospitalData.fees),
                maxAppointments: Number(newHospitalData.maxAppointments),
            },
            include: { parent: true },
        });

        console.log("Created Hospital :=", hospital);

        await prisma.$executeRawUnsafe(`
            UPDATE "Hospital"
            SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
            WHERE id = '${hospital.id}';
        `);

        console.log("Updated Hospital Location :=", hospital);

        const token = await generateToken({ userId: hospital.id });

        console.log("Token := ", token);

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

interface NewHospital extends Hospital {
    longitude: number;
    latitude: number;
}

router.post("/manyHospitals", async (req, res) => {
    const hospitals = req.body;

    console.log("Creating multiple hospitals...");
    console.log("Hospitals Data := ", hospitals);

    if (!hospitals || hospitals.length === 0) {
        res.status(400).send({ error: "Hospitals are required" });
        return;
    }

    const hospitalsData = hospitals.map((hospital: NewHospital) => {
        const { longitude, latitude, ...rest } = hospital;

        return {
            ...rest,
            currLocation: {
                longitude: new Decimal(longitude),
                latitude: new Decimal(latitude),
            },
        };
    });

    try {
        const createdHospitals = await prisma.hospital.createMany({
            data: hospitalsData,
        });

        res.status(201).send(createdHospitals);
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
    const {
        email,
        name,
        password,
        parentId,
        phone,
        documents,
        currLocation,
        timings,
        approved,
        freeSlotDate,
        maxAppointments,
        emergency,
        fees,
    } = req.body;

    if (!req.body) {
        res.status(400).send({ error: "Data is required" });
        return;
    }

    try {
        const hospital = await prisma.hospital.update({
            where: { id },
            data: {
                email,
                name,
                password,
                parentId,
                phone,
                documents,
                currLocation,
                timings: timings ?? {},
                approved,
                freeSlotDate,
                maxAppointments,
                emergency,
                fees,
            },
        });

        res.status(200).send(hospital);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            details: (error as Error).message,
        });
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

        await prisma.hospital.update({
            where: { id },
            data: { currLocation: { longitude, latitude } },
        });

        res.status(200).send({ message: "Location updated" });
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
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
