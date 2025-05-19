import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/contants';
import { Link } from 'react-router-dom';
import { getHighlyAccurateLocation } from '../utils/location/Location';

// Define TypeScript interfaces
interface Profile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}

interface Appointment {
    id: string;
    User: Profile;
    Hospital: Profile;
    date: string;
    time: string;
    status: string;
    paidPrice: number;
    createdAt: string;
}

type Role = 'HOSPITAL' | 'DOCTOR';

// The main component
const AdminApprovalPanel: React.FC = () => {
    const [hospitals, setHospitals] = useState<Profile[]>([]);
    const [doctors, setDoctors] = useState<Profile[]>([]);
    const [refundAppointments, setRefundAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'hospitals' | 'doctors' | 'refunds'>('hospitals');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const ENDPOINTS = {
        hospitals: `${API_URL}/hospitals?role=HOSPITAL&approved=false`,
        doctors: `${API_URL}/hospitals?role=DOCTOR&approved=false`,
        refundAppointments: `${API_URL}/appointments?status=REFUND_IN_PROGRESS`,
        approveHospital: (id: string) => `${API_URL}/hospitals/approve/${id}`,
        rejectHospital: (id: string) => `${API_URL}/hospitals/reject/${id}`,
        approveDoctor: (id: string) => `${API_URL}/hospitals/approve/${id}`,
        rejectDoctor: (id: string) => `${API_URL}/hospitals/reject/${id}`,
        approveRefund: (id: string) => `${API_URL}/appointments/${id}/approve-refund`,
        rejectRefund: (id: string) => `${API_URL}/appointments/${id}/reject-refund`
    };

    const fetchUnapprovedProfiles = async (): Promise<void> => {



        setIsLoading(true);
        try {

            const coords = await getHighlyAccurateLocation();

            if (!coords) {
                console.error('Failed to get coordinates');
                return;
            }

            // Fetch hospitals, doctors, and refund appointments in parallel
            const [hospitalsResponse, doctorsResponse, refundsResponse] = await Promise.all([
                axios.get<Profile[]>(ENDPOINTS.hospitals + `&latitude=${coords.lat}&longitude=${coords.lon}`),
                axios.get<Profile[]>(ENDPOINTS.doctors + `&latitude=${coords.lat}&longitude=${coords.lon}`),
                axios.get<Appointment[]>(ENDPOINTS.refundAppointments)
            ]);

            setHospitals(hospitalsResponse.data);
            setDoctors(doctorsResponse.data);
            setRefundAppointments(refundsResponse.data);

            console.log('Fetched hospitals:', hospitalsResponse.data);
            console.log('Fetched doctors:', doctorsResponse.data);
            console.log('Fetched refund appointments:', refundsResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUnapprovedProfiles();
    }, []);

    const handleApprove = async (id: string, role: Role | 'REFUND'): Promise<void> => {
        try {
            if (role === 'HOSPITAL') {
                await axios.put(ENDPOINTS.approveHospital(id));
                setHospitals(hospitals.filter(hospital => hospital.id !== id));
            } else if (role === 'DOCTOR') {
                await axios.put(ENDPOINTS.approveDoctor(id));
                setDoctors(doctors.filter(doctor => doctor.id !== id));
            } else if (role === 'REFUND') {
                await axios.put(ENDPOINTS.approveRefund(id));

                if (refundAppointments.length <= 1) {
                    setRefundAppointments([]);
                }

                setRefundAppointments(refundAppointments.filter(appointment => appointment.id !== id));
            }
        } catch (error) {
            console.error(`Error approving ${role.toLowerCase()}:`, error);
            // In a production app, you would want to show an error message to the user
        }
    };

    const handleReject = async (id: string, role: Role | 'REFUND'): Promise<void> => {
        try {
            if (role === 'HOSPITAL') {
                await axios.put(ENDPOINTS.rejectHospital(id));
                setHospitals(hospitals.filter(hospital => hospital.id !== id));
            } else if (role === 'DOCTOR') {
                await axios.put(ENDPOINTS.rejectDoctor(id));
                setDoctors(doctors.filter(doctor => doctor.id !== id));
            } else if (role === 'REFUND') {
                await axios.put(ENDPOINTS.rejectRefund(id));
                setRefundAppointments(refundAppointments.filter(appointment => appointment.id !== id));
            }
        } catch (error) {
            console.error(`Error rejecting ${role.toLowerCase()}:`, error);
            // In a production app, you would want to show an error message to the user
        }
    };

    const refreshData = (): void => {
        fetchUnapprovedProfiles();
    };

    const filteredHospitals = hospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRefundAppointments = refundAppointments.filter(appointment =>
        appointment.User.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.Hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    interface ProfileCardProps {
        profile: Profile;
        role: Role;
    }

    const ProfileCard: React.FC<ProfileCardProps> = ({ profile, role }) => {
        const createdDate = new Date(profile.createdAt).toLocaleDateString();

        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="p-1 bg-blue-500"></div>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">ID: {profile.id.substring(0, 8)}...</p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">Pending</span>
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span className="text-gray-600">{profile.email}</span>
                        </div>

                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <span className="text-gray-600">{profile.phone || "No phone"}</span>
                        </div>

                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">Applied on {createdDate}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                        <Link
                            to={`/profile/${profile.id}?role=${role}`}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded text-sm font-medium text-center hover:bg-blue-100 transition-colors"
                        >
                            View Profile
                        </Link>
                        <button
                            onClick={() => handleApprove(profile.id, role)}
                            className="flex-1 bg-green-50 text-green-600 py-2 rounded text-sm font-medium hover:bg-green-100 transition-colors"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleReject(profile.id, role)}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    interface RefundCardProps {
        appointment: Appointment;
    }

    const RefundCard: React.FC<RefundCardProps> = ({ appointment }) => {
        const appointmentDate = new Date(appointment.date).toLocaleDateString();
        const createdDate = new Date(appointment.createdAt).toLocaleDateString();

        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="p-1 bg-orange-500"></div>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{appointment.User.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">ID: {appointment.id.substring(0, 8)}...</p>
                        </div>
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">Refund Pending</span>
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">Doctor: {appointment.Hospital.name}</span>
                        </div>

                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm5 5a1 1 0 10-2 0v2H5a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2H9V9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">Hospital: {appointment.Hospital.name}</span>
                        </div>

                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">Appointment: {appointmentDate} at {appointment.time}</span>
                        </div>

                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">Amount: ${appointment.paidPrice.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">Refund requested on {createdDate}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                        <a
                            href={`/appointments/${appointment.id}`}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded text-sm font-medium text-center hover:bg-blue-100 transition-colors"
                        >
                            View Details
                        </a>
                        <button
                            onClick={() => handleApprove(appointment.id, 'REFUND')}
                            className="flex-1 bg-green-50 text-green-600 py-2 rounded text-sm font-medium hover:bg-green-100 transition-colors"
                        >
                            Approve Refund
                        </button>
                        <button
                            onClick={() => handleReject(appointment.id, 'REFUND')}
                            className="flex-1 bg-red-50 text-red-600 py-2 rounded text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                            Reject Refund
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
                    <h1 className="text-2xl font-bold text-white">Admin Approval Panel</h1>
                    <p className="text-indigo-100 mt-2">
                        Review and approve healthcare providers and refund requests
                    </p>
                </div>

                {/* Search and filters */}
                <div className="p-6 bg-gray-50 border-b">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:flex-1">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <button
                                onClick={refreshData}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('hospitals')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'hospitals'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Hospitals
                            {hospitals.length > 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                    {hospitals.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('doctors')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'doctors'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Doctors
                            {doctors.length > 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                    {doctors.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('refunds')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'refunds'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Refunds
                            {refundAppointments.length > 0 && (
                                <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                                    {refundAppointments.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'hospitals' && (
                                <>
                                    <h2 className="text-xl font-semibold mb-6">Pending Hospital Approvals</h2>
                                    {filteredHospitals.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredHospitals.map(hospital => (
                                                <ProfileCard key={hospital.id} profile={hospital} role="HOSPITAL" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="mt-4 text-lg font-medium text-gray-700">No pending hospital approvals</h3>
                                            <p className="mt-2 text-gray-500">All hospitals have been reviewed.</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'doctors' && (
                                <>
                                    <h2 className="text-xl font-semibold mb-6">Pending Doctor Approvals</h2>
                                    {filteredDoctors.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredDoctors.map(doctor => (
                                                <ProfileCard key={doctor.id} profile={doctor} role="DOCTOR" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="mt-4 text-lg font-medium text-gray-700">No pending doctor approvals</h3>
                                            <p className="mt-2 text-gray-500">All doctors have been reviewed.</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'refunds' && (
                                <>
                                    <h2 className="text-xl font-semibold mb-6">Pending Refund Approvals</h2>
                                    {filteredRefundAppointments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredRefundAppointments.map(appointment => (
                                                <RefundCard key={appointment.id} appointment={appointment} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="mt-4 text-lg font-medium text-gray-700">No pending refund requests</h3>
                                            <p className="mt-2 text-gray-500">All refund requests have been processed.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminApprovalPanel;