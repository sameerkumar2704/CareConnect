import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarCheck,
    faUser,
    faClock,
    faMoneyBillWave,
    faMapMarkerAlt,
    faPhoneAlt,
    faEnvelope,
    faArrowLeft,
    faCheckCircle,
    faExclamationCircle,
    faStar as fasStar,
    faClock as fasClock,
    faEdit,
    faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import NotFound from '../NotFound';
import { API_URL } from '../../utils/contants';
import { HospitalMap } from '../../components/HospitalMap';
import { useAuth } from '../../context/auth';

// Define interfaces based on your model
interface Appointment {
    id: string;
    hospitalId: string;
    userId: string;
    date: string;
    paidPrice: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    Hospital: Hospital;
    User: User;
    rating?: {
        rating: number;
        feedback: string;
    };
}

interface Hospital {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    parent?: Hospital;
    currLocation?: {
        latitude: number;
        longitude: number;
    };
}

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
}

// Status dropdown component
const StatusDropdown: React.FC<{
    currentStatus: string;
    onStatusChange: (status: string) => void;
    isUpdating: boolean;
}> = ({ currentStatus, onStatusChange, isUpdating }) => {
    const [isOpen, setIsOpen] = useState(false);

    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'text-yellow-800 bg-yellow-100' },
        { value: 'completed', label: 'Completed', color: 'text-green-800 bg-green-100' },
        { value: 'cancelled', label: 'Cancelled', color: 'text-red-800 bg-red-100' },
    ];

    const handleStatusChange = (status: string) => {
        onStatusChange(status);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={isUpdating}
            >
                <span>
                    {
                        statusOptions.find(option => option.value === currentStatus.toLowerCase())?.label ||
                        currentStatus
                    }
                </span>
                <FontAwesomeIcon icon={faEdit} className="ml-2" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 w-full mt-1 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                className={`${option.color} block w-full px-4 py-2 text-sm text-left font-medium hover:bg-gray-100`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Star Rating Display component
const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span key={index} className="text-lg">
                        <FontAwesomeIcon
                            icon={rating >= starValue ? fasStar : farStar}
                            className={rating >= starValue ? "text-yellow-400" : "text-gray-300"}
                        />
                    </span>
                );
            })}
        </div>
    );
};

const DoctorAppointmentView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        // Fetch appointment data from API
        fetch(`${API_URL}/appointments/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Appointment not found');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched appointment data:', data);
                setAppointment(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching appointment:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleStatusChange = (newStatus: string) => {
        if (!appointment || appointment.status.toLowerCase() === newStatus) return;

        setIsUpdatingStatus(true);
        setStatusUpdateSuccess(false);

        // Call API to update appointment status
        fetch(`${API_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update appointment status');
                }
                return response.json();
            })
            .then(data => {
                console.log('Updated appointment status:', data);
                setAppointment(prev => prev ? { ...prev, status: newStatus } : null);
                setStatusUpdateSuccess(true);
                setTimeout(() => setStatusUpdateSuccess(false), 3000);
                setIsUpdatingStatus(false);
            })
            .catch(err => {
                console.error('Error updating status:', err);
                setIsUpdatingStatus(false);
                alert("Error updating appointment status. Please try again.");
            });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return (
                    <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                        Completed
                    </span>
                );
            case 'pending':
                return (
                    <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                        <FontAwesomeIcon icon={fasClock} className="mr-1" />
                        Pending
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-sm font-medium">
                        {status}
                    </span>
                );
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error || !appointment) return <NotFound />;

    const auth = useAuth();

    if (!auth) {
        console.error("Auth context not found");
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-teal-600 to-blue-500 min-h-screen py-10 px-4">
            <div className="container mx-auto max-w-3xl">
                {/* Header Section with Status Management */}
                <div className="bg-white rounded-t-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <div className="bg-teal-100 rounded-full p-3 mr-4">
                                <FontAwesomeIcon icon={faCalendarCheck} className="text-teal-600 text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Appointment Details</h1>
                                <p className="text-gray-600">Doctor's view</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {statusUpdateSuccess && (
                                <span className="text-green-600 text-sm animate-pulse">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                    Status updated!
                                </span>
                            )}

                            <div className="flex flex-col items-end">
                                <span className="text-sm text-gray-500 mb-1">Status:</span>
                                <div className="flex items-center space-x-2">
                                    {getStatusBadge(appointment.status)}
                                    <StatusDropdown
                                        currentStatus={appointment.status}
                                        onStatusChange={handleStatusChange}
                                        isUpdating={isUpdatingStatus}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Reference Number */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500">Appointment ID</p>
                                <p className="font-medium text-gray-800">{appointment.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Booked On</p>
                                <p className="font-medium text-gray-800">{new Date(appointment.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white shadow-lg rounded-b-lg overflow-hidden">
                    {/* Time and Payment Info */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faClock} className="text-teal-500 mr-2" />
                            Schedule & Payment
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                    <FontAwesomeIcon icon={faClock} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium text-gray-800">{formatDate(appointment.date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                    <FontAwesomeIcon icon={faClock} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium text-gray-800">{formatTime(appointment.date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Amount</p>
                                    <p className="font-medium text-gray-800">₹{appointment.paidPrice.toFixed(2)}</p>
                                    <p className="text-xs text-green-600">Paid Successfully</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patient Information Section - More Detailed for Doctors */}
                    <div className="p-6 border-b border-gray-200 bg-blue-50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faUser} className="text-teal-500 mr-2" />
                            Patient Information
                        </h2>

                        <div className="bg-white p-5 rounded-lg shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-3">Contact Details</h3>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium text-gray-800">{appointment.User.name}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <a href={`mailto:${appointment.User.email}`} className="font-medium text-teal-600 hover:underline">
                                                {appointment.User.email}
                                            </a>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <a href={`tel:${appointment.User.phone}`} className="font-medium text-teal-600 hover:underline">
                                                {appointment.User.phone}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <div className="border-t border-gray-200 pt-4 md:border-t-0 md:pt-0">
                                        <h3 className="font-medium text-gray-700 mb-3">Action Center</h3>

                                        <div className="space-y-3">
                                            <button className="w-full bg-teal-600 text-white py-2 px-4 rounded flex items-center justify-center hover:bg-teal-700 transition">
                                                <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                                                Call Patient
                                            </button>

                                            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded flex items-center justify-center hover:bg-blue-600 transition">
                                                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                                Email Patient
                                            </button>

                                            <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                                <div className="flex items-start">
                                                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mr-2 mt-1" />
                                                    <p className="text-sm text-blue-700">
                                                        Access patient medical records from the patient dashboard.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Map */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-teal-500 mr-2" />
                            Location
                        </h2>

                        <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                            <HospitalMap
                                position={appointment.Hospital.currLocation ? [appointment.Hospital.currLocation.latitude, appointment.Hospital.currLocation.longitude] : [0, 0]}
                                name={appointment.Hospital.name}
                            />
                        </div>

                        <div className="mt-3 text-gray-600">
                            <p>{appointment.Hospital.address || "123 Healthcare Ave, Medical District"}</p>
                        </div>
                    </div>

                    {/* Patient Rating Section - Only show if completed and rated */}
                    {appointment.status &&
                        appointment.status.toLowerCase() === 'completed' &&
                        appointment.rating && (
                            <div className="p-6 border-b border-gray-200 bg-yellow-50">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={fasStar} className="text-yellow-500 mr-2" />
                                    Patient Feedback
                                </h2>

                                <div className="bg-white p-5 rounded-lg shadow-sm">
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-500 mb-1">Rating</p>
                                        <div className="flex items-center">
                                            <StarRatingDisplay rating={appointment.rating.rating} />
                                            <span className="ml-2 text-gray-700 font-medium">
                                                {appointment.rating.rating}/5
                                            </span>
                                        </div>
                                    </div>

                                    {appointment.rating.feedback && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Feedback</p>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <p className="text-gray-700">"{appointment.rating.feedback}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Action Buttons */}
                    <div className="p-6 flex justify-between">
                        <Link to="/doctor/appointments" className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg flex items-center hover:bg-gray-300 transition">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Back to Appointments
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorAppointmentView;