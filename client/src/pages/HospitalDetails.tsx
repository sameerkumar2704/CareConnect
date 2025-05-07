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
    faMapMarkerAlt,
    faCalendarCheck
} from "@fortawesome/free-solid-svg-icons";
import { Hospital } from "../model/user.model";

const HospitalDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [doctors, setDoctors] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/hospitals/${id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setHospital(data);
                setDoctors(data.children); // Assuming doctors are part of the hospital response
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching hospital details:", error);
                setLoading(false);
            });
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
                        {hospital.name}
                    </h1>
                    <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full">
                        <p className="text-xl text-white">
                            Premier Healthcare Provider
                        </p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Hospital info card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 transform hover:shadow-2xl transition-all duration-300">
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-4 text-teal-500" />
                            Hospital Information
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
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
                                    <p className="text-teal-100">Specialist</p>
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

                                    <Link
                                        to={`/checkout/${doctor.id}`}
                                        className="mt-4 flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform transition-all hover:-translate-y-1"
                                    >
                                        <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                        Book an Appointment
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