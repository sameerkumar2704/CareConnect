import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const client = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
        user: process.env.CLIENT_USER,
        pass: process.env.CLIENT_PASS,
    },
});
