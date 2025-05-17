import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const { severity } = req.query;
        console.log("Received severity:", severity);

        // Fetch all specialties with count field included
        const allSpecialities = await prisma.speciality.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                tags: true,
                count: true, // Assumes this is a JSON field like { doctorCount, hospitalCount }
            },
        });

        let filteredSpecialities = allSpecialities;

        if (
            severity &&
            ["Low", "Moderate", "High"].includes(severity as string)
        ) {
            // Filter and count matching tags
            const specialitiesWithMatchCount = allSpecialities.map(
                (speciality) => {
                    const matchingTagsCount = speciality.tags.filter((tag) => {
                        const tagObj =
                            typeof tag === "string" ? JSON.parse(tag) : tag;
                        return tagObj.severity === severity;
                    }).length;

                    return {
                        ...speciality,
                        matchingTagsCount,
                    };
                }
            );

            // Only include specialties with at least one matching tag
            filteredSpecialities = specialitiesWithMatchCount
                .filter((speciality) => speciality.matchingTagsCount > 0)
                .sort((a, b) => b.matchingTagsCount - a.matchingTagsCount);
        }

        console.log("Filtered specialities:", filteredSpecialities.length);

        // No need for hospital counts — already included in count field
        res.status(200).send(filteredSpecialities);
    } catch (error) {
        console.error("Error fetching specialties:", error);
        res.status(500).send({
            message: "An error occurred while fetching specialties",
            error,
        });
    }
});

router.get("/top", async (req, res) => {
    try {
        const { severity } = req.query;

        console.log("Received severity:", severity);

        // Validate severity parameter
        if (
            !severity ||
            !["Low", "Moderate", "High"].includes(severity as string)
        ) {
            res.status(400).send({
                message:
                    "Invalid severity parameter. Must be 'Low', 'Moderate', or 'High'.",
            });
            return;
        }

        // Get all specialties first
        const allSpecialities = await prisma.speciality.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                tags: true,
            },
        });

        // Filter and count matching tags for each specialty
        const specialitiesWithMatchCount = allSpecialities.map((speciality) => {
            // Count how many tags match the requested severity
            const matchingTagsCount = speciality.tags.filter((tag) => {
                const tagObj = typeof tag === "string" ? JSON.parse(tag) : tag;
                return tagObj.severity === severity;
            }).length;

            return {
                ...speciality,
                matchingTagsCount,
            };
        });

        // Filter to only include specialties with at least one matching tag
        // and sort by the number of matching tags (highest first)
        const specialities = specialitiesWithMatchCount
            .filter((specialty) => specialty.matchingTagsCount > 0)
            .sort((a, b) => b.matchingTagsCount - a.matchingTagsCount);

        // Get hospital counts for each specialty
        const specialitiesWithCounts = await Promise.all(
            specialities.map(async (speciality) => {
                const [rootCount, branchCount] = await prisma.$transaction([
                    prisma.hospital.count({
                        where: {
                            parentId: null,
                            specialities: {
                                some: {
                                    id: speciality.id,
                                },
                            },
                        },
                    }),
                    prisma.hospital.count({
                        where: {
                            parentId: {
                                not: null,
                            },
                            specialities: {
                                some: {
                                    id: speciality.id,
                                },
                            },
                        },
                    }),
                ]);

                return {
                    ...speciality,
                    _count: {
                        parent: rootCount,
                        children: branchCount,
                    },
                };
            })
        );

        res.status(200).send(specialitiesWithCounts.slice(0, 8));
    } catch (error) {
        console.error("Error fetching specialties by severity:", error);
        res.status(500).send({
            message: "An error occurred while fetching specialties by severity",
            error,
        });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const speciality = await prisma.speciality.findUnique({
            where: { id: id },
            include: {
                hospitals: {
                    include: {
                        specialities: true,
                        parent: true,
                        _count: {
                            select: {
                                children: true,
                            },
                        },
                    },
                },
            },
        });

        if (!speciality) {
            res.status(404).send({ message: "Speciality not found" });
            return;
        }

        res.status(200).send(speciality);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching speciality",
            error,
        });
    }
});

router.get("/doctor/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await prisma.hospital.findUnique({
            where: { id: id },
            include: {
                specialities: true,
            },
        });

        if (!doctor) {
            res.status(404).send({ message: "Doctor not found" });
            return;
        }

        res.status(200).send(doctor.specialities);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching speciality",
            error,
        });
    }
});

router.post("/", async (req, res) => {
    const specialities = req.body;

    try {
        const createdSpecialities = await prisma.speciality.createMany({
            data: specialities,
        });

        res.status(201).send(createdSpecialities);
    } catch (error) {
        console.error("Error creating specialities:", error);
        res.status(500).send({
            message: "An error occurred while creating specialities",
            error,
        });
    }
});

router.put("/doctor/:id", async (req, res) => {
    const { id } = req.params;

    const { specialtyId } = req.body;

    console.log("Received data:", specialtyId);

    try {
        const doctor = await prisma.hospital.findUnique({
            where: { id: id },
            include: {
                specialities: true,
            },
        });

        console.log("Doctor found:", doctor);

        if (!doctor) {
            res.status(404).send({ message: "Doctor not found" });
            return;
        }

        const speciality = await prisma.speciality.findUnique({
            where: { id: specialtyId },
        });

        if (!speciality) {
            res.status(404).send({ message: "Speciality not found" });
            return;
        }

        console.log("Speciality found:", speciality);

        const tags = speciality.tags as Array<{ severity: string }>;

        let low = 0,
            medium = 0,
            high = 0;

        tags.forEach((tag) => {
            switch ((tag.severity || "").toLowerCase()) {
                case "low":
                    low++;
                    break;
                case "medium":
                    medium++;
                    break;
                case "high":
                    high++;
                    break;
            }
        });

        let increment = 1;

        await prisma.$executeRawUnsafe(`
            UPDATE "Speciality"
            SET count = jsonb_set(
                count,
                '{doctorCount}', ((count->>'doctorCount')::int + ${increment})::text::jsonb
            )
            WHERE id = '${speciality.id}';
        `);

        const updatedDoctor = await prisma.hospital.update({
            where: { id: id },
            data: {
                specialities: {
                    connect: { id: specialtyId },
                },
            },
            include: {
                specialities: true,
            },
        });

        await prisma.$executeRawUnsafe(`
            UPDATE "Hospital"
            SET count = jsonb_set(
                jsonb_set(
                    jsonb_set(
                        count,
                        '{lowSeverity}', ((count->>'lowSeverity')::int + ${low})::text::jsonb
                    ),
                    '{mediumSeverity}', ((count->>'mediumSeverity')::int + ${medium})::text::jsonb
                ),
                '{highSeverity}', ((count->>'highSeverity')::int + ${high})::text::jsonb
            )
            WHERE id = '${doctor.id}';
        `);

        if (!updatedDoctor) {
            res.status(404).send({ message: "Doctor not found" });
            return;
        }

        if (doctor.parentId) {
            const alreadyConnected = await prisma.hospitalSpeciality.findFirst({
                where: {
                    hospitalId: doctor.parentId,
                    specialityId: specialtyId,
                },
            });

            if (!alreadyConnected) {
                await prisma.$executeRawUnsafe(`
                    UPDATE "Speciality"
                    SET count = jsonb_set(
                        count,
                        '{hospitalCount}', ((count->>'hospitalCount')::int + ${increment})::text::jsonb
                    )
                    WHERE id = '${speciality.id}';
                `);
            }

            await prisma.hospital.update({
                where: { id: doctor.parentId },
                data: {
                    specialities: {
                        connect: { id: specialtyId },
                    },
                },
            });

            await prisma.$executeRawUnsafe(`
                UPDATE "Hospital"
                SET count = jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            count,
                            '{lowSeverity}', ((count->>'lowSeverity')::int + ${low})::text::jsonb
                        ),
                        '{mediumSeverity}', ((count->>'mediumSeverity')::int + ${medium})::text::jsonb
                    ),
                    '{highSeverity}', ((count->>'highSeverity')::int + ${high})::text::jsonb
                )
                WHERE id = '${doctor.parentId}';
            `);
        } else {
            res.status(404).send({ message: "Parent not found" });
            return;
        }

        console.log("Updated doctor:", updatedDoctor);

        res.status(200).send(speciality);
    } catch (error) {
        console.error("Error updating doctor:", error);

        res.status(500).send({
            message: "An error occurred while fetching speciality",
            error,
        });
    }
});

router.delete("/doctor/:id", async (req, res) => {
    const { id } = req.params;
    const { specialtyId } = req.body;

    console.log("Removing specialty:", specialtyId, "from doctor:", id);

    try {
        // Find the doctor with their specialties
        const doctor = await prisma.hospital.findUnique({
            where: { id: id },
            include: {
                specialities: true,
            },
        });

        console.log("Doctor found:", doctor);

        if (!doctor) {
            res.status(404).send({ message: "Doctor not found" });
            return;
        }

        // Check if the doctor has this specialty
        const hasSpecialty = doctor.specialities.some(
            (spec) => spec.id === specialtyId
        );

        if (!hasSpecialty) {
            res.status(404).send({
                message: "Doctor does not have this specialty",
            });
            return;
        }

        // Find the specialty
        const speciality = await prisma.speciality.findUnique({
            where: { id: specialtyId },
        });

        if (!speciality) {
            res.status(404).send({ message: "Speciality not found" });
            return;
        }

        console.log("Speciality found:", speciality);

        // Calculate severity counts to decrement
        const tags = speciality.tags as Array<{ severity: string }>;

        let low = 0,
            medium = 0,
            high = 0;

        tags.forEach((tag) => {
            switch ((tag.severity || "").toLowerCase()) {
                case "low":
                    low++;
                    break;
                case "medium":
                    medium++;
                    break;
                case "high":
                    high++;
                    break;
            }
        });

        let decrement = 1;

        // Decrement doctorCount in the specialty
        await prisma.$executeRawUnsafe(`
            UPDATE "Speciality"
            SET count = jsonb_set(
                count,
                '{doctorCount}', ((count->>'doctorCount')::int - ${decrement})::text::jsonb
            )
            WHERE id = '${speciality.id}';
        `);

        // Disconnect the specialty from the doctor
        const updatedDoctor = await prisma.hospital.update({
            where: { id: id },
            data: {
                specialities: {
                    disconnect: { id: specialtyId },
                },
            },
            include: {
                specialities: true,
            },
        });

        // Decrement severity counts for the doctor
        await prisma.$executeRawUnsafe(`
            UPDATE "Hospital"
            SET count = jsonb_set(
                jsonb_set(
                    jsonb_set(
                        count,
                        '{lowSeverity}', ((count->>'lowSeverity')::int - ${low})::text::jsonb
                    ),
                    '{mediumSeverity}', ((count->>'mediumSeverity')::int - ${medium})::text::jsonb
                ),
                '{highSeverity}', ((count->>'highSeverity')::int - ${high})::text::jsonb
            )
            WHERE id = '${doctor.id}';
        `);

        // Handle parent hospital if it exists
        if (doctor.parentId) {
            // Check if there are other doctors under this hospital with the same specialty
            const otherDoctorsWithSpecialty = await prisma.hospital.count({
                where: {
                    parentId: doctor.parentId,
                    specialities: {
                        some: {
                            id: specialtyId,
                        },
                    },
                    id: {
                        not: id, // Exclude the current doctor
                    },
                },
            });

            // If no other doctors have this specialty, disconnect it from the hospital too
            if (otherDoctorsWithSpecialty === 0) {
                await prisma.hospital.update({
                    where: { id: doctor.parentId },
                    data: {
                        specialities: {
                            disconnect: { id: specialtyId },
                        },
                    },
                });

                // Decrement hospitalCount in the specialty
                await prisma.$executeRawUnsafe(`
                    UPDATE "Speciality"
                    SET count = jsonb_set(
                        count,
                        '{hospitalCount}', ((count->>'hospitalCount')::int - ${decrement})::text::jsonb
                    )
                    WHERE id = '${speciality.id}';
                `);

                // Decrement severity counts for the parent hospital
                await prisma.$executeRawUnsafe(`
                    UPDATE "Hospital"
                    SET count = jsonb_set(
                        jsonb_set(
                            jsonb_set(
                                count,
                                '{lowSeverity}', ((count->>'lowSeverity')::int - ${low})::text::jsonb
                            ),
                            '{mediumSeverity}', ((count->>'mediumSeverity')::int - ${medium})::text::jsonb
                        ),
                        '{highSeverity}', ((count->>'highSeverity')::int - ${high})::text::jsonb
                    )
                    WHERE id = '${doctor.parentId}';
                `);
            }
        }

        console.log("Updated doctor:", updatedDoctor);

        res.status(200).send({
            message: "Specialty removed successfully",
            doctor: updatedDoctor,
        });
    } catch (error) {
        console.error("Error removing specialty from doctor:", error);

        res.status(500).send({
            message: "An error occurred while removing specialty",
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
