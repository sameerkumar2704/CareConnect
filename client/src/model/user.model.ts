export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
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
    parentName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    locationId: string;
    specialities: Specialty[];
    createdAt: Date;
    updatedAt: Date;
}
