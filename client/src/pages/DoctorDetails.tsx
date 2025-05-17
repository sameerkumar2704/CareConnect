import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../utils/contants";
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "./NotFound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faIndianRupee,
    faPhone,
    faCalendarCheck,
    faNotesMedical,
    faUserMd,
    faLocationDot,
    faStar,
    faQuoteLeft, faUser, faStethoscope,
    faHospitalAlt
} from "@fortawesome/free-solid-svg-icons";
import { Hospital, Specialty, User } from "../model/user.model";
import { useAuth } from "../context/auth";
// import { GoogleMap } from "../utils/location/GoogleMap";
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

interface Ratings {
    Speciality: Specialty;
    User: User;
    rating: number;
    feedback: string;
}

const DoctorDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [doctor, setDoctor] = useState<Hospital | null>(null);
    const [parentHospital, setParentHospital] = useState<Hospital | null>(null);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState<string>("");
    const [specialities, setSpecialities] = useState<Specialty[]>([]);
    const [ratings, setRatings] = useState<Ratings[]>([]);

    const auth = useAuth();

    if (!auth) {
        console.error("Auth context is not available.");
        return; // or handle the error as needed
    }

    const { user } = auth;

    const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);

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

    useEffect(() => {
        fetch(`${API_URL}/hospitals/${id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setDoctor(data);

                // Set specialities
                if (data.specialities && data.specialities.length > 0) {
                    setSpecialities(data.specialities);
                }

                // Fetch ratings from backend
                setRatings(data.ratings);

                // Fetch parent hospital details if available
                setParentHospital(data.parent);

                // Fetch address if coordinates are available
                if (data.currLocation && data.currLocation.latitude && data.currLocation.longitude) {
                    fetchAddress(data.currLocation.latitude, data.currLocation.longitude);
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching doctor details:", error);
                setLoading(false);
            });

        const fetchUserCoordinates = async () => {
            try {
                const coordinates = await getHighlyAccurateLocation();

                if (coordinates) {
                    setUserCoordinates({ lat: coordinates.lat, lng: coordinates.lon });
                } else {
                    console.error("Unable to get user coordinates");
                }
            } catch (error) {
                console.error("Error fetching user coordinates:", error);
            }
        };

        fetchUserCoordinates();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (!doctor) return <NotFound />;

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
        if (rating >= 3.5) return 'bg-gradient-to-r from-blue-500 to-teal-400';
        if (rating >= 2.5) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
        return 'bg-gradient-to-r from-orange-500 to-red-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-cyan-700 via-teal-500 to-blue-400">
            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Doctor info card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 transform hover:shadow-2xl transition-all duration-300">
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <FontAwesomeIcon icon={faUserMd} className="mr-4 text-teal-500" />
                            Doctor Information {user && user._id === doctor.id && " (You)"}
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                                <div className="bg-teal-100 p-3 rounded-full mr-4">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-teal-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Email</p>
                                    <p className="text-gray-800 font-semibold">{doctor.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                                <div className="bg-teal-100 p-3 rounded-full mr-4">
                                    <FontAwesomeIcon icon={faPhone} className="text-teal-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Phone</p>
                                    <p className="text-gray-800 font-semibold">{doctor.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                                <div className="bg-teal-100 p-3 rounded-full mr-4">
                                    <FontAwesomeIcon icon={faIndianRupee} className="text-teal-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Consultation Fees</p>
                                    <p className="text-gray-800 font-semibold">{doctor.fees}</p>
                                </div>
                            </div>

                            {parentHospital && (
                                <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                                    <div className="bg-teal-100 p-3 rounded-full mr-4">
                                        <FontAwesomeIcon icon={faHospitalAlt} className="text-teal-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-medium">Affiliated Hospital</p>
                                        <Link to={`/hospital/${parentHospital.id}`} className="text-teal-600 font-semibold hover:underline">
                                            {parentHospital.name}
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Last free date avalilable Date */}
                            <div className="flex items-start p-4 bg-gray-50 rounded-xl">
                                <div className="bg-teal-100 p-3 rounded-full mr-4">
                                    <FontAwesomeIcon icon={faCalendarCheck} className="text-teal-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">Last Free Date</p>
                                    <p className="text-gray-800 font-semibold">{new Date(doctor.freeSlotDate).toLocaleDateString()}</p>
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


                            {doctor.currLocation.latitude && doctor.currLocation.longitude && userCoordinates && <div className="flex h-60 justify-center items-center p-4 bg-gray-50 rounded-xl md:col-span-2 lg:col-span-3">
                                {/* <GoogleMap
                                    latitude={hospital.currLocation.latitude}
                                    longitude={hospital.currLocation.longitude}
                                    name={hospital.name}
                                    mapId={hospital.id}
                                /> */}

                                <MapWithCoordinates
                                    startCoords={{ lat: doctor.currLocation.latitude, lng: doctor.currLocation.longitude }}
                                    endCoords={{ lat: userCoordinates.lat, lng: userCoordinates.lng }}
                                />
                            </div>}
                        </div>

                        {/* Go to Profile Link */}
                        {user && user.id === id && (
                            <div className="mt-6 flex justify-center">
                                <Link
                                    to={`/profile/doctor/${user.id}`}
                                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-300"
                                >
                                    Go to Profile
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Doctor Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Ratings Card */}
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center mb-4">
                            <div className="bg-white/20 p-3 rounded-full mr-4">
                                <FontAwesomeIcon icon={faStar} className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold">Patient Ratings</h3>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold mt-4 mb-2">
                                {ratings.length > 0 ? (ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length).toFixed(2) : "0.0"}
                                <span className="text-2xl">/5</span>
                            </div>
                            <div className="flex justify-center mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FontAwesomeIcon
                                        key={star}
                                        icon={faStar}
                                        className={`mx-1 ${star <= Math.round(ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length)
                                            ? "text-yellow-300"
                                            : "text-white/30"
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-blue-100">{ratings.length} Patient Reviews</p>
                        </div>
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
                                specialities.map((speciality) => (
                                    <Link
                                        to={"/specializations/" + speciality.id}
                                        key={speciality.id}
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

                {/* Ratings Section with full details name, rating and feedback  */}

                <div className="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                        <FontAwesomeIcon icon={faStar} className="mr-4 text-teal-500" />
                        <span className="relative">
                            Patient Reviews
                            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded"></span>
                        </span>
                    </h2>

                    {ratings.length > 0 ? (
                        <div className="space-y-6">
                            {ratings.map((rating, index) => (
                                <div key={index} className="transform transition-all duration-300 hover:translate-y-1 hover:shadow-lg">
                                    <div className="relative rounded-xl overflow-hidden shadow-md bg-white">
                                        {/* Rating Badge */}
                                        <div className={`absolute top-4 right-4 ${getRatingColor(rating.rating)} text-white font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg`}>
                                            {rating.rating}
                                        </div>

                                        <div className="pt-6 pb-6 px-6">
                                            {/* Quote Icon */}
                                            <FontAwesomeIcon icon={faQuoteLeft} className="text-gray-200 text-4xl mb-4" />

                                            {/* Review Text */}
                                            <p className="text-gray-700 italic mb-6 text-lg">{rating.feedback}</p>

                                            <div className="flex items-center pt-4 border-t border-gray-100">
                                                {/* User Info */}
                                                <div className="bg-gray-100 rounded-full p-2 mr-4">
                                                    <FontAwesomeIcon icon={faUser} className="text-teal-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{rating.User.name}</p>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FontAwesomeIcon icon={faStethoscope} className="mr-1 text-blue-400" />
                                                        <span>{rating.Speciality.name}</span>
                                                    </div>
                                                </div>

                                                {/* Star Rating */}
                                                <div className="ml-auto">
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <FontAwesomeIcon
                                                                key={star}
                                                                icon={faStar}
                                                                className={`${star <= rating.rating ? "text-yellow-400" : "text-gray-200"} mx-0.5`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-8 text-center shadow-md">
                            <FontAwesomeIcon icon={faStar} className="text-gray-300 text-5xl mb-4" />
                            <p className="text-gray-500 text-lg">No reviews available yet</p>
                            <p className="text-sm text-gray-400 mt-2">Be the first to share your experience!</p>
                        </div>
                    )}
                </div>

                {/* Book Appointment Button */}
                {user && user.role !== "HOSPITAL" && (user._id !== doctor.id) && <div className="flex justify-center">
                    <Link
                        to={`/checkout/${doctor.id}`}
                        className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 text-lg flex items-center"
                    >
                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-3 text-xl" />
                        Book an Appointment
                    </Link>
                </div>}
            </div>
        </div>
    );
};

export default DoctorDetails;