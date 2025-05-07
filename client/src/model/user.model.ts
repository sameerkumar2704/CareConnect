export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface Specialty {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Hospital {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    locationId: string;
    appointments: Appointment[];
    specialities: Specialty[];
    createdAt: Date;
    updatedAt: Date;
    fees: number;
    children: Hospital[];
    parentId: Hospital;
}

export interface Appointment {
    id: string;
    userId: string;
    hospitalId: string;
    date: Date;
    time: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
