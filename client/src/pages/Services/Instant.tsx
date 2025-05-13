import { useEffect, useState } from "react";
import { Hospital } from "../../model/user.model";
import { API_URL } from "../../utils/contants";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faEnvelope, faPerson, faPhone } from "@fortawesome/free-solid-svg-icons";

const InstantAppointments = () => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/hospitals/doctors?instant=true`);
            const data = await response.json();
            setHospitals(data);
        } catch (error) {
            console.log("Error fetching hospitals:", error);
        } finally {
            setLoading(false);
        }
    };


    const filteredHospitals = hospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || !hospitals) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-500 py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Find Emergency Hospitals Near You
                    </h1>
                    <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto mb-8">
                        Locate top-rated hospitals equipped to handle urgent and critical medical conditions.
                    </p>


                    <div className="flex max-w-2xl mx-auto ">
                        <input
                            type="text"
                            placeholder="Search hospitals by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow px-6 py-3 bg-white rounded-l-full text-gray-800 focus:outline-none"
                        />
                        <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-r-full transition-colors duration-300">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Hospitals Section */}
            <div className="p-6 md:p-12 bg-gray-100">
                {/* Browse by Hospital */}
                <div className="flex flex-col py-12 gap-2">
                    <h1 className="text-2xl text-[#4fadb1] font-semibold text-center">
                        Instant Appointments
                    </h1>
                    <h2 className="text-2xl md:text-5xl font-bold text-center">
                        Find the Right Doctor for Your Needs
                    </h2>
                    <h6 className="text-center text-sm md:text-lg text-gray-600">
                        Explore Doctors Available within 7 Days for Instant Appointments
                    </h6>

                </div>
                {loading && <LoadingSpinner />}

                {!loading && (filteredHospitals &&
                    filteredHospitals.length === 0 ? (
                    (
                        <div className="text-center py-12 w-full">
                            <p className="text-gray-600 text-lg">No specialties found matching "{searchTerm}"</p>
                            <button
                                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                onClick={() => setSearchTerm("")}
                            >
                                Clear Search
                            </button>
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8 md:px-12 md:py-8">
                        {filteredHospitals.map((doctor) => (
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
                                        <span>Available on:- {new Date(doctor.freeSlotDate).toLocaleDateString()}</span>
                                    </div>

                                    <Link
                                        to={`/doctors/${doctor.id}`}
                                        className="mt-4 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all hover:-translate-y-1"
                                    >
                                        <FontAwesomeIcon icon={faPerson} className="mr-2" />
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}


            </div>
        </div>
    );
};

export default InstantAppointments;