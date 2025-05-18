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
    reqS("Fetching Hospitals");

    try {
        const { emergency, role, approved, longitude, latitude, search } =
            req.query;

        console.log("Emergency:", emergency);
        console.log("Role:", role);
        console.log("Approved:", approved);
        console.log("Longitude:", longitude);
        console.log("Latitude:", latitude);
        console.log("Search:", search);

        if (search !== undefined) {
            const hospitals = await prisma.hospital.findMany({
                where: {
                    name: {
                        contains: (search && (search as string)) || "",
                        mode: "insensitive",
                    },
                },
            });

            console.log("Hospitals fetched:", hospitals.length);

            res.status(200).send(hospitals);
            return;
        }

        let hospitals = null;

        if (emergency)
            hospitals = await prisma.$queryRawUnsafe<any[]>(`
                SELECT h.id, h.email, h.name, h.password, h."parentId",
                ST_AsText(h."location") AS location,  
                h."currLocation", h."createdAt", h."updatedAt", h."timings",
                h."approved", h."freeSlotDate", h."maxAppointments", h."emergency",
                h."fees", h."phone",
                
                ST_DistanceSphere(
                    ST_MakePoint(CAST(h."currLocation"->>'longitude' AS DOUBLE PRECISION), 
                                CAST(h."currLocation"->>'latitude' AS DOUBLE PRECISION)),
                    ST_MakePoint(${longitude}, ${latitude})
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
            WHERE h."parentId" IS NULL AND h."emergency" = true

            GROUP BY 
                h.id, h.email, h.name, h.password, h."parentId",
                h."location", h."currLocation", h."createdAt", h."updatedAt", h."timings",
                h."approved", h."freeSlotDate", h."maxAppointments", h."emergency",
                h."fees", h."phone"

            ORDER BY "doctorCount" DESC, distance;
        `);
        else if (role && approved) {
            hospitals = await prisma.$queryRawUnsafe<any[]>(`
            SELECT h.id, h.email, h.name, h.password, h."parentId",
                ST_AsText(h."location") AS location,  
                h."currLocation", h."createdAt", h."updatedAt", h."timings",
                h."approved", h."freeSlotDate", h."maxAppointments", h."emergency",
                h."fees", h."phone",
                ST_DistanceSphere(
                    ST_MakePoint(CAST(h."currLocation"->>'latitude' AS DOUBLE PRECISION), 
                                CAST(h."currLocation"->>'longitude' AS DOUBLE PRECISION)),
                    ST_MakePoint(${latitude}, ${longitude})
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
            WHERE h."parentId" IS ${
                role === "HOSPITAL" ? "null" : "not null"
            } and h."approved" = ${approved}
            GROUP BY h.id
            ORDER BY h."count"->>'doctorCount' DESC,distance;
        `);
        } else {
            hospitals = await prisma.$queryRawUnsafe<any[]>(`
            SELECT h.id, h.email, h.name, h.password, h."parentId",
                ST_AsText(h."location") AS location,  
                h."currLocation", h."createdAt", h."updatedAt", h."timings",
                h."approved", h."freeSlotDate", h."maxAppointments", h."emergency",
                h."fees", h."phone", h."count",
                ST_DistanceSphere(
                    ST_MakePoint(CAST(h."currLocation"->>'longitude' AS DOUBLE PRECISION), 
                                CAST(h."currLocation"->>'latitude' AS DOUBLE PRECISION)),
                    ST_MakePoint(${longitude}, ${latitude})
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
            ORDER BY h."count"->>'doctorCount' DESC,distance;
        `);
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

router.get("/testing", async (req, res) => {
    console.log("Testing database connection");

    try {
        const hospitals = await prisma.$queryRawUnsafe<Hospital[]>(`
            select id, name from "Hospital";
        `);
        res.status(200).send(hospitals);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
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

        const hospitals = await prisma.$queryRawUnsafe<any[]>(`
            SELECT h.id, h.email, h.name, h.password, h."parentId",
                ST_AsText(h."location") AS location,  
                h."currLocation", h."createdAt", h."updatedAt", h."timings",
                h."approved", h."freeSlotDate", h."maxAppointments", h."emergency",
                h."fees", h."phone",
                ST_DistanceSphere(
                    ST_MakePoint(CAST(h."currLocation"->>'longitude' AS DOUBLE PRECISION), 
                                CAST(h."currLocation"->>'latitude' AS DOUBLE PRECISION)),
                    ST_MakePoint(${longitude}, ${latitude})
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
            ORDER BY h."count"->>'doctorCount' DESC, distance
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

    reqE();
});

router.get("/doctors", async (req, res) => {
    try {
        const now = new Date();
        const next = new Date(now);
        next.setDate(now.getDate() + 1);
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
                    lte: nextSevenDays,
                },
            },
        });

        console.log("Doctors fetched:", hospitals.length);

        res.status(200).send(hospitals);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching hospitals",
            error,
        });
    }
});

router.get("/doc", async (req, res) => {
    try {
        const hospitals = await prisma.hospital.findMany({
            select: {
                id: true,
            },
            where: {
                parentId: { not: null },
            },
        });

        // create a string array of ids
        const ids = hospitals.map((hospital) => hospital.id);

        console.log("Doctors fetched:", hospitals.length);

        res.status(200).send({ ids: ids });
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching hospitals",
            error,
        });
    }
});

router.get("/documents/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const documents = await prisma.document.findMany({
            where: { hospitalId: id },
        });

        if (!documents) {
            res.status(404).send({ message: "Documents not found" });
            return;
        }

        console.log("Documents found:", documents);

        res.status(200).send(documents);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching specialities",
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
        let hospitalData = { ...req.body };

        const { user } = req.query;

        console.log("User := ", user);

        console.log("Hospital Data := ", hospitalData);

        if (
            user === "Hospital" &&
            (!hospitalData.longitude || !hospitalData.latitude)
        ) {
            res.status(400).send({
                error: "Longitude and Latitude are required.",
            });
            return;
        }

        if (user === "Doctor") {
            const associatedHospital = await prisma.hospital.findUnique({
                where: { id: hospitalData.hospital },
            });

            if (!associatedHospital) {
                res.status(404).send({
                    error: "Associated Hospital not found.",
                });
                return;
            }

            if (associatedHospital.parentId !== null) {
                res.status(400).send({
                    error: "Associated Hospital is not a parent hospital.",
                });
                return;
            }

            if (
                associatedHospital.currLocation !== null &&
                typeof associatedHospital.currLocation === "object" &&
                "longitude" in associatedHospital.currLocation &&
                "latitude" in associatedHospital.currLocation
            ) {
                const currLoc = associatedHospital.currLocation as {
                    longitude: number | string;
                    latitude: number | string;
                };
                hospitalData = {
                    ...hospitalData,
                    longitude: currLoc.longitude,
                    latitude: currLoc.latitude,
                };
            }

            // Update the doctor count for the associated hospital
            await prisma.$executeRawUnsafe(`
                UPDATE "Hospital"
                SET count = jsonb_set(
                    count,
                    '{doctorCount}',
                    ((count->>'doctorCount')::int + 1)::text::jsonb
                )
                WHERE id = '${associatedHospital.id}';
            `);
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

        const now = new Date();

        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + 1);

        const countField = {
            highSeverity: 0,
            lowSeverity: 0,
            mediumSeverity: 0,
            doctorCount: 0,
        };

        const hospital = await prisma.hospital.create({
            data: {
                ...newHospitalData,
                parentId: hospitalID || null,
                fees: Number(newHospitalData.fees),
                maxAppointments: Number(newHospitalData.maxAppointments),
                count: countField,
            },
            include: { parent: true },
        });

        console.log("Created Hospital :=", hospital);

        await prisma.$executeRawUnsafe(`
            UPDATE "Hospital"
            SET location = ST_SetSRID(ST_MakePoint(${latitude}, ${longitude}), 4326)
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

router.post("/bulk-register", async (req, res) => {
    reqS("Bulk Hospital Registration Request");

    try {
        const { user } = req.query;

        console.log("User := ", user);

        const hospitalEntries = req.body;

        console.log("Hospital Entries := ", hospitalEntries);

        if (!Array.isArray(hospitalEntries) || hospitalEntries.length === 0) {
            res.status(400).json({
                error: "Request body must be a non-empty array.",
            });
            return;
        }

        const results: {
            success: any[];
            failed: { index: number; error: string }[];
        } = {
            success: [],
            failed: [],
        };

        for (let i = 0; i < hospitalEntries.length; i++) {
            let entry = { ...hospitalEntries[i] };
            try {
                // Hospital Validation
                if (
                    user === "Hospital" &&
                    (!entry.longitude || !entry.latitude)
                ) {
                    throw new Error("Longitude and Latitude are required.");
                }

                // Doctor Specific Validations
                if (user === "Doctor") {
                    const associatedHospital = await prisma.hospital.findUnique(
                        {
                            where: { id: entry.hospital },
                        }
                    );

                    if (!associatedHospital) {
                        throw new Error("Associated Hospital not found.");
                    }

                    if (associatedHospital.parentId !== null) {
                        throw new Error(
                            "Associated Hospital is not a parent hospital."
                        );
                    }

                    if (
                        associatedHospital.currLocation !== null &&
                        typeof associatedHospital.currLocation === "object" &&
                        "longitude" in associatedHospital.currLocation &&
                        "latitude" in associatedHospital.currLocation
                    ) {
                        const currLoc = associatedHospital.currLocation as {
                            longitude: number | string;
                            latitude: number | string;
                        };
                        entry.longitude = currLoc.longitude;
                        entry.latitude = currLoc.latitude;
                    }

                    // Increment doctor count
                    await prisma.$executeRawUnsafe(`
                        UPDATE "Hospital"
                        SET count = jsonb_set(
                            count,
                            '{doctorCount}',
                            ((count->>'doctorCount')::int + 1)::text::jsonb
                        )
                        WHERE id = '${associatedHospital.id}';
                    `);
                }

                const longitude = new Decimal(entry.longitude);
                const latitude = new Decimal(entry.latitude);

                delete entry.longitude;
                delete entry.latitude;

                const encPass = await encryptPassword(entry.password);
                if (!encPass) throw new Error("Error in Password Encryption");

                entry.password = encPass;
                delete entry.confirmPassword;

                const hospitalID = entry.hospital;
                delete entry.hospital;

                const countField = {
                    highSeverity: 0,
                    lowSeverity: 0,
                    mediumSeverity: 0,
                    doctorCount: 0,
                };

                const timings = {
                    mon: {
                        start: "09:00",
                        end: "17:00",
                    },
                    tue: {
                        start: "09:00",
                        end: "17:00",
                    },
                    wed: {
                        start: "09:00",
                        end: "17:00",
                    },
                    thu: {
                        start: "09:00",
                        end: "17:00",
                    },
                    fri: {
                        start: "09:00",
                        end: "17:00",
                    },
                    sat: null,
                    sun: null,
                };

                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + 1);

                const hospital = await prisma.hospital.create({
                    data: {
                        ...entry,
                        parentId: hospitalID || null,
                        fees: Number(entry.fees),
                        maxAppointments: Number(entry.maxAppointments),
                        count: countField,
                        timings: timings,
                        freeSlotDate: nextDate,
                    },
                    include: { parent: true },
                });

                await prisma.$executeRawUnsafe(`
                    UPDATE "Hospital"
                    SET location = ST_SetSRID(ST_MakePoint(${latitude}, ${longitude}), 4326)
                    WHERE id = '${hospital.id}';
                `);

                const token = await generateToken({ userId: hospital.id });

                results.success.push({ hospital, token });
            } catch (error: any) {
                results.failed.push({
                    index: i,
                    error: error.message || "Unknown error occurred",
                });
            }
        }

        res.status(207).json(results); // 207 = Multi-Status for partial success/failure
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

router.post("/register/bulk", async (req, res) => {
    reqS("Bulk Hospital Registration Request");

    const hospitalsData = req.body;
    if (!Array.isArray(hospitalsData) || hospitalsData.length === 0) {
        res.status(400).send({ error: "An array of hospitals is required." });
        return;
    }

    const results: { success?: any; error?: string; index: number }[] = [];

    for (let i = 0; i < hospitalsData.length; i++) {
        const hospitalData = { ...hospitalsData[i] };
        try {
            if (!hospitalData.longitude || !hospitalData.latitude) {
                results.push({
                    error: "Longitude and Latitude are required.",
                    index: i,
                });
                continue;
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
                results.push({
                    error: "Error in Password Encryption",
                    index: i,
                });
                continue;
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

            await prisma.$executeRawUnsafe(`
                UPDATE "Hospital"
                SET location = ST_SetSRID(ST_MakePoint(${latitude}, ${longitude}), 4326)
                WHERE id = '${hospital.id}';
            `);

            const token = await generateToken({ userId: hospital.id });

            results.push({ success: { hospital, token }, index: i });
        } catch (error) {
            results.push({ error: (error as Error).message, index: i });
        }
    }

    reqE();
    res.status(207).send({ results }); // 207: Multi-Status for partial success/failure
});

router.post("/documents/:id", async (req, res) => {
    const { id } = req.params;
    const { document } = req.body;

    if (!document) {
        res.status(400).send({ error: "Document is required" });
        return;
    }

    try {
        // 1. Get existing documents
        const hospital = await prisma.hospital.findUnique({
            where: { id: id },
            select: { documents: true },
        });

        if (!hospital) {
            res.status(404).send({ error: "Hospital not found" });
            return;
        }

        if (hospital.documents.some((doc) => doc.name === document.name)) {
            res.status(400).send({ error: "Document already exists" });
            return;
        }

        // 2. Create the new document and connect it to the hospital

        const newDocument = await prisma.document.create({
            data: {
                ...document,
                hospitalId: id,
            },
        });

        console.log("New Document Created:", newDocument);

        // 3. Update the hospital to connect the new document
        const updatedHospital = await prisma.hospital.update({
            where: { id: id },
            data: {
                documents: {
                    connect: { id: newDocument.id },
                },
            },
            include: { documents: true },
        });

        console.log("Updated Hospital with new document:", updatedHospital);

        res.status(200).send(updatedHospital);
    } catch (error) {
        sendError(res, error as Error);
    }
});

router.put("/date/:id", async (req, res) => {
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
        res.status(400).send({ error: "Date is required" });
        return;
    }

    try {
        const hospital = await prisma.hospital.update({
            where: { id },
            data: { freeSlotDate: new Date(date) },
        });

        res.status(200).send(hospital);
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

router.delete("/documents/:id", async (req, res) => {
    const { id } = req.params;
    const { documentId } = req.body;

    if (!documentId) {
        res.status(400).send({ error: "Document ID is required" });
        return;
    }

    try {
        const hospital = await prisma.hospital.update({
            where: { id },
            data: {
                documents: {
                    disconnect: { id: documentId },
                },
            },
            include: { documents: true },
        });

        if (!hospital) {
            res.status(404).send({ error: "Hospital not found" });
            return;
        }

        // Delete the document from the Document table
        await prisma.document.delete({
            where: { id: documentId },
        });

        res.status(200).send(hospital);
    } catch (error) {
        sendError(res, error as Error);
    }
});

export default router;
