// src/routes/appointment.routes.ts
import { Router } from "express";
import {
    createAppointment,
    getAppointmentById,
} from "../controllers/appointment.controller";

const router = Router();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

router.post("/", createAppointment);

import { startOfDay, endOfDay } from "date-fns";

router.get("/byDate", async (req, res) => {
    console.log("Fetching appointments by date...");

    const { userId, role, date } = req.query;

    if (!userId) {
        res.status(400).send({ error: "User ID is required" });
        return;
    }

    if (!date) {
        res.status(400).send({ error: "Date is required" });
        return;
    }

    const selectedDate = new Date(date as string);
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    console.log("User ID:", userId);
    console.log("Date:", selectedDate);

    try {
        const appointments =
            role === "PATIENT"
                ? await prisma.appointment.findMany({
                      where: {
                          userId: userId as string,
                      },
                      include: {
                          Hospital: {
                              include: {
                                  specialities: true,
                                  currLocation: true,
                              },
                          },
                          User: true,
                      },
                  })
                : await prisma.appointment.findMany({
                      where: {
                          date: {
                              gte: dayStart,
                              lte: dayEnd,
                          },
                          hospitalId: userId as string,
                      },
                      include: {
                          Hospital: {
                              include: {
                                  specialities: true,
                                  currLocation: true,
                              },
                          },
                          User: true,
                      },
                  });

        res.status(200).send(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.get("/:id", getAppointmentById);

router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log("Updating appointment with ID:", id);
        console.log("New status:", status);

        if (!id) {
            res.status(400).send({ error: "Appointment ID is required" });
            return;
        }

        if (!status) {
            res.status(400).send({ error: "Status is required" });
            return;
        }

        const statusUpperCase = status.toUpperCase();

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status: statusUpperCase },
        });

        res.status(200).send(appointment);
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
});

export default router;
