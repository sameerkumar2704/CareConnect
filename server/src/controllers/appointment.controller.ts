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

        let lastDate = doctor?.freeSlotDate || new Date();

        if (lastDate < new Date()) {
            lastDate = new Date();
        }

        const appointment = await prisma.appointment.create({
            data: {
                userId,
                hospitalId,
                date: lastDate,
                paidPrice,
            },
        });

        if (!appointment) {
            res.status(500).send({ message: "Failed to create appointment" });
            return;
        }

        const totalAppointments = await prisma.appointment.count({
            where: { hospitalId },
        });

        if (totalAppointments >= (doctor?.maxAppointments || 20)) {
            await prisma.hospital.update({
                where: { id: hospitalId },
                data: {
                    freeSlotDate: new Date(
                        lastDate.setDate(lastDate.getDate() + 1)
                    ),
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
                        currLocation: true,
                    },
                },
            },
        });

        if (!appointment) {
            res.status(404).json({ message: "Appointment not found" });
            return;
        }

        const now = new Date();

        if (
            appointment.date < new Date(now.getDate() + 1) &&
            appointment.status === "PENDING"
        ) {
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
