import { Prisma } from "@prisma/client";
import { Response } from "express";

export const sendError = (res: Response, error: Error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "Unique constraint failed",
                field: error.meta?.target,
                message: error.message,
            });
        } else if (error.code === "P2025") {
            return res.status(404).json({
                error: "Record not found",
                message: error.message,
            });
        } else {
            return res.status(400).json({
                error: "Prisma error",
                code: error.code,
                message: error.message,
            });
        }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        return res.status(400).json({
            error: "Validation error",
            message: error.message,
        });
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return res.status(500).json({
            error: "Unknown database error",
            message: error.message,
        });
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
        return res.status(500).json({
            error: "Database initialization error",
            message: error.message,
        });
    } else if (error instanceof Error) {
        return res.status(400).json({
            error: "Application error",
            message: error.message,
        });
    } else {
        return res.status(500).json({ error: "Unknown error occurred" });
    }
};
