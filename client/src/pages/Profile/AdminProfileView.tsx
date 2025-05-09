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
    faStar,
    faArrowCircleUp,
    faSearch,
    faCheck,
    faXmark,
    faCheckCircle,
    faClipboardList,
    faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import UserLocationMap from "./UserLocationMap";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminDocumentVerificationTab from "./AdminDocumentVerification";

interface Appointment {
    id: string;
    hospitalId: string;
    userId: string;
    date: string;
    Hospital: Hospital;
    User: User;
    paidPrice: number;
    createdAt: string;
    status: string;
    updatedAt: string;
}

interface Location {
    id: string;
    longitude: string;
    latitude: string;
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
    locationId: string;
    timings: JSON;
    currLocation: Location;
    appointments: Appointment[];
    ratings: any[];
    approved: boolean;
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

const AdminProfileView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [activeTab, setActiveTab] = useState<string>("profile");
    const [role, setRole] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(false);
    const [profileCompletionSteps, setProfileCompletionSteps] = useState<ProfileCompletionStep[]>([]);
    const [isUpdatingApproval, setIsUpdatingApproval] = useState<boolean>(false);

    const [searchParams] = useSearchParams();
    const userRole = searchParams.get("role"); // "admin" if URL = /profile/123?role=admin

    useEffect(() => {
        fetchUser();
    }, [id]);

    useEffect(() => {
        if (user && role !== "PATIENT") {
            // Set up profile completion steps based on user data
            const steps: ProfileCompletionStep[] = [
                {
                    id: "timings",
                    title: "Set availability",
                    description: "Define working hours to receive appointments",
                    isCompleted: user.timings && JSON.stringify(user.timings) !== "{}",
                    tabId: "timings"
                },
                {
                    id: "location",
                    title: "Update location",
                    description: "Set location to help patients find",
                    isCompleted: !!user.currLocation,
                    tabId: "location"
                },
                {
                    id: "documents",
                    title: "Upload verification documents",
                    description: "Upload credentials to get verified",
                    isCompleted: user.approved,
                    tabId: "documents"
                }
            ];

            // Add specialties step only for doctors
            if (role === "DOCTOR") {
                steps.push({
                    id: "specialties",
                    title: "Add specialties",
                    description: "List areas of expertise",
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
            // First, determine the role of the user

            setRole(userRole ? userRole : "PATIENT");

            // Then fetch the full user data with the correct endpoint
            const endpoint = userRole === "PATIENT" ? "users" : "hospitals";
            const res = await axios.get(`${API_URL}/${endpoint}/${id}`);
            setUser(res.data);
            setRole(res.data.role);
            console.log("User data:", res.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to load user data");
            setUser(null);
        }
    };

    const fetchAppointmentsByDate = async (date: string) => {
        setIsLoadingAppointments(true);
        try {
            const response = await axios.get(`${API_URL}/appointments/byDate`, {
                params: {
                    userId: id,
                    role,
                    date
                }
            });

            setUser(prevUser => prevUser ? {
                ...prevUser,
                appointments: response.data
            } : null);

        } catch (error) {
            console.error("Error fetching appointments by date:", error);
            toast.error("Failed to load appointments");
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    // Handle date change and fetch appointments for the selected date
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        fetchAppointmentsByDate(newDate);
    };

    // Initial loading of appointments for current date when tab changes to appointments
    useEffect(() => {
        if (activeTab === "appointments") {
            fetchAppointmentsByDate(selectedDate);
        }
    }, [activeTab]);

    // Handle approval status update
    const handleUpdateApproval = async (approve: boolean) => {
        setIsUpdatingApproval(true);
        try {
            const endpoint = role === "PATIENT" ? "users" : "hospitals";
            const status = approve ? "approve" : "reject";
            const response = await axios.put(`${API_URL}/${endpoint}/${status}/${id}`);

            console.log("Approval status updated:", response.data);

            // Refresh user data to show updated approval status
            await fetchUser();
            toast.success(`User ${approve ? 'approved' : 'unapproved'} successfully`);
        } catch (error) {
            console.error("Error updating approval status:", error);
            toast.error("Failed to update approval status");
        } finally {
            setIsUpdatingApproval(false);
        }
    };

    if (!user) return <LoadingSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
                >
                    ← Back
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-white p-4 rounded-full shadow-md">
                                <FontAwesomeIcon icon={faUser} className="text-blue-600 text-3xl" />
                            </div>
                            <div className="ml-6">
                                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                <p className="text-blue-100">
                                    <span className="bg-blue-800 rounded-full px-3 py-1 text-sm font-semibold">
                                        {user.role}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div
                                className={`px-4 py-2 rounded-md transition duration-300 flex items-center gap-2 ${user.approved
                                    ? "bg-green-50 text-green-600"
                                    : "bg-amber-50 text-amber-600"
                                    }`}
                            >
                                {user.approved ? (
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

                            {/* Admin Approval Buttons */}
                            {role !== "PATIENT" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateApproval(true)}
                                        disabled={isUpdatingApproval || user.approved}
                                        className={`px-4 py-2 rounded-md transition duration-300 flex items-center gap-2 ${user.approved
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-green-500 text-white hover:bg-green-600"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleUpdateApproval(false)}
                                        disabled={isUpdatingApproval || !user.approved}
                                        className={`px-4 py-2 rounded-md transition duration-300 flex items-center gap-2 ${!user.approved
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-red-500 text-white hover:bg-red-600"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                        Unapprove
                                    </button>
                                </div>
                            )}
                        </div>
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
                                            "Profile completion status"}
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
                            className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("appointments")}
                            className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "appointments" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                        >
                            Appointments
                        </button>
                        <button
                            onClick={() => setActiveTab("location")}
                            className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "location" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                        >
                            Location
                        </button>
                        {role !== "PATIENT" && (
                            <button
                                onClick={() => setActiveTab("specialties")}
                                className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "specialties" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                            >
                                Specialties
                            </button>
                        )}
                        {role !== "PATIENT" && (
                            <button
                                onClick={() => setActiveTab("documents")}
                                className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === "documents" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}
                            >
                                Documents
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {activeTab === "profile" && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <FontAwesomeIcon icon={faUser} className="mt-1 text-blue-600 w-5" />
                                    <div className="ml-4">
                                        <h3 className="text-gray-500 text-sm">Full Name</h3>
                                        <p className="text-gray-700 font-medium">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <FontAwesomeIcon icon={faEnvelope} className="mt-1 text-blue-600 w-5" />
                                    <div className="ml-4">
                                        <h3 className="text-gray-500 text-sm">Email Address</h3>
                                        <p className="text-gray-700 font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <FontAwesomeIcon icon={faPhone} className="mt-1 text-blue-600 w-5" />
                                    <div className="ml-4">
                                        <h3 className="text-gray-500 text-sm">Phone Number</h3>
                                        <p className="text-gray-700 font-medium">{user.phone}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <FontAwesomeIcon icon={faClock} className="mt-1 text-blue-600 w-5" />
                                    <div className="ml-4">
                                        <h3 className="text-gray-500 text-sm">Account Created</h3>
                                        <p className="text-gray-700 font-medium">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <FontAwesomeIcon icon={faClock} className="mt-1 text-blue-600 w-5" />
                                    <div className="ml-4">
                                        <h3 className="text-gray-500 text-sm">Last Updated</h3>
                                        <p className="text-gray-700 font-medium">{formatDate(user.updatedAt)}</p>
                                    </div>
                                </div>
                                {role !== "PATIENT" && (
                                    <div className="flex items-start">
                                        <FontAwesomeIcon icon={faStar} className="mt-1 text-blue-600 w-5" />
                                        <div className="ml-4">
                                            <h3 className="text-gray-500 text-sm">Ratings</h3>
                                            <p className="text-gray-700 font-medium">
                                                {user.ratings && user.ratings.length > 0 ? `${user.ratings.length} ratings` : "No ratings yet"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "appointments" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">User Appointments</h2>

                            {/* Date selector */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 mr-2" />
                                        <span className="text-gray-700">Select Date:</span>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 w-full md:w-auto"
                                        />
                                    </div>
                                    <button
                                        onClick={() => fetchAppointmentsByDate(selectedDate)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                                    >
                                        <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                        Find Appointments
                                    </button>
                                </div>
                            </div>

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
                                                {role === "PATIENT" && <th className="py-3 px-6 text-left">Provider</th>}
                                                {role !== "PATIENT" && <th className="py-3 px-6 text-left">Patient</th>}
                                                <th className="py-3 px-6 text-left">Date</th>
                                                <th className="py-3 px-6 text-right">Price</th>
                                                <th className="py-3 px-6 text-left">Status</th>
                                                <th className="py-3 px-6 text-right">View Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-600 text-sm">
                                            {user.appointments.map((appointment) => (
                                                <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="py-3 px-6 text-left">
                                                        <span className="font-medium">{appointment.id.substring(0, 8)}...</span>
                                                    </td>
                                                    {role === "PATIENT" && (
                                                        <td className="py-3 px-6 text-left">
                                                            <Link to={`/hospital/${appointment.Hospital.parentId}`} className="flex items-center">
                                                                <FontAwesomeIcon icon={faHospital} className="mr-2 text-blue-600" />
                                                                {appointment.Hospital.name}
                                                            </Link>
                                                        </td>
                                                    )}
                                                    {role !== "PATIENT" && (
                                                        <td className="py-3 px-6 text-left">
                                                            <Link to={`/profile/${appointment.User.id}`} className="flex items-center">
                                                                <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                                                                {appointment.User.name}
                                                            </Link>
                                                        </td>
                                                    )}
                                                    <td className="py-3 px-6 text-left">
                                                        <div className="flex items-center">
                                                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-blue-600" />
                                                            {new Date(appointment.date).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <span className="bg-blue-100 text-blue-600 py-1 px-3 rounded-full text-xs">
                                                            ${appointment.paidPrice}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6 text-left">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                            appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {appointment.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <Link to={`/appointments/${appointment.id}`} className="flex items-center justify-end">
                                                            <FontAwesomeIcon icon={faArrowCircleUp} className="mr-2 text-blue-600" />
                                                            View Details
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
                            <h2 className="text-xl font-semibold mb-4">User Location</h2>
                            <div className="bg-gray-100 p-6 rounded-lg">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-start">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-blue-600 w-5" />
                                        <div className="ml-4">
                                            <h3 className="text-gray-700 font-medium">Saved Location</h3>
                                            <p className="text-gray-600">ID: {user.currLocation ? user.currLocation.id : "Not set"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {user.currLocation ? (
                                        <UserLocationMap
                                            latitude={user.currLocation.latitude}
                                            longitude={user.currLocation.longitude}
                                            name={user.name}
                                        />
                                    ) : (
                                        <div className="text-center py-8">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-300 text-5xl mb-3" />
                                            <p className="text-gray-500">Location not available. User has not set their location yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Specialties Tab - Read Only */}
                    {activeTab === "specialties" && role === "DOCTOR" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Doctor Specialties</h2>

                            {user.specialities && user.specialities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.specialities.map(specialty => (
                                        <div key={specialty.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h3 className="font-medium text-lg text-gray-800">{specialty.name}</h3>
                                            <p className="text-gray-600 mt-2">{specialty.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No specialties have been added yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "documents" && role !== "PATIENT" && id !== undefined && (
                        <AdminDocumentVerificationTab userId={id} role={role} />
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminProfileView;