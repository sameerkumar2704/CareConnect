// src/routes/appointment.routes.ts
import { Router } from "express";
import {
    createAppointment,
    getAppointmentById,
} from "../controllers/appointment.controller";

const router = Router();

router.post("/", createAppointment);
router.get("/:id", getAppointmentById);

export default router;
