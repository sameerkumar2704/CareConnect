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
    faEdit
} from "@fortawesome/free-solid-svg-icons";
import UserLocationMap from "./UserLocationMap";
import { Link } from "react-router-dom";

interface Appointment {
    id: string;
    hospitalId: string;
    userId: string;
    date: string;
    expiration: string;
    Hospital: Hospital;
    paidPrice: number;
    createdAt: string;
    updatedAt: string;
}

interface Location {
    id: string;
    longitude: string;
    latitude: string;
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
    currLocation: Location;
    appointments: Appointment[];
    ratings: any[];
}

const UserProfile = ({ userId }: { userId: string }) => {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [activeTab, setActiveTab] = useState<string>("profile");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${API_URL}/users/${userId}`);
                setUser(res.data);
                console.log(res.data);
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

        fetchUser();
    }, [userId]);

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
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-white text-teal-500 px-4 py-2 rounded-md hover:bg-teal-50 transition duration-300 flex items-center"
                        >
                            <FontAwesomeIcon icon={faEdit} className="mr-2" />
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-gray-100 px-6 py-4">
                    <div className="flex space-x-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`py-3 px-4 font-medium ${activeTab === "profile" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("appointments")}
                            className={`py-3 px-4 font-medium ${activeTab === "appointments" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                        >
                            Appointments
                        </button>
                        <button
                            onClick={() => setActiveTab("location")}
                            className={`py-3 px-4 font-medium ${activeTab === "location" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500 hover:text-teal-500"}`}
                        >
                            Location
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {activeTab === "profile" && (
                        <>
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
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
                                        <div className="flex items-start">
                                            <FontAwesomeIcon icon={faStar} className="mt-1 text-teal-500 w-5" />
                                            <div className="ml-4">
                                                <h3 className="text-gray-500 text-sm">Ratings</h3>
                                                <p className="text-gray-700 font-medium">
                                                    {user.ratings.length > 0 ? `${user.ratings.length} ratings` : "No ratings yet"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "appointments" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
                            {user.appointments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                                <th className="py-3 px-6 text-left">ID</th>
                                                <th className="py-3 px-6 text-left">Doctor</th>
                                                <th className="py-3 px-6 text-left">Date</th>
                                                <th className="py-3 px-6 text-left">Expiration</th>
                                                <th className="py-3 px-6 text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-600 text-sm">
                                            {user.appointments.map((appointment) => (
                                                <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="py-3 px-6 text-left">
                                                        <span className="font-medium">{appointment.id.substring(0, 8)}...</span>
                                                    </td>
                                                    <td className="py-3 px-6 text-left">
                                                        <Link to={"/hospital/" + appointment.Hospital.parentId} className="flex items-center">
                                                            <FontAwesomeIcon icon={faHospital} className="mr-2 text-teal-500" />
                                                            {appointment.Hospital.name}...
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-6 text-left">
                                                        <div className="flex items-center">
                                                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-teal-500" />
                                                            {new Date(appointment.date).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 text-left">
                                                        {new Date(appointment.expiration).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <span className="bg-teal-100 text-teal-600 py-1 px-3 rounded-full text-xs">
                                                            ${appointment.paidPrice}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300 text-5xl mb-3" />
                                    <p className="text-gray-500">You don't have any appointments yet.</p>
                                    <button className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition">
                                        Book an Appointment
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "location" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Your Location</h2>
                            <div className="bg-gray-100 p-6 rounded-lg">
                                <div className="flex items-start mb-4">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 text-teal-500 w-5" />
                                    <div className="ml-4">
                                        <h3 className="text-gray-700 font-medium">Current Location</h3>
                                        <p className="text-gray-600">ID: {user.currLocation.id}</p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Current Location</h2>
                                    {user.currLocation ? (
                                        <UserLocationMap
                                            latitude={user.currLocation.latitude}
                                            longitude={user.currLocation.longitude}
                                            name={user.name}
                                        />
                                    ) : (
                                        <p className="text-gray-500">Location not available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;