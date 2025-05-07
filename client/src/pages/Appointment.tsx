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
    faCalendarTimes
} from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from './NotFound';
import { API_URL } from '../utils/contants';
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
    FaMapMarkerAlt
} from 'react-icons/fa';
import {
    FaRegCalendarAlt,
    FaRegClock,
    FaRegCalendar
} from 'react-icons/fa';
import { HospitalMap } from '../components/HospitalMap';

// Define interfaces based on your model
interface Appointment {
    id: string;
    hospitalId: string;
    userId: string;
    date: string;
    paidPrice: number;
    createdAt: string;
    updatedAt: string;
    Hospital: Hospital;
    User: User;
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

const AppointmentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const pdfTemplateRef = useRef<HTMLDivElement>(null);

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

    const getExpirationDate = (appointmentDate: string) => {
        const date = new Date(appointmentDate);
        date.setDate(date.getDate() + 90); // Set expiration to 90 days after appointment
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    if (loading) return <LoadingSpinner />;
    if (error || !appointment) return <NotFound />;

    return (
        <div className="bg-gradient-to-r from-teal-500 to-blue-400 min-h-screen py-10 px-4">
            <div className="container mx-auto max-w-3xl">
                {/* Confirmation Header */}
                <div className="bg-white rounded-t-lg shadow-lg p-6 flex items-center">
                    <div className="bg-green-100 rounded-full p-3 mr-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Appointment Confirmed</h1>
                        <p className="text-gray-600">Your appointment has been successfully booked and confirmed.</p>
                    </div>
                </div>

                {/* Appointment Details Card */}
                <div ref={contentRef} className="bg-white shadow-lg rounded-b-lg overflow-hidden">
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
                                    <p className="text-xs text-green-600">Paid Successfully</p>
                                </div>
                            </div>

                            {/* Added Expiration Date */}
                            <div className="flex items-start">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                    <FontAwesomeIcon icon={faCalendarTimes} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Booking Expires</p>
                                    <p className="font-medium text-gray-800">{getExpirationDate(appointment.date)}</p>
                                    <p className="text-xs text-gray-600">90 days after appointment date</p>
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

                            <div className="bg-gray-200 h-40 rounded-lg flex items-center justify-center">
                                <HospitalMap
                                    position={appointment.Hospital.currLocation ? [appointment.Hospital.currLocation.latitude, appointment.Hospital.currLocation.longitude] : [0, 0]}
                                    name={appointment.Hospital.name}
                                />

                            </div>
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

                    {/* Appointment Confirmation Title */}
                    <div style={{ textAlign: 'center', margin: '25px 0' }}>
                        <h2 style={{ display: "flex", alignContent: "center", justifyContent: "center", color: '#008080', fontSize: '24px', margin: '5px 0' }}>
                            <FaCheckCircle style={{ marginRight: '10px' }} />
                            Appointment Confirmation
                        </h2>
                        <p style={{ color: '#666', margin: '10px 0' }}>Appointment ID: {appointment.id}</p>
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
                            <div style={{ flex: '1', padding: '0 10px' }}>
                                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                    <FaClock style={{ marginRight: '8px', color: '#008080' }} />
                                    Expires On
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '16px' }}>{getExpirationDate(appointment.date)}</p>
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