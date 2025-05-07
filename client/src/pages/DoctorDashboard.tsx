// DoctorDashboard.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser, faUpload, faDownload, faTrash,
    faEdit, faHospital, faPhone, faStar,
    faCalendarAlt, faUserMd, faCheck, faTimes
} from '@fortawesome/free-solid-svg-icons';

// Types
interface Doctor {
    id: string;
    name: string;
    hospital: string;
    contact: string;
    image: string;
}

interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    date: string;
    purpose: string;
    status: 'pending' | 'approved' | 'cancelled';
}

interface Specialty {
    id: string;
    name: string;
    description: string;
}

interface Rating {
    id: string;
    score: number;
    feedback: string;
    specialty: string;
}

// Left Panel Component
const LeftPanel: React.FC<{ doctor: Doctor }> = ({ doctor }) => {
    return (
        <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-lg p-6 h-full border border-gray-100">
            {/* Top gradient header */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 -mx-6 -mt-6 p-6 pt-8 pb-12 rounded-t-xl mb-10 relative">
                {/* Profile image container with shadow and border */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-36 h-36 bg-white rounded-full p-1.5 shadow-xl">
                            <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden">
                                {doctor.image ? (
                                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                        <FontAwesomeIcon icon={faUser} className="text-gray-400 text-5xl" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Image edit buttons below profile pic */}
                        <div className="flex justify-center gap-2 mt-3">
                            <button className="bg-teal-500 text-white p-2.5 rounded-full hover:bg-teal-600 transition shadow-md hover:shadow-lg">
                                <FontAwesomeIcon icon={faUpload} />
                            </button>
                            <button className="bg-blue-500 text-white p-2.5 rounded-full hover:bg-blue-600 transition shadow-md hover:shadow-lg">
                                <FontAwesomeIcon icon={faDownload} />
                            </button>
                            <button className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition shadow-md hover:shadow-lg">
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Doctor name with highlight */}
            <div className="text-center mb-8 mt-16">
                <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
                <p className="text-teal-600 font-medium">Medical Professional</p>
            </div>

            {/* Doctor information with attractive styling */}
            <div className="space-y-5 mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-teal-500">
                    <div className="flex items-center mb-1">
                        <FontAwesomeIcon icon={faUserMd} className="text-teal-500 mr-3" />
                        <h3 className="text-gray-700 font-medium">Doctor Name</h3>
                    </div>
                    <div className="flex items-center justify-between pl-7">
                        <span className="text-gray-800 font-bold">{doctor.name}</span>
                        <button className="text-blue-500 hover:text-blue-700 p-1">
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500">
                    <div className="flex items-center mb-1">
                        <FontAwesomeIcon icon={faHospital} className="text-blue-500 mr-3" />
                        <h3 className="text-gray-700 font-medium">Hospital</h3>
                    </div>
                    <div className="flex items-center justify-between pl-7">
                        <span className="text-gray-800">{doctor.hospital}</span>
                        <button className="text-blue-500 hover:text-blue-700 p-1">
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-purple-500">
                    <div className="flex items-center mb-1">
                        <FontAwesomeIcon icon={faPhone} className="text-purple-500 mr-3" />
                        <h3 className="text-gray-700 font-medium">Contact</h3>
                    </div>
                    <div className="flex items-center justify-between pl-7">
                        <span className="text-gray-800">{doctor.contact}</span>
                        <button className="text-blue-500 hover:text-blue-700 p-1">
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Appointments Component
const AppointmentsComponent: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-teal-500" />
                Appointments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {appointments.map(appointment => (
                    <div
                        key={appointment.id}
                        className="rounded-lg p-5 shadow-md bg-gradient-to-br from-white to-gray-50 border-l-4 border-teal-500 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="mb-3">
                            <h3 className="font-bold text-lg text-gray-800">{appointment.patientName}</h3>
                            <span className="text-sm text-teal-600 font-medium">{appointment.patientId}</span>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center">
                                <div className="bg-teal-100 p-2 rounded-full">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-teal-600" />
                                </div>
                                <span className="ml-3 text-gray-700">{appointment.date}</span>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-blue-100 p-2 rounded-full mt-1">
                                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                                </div>
                                <span className="ml-3 text-gray-700">{appointment.purpose}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button
                                className="bg-gradient-to-r from-teal-400 to-teal-500 text-white px-4 py-2 rounded-md hover:from-teal-500 hover:to-teal-600 shadow-sm hover:shadow transition flex-1 flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                Approve
                            </button>
                            <button
                                className="bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-2 rounded-md hover:from-red-500 hover:to-red-600 shadow-sm hover:shadow transition flex-1 flex items-center justify-center"
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                Cancel
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Specialties Component
const SpecialtiesComponent: React.FC<{ specialties: Specialty[] }> = ({ specialties }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between border-b pb-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faUserMd} className="mr-2 text-teal-500" />
                    Specialties
                </h2>
                <button className="bg-teal-100 text-teal-600 p-2 rounded-full hover:bg-teal-200 transition">
                    <FontAwesomeIcon icon={faEdit} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {specialties.map(specialty => (
                    <div
                        key={specialty.id}
                        className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-3"></div>
                        <div className="p-5">
                            <div className="flex items-center mb-3">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <FontAwesomeIcon icon={faUserMd} className="text-blue-600" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 ml-3">{specialty.name}</h3>
                            </div>
                            <p className="text-gray-600 mb-4">{specialty.description}</p>
                            <div className="flex justify-end gap-2">
                                <button className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition">
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Ratings Component
const RatingsComponent: React.FC<{ ratings: Rating[] }> = ({ ratings }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-bold border-b pb-3 mb-6 text-gray-800">
                <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-500" />
                Ratings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ratings.map(rating => (
                    <div
                        key={rating.id}
                        className="rounded-lg p-5 shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300 border-t-4 border-yellow-400"
                    >
                        <div className="flex items-center mb-4">
                            <div className="p-3 rounded-full bg-yellow-100 mr-3">
                                <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                            </div>
                            <div>
                                <div className="flex text-yellow-400 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <FontAwesomeIcon
                                            key={i}
                                            icon={faStar}
                                            className={`${i < rating.score ? "text-yellow-400" : "text-gray-300"} text-lg`}
                                        />
                                    ))}
                                </div>
                                <span className="font-bold text-gray-700">{rating.score}/5</span>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg mb-3">
                            <p className="text-gray-700 italic">"{rating.feedback}"</p>
                        </div>

                        <div className="flex justify-end">
                            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                                {rating.specialty}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Dashboard Component
const DoctorDashboard: React.FC = () => {
    // Mock data
    const [doctor] = useState<Doctor>({
        id: '1',
        name: 'Dr. John Doe',
        hospital: 'City General Hospital',
        contact: '+1 (234) 567-8901',
        image: '',
    });

    const [appointments] = useState<Appointment[]>([
        {
            id: '1',
            patientId: 'P12345',
            patientName: 'Sarah Johnson',
            date: '2025-05-10 10:00 AM',
            purpose: 'Regular Checkup',
            status: 'pending',
        },
        {
            id: '2',
            patientId: 'P67890',
            patientName: 'Michael Chen',
            date: '2025-05-11 03:30 PM',
            purpose: 'Follow-up',
            status: 'pending',
        },
        {
            id: '3',
            patientId: 'P24680',
            patientName: 'Emma Williams',
            date: '2025-05-12 12:15 PM',
            purpose: 'Consultation',
            status: 'pending',
        }
    ]);

    const [specialties] = useState<Specialty[]>([
        {
            id: '1',
            name: 'Cardiology',
            description: 'Diagnosis and treatment of heart conditions',
        },
        {
            id: '2',
            name: 'Neurology',
            description: 'Management of disorders of the nervous system',
        },
        {
            id: '3',
            name: 'Pediatrics',
            description: 'Medical care for infants, children, and adolescents',
        }
    ]);

    const [ratings] = useState<Rating[]>([
        {
            id: '1',
            score: 5,
            feedback: 'Excellent doctor, very knowledgeable and caring',
            specialty: 'Cardiology',
        },
        {
            id: '2',
            score: 4,
            feedback: 'Great experience, would recommend to others',
            specialty: 'Neurology',
        },
        {
            id: '3',
            score: 5,
            feedback: 'Outstanding service and very thorough',
            specialty: 'Pediatrics',
        }
    ]);

    return (
        <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
            {/* Left fixed panel */}
            <div className="md:w-1/4 p-4 md:h-screen md:overflow-hidden">
                <LeftPanel doctor={doctor} />
            </div>

            {/* Right scrollable content */}
            <div className="md:w-3/4 md:ml-auto p-4">
                <AppointmentsComponent appointments={appointments} />
                <SpecialtiesComponent specialties={specialties} />
                <RatingsComponent ratings={ratings} />
            </div>
        </div>
    );
};

export default DoctorDashboard;