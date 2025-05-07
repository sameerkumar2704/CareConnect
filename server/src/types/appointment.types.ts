// src/types/appointment.types.ts
export interface CreateAppointmentDTO {
    userId: string;
    hospitalId: string;
    date: string;
    expiration: string;
    paidPrice: number;
}
