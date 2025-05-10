import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
    faMedkit,
    faStethoscope,
    faUserMd,
    faHospital,
    faSpinner,
    faIndianRupeeSign
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Import types
import { Hospital, Specialty } from "../model/user.model";
import { API_URL } from "../utils/contants";

// Modified HospitalCard component for specialty page
const SpecialtyHospitalCard = ({
    id,
    parentName,
    specialities,
    email,
    image,
    fees,
    hasEmergency,
    doctorCount,
    isDoctor = false
}: {
    id: string;
    parentName: string;
    specialities: { id: string; name: string }[];
    email: string;
    image?: string;
    fees: number;
    hasEmergency?: boolean;
    doctorCount?: number;
    isDoctor?: boolean;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full bg-white rounded-xl overflow-hidden transition duration-300 hover:transform hover:scale-105 
                  shadow-lg hover:shadow-xl border border-gray-100">
            {/* Banner for emergency services or doctor status */}
            {hasEmergency && !isDoctor && (
                <div className="bg-red-600 text-white text-center py-1 text-sm font-medium">
                    <FontAwesomeIcon icon={faMedkit} className="mr-2" />
                    24/7 Emergency Services Available
                </div>
            )}
            {isDoctor && (
                <div className="bg-blue-600 text-white text-center py-1 text-sm font-medium">
                    <FontAwesomeIcon icon={faUserMd} className="mr-2" />
                    Healthcare Professional
                </div>
            )}

            {/* Image with overlay gradient */}
            <div className="relative">
                <img
                    src={image || "/placeholder-hospital.jpg"}
                    alt={parentName}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                        e.currentTarget.src = "/placeholder-hospital.jpg";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                {/* Hospital/Doctor name positioned over image */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white">
                        {isDoctor ? "Dr. " : ""}{parentName.charAt(0).toUpperCase() + parentName.slice(1)}
                    </h3>
                </div>
            </div>

            {/* Content area */}
            <div className="p-5">
                {/* Key information in badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {!isDoctor && (
                        <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center">
                            <FontAwesomeIcon icon={faUserMd} className="mr-1" />
                            {doctorCount} Doctors
                        </span>
                    )}
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full flex items-center">
                        <FontAwesomeIcon icon={faIndianRupeeSign} className="mr-1" />
                        {fees} Fees
                    </span>
                </div>

                {/* Specialities */}
                {specialities && specialities.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
                            <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-teal-600" />
                            {isDoctor ? "Specializes in" : "Other Specialities"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {specialities.slice(0, 4).map((specialty, index) => (
                                <Link to={`/speciality/${specialty.id}`} key={index}>
                                    <span className="bg-teal-50 text-teal-700 text-sm px-3 py-1 rounded-lg hover:bg-teal-100 transition-colors">
                                        {specialty.name.charAt(0).toUpperCase() + specialty.name.slice(1)}
                                    </span>
                                </Link>
                            ))}
                            {specialities.length > 4 && (
                                <span className="bg-teal-50 text-teal-700 text-sm px-3 py-1 rounded-lg">
                                    +{specialities.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Contact information */}
                <p className="text-gray-500 text-xs mb-4">{email}</p>

                {/* Action buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center hover:underline"
                    >
                        {isExpanded ? "Show Less" : "Read More →"}
                    </button>

                    <Link to={`/${isDoctor ? "doctor" : "hospital"}/${id}`}
                        className="bg-teal-500 hover:bg-teal-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Main Specialty Page Component
const SpecialtyPage = () => {
    const { id } = useParams();
    const [specialty, setSpecialty] = useState<Specialty | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [doctors, setDoctors] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSpecialty = async () => {
            setLoading(true);
            try {
                // Replace with your actual API endpoint
                const specialtyRes = await axios.get(`${API_URL}/speciality/${id}`);
                console.log("Specialty data:", specialtyRes.data);
                setSpecialty(specialtyRes.data);

                // Fetch hospitals with this specialty
                const hospitalsRes: Hospital[] = specialtyRes.data.hospitals || [];

                // Separate doctors (hospitals with parent) from actual hospitals
                const hospitalsList = hospitalsRes.filter(h => !h.parentId);
                const doctorsList = hospitalsRes.filter(h => h.parentId);

                setHospitals(hospitalsList);
                setDoctors(doctorsList);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching specialty data:", err);
                setError("Failed to load specialty information. Please try again later.");
                setLoading(false);
            }
        };

        if (id) {
            fetchSpecialty();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <FontAwesomeIcon icon={faSpinner} spin className="text-teal-500 text-4xl mb-4" />
                <p className="text-gray-600">Loading specialty information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-lg text-center">
                    <p className="font-medium">{error}</p>
                    <Link to="/" className="text-teal-600 hover:underline mt-2 inline-block">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!specialty) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg max-w-lg text-center">
                    <p className="font-medium">Specialty not found</p>
                    <Link to="/" className="text-teal-600 hover:underline mt-2 inline-block">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero section */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-8 mb-8 text-white">
                <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faStethoscope} className="text-3xl mr-4" />
                    <h1 className="text-3xl font-bold">{specialty.name}</h1>
                </div>
                <p className="text-lg max-w-3xl">{specialty.description}</p>

                {/* Tags */}
                {specialty.tags && specialty.tags.length > 0 && (
                    <div className="mt-6">
                        <div className="flex flex-wrap gap-2">
                            {specialty.tags.map((tag, index) => (
                                <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Hospitals Section */}
            <section className="mb-12">
                <div className="flex items-center mb-6">
                    <FontAwesomeIcon icon={faHospital} className="text-teal-600 text-xl mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-800">Hospitals with {specialty.name} Services</h2>
                </div>

                {hospitals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitals.map((hospital) => (
                            <SpecialtyHospitalCard
                                key={hospital.id}
                                id={hospital.id}
                                parentName={hospital.name}
                                specialities={hospital.specialities.filter(s => s.id !== specialty.id)} // Exclude current specialty
                                email={hospital.email}
                                image={"/Services/Hospital.jpg"}
                                fees={hospital.fees}
                                hasEmergency={hospital.emergency}
                                doctorCount={hospital.doctorCount || 0}
                                isDoctor={false}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600">No hospitals offering {specialty.name} services found.</p>
                    </div>
                )}
            </section>

            {/* Doctors Section */}
            <section>
                <div className="flex items-center mb-6">
                    <FontAwesomeIcon icon={faUserMd} className="text-teal-600 text-xl mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-800">{specialty.name} Specialists</h2>
                </div>

                {doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor) => (
                            <SpecialtyHospitalCard
                                key={doctor.id}
                                id={doctor.id}
                                parentName={doctor.name}
                                specialities={doctor.specialities.filter(s => s.id !== specialty.id)} // Exclude current specialty
                                email={doctor.email}
                                image={"/Auth/Doctor.png"}
                                fees={doctor.fees}
                                hasEmergency={false}
                                doctorCount={0}
                                isDoctor={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600">No specialists for {specialty.name} found.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SpecialtyPage;