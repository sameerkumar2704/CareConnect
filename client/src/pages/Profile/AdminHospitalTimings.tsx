import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/contants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCalendarWeek,
    faBan,
    faCalendarTimes,
    faHospital,
    faBuilding,
    faSearch,
    faFilter
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../../components/LoadingSpinner";

// Data structure for hospital timing
interface DayTiming {
    start: string;
    end: string;
}

interface TimingsData {
    mon?: DayTiming | null;
    tue?: DayTiming | null;
    wed?: DayTiming | null;
    thu?: DayTiming | null;
    fri?: DayTiming | null;
    sat?: DayTiming | null;
    sun?: DayTiming | null;
    [key: string]: DayTiming | null | undefined;
}

interface Hospital {
    id: string;
    name: string;
    address: string;
    timings: TimingsData;
}

// Map for converting between full day names and short codes
const reverseDayMappings: { [key: string]: string } = {
    "mon": "Monday",
    "tue": "Tuesday",
    "wed": "Wednesday",
    "thu": "Thursday",
    "fri": "Friday",
    "sat": "Saturday",
    "sun": "Sunday"
};

const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const AdminHospitalTimings = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDay, setFilterDay] = useState<string>("");
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/hospitals`);
            setHospitals(response.data);
            if (response.data.length > 0) {
                setSelectedHospital(response.data[0]);
            }
        } catch (error) {
            console.error("Error fetching hospitals:", error);
            setErrorMessage("Failed to load hospital data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timeString: string) => {
        // Convert 24h time format to 12h format with AM/PM
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    // Sort days for display
    const getSortedTimings = (timings: TimingsData) => {
        const orderedDayCodes = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        return orderedDayCodes
            .filter(code => timings[code] !== undefined)
            .map(code => ({
                dayCode: code,
                timing: timings[code]
            }));
    };

    // Filter hospitals based on search term and day filter
    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.address.toLowerCase().includes(searchTerm.toLowerCase());

        if (!filterDay || !matchesSearch) return matchesSearch;

        // Check if hospital has timings for the selected day
        const dayCode = filterDay.toLowerCase().slice(0, 3);
        return hospital.timings && hospital.timings[dayCode] !== undefined;
    });

    // Get days categorized by status for a hospital
    const getDaysByStatus = (timings: TimingsData) => {
        const unavailableDays: string[] = [];
        const availableDays: string[] = [];
        const unsetDays: string[] = [];

        daysOfWeek.forEach(day => {
            const dayCode = day.toLowerCase().slice(0, 3);
            const status = timings[dayCode];

            if (status === undefined) {
                unsetDays.push(day);
            } else if (status === null) {
                unavailableDays.push(day);
            } else {
                availableDays.push(day);
            }
        });

        return { unavailableDays, availableDays, unsetDays };
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
                <FontAwesomeIcon icon={faHospital} className="text-teal-600 text-2xl mr-3" />
                <h1 className="text-2xl font-bold text-gray-800">Hospital Timings Administration</h1>
            </div>

            {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                    {errorMessage}
                </div>
            )}

            {/* Search and Filter Controls */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="flex-1 mb-4 md:mb-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search hospitals by name or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>
                    <div className="md:w-64">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                            </div>
                            <select
                                value={filterDay}
                                onChange={(e) => setFilterDay(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                            >
                                <option value="">Filter by day availability</option>
                                {daysOfWeek.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Hospitals List */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-teal-600 text-white px-4 py-3">
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                                <h2 className="font-semibold">Hospitals</h2>
                            </div>
                        </div>
                        <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
                            {filteredHospitals.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {filteredHospitals.map((hospital) => (
                                        <li key={hospital.id}>
                                            <button
                                                onClick={() => setSelectedHospital(hospital)}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition duration-150 ${selectedHospital?.id === hospital.id ? 'bg-teal-50 border-l-4 border-teal-500' : ''}`}
                                            >
                                                <h3 className="font-medium text-gray-800">{hospital.name}</h3>
                                                <p className="text-sm text-gray-500 truncate">{hospital.address}</p>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {getDaysByStatus(hospital.timings).availableDays.length > 0 && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            {getDaysByStatus(hospital.timings).availableDays.length} available days
                                                        </span>
                                                    )}
                                                    {getDaysByStatus(hospital.timings).unavailableDays.length > 0 && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                            {getDaysByStatus(hospital.timings).unavailableDays.length} unavailable days
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-12">
                                    <FontAwesomeIcon icon={faBuilding} className="text-gray-300 text-5xl mb-3" />
                                    <p className="text-gray-500">No hospitals found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Selected Hospital Timings */}
                <div className="md:col-span-2">
                    {selectedHospital ? (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4">
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faCalendarWeek} className="text-white mr-3" />
                                    <h2 className="font-semibold text-white">{selectedHospital.name} - Weekly Schedule</h2>
                                </div>
                                <p className="text-white text-opacity-80 text-sm mt-1">{selectedHospital.address}</p>
                            </div>

                            {Object.keys(selectedHospital.timings || {}).length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {getSortedTimings(selectedHospital.timings).map(({ dayCode, timing }) => (
                                        <div key={dayCode} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition duration-150">
                                            <div className="flex items-center">
                                                {timing === null ? (
                                                    <div className="bg-red-100 text-red-600 rounded-full p-3 mr-4">
                                                        <FontAwesomeIcon icon={faCalendarTimes} />
                                                    </div>
                                                ) : (
                                                    <div className="bg-teal-100 text-teal-600 rounded-full p-3 mr-4">
                                                        <FontAwesomeIcon icon={faCalendarWeek} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-800">{reverseDayMappings[dayCode]}</p>
                                                    {timing === null ? (
                                                        <p className="text-red-600 text-sm font-medium">
                                                            <FontAwesomeIcon icon={faBan} className="mr-1" />
                                                            Not Available
                                                        </p>
                                                    ) : (
                                                        <p className="text-teal-600 text-sm">
                                                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                            {timing && `${formatTime(timing.start)} - ${formatTime(timing.end)}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center">
                                    <div className="bg-gray-100 text-gray-400 rounded-full p-4 inline-block mb-4">
                                        <FontAwesomeIcon icon={faClock} className="text-4xl" />
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Schedule Set</h4>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        This hospital hasn't set any availability or unavailability timings yet.
                                    </p>
                                </div>
                            )}

                            {/* Summary Section */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <h3 className="font-medium text-gray-700 mb-2">Availability Summary</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <div className="flex items-center">
                                            <div className="bg-green-100 rounded-full p-2 mr-3">
                                                <FontAwesomeIcon icon={faCalendarWeek} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-green-600 font-medium">Available Days</p>
                                                <p className="text-xl font-bold text-green-700">
                                                    {getDaysByStatus(selectedHospital.timings).availableDays.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                        <div className="flex items-center">
                                            <div className="bg-red-100 rounded-full p-2 mr-3">
                                                <FontAwesomeIcon icon={faBan} className="text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-red-600 font-medium">Unavailable Days</p>
                                                <p className="text-xl font-bold text-red-700">
                                                    {getDaysByStatus(selectedHospital.timings).unavailableDays.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                                        <div className="flex items-center">
                                            <div className="bg-gray-200 rounded-full p-2 mr-3">
                                                <FontAwesomeIcon icon={faCalendarTimes} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 font-medium">Unset Days</p>
                                                <p className="text-xl font-bold text-gray-700">
                                                    {getDaysByStatus(selectedHospital.timings).unsetDays.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <FontAwesomeIcon icon={faHospital} className="text-gray-300 text-5xl mb-3" />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No Hospital Selected</h3>
                            <p className="text-gray-500">Please select a hospital from the list to view its schedule.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHospitalTimings;