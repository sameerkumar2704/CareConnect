import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/contants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faSave,
    faTrash,
    faCalendarWeek,
    faExclamationCircle,
    faBan,
    faCalendarPlus,
    faCalendarTimes
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../../components/LoadingSpinner";

// New interface for the updated data structure
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

interface ProviderTimingsTabProps {
    userId: string;
}

// Map for converting between full day names and short codes
const dayMappings = {
    "Monday": "mon",
    "Tuesday": "tue",
    "Wednesday": "wed",
    "Thursday": "thu",
    "Friday": "fri",
    "Saturday": "sat",
    "Sunday": "sun"
};

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
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const ProviderTimingsTab = ({ userId }: ProviderTimingsTabProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [providerTimings, setProviderTimings] = useState<TimingsData>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Form state
    const [formData, setFormData] = useState({
        startTime: "09:00",
        endTime: "17:00",
        selectedDays: [] as string[],
        availabilityMode: "available" // "available" or "unavailable"
    });

    useEffect(() => {
        fetchTimings();
    }, [userId]);

    const fetchTimings = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/hospitals/${userId}/timings`);
            console.log("Provider Timings", response.data);
            setProviderTimings(response.data || {});
        } catch (error) {
            console.error("Error fetching provider timings:", error);
            setErrorMessage("Failed to load your timings. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleDaySelection = (day: string) => {

        // If day is already selected, remove it; otherwise add it
        if (formData.selectedDays.includes(day)) {
            setFormData({
                ...formData,
                selectedDays: formData.selectedDays.filter(d => d !== day)
            });
        } else {
            setFormData({
                ...formData,
                selectedDays: [...formData.selectedDays, day]
            });
        }
    };

    const validateTimings = () => {
        if (formData.selectedDays.length === 0) {
            setErrorMessage("Please select at least one day of the week.");
            return false;
        }

        if (formData.startTime >= formData.endTime) {
            setErrorMessage("End time must be later than start time.");
            return false;
        }

        return true;
    };

    const handleSaveTimings = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateTimings()) {
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

        setIsSaving(true);

        try {
            // Create new timings object with the updated days
            const updatedTimings = { ...providerTimings };

            formData.selectedDays.forEach(day => {
                const dayCode = dayMappings[day as keyof typeof dayMappings];

                if (formData.availabilityMode === "available") {
                    updatedTimings[dayCode] = {
                        start: formData.startTime,
                        end: formData.endTime
                    };
                } else {
                    // Mark as explicitly unavailable
                    updatedTimings[dayCode] = null;
                }
            });

            // Send the entire timings object to be updated
            await axios.put(`${API_URL}/hospitals/${userId}/timings`, {
                timings: updatedTimings
            });

            // Update state with the new timings
            setProviderTimings(updatedTimings);

            // Reset selected days
            setFormData({
                ...formData,
                selectedDays: []
            });

            setSuccessMessage(formData.availabilityMode === "available"
                ? "Availability timings added successfully!"
                : "Unavailability marked successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error saving timings:", error);
            setErrorMessage("Failed to save timings. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTiming = async (dayCode: string) => {
        setIsSaving(true);
        try {
            // Create new timings object without the deleted day
            const updatedTimings = { ...providerTimings };
            delete updatedTimings[dayCode];

            // Send the entire updated timings object
            const res = await axios.put(`${API_URL}/hospitals/${userId}/timings`, {
                timings: updatedTimings
            });

            if (res.status !== 200) {
                throw new Error(res.data);
            }

            // Update state with the new timings
            setProviderTimings(updatedTimings);

            setSuccessMessage("Timing removed successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error removing timing:", error);
            setErrorMessage("Failed to remove timing. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        } finally {
            setIsSaving(false);
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

    // Get days categorized by status
    const getDaysByStatus = () => {
        const unavailableDays: string[] = [];
        const availableDays: string[] = [];
        const unsetDays: string[] = [];

        daysOfWeek.forEach(day => {
            const dayCode = dayMappings[day as keyof typeof dayMappings];
            const status = providerTimings[dayCode];

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

    const { unsetDays } = getDaysByStatus();

    // Sort days for display
    const getSortedTimings = () => {
        const orderedDayCodes = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        return orderedDayCodes
            .filter(code => providerTimings[code] !== undefined)
            .map(code => ({
                dayCode: code,
                timing: providerTimings[code]
            }));
    };

    const sortedTimings = getSortedTimings();

    if (isLoading) return <LoadingSpinner />;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Your Availability Schedule</h2>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                    {errorMessage}
                </div>
            )}

            {/* Add new timing schedule */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-8 rounded-xl shadow-lg mb-8 border border-teal-100">
                <div className="flex items-center mb-6">
                    <div className="bg-teal-500 rounded-full p-3 mr-4 text-white">
                        <FontAwesomeIcon icon={faCalendarPlus} className="text-xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-teal-800">Manage Your Availability</h3>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                    {unsetDays.length > 0 && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md shadow-sm">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon icon={faExclamationCircle} className="text-amber-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-amber-700">
                                        <span className="font-medium">Action needed:</span> You haven't set availability for {unsetDays.length} {unsetDays.length === 1 ? 'day' : 'days'}: <span className="font-medium">{unsetDays.join(', ')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center mb-4 md:mb-0">
                            <span className="text-teal-700 font-medium mr-3">Availability Status:</span>
                            <div className="bg-white rounded-full border overflow-hidden p-1 flex">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, availabilityMode: "available" })}
                                    className={`px-4 py-1 rounded-full transition ${formData.availabilityMode === "available"
                                        ? "bg-teal-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"}`}
                                >
                                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                                    Available
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, availabilityMode: "unavailable" })}
                                    className={`px-4 py-1 rounded-full transition ${formData.availabilityMode === "unavailable"
                                        ? "bg-red-500 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"}`}
                                >
                                    <FontAwesomeIcon icon={faBan} className="mr-2" />
                                    Unavailable
                                </button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            {formData.availabilityMode === "available"
                                ? "Set when you're available to see patients"
                                : "Mark days when you cannot see patients"}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSaveTimings} className="space-y-6">
                    {formData.availabilityMode === "available" && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h4 className="text-md font-medium mb-4 text-teal-700">Set Working Hours</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">Start Time</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            required={formData.availabilityMode === "available"}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2 font-medium">End Time</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            required={formData.availabilityMode === "available"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h4 className="text-md font-medium mb-4 text-teal-700">
                            {formData.availabilityMode === "available"
                                ? "Select Days to Apply This Schedule"
                                : "Select Days When You're Unavailable"}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                            {daysOfWeek.map((day) => {
                                const dayCode = dayMappings[day as keyof typeof dayMappings];
                                const isSet = providerTimings[dayCode] !== undefined;
                                const shortDay = day.substring(0, 3);

                                return (
                                    <div key={day} className="flex flex-col items-center">
                                        <input
                                            type="checkbox"
                                            id={`day-${day}`}
                                            checked={formData.selectedDays.includes(day)}
                                            onChange={() => handleDaySelection(day)}
                                            className="hidden"
                                            disabled={isSet}
                                        />
                                        <label
                                            htmlFor={`day-${day}`}
                                            className={`
                                                w-full py-2 px-1 rounded-lg text-center cursor-pointer transition-all duration-200
                                                ${isSet ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                                    formData.selectedDays.includes(day) ?
                                                        (formData.availabilityMode === "available" ? 'bg-teal-100 text-teal-800 border-2 border-teal-500' : 'bg-red-100 text-red-800 border-2 border-red-500') :
                                                        'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}
                                            `}
                                        >
                                            <div className="font-medium">{shortDay}</div>
                                            {isSet && <div className="text-xs mt-1">(Set)</div>}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving || formData.selectedDays.length === 0}
                            className={`px-6 py-3 rounded-lg font-medium shadow-sm flex items-center space-x-2 transition duration-300
                                ${formData.availabilityMode === "available"
                                    ? "bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-300"
                                    : "bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300"
                                }`}
                        >
                            <FontAwesomeIcon icon={formData.availabilityMode === "available" ? faSave : faBan} />
                            <span>
                                {formData.availabilityMode === "available"
                                    ? "Save Availability"
                                    : "Mark as Unavailable"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Current timings */}
            <div className="bg-white border rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4 border-b">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarWeek} className="text-white mr-3 text-xl" />
                        <h3 className="font-semibold text-white text-lg">Your Weekly Schedule</h3>
                    </div>
                </div>

                {sortedTimings.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {sortedTimings.map(({ dayCode, timing }) => (
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
                                <button
                                    onClick={() => handleDeleteTiming(dayCode)}
                                    disabled={isSaving}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition duration-300"
                                    title="Remove this schedule"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
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
                            You haven't set any availability or unavailability timings yet. Use the form above to configure your weekly schedule.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderTimingsTab;