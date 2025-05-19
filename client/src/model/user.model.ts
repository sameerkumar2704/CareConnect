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
    count: {
        hospitalCount: number;
        doctorCount: number;
    };
}

export interface Hospital {
    id: string;
    name: string;
    timings: {
        mon: {
            start: string;
            end: string;
        } | null;
        tue: {
            start: string;
            end: string;
        };
        wed: {
            start: string;
            end: string;
        } | null;
        thu: {
            start: string;
            end: string;
        };
        fri: {
            start: string;
            end: string;
        } | null;
        sat: {
            start: string;
            end: string;
        } | null;
        sun: {
            start: string;
            end: string;
        } | null;
    };
    email: string;
    freeSlotDate: string;
    doctorCount: number;
    password: string;
    phone: string;
    approved: true;
    address: string;
    locationId: string;
    appointments: Appointment[];
    specialities: Specialty[];
    parent: Hospital;
    createdAt: Date;
    emergency: boolean;
    updatedAt: Date;
    fees: number;
    distance: number;
    children: Hospital[];
    currLocation: {
        latitude: number;
        longitude: number;
    };
    parentId: Hospital;
    count: {
        doctorCount: number;
        lowSeverity: number;
        mediumSeverity: number;
        highSeverity: number;
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
