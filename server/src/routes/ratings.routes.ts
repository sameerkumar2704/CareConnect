import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { userId, hospitalId, specialityId, rating, feedback } = req.body;

        console.log("Received rating data:", req.body);

        if (
            !userId ||
            !hospitalId ||
            !specialityId ||
            typeof rating !== "number"
        ) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        if (rating < 1 || rating > 5) {
            res.status(400).json({ message: "Rating must be between 1 and 5" });
            return;
        }

        // Check if the hospital and speciality exist and are connected (optional but recommended)
        const isValidHospitalSpeciality = await prisma.hospital.findFirst({
            where: {
                id: hospitalId,
                specialities: {
                    some: { id: specialityId },
                },
            },
        });

        if (!isValidHospitalSpeciality) {
            res.status(400).json({
                message: "Invalid hospital-speciality combination",
            });
            return;
        }

        // Upsert: Create or update the rating for this user/hospital/speciality combo
        const newRating = await prisma.ratings.upsert({
            where: {
                unique_hospital_user_speciality_rating: {
                    hospitalId,
                    userId,
                    specialityId,
                },
            },
            update: {
                rating,
                feedback,
            },
            create: {
                hospitalId,
                userId,
                specialityId,
                rating,
                feedback,
            },
        });

        res.status(201).json({
            message: "Rating submitted successfully",
            data: newRating,
        });
    } catch (error) {
        console.error("Rating Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
