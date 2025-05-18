import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarCheck,
    faUser,
    faClock,
    faMoneyBillWave,
    faPhoneAlt,
    faEnvelope,
    faArrowLeft,
    faCheckCircle,
    faExclamationCircle,
    faStar as fasStar,
    faClock as fasClock,
    faEdit,
    faInfoCircle,
    faCalendarTimes,
    faLock,
    faExclamationTriangle,
    faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import NotFound from '../NotFound';
import { API_URL } from '../../utils/contants';
// import { HospitalMap } from '../../components/HospitalMap';
import { useAuth } from '../../context/auth';

// Define interfaces based on your model
interface Appointment {
    id: string;
    hospitalId: string;
    userId: string;
    date: string;
    paidPrice: number;
    doctorCharges: number;
    paidCharges: number;
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
    paidPrice: number;
    parent?: Hospital;
    currLocation: {
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

// Confirmation Modal component
const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-2" />
                        {title}
                    </h3>
                    <div className="mt-2 text-sm text-gray-600">
                        {message}
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
                    <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        onClick={onConfirm}
                    >
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
    );
};

// Payment Modal component
const PaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    amount: number;
}> = ({ isOpen, onClose, onConfirm, amount }) => {
    if (!isOpen) return null;

    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setProcessing(false);
            onConfirm();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                        <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 mr-2" />
                        Pay Cancellation Fee
                    </h3>
                    <div className="mt-2 text-sm text-gray-600 mb-4">
                        <p>Please make a payment of <span className="font-semibold">₹{amount.toFixed(2)}</span> for the cancellation fee.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="MM/YY"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                                onClick={onClose}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Pay Now'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Status dropdown component
const StatusDropdown: React.FC<{
    currentStatus: string;
    onStatusChange: (status: string) => void;
    isUpdating: boolean;
    isDisabled: boolean;
}> = ({ currentStatus, onStatusChange, isUpdating, isDisabled }) => {
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
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500'
                    }`}
                disabled={isUpdating || isDisabled}
            >
                <span>
                    {
                        statusOptions.find(option => option.value === currentStatus.toLowerCase())?.label ||
                        currentStatus
                    }
                </span>
                {isDisabled ? (
                    <FontAwesomeIcon icon={faLock} className="ml-2 text-gray-500" />
                ) : (
                    <FontAwesomeIcon icon={faEdit} className="ml-2" />
                )}
            </button>

            {isOpen && !isDisabled && (
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
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const auth = useAuth();

    if (!auth) {
        <LoadingSpinner />;
    }

    const { user } = auth;

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
                if (data.status.toLowerCase() === 'refunded' || data.status.toLowerCase() === 'refund_in_progress') {
                    data.status = (data.doctorCharges > 0 || data.paidCharges > 0) ? "cancelled" : 'expired';
                }

                if (user.role === "PATIENT") {
                    setError('You do not have permission to view this appointment.');
                    setLoading(false);
                    return;
                }

                if (data.hospitalId !== user._id && data.Hospital.parent?.id !== user._id) {
                    console.error('User does not have permission to view this appointment');
                    setError('You do not have permission to view this appointment.');
                    setLoading(false);
                    return;
                }

                // Calculate fine amount if cancelled (10% of paid price)
                if (data.status.toLowerCase() === 'cancelled') {
                    data.fineAmount = data.Hospital.paidPrice * 0.1;
                    // This would normally come from your backend
                    data.finePaid = data.finePaid || false;
                }

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

        // Don't allow status changes for expired or cancelled appointments
        if (appointment.status.toLowerCase() === 'expired' || appointment.status.toLowerCase() === 'cancelled') {
            alert("Cannot modify appointments that are expired or cancelled");
            return;
        }

        // Show confirmation modal if trying to cancel
        if (newStatus.toLowerCase() === 'cancelled') {
            setShowCancelModal(true);
            return;
        }

        // For other status changes, proceed normally
        updateAppointmentStatus(newStatus);
    };

    const confirmCancellation = () => {
        setShowCancelModal(false);
        updateAppointmentStatus('cancelled');
    };

    const updateAppointmentStatus = (newStatus: string) => {
        if (!appointment) return;

        setIsUpdatingStatus(true);
        setStatusUpdateSuccess(false);

        // Calculate doctor charges/fine
        let doctorCharges = 0;
        if (newStatus.toLowerCase() === 'cancelled') {
            doctorCharges = appointment.paidPrice * 0.1; // 10% cancellation fee
        }

        // Call API to update appointment status
        fetch(`${API_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: newStatus,
                doctorCharges: newStatus.toLowerCase() === 'cancelled' ? doctorCharges : appointment.Hospital.paidPrice
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update appointment status');
                }
                return response.json();
            })
            .then(data => {
                console.log('Updated appointment status:', data);

                const updatedAppointment = {
                    ...appointment,
                    status: newStatus
                };

                // If cancelling, add fine amount
                if (newStatus.toLowerCase() === 'cancelled') {
                    updatedAppointment.doctorCharges = doctorCharges;
                    updatedAppointment.paidCharges = 0;
                }

                setAppointment(updatedAppointment);
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

    const handlePayFine = () => {
        setShowPaymentModal(true);
    };

    const confirmPayment = () => {
        if (!appointment) return;

        // Call API to record payment
        fetch(`${API_URL}/appointments/${id}/pay-fine`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fineAmount: appointment.doctorCharges
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to process payment');
                }
                return response.json();
            })
            .then(data => {
                console.log('Payment successful:', data);
                setShowPaymentModal(false);
                setAppointment(prev => prev ? { ...prev, finePaid: true } : null);
                setPaymentSuccess(true);
                setTimeout(() => setPaymentSuccess(false), 3000);
            })
            .catch(err => {
                console.error('Error processing payment:', err);
                setShowPaymentModal(false);
                alert("Error processing payment. Please try again.");
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
            case 'expired':
                return (
                    <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                        <FontAwesomeIcon icon={faCalendarTimes} className="mr-1" />
                        Expired
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

    // Check if appointment is expired or cancelled
    const isExpired = appointment?.status.toLowerCase() === 'expired';
    const isCancelled = appointment?.status.toLowerCase() === 'cancelled';
    const isStatusLocked = isExpired || isCancelled;

    if (loading) return <LoadingSpinner />;
    if (error || !appointment) return <NotFound />;

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

                            {paymentSuccess && (
                                <span className="text-green-600 text-sm animate-pulse">
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                    Payment successful!
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
                                        isDisabled={isStatusLocked}
                                    />
                                </div>
                                {isStatusLocked && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        <FontAwesomeIcon icon={faLock} className="mr-1" />
                                        {isExpired ? 'Expired' : 'Cancelled'} appointments cannot be modified
                                    </p>
                                )}
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
                    {/* Cancellation Fee Section - Only show if cancelled and fine not paid */}
                    {isCancelled && appointment.doctorCharges > 0 && appointment.paidCharges == 0 && (
                        <div className="p-6 bg-red-50 border-b border-red-200">
                            <div className="flex items-start">
                                <div className="bg-red-100 rounded-full p-2 mr-4 flex-shrink-0">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />
                                </div>
                                <div className="flex-grow">
                                    <h2 className="text-lg font-semibold text-red-800 mb-2">Cancellation Fee Required</h2>
                                    <p className="text-red-700 mb-3">
                                        You have cancelled this appointment. A 10% cancellation fee of ₹{appointment.doctorCharges.toFixed(2)} is required.
                                    </p>
                                    <button
                                        onClick={handlePayFine}
                                        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition flex items-center"
                                    >
                                        <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                        Pay Cancellation Fee Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancellation Fee Paid Confirmation - Only show if cancelled and fine paid */}
                    {isCancelled && appointment.doctorCharges == 0 && appointment.paidCharges >= 0 && (
                        <div className="p-6 bg-green-50 border-b border-green-200">
                            <div className="flex items-start">
                                <div className="bg-green-100 rounded-full p-2 mr-4 flex-shrink-0">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-green-800 mb-2">Cancellation Fee Paid</h2>
                                    <p className="text-green-700">
                                        You have paid the cancellation fee of ₹{appointment.paidCharges.toFixed(2)}.
                                        Thank you for completing this transaction.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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

                        {/* Status-specific message */}
                        {isExpired && (
                            <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                                <div className="flex items-start">
                                    <FontAwesomeIcon icon={faCalendarTimes} className="text-gray-600 mr-2 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            This appointment has expired
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            The scheduled appointment time has passed and no action was taken. No further changes can be made.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isCancelled && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="text-red-600 mr-2 mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-red-700">
                                            This appointment has been cancelled
                                        </p>
                                        <p className="text-xs text-red-600">
                                            You have cancelled this appointment. No further status changes can be made.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                            {!isStatusLocked ? (
                                                <>
                                                    <button className="w-full bg-teal-600 text-white py-2 px-4 rounded flex items-center justify-center hover:bg-teal-700 transition">
                                                        <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                                                        Call Patient
                                                    </button>

                                                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded flex items-center justify-center hover:bg-blue-600 transition">
                                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                                        Email Patient
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="p-3 bg-gray-100 rounded border border-gray-300 mb-3">
                                                    <div className="flex items-start">
                                                        <FontAwesomeIcon icon={faInfoCircle} className="text-gray-600 mr-2 mt-1" />
                                                        <p className="text-sm text-gray-700">
                                                            Contact options are limited for {isExpired ? 'expired' : 'cancelled'} appointments.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

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

                    {/* Expired Appointment Summary - Only show if expired */}
                    {isExpired && (
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 mr-2" />
                                Expired Appointment Summary
                            </h2>

                            <div className="bg-white p-5 rounded-lg shadow-sm">
                                <p className="text-gray-700 mb-4">
                                    This appointment has passed its scheduled date and time without being marked as completed or cancelled.
                                    No further actions can be taken on this appointment.
                                </p>

                                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                    <div className="flex items-start">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600 mr-2 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-700">
                                                System Note
                                            </p>
                                            <p className="text-sm text-yellow-600">
                                                Appointments are automatically marked as expired if they remain in 'pending'
                                                status 24 hours after their scheduled time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancelled Appointment Summary - Only show if cancelled */}
                    {isCancelled && (
                        <div className="p-6 border-b border-gray-200 bg-red-50">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 mr-2" />
                                Cancelled Appointment Summary
                            </h2>

                            <div className="bg-white p-5 rounded-lg shadow-sm">
                                <p className="text-gray-700 mb-4">
                                    This appointment has been cancelled. No further status changes can be made.
                                </p>

                                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                    <div className="flex items-start">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600 mr-2 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-yellow-700">
                                                Cancellation Policy
                                            </p>
                                            <p className="text-sm text-yellow-600">
                                                When a doctor cancels an appointment, a 10% cancellation fee is applied.
                                                This fee ensures that both parties respect the scheduled appointment time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
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

            {/* Confirmation Modal for Cancellation */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancellation}
                title="Confirm Appointment Cancellation"
                message={
                    <div>
                        <p className="mb-3">Are you sure you want to cancel this appointment?</p>
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-3">
                            <div className="flex items-start">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-2 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-700">Cancellation Fee Warning</p>
                                    <p className="text-sm text-yellow-600">
                                        A 10% cancellation fee of <strong>₹{appointment.paidPrice * 0.1}</strong> will be applied.
                                        You will need to pay this fee after cancellation.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-red-600 text-sm font-medium">
                            Once cancelled, you cannot change the status of this appointment again.
                        </p>
                    </div>
                }
            />

            {/* Payment Modal for Cancellation Fee */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={confirmPayment}
                amount={appointment.doctorCharges || 0}
            />
        </div>
    );
};

export default DoctorAppointmentView;