import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarCheck,
    faHospital,
    faUser,
    faClock,
    faMoneyBillWave,
    faFileMedical,
    faDownload,
    faShare,
    faMapMarkerAlt,
    faPhoneAlt,
    faEnvelope,
    faArrowLeft,
    faCheckCircle,
    faExclamationCircle,
    faStar as fasStar,
    faClock as fasClock,
    faTimes,
    faTimesCircle,
    faCreditCard, // Add this import for the bank details icon
    faExclamationTriangle,
    faInfoCircle,
    faSync, // Add this for expired status
} from '@fortawesome/free-solid-svg-icons';

import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import NotFound from '../NotFound';
import { API_URL } from '../../utils/contants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import {
    FaCheckCircle,
    FaCalendarCheck,
    FaHospital,
    FaRupeeSign,
    FaUser,
    FaInfoCircle,
    FaClock,
    FaIdCard,
    FaFileAlt,
    FaExclamationTriangle,
    FaLock,
    FaPhoneAlt,
    FaUserMd,
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
} from 'react-icons/fa';
import {
    FaRegCalendarAlt,
    FaRegClock,
    FaRegCalendar,
} from 'react-icons/fa';
// import { HospitalMap } from '../../components/HospitalMap';
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
}

interface Speciality {
    id: string;
    name: string;
}

interface Hospital {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    parent?: Hospital;
    specialities?: Speciality[];
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

interface BankDetails {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
}

// Rating component
const RatingStars: React.FC<{
    rating: number;
    setRating: (rating: number) => void;
    hoverRating: number;
    setHoverRating: (rating: number) => void;
}> = ({ rating, setRating, hoverRating, setHoverRating }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span
                        key={index}
                        className="cursor-pointer text-2xl"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        <FontAwesomeIcon
                            icon={
                                (hoverRating || rating) >= starValue ? fasStar : farStar
                            }
                            className={(hoverRating || rating) >= starValue ? "text-yellow-400" : "text-gray-300"}
                        />
                    </span>
                );
            })}
        </div>
    );
};

const AppointmentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const pdfTemplateRef = useRef<HTMLDivElement>(null);

    // New state for cancellation
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancellationSuccess, setCancellationSuccess] = useState(false);

    // Rating state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);
    const [cancelledByDoctor, setCancelledByDoctor] = useState(false);
    const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);

    const [bankDetails, setBankDetails] = useState<BankDetails>({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
    });
    const [showBankDetailsForm, setShowBankDetailsForm] = useState(false);
    const [submittingBankDetails, setSubmittingBankDetails] = useState(false);
    const [bankDetailsSubmitted, setBankDetailsSubmitted] = useState(false);

    // Add this function to handle bank details input changes
    const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBankDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitBankDetailsForRefund = () => {
        if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
            alert("Please fill in all bank details fields");
            return;
        }

        setSubmittingBankDetails(true);

        fetch(`${API_URL}/appointments/${id}/refund`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bankDetails
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit bank details');
                }
                return response.json();
            })
            .then(data => {
                setBankDetailsSubmitted(true);
                setSubmittingBankDetails(false);
                console.log('Bank details submitted successfully:', data);
            })
            .catch(err => {
                console.error('Error submitting bank details:', err);
                setSubmittingBankDetails(false);
                alert("Error submitting bank details. Please try again.");
            })
    };


    // Add function to check if appointment is expired (to be used in the component)
    const isAppointmentExpired = () => {
        if (!appointment) return false;

        const appointmentDate = new Date(appointment.date);
        const now = new Date();
        return appointmentDate < new Date(now.getDate() + 1) && appointment.status.toLowerCase() === 'pending';
    };

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
                if (data.bankDetails) {
                    setBankDetails({
                        accountNumber: data.bankDetails.accountNumber,
                        ifscCode: data.bankDetails.ifscCode,
                        accountHolderName: data.bankDetails.accountHolderName,
                    });
                    setBankDetailsSubmitted(true);
                    console.log('Bank details fetched:', data.bankDetails);
                }
                if (data.doctorCharges > 0 && (!data.paidCharges || data.paidCharges > 0)) {
                    setCancelledByDoctor(true);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching appointment:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleSpecialityToggle = (specialityId: string) => {
        setSelectedSpecialities(prevSelected => {
            if (prevSelected.includes(specialityId)) {
                return prevSelected.filter(id => id !== specialityId);
            } else {
                return [...prevSelected, specialityId];
            }
        });
    };

    const submitRating = () => {
        if (rating === 0) {
            alert("Please select a rating before submitting");
            return;
        }

        if (selectedSpecialities.length === 0) {
            alert("Please select at least one speciality");
            return;
        }

        setIsSubmittingRating(true);

        // Prepare rating data for each selected speciality
        const ratingPromises = selectedSpecialities.map(specialityId => {
            return fetch(`${API_URL}/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: appointment?.userId,
                    hospitalId: appointment?.hospitalId,
                    specialityId,
                    rating,
                    feedback,
                }),
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit rating');
                }
                return response.json();
            });
        });

        // Submit all ratings
        Promise.all(ratingPromises)
            .then(() => {
                setRatingSubmitted(true);
                setIsSubmittingRating(false);
            })
            .catch(err => {
                console.error('Error submitting ratings:', err);
                setIsSubmittingRating(false);
                alert("Error submitting ratings. Please try again.");
            });
    };

    const cancelAppointment = () => {
        if (!appointment || !id) return;

        setCancelling(true);

        fetch(`${API_URL}/appointments/${id}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to cancel appointment');
                }
                return response.json();
            })
            .then(data => {
                // Update the appointment with new status
                setAppointment({
                    ...appointment,
                    status: 'cancelled'
                });
                setCancellationSuccess(true);
                setCancelling(false);
                console.log('Appointment cancelled successfully:', data);

                // Close modal after showing success for 2 seconds
                setTimeout(() => {
                    setShowCancelModal(false);
                }, 2000);
            })
            .catch(err => {
                console.error('Error cancelling appointment:', err);
                setCancelling(false);
                alert("Error cancelling appointment. Please try again.");
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

    const generatePDF = async () => {
        if (!pdfTemplateRef.current || !appointment) return;

        try {
            setDownloadingPdf(true);

            // Make the PDF template visible before capturing
            const template = pdfTemplateRef.current;
            template.style.display = 'block';
            template.style.width = '800px';
            template.style.position = 'absolute';
            template.style.left = '-9999px';
            document.body.appendChild(template);

            // Allow some time for rendering
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Use html2canvas to capture the template
            const canvas = await html2canvas(template, {
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true
            });

            // Hide the template again
            template.style.display = 'none';

            // Create PDF from canvas
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Add the image to the PDF
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Save the PDF
            pdf.save(`CareConnect-Appointment-${appointment.id}.pdf`);

            setDownloadingPdf(false);
        } catch (err) {
            console.error("Error generating PDF:", err);
            setDownloadingPdf(false);
            alert("Error generating PDF. Please try again later.");
        }
    };

    // Update the getStatusBadge function to include the "expired" status
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
                        <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
                        Cancelled
                    </span>
                );
            case 'expired':
                return (
                    <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                        Expired
                    </span>
                );
            case 'refunded':
                return (
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium flex items-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                        Refunded
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

    // Check if appointment can be cancelled (only pending appointments and not too close to appointment time)
    const canBeCancelled = appointment.status.toLowerCase() === 'pending';

    // Calculate the refund amount (90% of paid price)
    const refundAmount = !cancelledByDoctor ? (appointment.paidPrice * 0.9).toFixed(2) : (appointment.paidPrice).toFixed(2);

    return (
        <div className="bg-gradient-to-r from-teal-500 to-blue-400 min-h-screen py-10 px-4">
            <div className="container mx-auto max-w-3xl">
                {/* Confirmation Header */}
                <div className="bg-white rounded-t-lg shadow-lg p-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className={`${['cancelled', 'expired', 'refunded', 'refund_in_progress'].includes(appointment.status.toLowerCase())
                            ? 'bg-red-100'
                            : 'bg-green-100'
                            } rounded-full p-3 mr-4`}>
                            <FontAwesomeIcon
                                icon={
                                    appointment.status.toLowerCase() === 'cancelled' ? faTimesCircle :
                                        appointment.status.toLowerCase() === 'expired' ? faExclamationTriangle :
                                            appointment.status.toLowerCase() === 'refunded' ? faMoneyBillWave :
                                                appointment.status.toLowerCase() === 'refund_in_progress' ? faSync :
                                                    faCheckCircle
                                }
                                className={`${['cancelled', 'expired', 'refunded', 'refund_in_progress'].includes(appointment.status.toLowerCase())
                                    ? 'text-red-500'
                                    : 'text-green-500'
                                    } text-2xl`}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {appointment.status.toLowerCase() === 'cancelled'
                                    ? 'Appointment Cancelled'
                                    : appointment.status.toLowerCase() === 'expired'
                                        ? 'Appointment Expired'
                                        : appointment.status.toLowerCase() === 'refunded'
                                            ? 'Appointment Refunded'
                                            : appointment.status.toLowerCase() === 'refund_in_progress'
                                                ? 'Refund In Progress'
                                                : 'Appointment Confirmed'}
                            </h1>
                            <p className="text-gray-600">
                                {appointment.status.toLowerCase() === 'cancelled'
                                    ? 'Your appointment has been cancelled.'
                                    : appointment.status.toLowerCase() === 'expired'
                                        ? 'Your appointment time has passed.'
                                        : appointment.status.toLowerCase() === 'refunded'
                                            ? 'Your appointment payment has been refunded.'
                                            : appointment.status.toLowerCase() === 'refund_in_progress'
                                                ? 'Your refund is currently being processed.'
                                                : 'Your appointment has been successfully booked and confirmed.'}
                            </p>
                        </div>
                    </div>
                    {/* Status badge */}
                    {appointment.status && getStatusBadge(appointment.status)}
                </div>

                {/* Appointment Details Card */}
                <div ref={contentRef} className="bg-white shadow-lg rounded-b-lg overflow-hidden">
                    {/* Cancel button for pending appointments */}
                    {canBeCancelled && !isAppointmentExpired() && (
                        <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-800">Need to reschedule?</h3>
                                <p className="text-sm text-gray-600">You can cancel this appointment and receive a 90% refund.</p>
                            </div>
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition flex items-center"
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                Cancel Appointment
                            </button>
                        </div>
                    )}

                    {isAppointmentExpired() && !bankDetailsSubmitted && !showBankDetailsForm && (
                        <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-800">Your appointment has expired</h3>
                                <p className="text-sm text-gray-600">You missed your appointment but can still claim a 90% refund.</p>
                            </div>
                            <button
                                onClick={() => setShowBankDetailsForm(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition flex items-center"
                            >
                                <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                Claim Refund
                            </button>
                        </div>
                    )}



                    {(appointment.status.toLowerCase() === 'cancelled' || appointment.status.toLowerCase() === 'expired') && !bankDetailsSubmitted && (
                        <div className="p-6 border-b border-gray-200 bg-orange-50">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faCreditCard} className="text-orange-500 mr-2" />
                                {showBankDetailsForm ? 'Enter Your Bank Details for Refund' : 'Get Your Refund'}
                            </h2>

                            {!showBankDetailsForm ? (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    {!cancelledByDoctor ? <p className="text-gray-700 mb-4">
                                        You are eligible for a refund of ₹{refundAmount} (90% of the paid amount).
                                        Please provide your bank details to receive the refund.
                                    </p> :
                                        <p className="text-gray-700 mb-4">
                                            You are eligible for a refund of ₹{refundAmount} (100% of the paid amount) because its cancelled by doctor.
                                            Please provide your bank details to receive the refund.
                                        </p>}
                                    <button
                                        onClick={() => setShowBankDetailsForm(true)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition"
                                    >
                                        Provide Bank Details
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="mb-4">
                                        <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Holder Name
                                        </label>
                                        <input
                                            type="text"
                                            id="accountHolderName"
                                            name="accountHolderName"
                                            value={bankDetails.accountHolderName}
                                            onChange={handleBankDetailsChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Enter account holder's name"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Number
                                        </label>
                                        <input
                                            type="text"
                                            id="accountNumber"
                                            name="accountNumber"
                                            value={bankDetails.accountNumber}
                                            onChange={handleBankDetailsChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Enter your account number"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">
                                            IFSC Code
                                        </label>
                                        <input
                                            type="text"
                                            id="ifscCode"
                                            name="ifscCode"
                                            value={bankDetails.ifscCode}
                                            onChange={handleBankDetailsChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Enter bank IFSC code"
                                        />
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            onClick={() => setShowBankDetailsForm(false)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={submitBankDetailsForRefund}
                                            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition flex items-center justify-center disabled:bg-gray-400"
                                            disabled={submittingBankDetails || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName}
                                        >
                                            {submittingBankDetails ? 'Processing...' : 'Submit Bank Details'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {showCancelModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                                {!cancellationSuccess ? (
                                    <>
                                        <div className="mb-4 text-center">
                                            <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-2xl" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Cancel Appointment?</h3>
                                            <p className="text-gray-600">
                                                Are you sure you want to cancel your appointment with Dr. {appointment.Hospital.name} on {formatDate(appointment.date)} at {formatTime(appointment.date)}?
                                            </p>
                                        </div>

                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-yellow-700">
                                                        You will receive a refund of <span className="font-semibold">₹{refundAmount}</span> (90% of your payment).
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => setShowCancelModal(false)}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition"
                                            >
                                                Keep Appointment
                                            </button>
                                            <button
                                                onClick={cancelAppointment}
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition flex items-center"
                                                disabled={cancelling}
                                            >
                                                {cancelling ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Cancelling...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                                        Yes, Cancel
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="bg-green-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Appointment Cancelled</h3>
                                        <p className="text-gray-600 mb-4">
                                            Your appointment has been successfully cancelled. You will receive a refund of ₹{refundAmount} soon.
                                        </p>
                                        <button
                                            onClick={() => setShowBankDetailsForm(true)}
                                            className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition"
                                        >
                                            Provide Bank Details for Refund
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bank Details Submitted Success Message */}
                    {bankDetailsSubmitted && (
                        <div className="p-6 border-b border-gray-200 bg-green-50">
                            <div className="flex items-center justify-center mb-3">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-3xl" />
                            </div>
                            <h3 className="text-center text-xl font-medium text-green-800">Refund Request {appointment.status.toLowerCase() == "refunded" ? "Accepted" : "Submitted"}!</h3>
                            <p className="text-center text-green-700 mt-2">
                                Your refund of ₹{refundAmount} {appointment.status.toLowerCase() == "refunded" ? "has been refunded to your submitted bank details." : "will be processed to your account within 5-7 business days."}
                            </p>
                        </div>
                    )}

                    {/* Show User Bank Details */}
                    {bankDetailsSubmitted && (
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faCreditCard} className="text-teal-500 mr-2" />
                                Your Bank Details
                            </h2>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-gray-700 mb-3">Bank Account Holder Name: {bankDetails.accountHolderName}</p>
                                <p className="text-gray-700 mb-3">Account Number: {bankDetails.accountNumber}</p>
                                <p className="text-gray-700 mb-3">IFSC Code: {bankDetails.ifscCode}</p>
                            </div>
                        </div>
                    )}

                    {/* Rating component - moved up and shown for completed appointments */}
                    {appointment.status && appointment.status.toLowerCase() === 'completed' && !ratingSubmitted && (
                        <div className="p-6 border-b border-gray-200 bg-blue-50">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={fasStar} className="text-yellow-500 mr-2" />
                                Please Rate Your Experience
                            </h2>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <p className="text-gray-700 mb-3">How was your experience with Dr. {appointment.Hospital.name}?</p>

                                <div className="mb-4">
                                    <RatingStars
                                        rating={rating}
                                        setRating={setRating}
                                        hoverRating={hoverRating}
                                        setHoverRating={setHoverRating}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {rating === 1 && "Poor"}
                                        {rating === 2 && "Fair"}
                                        {rating === 3 && "Good"}
                                        {rating === 4 && "Very Good"}
                                        {rating === 5 && "Excellent"}
                                    </p>
                                </div>

                                {/* Speciality selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Specialities You're Rating (Select all that apply)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {appointment.Hospital.specialities ? (
                                            appointment.Hospital.specialities.map(spec => (
                                                <div
                                                    key={spec.id}
                                                    onClick={() => handleSpecialityToggle(spec.id)}
                                                    className={`cursor-pointer px-3 py-2 rounded-full text-sm ${selectedSpecialities.includes(spec.id)
                                                        ? 'bg-teal-500 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {spec.name}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-yellow-600">Loading specialities...</p>
                                        )}
                                    </div>
                                    {selectedSpecialities.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">Please select at least one speciality</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Feedback (Optional)
                                    </label>
                                    <textarea
                                        id="feedback"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Share your thoughts about your appointment..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    ></textarea>
                                </div>

                                <button
                                    className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition flex items-center justify-center disabled:bg-gray-400"
                                    onClick={submitRating}
                                    disabled={isSubmittingRating || rating === 0 || selectedSpecialities.length === 0}
                                >
                                    {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Rating submitted thank you message */}
                    {ratingSubmitted && (
                        <div className="p-6 border-b border-gray-200 bg-green-50">
                            <div className="flex items-center justify-center mb-3">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-3xl" />
                            </div>
                            <h3 className="text-center text-xl font-medium text-green-800">Thank You for Your Feedback!</h3>
                            <p className="text-center text-green-700 mt-2">
                                Your rating helps us improve our services and assist other patients.
                            </p>
                        </div>
                    )}

                    {/* Appointment Info Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-teal-500 mr-2" />
                            Appointment Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                    <FontAwesomeIcon icon={faUser} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Doctor</p>
                                    <p className="font-medium text-gray-800">Dr. {appointment.Hospital.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                    <FontAwesomeIcon icon={faHospital} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Hospital</p>
                                    <p className="font-medium text-gray-800">{appointment.Hospital.parent?.name || appointment.Hospital.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                    <FontAwesomeIcon icon={faClock} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date & Time</p>
                                    <p className="font-medium text-gray-800">{formatDate(appointment.date)}</p>
                                    <p className="text-sm text-gray-600">{formatTime(appointment.date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Amount</p>
                                    <p className="font-medium text-gray-800">₹{appointment.paidPrice.toFixed(2)}</p>
                                    <p className={`text-xs ${appointment.status.toLowerCase() === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                                        {appointment.status.toLowerCase() === 'cancelled'
                                            ? `Refunded: ₹${refundAmount}`
                                            : 'Paid Successfully'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reference Number */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
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

                    {/* Hospital Location & Contact */}
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-teal-500 mr-2" />
                            Location & Contact
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600 mb-1">{appointment.Hospital.address || "123 Healthcare Ave, Medical District"}</p>

                                <div className="mt-4 flex flex-col space-y-2">
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faPhoneAlt} className="text-teal-600 mr-2" />
                                        <a href={`tel:${appointment.Hospital.phone}`} className="text-teal-600 hover:underline">
                                            {appointment.Hospital.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-teal-600 mr-2" />
                                        <a href={`mailto:${appointment.Hospital.email}`} className="text-teal-600 hover:underline">
                                            {appointment.Hospital.email}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center">
                                <HospitalMap
                                    position={appointment.Hospital.currLocation ? [appointment.Hospital.currLocation.latitude, appointment.Hospital.currLocation.longitude] : [0, 0]}
                                    name={appointment.Hospital.name}
                                />
                            </div> */}
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faUser} className="text-teal-500 mr-2" />
                            Patient Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium text-gray-800">{appointment.User.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Email Address</p>
                                <p className="font-medium text-gray-800">{appointment.User.email}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="font-medium text-gray-800">{appointment.User.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Instructions */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FontAwesomeIcon icon={faFileMedical} className="text-teal-500 mr-2" />
                            Important Information
                        </h2>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Please arrive 15 minutes before your appointment time for registration.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                            <li>Bring your government-issued ID and insurance card if applicable.</li>
                            <li>If you're bringing medical records or test results, please have them ready.</li>
                            <li>Wear comfortable clothing that allows easy examination of the affected area.</li>
                            <li>If you need to cancel, please do so at least 24 hours in advance.</li>
                            <li><strong>Please bring a printed copy of your appointment details to the hospital.</strong></li>
                        </ul>
                    </div>

                    {/* Confidentiality Notice */}
                    <div className="px-6 pb-2 pt-2 bg-gray-100">
                        <p className="text-xs text-gray-500 italic text-center">
                            <strong>CONFIDENTIAL:</strong> This document contains private patient information. Please keep secure.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="p-6 flex flex-wrap gap-4">
                        <button
                            className="flex-1 min-w-[160px] bg-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-teal-700 transition disabled:bg-gray-400"
                            onClick={generatePDF}
                            disabled={downloadingPdf}
                        >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            {downloadingPdf ? 'Generating PDF...' : 'Download PDF Copy'}
                        </button>

                        <button className="flex-1 min-w-[160px] bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition">
                            <FontAwesomeIcon icon={faShare} className="mr-2" />
                            Share Details
                        </button>

                        <Link to="/dashboard" className="flex-1 min-w-[160px] bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                            Back to Dashboard
                        </Link>
                    </div>

                    {/* PDF Instruction Note */}
                    <div className="px-6 pb-6">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon icon={faDownload} className="text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        <strong>Please download and print a copy</strong> of your appointment details to bring with you to the hospital.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Support Info */}
                <div className="mt-6 text-center text-white">
                    <p className="mb-2">Need help with your appointment?</p>
                    <p className="font-medium">Call our support team: <a href="tel:+1234567890" className="underline">+1 (234) 567-890</a></p>
                </div>
            </div>

            {/* PDF Template - Initially hidden */}
            <div ref={pdfTemplateRef} style={{ display: 'none', backgroundColor: 'white' }}>
                <div style={{ fontFamily: 'Arial, sans-serif', width: '800px', padding: '20px', margin: '0 auto' }}>
                    {/* PDF Header */}
                    <div style={{
                        display: "flex",
                        backgroundColor: '#008080',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '5px 5px 0 0',
                        justifyContent: "center",
                        gap: "15px"
                    }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '50px', height: '50px' }} />
                        <h1 style={{ margin: '0', fontSize: '28px' }}>CareConnect</h1>
                    </div>

                    <div style={{ textAlign: 'center', margin: '25px 0' }}>
                        <h2 style={{ display: "flex", alignContent: "center", justifyContent: "center", color: '#008080', fontSize: '24px', margin: '5px 0' }}>
                            <FaCheckCircle style={{ marginRight: '10px' }} />
                            Appointment Confirmation
                        </h2>
                        <p style={{ color: '#666', margin: '10px 0' }}>Appointment ID: {appointment.id}</p>

                        {/* Only show status in PDF if completed */}
                        {appointment.status && appointment.status.toLowerCase() === 'completed' && (
                            <div style={{
                                display: 'inline-block',
                                backgroundColor: '#d1fae5',
                                color: '#065f46',
                                padding: '5px 15px',
                                borderRadius: '15px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                marginTop: '10px'
                            }}>
                                ✓ Completed
                            </div>
                        )}

                        {appointment.status && appointment.status.toLowerCase() === 'expired' && (
                            <div style={{
                                display: 'inline-block',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                padding: '5px 15px',
                                borderRadius: '15px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                marginTop: '10px'
                            }}>
                                ⚠ Expired
                            </div>
                        )}
                    </div>

                    {/* Appointment Details Section */}
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '20px',
                        backgroundColor: '#f9f9f9',
                        marginBottom: '25px'
                    }}>
                        <h3 style={{
                            color: '#008080',
                            borderBottom: '2px solid #ddd',
                            paddingBottom: '10px',
                            margin: '0 0 20px 0',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FaCalendarCheck style={{ marginRight: '10px' }} />
                            Appointment Details
                        </h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaRegCalendarAlt style={{ marginRight: '8px', color: '#008080' }} />
                                    Date
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>{formatDate(appointment.date)}</p>
                            </div>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaRegClock style={{ marginRight: '8px', color: '#008080' }} />
                                    Time
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>{formatTime(appointment.date)}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaUserMd style={{ marginRight: '8px', color: '#008080' }} />
                                    Doctor
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>Dr. {appointment.Hospital.name}</p>
                            </div>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaHospital style={{ marginRight: '8px', color: '#008080' }} />
                                    Hospital
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>{appointment.Hospital.parent?.name || appointment.Hospital.name}</p>
                            </div>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaRupeeSign style={{ marginRight: '8px', color: '#008080' }} />
                                    Amount Paid
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>₹{appointment.paidPrice.toFixed(2)}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex' }}>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaMapMarkerAlt style={{ marginRight: '8px', color: '#008080' }} />
                                    Address
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>{appointment.Hospital.address || "123 Healthcare Ave, Medical District"}</p>
                            </div>
                            <div style={{ flex: '2' }}></div> {/* Empty flex space for alignment */}
                        </div>
                    </div>

                    {/* Patient Information Section */}
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '20px',
                        backgroundColor: '#f9f9f9',
                        marginBottom: '25px'
                    }}>
                        <h3 style={{
                            color: '#008080',
                            borderBottom: '2px solid #ddd',
                            paddingBottom: '10px',
                            margin: '0 0 20px 0',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FaUser style={{ marginRight: '10px' }} />
                            Patient Information
                        </h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaUserCircle style={{ marginRight: '8px', color: '#008080' }} />
                                    Name
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>{appointment.User.name}</p>
                            </div>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaEnvelope style={{ marginRight: '8px', color: '#008080' }} />
                                    Email
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>{appointment.User.email}</p>
                            </div>
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaPhone style={{ marginRight: '8px', color: '#008080' }} />
                                    Phone
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>{appointment.User.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Important Information Section */}
                    <div style={{
                        border: '1px solid #ffd54f',
                        borderRadius: '5px',
                        padding: '20px',
                        backgroundColor: '#fff8e1',
                        marginBottom: '25px'
                    }}>
                        <h3 style={{
                            color: '#008080',
                            borderBottom: '2px solid #ffd54f',
                            paddingBottom: '10px',
                            margin: '0 0 15px 0',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FaInfoCircle style={{ marginRight: '10px' }} />
                            Important Information
                        </h3>

                        <ul style={{ paddingLeft: '10px', margin: '0', listStyleType: 'none' }}>
                            <li style={{ margin: '12px 0', display: 'flex', alignItems: 'flex-start' }}>
                                <FaClock style={{ color: '#008080', marginRight: '10px', marginTop: '3px' }} />
                                <span>Please arrive 15 minutes before your appointment time for registration.</span>
                            </li>
                            <li style={{ margin: '12px 0', display: 'flex', alignItems: 'flex-start' }}>
                                <FaIdCard style={{ color: '#008080', marginRight: '10px', marginTop: '3px' }} />
                                <span>Bring your government-issued ID and insurance card if applicable.</span>
                            </li>
                            <li style={{ margin: '12px 0', display: 'flex', alignItems: 'flex-start' }}>
                                <FaFileAlt style={{ color: '#008080', marginRight: '10px', marginTop: '3px' }} />
                                <span>If you're bringing medical records or test results, please have them ready.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Important Note */}
                    <div style={{
                        backgroundColor: '#ffebee',
                        padding: '15px',
                        borderRadius: '5px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#c62828',
                        marginBottom: '25px',
                        border: '1px dashed #f44336'
                    }}>
                        <FaExclamationTriangle style={{ marginRight: '10px' }} />
                        PLEASE BRING THIS PRINTED DOCUMENT TO YOUR APPOINTMENT
                    </div>

                    {/* Footer */}
                    <div style={{
                        width: '100%',
                        marginTop: '30px',
                        borderTop: '1px solid #ddd',
                        paddingTop: '15px',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            <FaRegCalendar style={{ marginRight: '5px' }} />
                            Generated on {new Date().toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            <FaPhoneAlt style={{ marginRight: '5px' }} />
                            For assistance, call: +1 (234) 567-890
                        </div>
                    </div>

                    {/* Confidentiality Notice */}
                    <div style={{
                        backgroundColor: '#f5f5f5',
                        padding: '10px',
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#666',
                        fontStyle: 'italic',
                        marginTop: '20px',
                        borderRadius: '3px'
                    }}>
                        <FaLock style={{ marginRight: '5px' }} />
                        CONFIDENTIAL: This document contains private patient information. Please keep secure.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsPage;