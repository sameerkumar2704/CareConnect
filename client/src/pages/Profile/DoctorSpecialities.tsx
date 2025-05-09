import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/contants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMedkit,
    faPlus,
    faTimes,
    faUserMd,
    faStethoscope,
    faHeartbeat
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../../components/LoadingSpinner";

interface Specialty {
    id: string;
    name: string;
}

interface DoctorSpecialty {
    id: string;
    specialtyId: string;
    doctorId: string;
    name: string;
}

interface DoctorSpecialtiesTabProps {
    userId: string;
}

const DoctorSpecialtiesTab = ({ userId }: DoctorSpecialtiesTabProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [availableSpecialties, setAvailableSpecialties] = useState<Specialty[]>([]);
    const [doctorSpecialties, setDoctorSpecialties] = useState<DoctorSpecialty[]>([]);
    const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isAddingSpecialty, setIsAddingSpecialty] = useState<boolean>(false);

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch all available specialties
            const specialtiesRes = await axios.get(`${API_URL}/speciality`);
            setAvailableSpecialties(specialtiesRes.data);

            // Fetch doctor's current specialties
            const doctorSpecialtiesRes = await axios.get(`${API_URL}/speciality/doctor/${userId}`);
            setDoctorSpecialties(doctorSpecialtiesRes.data);
            console.log("Doctor's specialties:", doctorSpecialtiesRes.data);
        } catch (error) {
            console.error("Error fetching specialties data:", error);
            setErrorMessage("Failed to load specialties. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSpecialty = async () => {
        if (!selectedSpecialtyId) return;

        // Check if already added
        if (doctorSpecialties.some(ds => ds.specialtyId === selectedSpecialtyId)) {
            setErrorMessage("This specialty is already added to your profile.");
            setTimeout(() => setErrorMessage(""), 3000);
            return;
        }

        setIsSaving(true);
        try {
            console.log("Adding specialty:", selectedSpecialtyId);

            const response = await axios.put(`${API_URL}/speciality/doctor/${userId}`, {
                specialtyId: selectedSpecialtyId
            });

            // Add the new specialty to the list
            setDoctorSpecialties([...doctorSpecialties, response.data]);
            setSelectedSpecialtyId("");
            setSuccessMessage("Specialty added successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
            setIsAddingSpecialty(false);
        } catch (error) {
            console.error("Error adding specialty:", error);
            setErrorMessage("Failed to add specialty. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveSpecialty = async (specialtyId: string) => {
        setIsSaving(true);
        try {
            await axios.delete(`${API_URL}/doctors/${userId}/specialties/${specialtyId}`);

            // Remove the specialty from the list
            setDoctorSpecialties(doctorSpecialties.filter(ds => ds.specialtyId !== specialtyId));
            setSuccessMessage("Specialty removed successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error removing specialty:", error);
            setErrorMessage("Failed to remove specialty. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    // Get a color for a specialty card based on its index
    const getSpecialtyColor = (index: number) => {
        const colors = [
            'bg-blue-50 border-blue-200 text-blue-800',
            'bg-green-50 border-green-200 text-green-800',
            'bg-purple-50 border-purple-200 text-purple-800',
            'bg-pink-50 border-pink-200 text-pink-800',
            'bg-indigo-50 border-indigo-200 text-indigo-800',
            'bg-cyan-50 border-cyan-200 text-cyan-800'
        ];
        return colors[index % colors.length];
    };

    // Get an icon for a specialty card based on its index
    const getSpecialtyIcon = (index: number) => {
        const icons = [faMedkit, faUserMd, faStethoscope, faHeartbeat];
        return icons[index % icons.length];
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faUserMd} className="text-indigo-600 mr-3" />
                    Your Medical Specialties
                </h2>
                {!isAddingSpecialty && (
                    <button
                        onClick={() => setIsAddingSpecialty(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md flex items-center"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add Specialty
                    </button>
                )}
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm animate-fadeIn">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm animate-fadeIn">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{errorMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Add new specialty form - expandable/collapsible */}
            {isAddingSpecialty && (
                <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-indigo-100 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center">
                            <FontAwesomeIcon icon={faPlus} className="text-indigo-500 mr-2" />
                            Add New Specialty
                        </h3>
                        <button
                            onClick={() => setIsAddingSpecialty(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow">
                            <select
                                value={selectedSpecialtyId}
                                onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            >
                                <option value="">Select a specialty</option>
                                {availableSpecialties.map((specialty) => (
                                    <option key={specialty.id} value={specialty.id}>
                                        {specialty.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleAddSpecialty}
                                disabled={!selectedSpecialtyId || isSaving}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm font-medium min-w-max"
                            >
                                {isSaving ? (
                                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                ) : (
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                )}
                                Add Specialty
                            </button>

                            <button
                                onClick={() => setIsAddingSpecialty(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 shadow-sm font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Current specialties - card layout */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
                    <h3 className="font-semibold text-white text-lg flex items-center">
                        <FontAwesomeIcon icon={faStethoscope} className="mr-2" />
                        Your Current Specialties
                    </h3>
                </div>

                {doctorSpecialties.length > 0 ? (
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {doctorSpecialties.map((doctorSpecialty, index) => (
                                <div
                                    key={doctorSpecialty.id}
                                    className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${getSpecialtyColor(index)}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={getSpecialtyIcon(index)} className="text-indigo-600 mr-3 text-lg" />
                                            <span className="font-medium">{doctorSpecialty.name || "Unknown Specialty"}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveSpecialty(doctorSpecialty.specialtyId)}
                                            disabled={isSaving}
                                            className="text-gray-400 hover:text-red-500 transition duration-300 p-1 hover:bg-white rounded-full"
                                            title="Remove specialty"
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                            <FontAwesomeIcon icon={faMedkit} className="text-indigo-300 text-5xl mb-4" />
                            <h4 className="text-lg font-medium text-gray-800 mb-2">No Specialties Added</h4>
                            <p className="text-gray-500 mb-6">You haven't added any medical specialties to your profile yet.</p>
                            {!isAddingSpecialty && (
                                <button
                                    onClick={() => setIsAddingSpecialty(true)}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition duration-300 shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Add Your First Specialty
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorSpecialtiesTab;