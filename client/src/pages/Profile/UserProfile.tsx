import { useEffect, useState } from "react";
import { Hospital, User } from "../../model/user.model";
import axios from "axios";
import { API_URL } from "../../utils/contants";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faCalendarAlt,
    faClock,
    faHospital,
    faArrowCircleUp,
    faLocationArrow,
    faSearch,
    faWarning,
    faCheckCircle,
    faExclamationTriangle,
    faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { getHighlyAccurateLocation } from "../../utils/location/Location";
import DoctorSpecialtiesTab from "./DoctorSpecialities";
import ProviderTimingsTab from "./HospitalTimings";
import DocumentVerificationTab from "./DocumentVerificationTab";
import { GoogleMap } from "../../utils/location/GoogleMap";
import ReverseGeocoder from "../../utils/location/Address";

interface Appointment {
    id: string;
    hospitalId: string;
    userId: string;
    date: string;
    Hospital: Hospital;
    User: User
    paidPrice: number;
    createdAt: string;
    status: string;
    updatedAt: string;
}

interface Speciality {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

interface ExtendedUser extends User {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    timings: JSON;
    currLocation: {
        longitude: string;
        latitude: string;
    };
    freeSlotDate: string;
    appointments: Appointment[];
    ratings: any[];
    isApproved: boolean;
    specialities: Speciality[];
}

// Profile completion step interface
interface ProfileCompletionStep {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    tabId: string;
}

const UserProfile = ({ userId, role }: { userId: string; role: string; }) => {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [activeTab, setActiveTab] = useState<string>("profile");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState<boolean>(false);
    const [date, setDate] = useState('');
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const validateDate = (dateString: string) => {
        // Basic validation for dd/mm/yyyy format
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(regex);

        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        // Check if date values are valid
        if (month < 1 || month > 12) return false;
        if (day < 1) return false;

        // Check for days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) return false;

        const selectedDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Ensure date is not in the past
        if (selectedDate < today) return false;

        return true;
    };

    const handleSave = async () => {
        if (!date) {
            setError('Please enter a date');
            return;
        }

        if (!validateDate(date)) {
            setError('Please enter a valid future date in DD/MM/YYYY format');
            return;
        }

        console.log("Selected date:", date);

        const [day, month, year] = date.split('/').map(Number);

        console.log("Parsed date:", { day, month, year });

        const dataDate = new Date();
        dataDate.setFullYear(year);
        dataDate.setMonth(month - 1);
        dataDate.setDate(day);

        console.log("Date object:", dataDate);

        const res = await axios.put(`${API_URL}/hospitals/date/${userId}`, {
            date: dataDate,
        });

        if (res.status !== 200) {
            setError('Failed to save date');
            return;
        }



        setSaved(true);
        setError('');
    };

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(false);
    const [profileCompletionSteps, setProfileCompletionSteps] = useState<ProfileCompletionStep[]>([]);

    useEffect(() => {
        fetchUser();
    }, [userId]);

    useEffect(() => {
        if (user && role !== "PATIENT") {
            // Set up profile completion steps based on user data
            const steps: ProfileCompletionStep[] = [
                {
                    id: "timings",
                    title: "Set your availability",
                    description: "Define your working hours to receive appointments",
                    isCompleted: user.timings && JSON.stringify(user.timings) !== "{}",
                    tabId: "timings"
                },
                {
                    id: "location",
                    title: "Update your location",
                    description: "Set your location to help patients find you",
                    isCompleted: !!user.currLocation,
                    tabId: "location"
                },
                {
                    id: "documents",
                    title: "Upload verification documents",
                    description: "Upload your credentials to get verified",
                    isCompleted: user.isApproved,
                    tabId: "documents"
                }
            ];

            // Add specialties step only for doctors
            if (role === "DOCTOR") {
                steps.push({
                    id: "specialties",
                    title: "Add your specialties",
                    description: "Let patients know your areas of expertise",
                    isCompleted: user.specialities && user.specialities.length > 0,
                    tabId: "specialties"
                });
            }

            setProfileCompletionSteps(steps);
        }
    }, [user, role]);

    const getCompletedStepsCount = () => {
        return profileCompletionSteps.filter(step => step.isCompleted).length;
    };

    const fetchUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/${role === "PATIENT" ? "users" : "hospitals"}/${userId}`);
            setUser(res.data);
            console.log("User at User Profile", res.data);
            setFormData({
                name: res.data.name,
                email: res.data.email,
                phone: res.data.phone
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
        }
    };

    const fetchAppointmentsByDate = async (date: string) => {
        setIsLoadingAppointments(true);
        try {
            // Replace this URL with your actual API endpoint for fetching appointments by date
            const response = await axios.get(`${API_URL}/appointments/byDate`, {
                params: {
                    userId,
                    role,
                    date
                }
            });

            const now = new Date();
            const nextDate = new Date(now);
            nextDate.setDate(now.getDate() + 1);

            // const newAppointments = response.data.map((appointment: Appointment) => {
            //     if (appointment.status.toLowerCase() === "pending" && new Date(appointment.date) <= nextDate) {
            //         return {
            //             ...appointment,
            //             status: "EXPIRED"
            //         };
            //     } else {
            //         return appointment;
            //     }
            // });

            // Update only the appointments part of the user data
            setUser(prevUser => prevUser ? {
                ...prevUser,
                appointments: response.data
            } : null);

        } catch (error) {
            console.error("Error fetching appointments by date:", error);
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would update the user data via API here
        // For now, we'll just simulate it
        setUser(prev => prev ? { ...prev, ...formData } : null);
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    // Function to update user location
    const handleUpdateLocation = async () => {
        try {
            setIsUpdatingLocation(true);

            // Get current position
            const position = await getHighlyAccurateLocation();
            const { lat: latitude, lon: longitude } = position;

            console.log("Current position:", { latitude, longitude });

            // Call API to update location in database
            const response = await axios.post(`${API_URL}/${role !== "PATIENT" ? "hospitals" : "users"}/location`, {
                id: userId,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
            });

            console.log("Location updated:", response.data);

            // Refresh user data to show updated location
            window.location.reload();

            setIsUpdatingLocation(false);
        } catch (error) {
            console.error("Error updating location:", error);
            setIsUpdatingLocation(false);
            alert("Failed to update location. Please check your browser permissions and try again.");
        }
    };

    // Handle date change and fetch appointments for the selected date
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        fetchAppointmentsByDate(newDate);
    };

    const handleUnavailableDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
        setSaved(false);
        setError('');
    }

    // Initial loading of appointments for current date when tab changes to appointments
    useEffect(() => {
        if (activeTab === "appointments") {
            fetchAppointmentsByDate(selectedDate);
        }
    }, [activeTab]);

    // Handle tab change with special logic for incomplete steps
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    if (!user) return <LoadingSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-white p-4 rounded-full shadow-md">
                                <FontAwesomeIcon icon={faUser} className="text-teal-500 text-3xl" />
                            </div>
                            <div className="ml-6">
                                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                <p className="text-teal-100">
                                    <span className="bg-teal-700 rounded-full px-3 py-1 text-sm font-semibold">
                                        {user.role}
                                    </span>
                                </p>
                            </div>
                        </div>
                        {role !== "PATIENT" && (
                            <div
                                className={`px-4 py-2 rounded-md transition duration-300 flex items-center gap-2 ${user.isApproved
                                    ? "bg-green-50 text-green-600"
                                    : "bg-amber-50 text-amber-600"
                                    }`}
                            >
                                {user.isApproved ? (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-5 h-5"
                                        >
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                            <path d="m9 12 2 2 4-4" />
                                        </svg>
                                        Verified
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-5 h-5"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12" y2="16" />
                                        </svg>
                                        Not Verified
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Completion Alert - Only for non-patients */}
                {role !== "PATIENT" && profileCompletionSteps.length > 0 && (
                    <div className={`mx-6 mt-6 ${getCompletedStepsCount() === profileCompletionSteps.length ? "bg-green-50" : "bg-amber-50"} border-l-4 ${getCompletedStepsCount() === profileCompletionSteps.length ? "border-green-500" : "border-amber-500"} p-4 rounded-md`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <FontAwesomeIcon
                                    icon={getCompletedStepsCount() === profileCompletionSteps.length ? faCheckCircle : faClipboardList}
                                    className={`${getCompletedStepsCount() === profileCompletionSteps.length ? "text-green-500" : "text-amber-500"} text-xl mr-3`}
                                />
                                <div>
                                    <h3 className={`font-semibold ${getCompletedStepsCount() === profileCompletionSteps.length ? "text-green-700" : "text-amber-700"}`}>
                                        {getCompletedStepsCount() === profileCompletionSteps.length ?
                                            "Profile complete!" :
                                            "Complete your profile"}
                                    </h3>
                                    <p className={`${getCompletedStepsCount() === profileCompletionSteps.length ? "text-green-600" : "text-amber-600"} text-sm`}>
                                        {getCompletedStepsCount()} of {profileCompletionSteps.length} tasks completed
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-36 bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className={`h-2.5 rounded-full ${getCompletedStepsCount() === profileCompletionSteps.length ? "bg-green-500" : "bg-amber-500"}`}
                                        style={{ width: `${(getCompletedStepsCount() / profileCompletionSteps.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Incomplete steps */}
                        {getCompletedStepsCount() < profileCompletionSteps.length && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {profileCompletionSteps.filter(step => !step.isCompleted).map(step => (
                                    <div key={step.id} className="flex items-start">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 mt-1 mr-2" />
                                        <div>
                                            <p className="text-amber-700 font-medium">{step.title}</p>
                                            <p className="text-amber-600 text-sm">{step.description}</p>
                                            <button
                                                className="text-amber-700 font-medium text-sm mt-1 underline hover:text-amber-800"
                                                onClick={() => handleTabChange(step.tabId)}
                                            >
                                                Complete now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="bg-gray-100 px-6 py-4 mt-4">
                    <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "profile" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("appointments")}
                            className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "appointments" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                        >
                            Appointments
                        </button>
                        <button
                            onClick={() => setActiveTab("location")}
                            className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "location" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                        >
                            {!user.currLocation && role !== "PATIENT" && <FontAwesomeIcon icon={faWarning} className="text-amber-500 mr-2" />}
                            Location
                        </button>
                        {role === "DOCTOR" && (
                            <button
                                onClick={() => setActiveTab("specialties")}
                                className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "specialties" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                            >
                                {(!user.specialities || user.specialities.length === 0) && <FontAwesomeIcon icon={faWarning} className="text-amber-500 mr-2" />}
                                Specialties
                            </button>
                        )}
                        {role !== "PATIENT" && (
                            <button
                                onClick={() => setActiveTab("timings")}
                                className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "timings" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                            >
                                {(!user.timings || JSON.stringify(user.timings) === "{}") && <FontAwesomeIcon icon={faWarning} className="text-amber-500 mr-2" />}
                                Availability
                            </button>
                        )}
                        {role !== "PATIENT" && (
                            <button
                                onClick={() => setActiveTab("documents")}
                                className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "documents" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                            >
                                {!user.isApproved && <FontAwesomeIcon icon={faWarning} className="text-amber-500 mr-2" />}
                                Verification
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {activeTab === "profile" && (
                        <>
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-start">
                                            <FontAwesomeIcon icon={faUser} className="mt-1 text-teal-500 w-5" />
                                            <div className="ml-4">
                                                <h3 className="text-gray-500 text-sm">Full Name</h3>
                                                <p className="text-gray-700 font-medium">{user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <FontAwesomeIcon icon={faEnvelope} className="mt-1 text-teal-500 w-5" />
                                            <div className="ml-4">
                                                <h3 className="text-gray-500 text-sm">Email Address</h3>
                                                <p className="text-gray-700 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <FontAwesomeIcon icon={faPhone} className="mt-1 text-teal-500 w-5" />
                                            <div className="ml-4">
                                                <h3 className="text-gray-500 text-sm">Phone Number</h3>
                                                <p className="text-gray-700 font-medium">{user.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-start">
                                            <FontAwesomeIcon icon={faClock} className="mt-1 text-teal-500 w-5" />
                                            <div className="ml-4">
                                                <h3 className="text-gray-500 text-sm">Account Created</h3>
                                                <p className="text-gray-700 font-medium">{formatDate(user.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <FontAwesomeIcon icon={faClock} className="mt-1 text-teal-500 w-5" />
                                            <div className="ml-4">
                                                <h3 className="text-gray-500 text-sm">Last Updated</h3>
                                                <p className="text-gray-700 font-medium">{formatDate(user.updatedAt)}</p>
                                            </div>
                                        </div>
                                        {/* {role !== "PATIENT" && <div className="flex items-start">
                                            <FontAwesomeIcon icon={faStar} className="mt-1 text-teal-500 w-5" />
                                            <div className="ml-4">
                                                <h3 className="text-gray-500 text-sm">Ratings</h3>
                                                <p className="text-gray-700 font-medium">
                                                    {user.ratings && user.ratings.length > 0 ? `${user.ratings.length} ratings` : "No ratings yet"}
                                                </p>
                                            </div>
                                        </div>} */}
                                        {role !== "PATIENT" && <div className="flex items-start">
                                            <FontAwesomeIcon icon={faHospital} className="mt-1 text-teal-500 w-5" />
                                            <div className="ml-4">
                                                <h3 className="text-gray-500 text-sm">Available Date for Appointment</h3>
                                                <p className="text-gray-700 font-medium">{new Date(user.freeSlotDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>}

                                        {role !== "PATIENT" && <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
                                            <div className="flex items-start mb-4">
                                                <div className="flex-shrink-0 text-teal-500 mt-1">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-medium text-gray-800">Set Available Date for Appointment</h3>
                                                    <p className="text-sm text-gray-500">Enter your next available date in DD/MM/YYYY format</p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex flex-col md:flex-row gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="DD/MM/YYYY"
                                                        className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                        value={date}
                                                        onChange={handleUnavailableDateChange}
                                                    />
                                                    <button
                                                        onClick={handleSave}
                                                        className="px-6 py-2 text-white bg-teal-500 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                                    >
                                                        Save
                                                    </button>
                                                </div>

                                                {error && (
                                                    <p className="mt-2 text-sm text-red-600">{error}</p>
                                                )}

                                                {saved && (
                                                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                                                        <p className="text-sm text-green-700 flex items-center">
                                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                            </svg>
                                                            Available date saved successfully
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "appointments" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>

                            {/* Date selector */}
                            {role !== "PATIENT" && <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-teal-500 mr-2" />
                                        <span className="text-gray-700">Select Date:</span>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-auto"
                                        />
                                    </div>
                                    <button
                                        onClick={() => fetchAppointmentsByDate(selectedDate)}
                                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition flex items-center justify-center"
                                    >
                                        <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                        Find Appointments
                                    </button>
                                </div>
                            </div>}

                            {isLoadingAppointments ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : user.appointments && user.appointments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                                <th className="py-3 px-6 text-left">ID</th>
                                                {role === "PATIENT" && <th className="py-3 px-6 text-left">Doctor</th>}
                                                {role === "DOCTOR" && <th className="py-3 px-6 text-left">Patient</th>}
                                                <th className="py-3 px-6 text-left">Date</th>
                                                <th className="py-3 px-6 text-right">Price</th>
                                                <th className="py-3 px-6 text-left">Status</th>
                                                <th className="py-3 px-6 text-right">View Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-600 text-sm">
                                            {user.appointments && user.appointments.map((appointment) => (
                                                <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="py-3 px-6 text-left">
                                                        <span className="font-medium">{appointment.id.substring(0, 8)}...</span>
                                                    </td>
                                                    {role === "PATIENT" && <td className="py-3 px-6 text-left">
                                                        <Link to={"/hospital/" + appointment.Hospital.parentId} className="flex items-center">
                                                            <FontAwesomeIcon icon={faHospital} className="mr-2 text-teal-500" />
                                                            {appointment.Hospital.name}
                                                        </Link>
                                                    </td>}
                                                    {role === "DOCTOR" && <td className="py-3 px-6 text-left">
                                                        <div className="flex items-center">
                                                            <FontAwesomeIcon icon={faUser} className="mr-2 text-teal-500" />
                                                            {appointment.User.name}
                                                        </div>
                                                    </td>}
                                                    <td className="py-3 px-6 text-left">
                                                        <div className="flex items-center">
                                                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-teal-500" />
                                                            {new Date(appointment.date).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <span className="bg-teal-100 text-teal-600 py-1 px-3 rounded-full text-xs">
                                                            ${appointment.paidPrice}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6 text-left">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                            appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                                                appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                                    appointment.status === 'REFUND_IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                                                                        appointment.status === 'REFUNDED' ? 'bg-indigo-100 text-indigo-700' :
                                                                            appointment.status === 'EXPIRED' ? 'bg-red-100 text-red-600' :
                                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {appointment.status}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-6 text-right">
                                                        <Link to={"/appointments/" + appointment.id} className="flex items-center justify-end">
                                                            <FontAwesomeIcon icon={faArrowCircleUp} className="mr-2 text-teal-500" />
                                                            Go to Appointment
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300 text-5xl mb-3" />
                                    <p className="text-gray-500">No appointments found for {new Date(selectedDate).toLocaleDateString()}.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "location" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Your Location</h2>
                            <div className="bg-gray-100 p-6 rounded-lg">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-start">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-teal-500 w-5" />
                                        <div className="ml-4">
                                            <h3 className="text-gray-700 font-medium">Your Saved Location</h3>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleUpdateLocation}
                                        disabled={isUpdatingLocation}
                                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition duration-300 flex items-center"
                                    >
                                        <FontAwesomeIcon icon={faLocationArrow} className="mr-2" />
                                        {isUpdatingLocation ? "Updating..." : "Update with Current Location"}
                                    </button>
                                </div>
                                <div className="h-100 w-full rounded-lg overflow-hidden">
                                    {user.currLocation && user.currLocation.latitude && user.currLocation.longitude ? (
                                        <>
                                            <ReverseGeocoder
                                                latitude={Number(user.currLocation.latitude)}
                                                longitude={Number(user.currLocation.longitude)}
                                            />
                                            <GoogleMap
                                                mapId={user.id}
                                                latitude={Number(user.currLocation.latitude)}
                                                longitude={Number(user.currLocation.longitude)}
                                                name={user.name}
                                            />
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-300 text-5xl mb-3" />
                                            <p className="text-gray-500">Location not available. Click "Update Location" to set your current location.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctor Specialties Tab */}
                    {activeTab === "specialties" && role === "DOCTOR" && (
                        <DoctorSpecialtiesTab userId={userId} />
                    )}

                    {/* Provider Timings Tab */}
                    {activeTab === "timings" && role !== "PATIENT" && (
                        <ProviderTimingsTab userId={userId} />
                    )}

                    {/* Documents Tab */}
                    {activeTab === "documents" && role !== "PATIENT" && (
                        <DocumentVerificationTab userId={userId} role={role} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;