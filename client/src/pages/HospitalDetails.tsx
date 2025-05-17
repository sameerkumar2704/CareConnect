import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../utils/contants";
import hospitalImage from "../images/hospital.webp";
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "./NotFound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faIndianRupee,
    faPhone,
    faUserMd,
    faCalendarCheck,
    faNotesMedical,
    faHospitalAlt,
    faLocationDot
} from "@fortawesome/free-solid-svg-icons";
import { Hospital, Specialty } from "../model/user.model";
import { useAuth } from "../context/auth";
import MapWithCoordinates from "../utils/location/DirectionMap";
import { getHighlyAccurateLocation } from "../utils/location/Location";

// Interface for reverse geocoding response
interface GeocodingResult {
    address: {
        road?: string;
        suburb?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
    display_name?: string;
}

const HospitalDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [doctors, setDoctors] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState<string>("");
    const [specialities, setSpecialities] = useState<Specialty[]>([]);

    const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    const auth = useAuth();

    if (!auth) {
        console.error("Auth context is not available.");
        return null; // or handle the error as needed
    }

    const { user } = auth;

    if (!user) {
        <LoadingSpinner />;
    }

    // Function to fetch address from coordinates
    const fetchAddress = async (latitude: number, longitude: number) => {
        try {

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data: GeocodingResult = await response.json();

            if (data && data.display_name) {
                setAddress(data.display_name);
            } else if (data && data.address) {
                const addr = data.address;
                const addressParts = [
                    addr.road,
                    addr.suburb,
                    addr.city,
                    addr.state,
                    addr.postcode,
                    addr.country
                ].filter(Boolean);
                setAddress(addressParts.join(", "));
            } else {
                setAddress("Address not available");
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            setAddress("Error retrieving address");
        }
    };

    // Extract unique specialities from doctors
    const extractSpecialities = (doctors: Hospital[]) => {
        // Collect all specialities, handling both string and array formats
        let allSpecialities: Specialty[] = [];

        doctors.forEach(doctor => {
            if (doctor.specialities) {
                allSpecialities = [...allSpecialities, ...doctor.specialities];
            }
        });

        // Filter out empty values and remove duplicates
        return [...new Set(allSpecialities.filter(Boolean))];
    };

    useEffect(() => {
        fetch(`${API_URL}/hospitals/${id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data.children);
                setHospital(data);
                setDoctors(data.children); // Assuming doctors are part of the hospital response

                // Extract specialities
                if (data.children && data.children.length > 0) {
                    setSpecialities(extractSpecialities(data.children));
                }

                // Fetch address if coordinates are available
                if (data.currLocation && data.currLocation.latitude && data.currLocation.longitude) {
                    fetchAddress(data.currLocation.latitude, data.currLocation.longitude);
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching hospital details:", error);
                setLoading(false);
            });

        const fetchUserCoordinates = async () => {
            const coords = await getHighlyAccurateLocation();

            if (coords) {
                setUserCoordinates({ lat: coords.lat, lng: coords.lon });
            }

            // Fetch address from user coordinates

        };

        fetchUserCoordinates();

    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (!hospital) return <NotFound />;

    return (
        <div className="min-h-screen bg-gradient-to-r from-cyan-700 via-teal-500 to-blue-400">
            {/* Hero section */}
            <div className="relative">
                <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
                <img
                    src={hospitalImage}
                    alt="Hospital"
                    className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-20 p-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center drop-shadow-lg">
                        {hospital.name} {user && user._id === id ? "(Your Hospital)" : ""}
                    </h1>
                    <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full">
                        <p className="text-xl text-white">
                            Premier Healthcare Provider
                        </p>
                    </div>
                    {/* Go to Profile Link */}
                    {user && user.id === id && (
                        <Link
                            to={`/profile/hospital/${user.id}`}
                            className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
                        >
                            Go to Profile
                        </Link>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Hospital info card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 transform hover:shadow-2xl transition-all duration-300">
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <FontAwesomeIcon icon={faHospitalAlt} className="mr-4 text-teal-500" />
                            Hospital Information
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                                <div className="bg-teal-100 p-3 rounded-full mr-4">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-teal-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Email</p>
                                    <p className="text-gray-800 font-semibold">{hospital.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                                <div className="bg-teal-100 p-3 rounded-full mr-4">
                                    <FontAwesomeIcon icon={faPhone} className="text-teal-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Phone</p>
                                    <p className="text-gray-800 font-semibold">{hospital.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                                <div className="bg-teal-100 p-3 rounded-full mr-4">
                                    <FontAwesomeIcon icon={faIndianRupee} className="text-teal-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Consultation Fees</p>
                                    <p className="text-gray-800 font-semibold">{hospital.fees}</p>
                                </div>
                            </div>

                            <div className="flex items-start p-4 bg-gray-50 rounded-xl md:col-span-2 lg:col-span-3">
                                <div className="bg-teal-100 p-3 rounded-full mr-4">
                                    <FontAwesomeIcon icon={faLocationDot} className="text-teal-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Address</p>
                                    <p className="text-gray-800 font-semibold">{address || "Address not available"}</p>
                                </div>
                            </div>

                            {hospital.currLocation.latitude && hospital.currLocation.longitude && userCoordinates && <div className="flex h-60 justify-center items-center p-4 bg-gray-50 rounded-xl md:col-span-2 lg:col-span-3">
                                {/* <GoogleMap
                                    latitude={hospital.currLocation.latitude}
                                    longitude={hospital.currLocation.longitude}
                                    name={hospital.name}
                                    mapId={hospital.id}
                                /> */}

                                <MapWithCoordinates
                                    startCoords={{ lat: hospital.currLocation.latitude, lng: hospital.currLocation.longitude }}
                                    endCoords={{ lat: userCoordinates.lat, lng: userCoordinates.lng }}
                                />
                            </div>}
                        </div>
                    </div>
                </div>

                {/* Hospital Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Doctor Count Card */}
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center mb-4">
                            <div className="bg-white/20 p-3 rounded-full mr-4">
                                <FontAwesomeIcon icon={faUserMd} className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold">Doctor Count</h3>
                        </div>
                        <div className="text-5xl font-bold text-center mt-4 mb-2">{doctors.length}</div>
                        <p className="text-center text-blue-100">Healthcare Professionals Ready to Serve</p>
                    </div>

                    {/* Specialities Card */}
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center mb-4">
                            <div className="bg-white/20 p-3 rounded-full mr-4">
                                <FontAwesomeIcon icon={faNotesMedical} className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold">Specialities</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {specialities.length > 0 ? (
                                specialities.map((speciality, index) => (
                                    <Link
                                        to={"/specializations/" + speciality.id}
                                        key={index}
                                        className="bg-white/20 px-3 py-1 hover:underline rounded-full text-sm font-medium"
                                    >
                                        {speciality.name}
                                    </Link>
                                ))
                            ) : (
                                <p className="text-center w-full">No specialities listed</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Doctors Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-white flex items-center">
                            <FontAwesomeIcon icon={faUserMd} className="mr-4 text-white" />
                            Our Specialists
                        </h2>
                        <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full">
                            <p className="text-lg text-white">
                                {doctors.length} Doctors Available
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor) => (
                            <div
                                key={doctor.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all transform hover:shadow-2xl hover:-translate-y-1"
                            >
                                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
                                    <h3 className="text-2xl font-bold text-white">{"Dr. " + doctor.name}</h3>
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-1">
                                            {doctor.specialities.map((spec) => (
                                                <Link to={"/specializations/" + spec.id} key={spec.id} className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                                                    {spec.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col gap-4">
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faPhone} className="mr-3 text-teal-500" />
                                        <span>{doctor.phone}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-teal-500" />
                                        <span>{doctor.email}</span>
                                    </div>

                                    {/* Last Free Date Available */}
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-3 text-teal-500" />
                                        <span>{doctor.freeSlotDate}</span>
                                    </div>

                                    <Link
                                        to={`/doctors/${doctor.id}`}
                                        className="mt-4 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all hover:-translate-y-1"
                                    >
                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDetails;