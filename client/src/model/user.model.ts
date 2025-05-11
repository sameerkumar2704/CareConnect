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
    tags: [{ name: string; severity: string }];
    hospitalCount: number;
    createdAt: Date;
    updatedAt: Date;
    _count: {
        parent: number;
        children: number;
    }
}

export interface Hospital {
    id: string;
    name: string;
    email: string;
    freeSlotDate: string;
    doctorCount: number;
    password: string;
    phone: string;
    address: string;
    locationId: string;
    appointments: Appointment[];
    specialities: Specialty[];
    createdAt: Date;
    emergency: boolean;
    updatedAt: Date;
    fees: number;
    children: Hospital[];
    parentId: Hospital;
    _count: {
        children: number;
    };
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
