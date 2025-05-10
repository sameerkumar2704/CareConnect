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

router.get("/", async (req, res) => {
    const { status } = req.query;

    console.log("Fetching appointments...");

    if (!status) {
        res.status(400).send({ error: "Status is required" });
        return;
    }

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                status: status as string,
            },
            include: {
                Hospital: {
                    include: {
                        specialities: true,
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
                      orderBy: {
                          date: "asc",
                      },
                      include: {
                          Hospital: {
                              include: {
                                  specialities: true,
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

router.put("/:id/refund", async (req, res) => {
    // mark status as refund in progress and update the bank details in appointment table
    try {
        const { id } = req.params;
        const { bankDetails } = req.body;

        console.log("Updating appointment with ID:", id);
        console.log("New bank details:", bankDetails);

        if (!id) {
            res.status(400).send({ error: "Appointment ID is required" });
            return;
        }

        if (!bankDetails) {
            res.status(400).send({ error: "Bank details are required" });
            return;
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                status: "REFUND_IN_PROGRESS",
                bankDetails,
            },
        });

        res.status(200).send(appointment);
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, doctorCharges } = req.body;

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
            data: { status: statusUpperCase, doctorCharges: doctorCharges },
        });

        res.status(200).send(appointment);
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.put("/:id/approve-refund", async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Approving refund for appointment with ID:", id);

        if (!id) {
            res.status(400).send({ error: "Appointment ID is required" });
            return;
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status: "REFUNDED" },
        });

        res.status(200).send(appointment);
    } catch (error) {
        console.error("Error approving refund:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.put("/:id/reject-refund", async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Rejecting refund for appointment with ID:", id);

        if (!id) {
            res.status(400).send({ error: "Appointment ID is required" });
            return;
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status: "EXPIRED", bankDetails: {} },
        });

        res.status(200).send(appointment);
    } catch (error) {
        console.error("Error rejecting refund:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.put("/:id/cancel", async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Cancelling appointment with ID:", id);

        if (!id) {
            res.status(400).send({ error: "Appointment ID is required" });
            return;
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        res.status(200).send(appointment);
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
});

router.put("/:id/pay-fine", async (req, res) => {
    try {
        const { id } = req.params;

        const { fineAmount } = req.body;

        console.log("Paying fine for appointment with ID:", id);

        if (!id) {
            res.status(400).send({ error: "Appointment ID is required" });
            return;
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { paidCharges: fineAmount, doctorCharges: 0 },
        });

        res.status(200).send(appointment);
    } catch (error) {
        console.error("Error paying fine:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
});

export default router;
