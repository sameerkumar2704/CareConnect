import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
    try {
        const specialities = await prisma.speciality.findMany({
            orderBy: {
                hospitals: {
                    _count: "desc",
                },
            },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });

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

        res.status(200).send(specialitiesWithCounts);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching top specialities",
            error,
        });
    }
});

router.get("/top", async (req, res) => {
    try {
        const specialities = await prisma.speciality.findMany({
            take: 8,
            orderBy: {
                hospitals: {
                    _count: "desc",
                },
            },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });

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

        res.status(200).send(specialitiesWithCounts);
    } catch (error) {
        res.status(500).send({
            message: "An error occurred while fetching top specialities",
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

        if (!updatedDoctor) {
            res.status(404).send({ message: "Doctor not found" });
            return;
        }

        if (doctor.parentId) {
            await prisma.hospital.update({
                where: { id: doctor.parentId },
                data: {
                    specialities: {
                        connect: { id: specialtyId },
                    },
                },
            });
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

        if (!updatedDoctor) {
            res.status(404).send({ message: "Doctor not found" });
            return;
        }

        if (doctor.parentId) {
            await prisma.hospital.update({
                where: { id: doctor.parentId },
                data: {
                    specialities: {
                        disconnect: { id: specialtyId },
                    },
                },
            });
        } else {
            res.status(404).send({ message: "Parent not found" });
            return;
        }

        console.log("Updated doctor:", updatedDoctor);

        res.status(200).send(updatedDoctor.specialities);
    } catch (error) {
        console.error("Error updating doctor:", error);

        res.status(500).send({
            message: "An error occurred while fetching speciality",
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
