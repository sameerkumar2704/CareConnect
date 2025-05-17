// src/controllers/appointment.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";
import { CreateAppointmentDTO } from "../types/appointment.types";
import { reqE, reqS } from "../utils/logger.utils";

export const createAppointment = async (
    req: Request,
    res: Response
): Promise<void> => {
    const {
        userId,
        hospitalId,
        date,
        expiration,
        paidPrice,
    }: CreateAppointmentDTO = req.body;

    if (
        !userId ||
        !hospitalId ||
        !date ||
        !expiration ||
        paidPrice === undefined
    ) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        reqS("CREATE APPOINTMENT");

        const doctor = await prisma.hospital.findUnique({
            where: { id: hospitalId },
        });

        const now = new Date();

        console.log("Current date:", now);
        console.log("Doctor free slot date:", doctor?.freeSlotDate);

        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + 1);

        console.log("Next date:", nextDate);

        let lastDate =
            doctor?.freeSlotDate == null
                ? nextDate
                : new Date(doctor?.freeSlotDate);

        console.log("Last date:", lastDate);

        if (lastDate <= now) {
            lastDate = nextDate;
        }

        const expirationDate = new Date(date);
        expirationDate.setDate(expirationDate.getDate() + 1);

        console.log("Adjusted last date:", lastDate);

        const appointment = await prisma.appointment.create({
            data: {
                userId,
                hospitalId,
                date: lastDate,
                expiry: expirationDate,
                paidPrice,
            },
        });

        if (!appointment) {
            res.status(500).send({ message: "Failed to create appointment" });
            return;
        }

        const totalAppointments = await prisma.appointment.count({
            where: { hospitalId, date: lastDate },
        });

        const newLastDate = new Date(lastDate);
        newLastDate.setDate(lastDate.getDate() + 1);

        if (totalAppointments >= (doctor?.maxAppointments || 20)) {
            await prisma.hospital.update({
                where: { id: hospitalId },
                data: {
                    freeSlotDate: newLastDate,
                },
            });
        }

        console.log(appointment);

        res.status(201).send(appointment);

        reqE();
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to create appointment" });
    }
};

export const getAppointmentById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                User: true,
                Hospital: {
                    include: {
                        parent: true,
                        specialities: true,
                    },
                },
            },
        });

        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        const now = new Date();

        console.log("appointment", appointment);
        console.log("Current date:", now);
        console.log("Appointment date:", appointment.date);

        if (appointment.date < now && appointment.status === "PENDING") {
            await prisma.appointment.update({
                where: { id },
                data: {
                    status: "EXPIRED",
                },
            });
        }

        res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch appointment" });
        return;
    }
};
