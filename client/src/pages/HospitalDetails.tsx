import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../utils/contants";
import hospitalImage from "../images/hospital.webp";
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "./NotFound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faIndianRupee, faPhone } from "@fortawesome/free-solid-svg-icons";
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
        <div className="bg-gradient-to-br to-[#A9E2E3] from-[#00979D] flex justify-center items-center p-5 md:p-8">
            <div className="w-full max-w-5xl h-max bg-white rounded-xl shadow-xl overflow-hidden">
                {/* Hospital Image */}
                <img src={hospitalImage} alt="Hospital" className="w-full h-96 object-cover" />

                {/* Hospital Details */}
                <div className="p-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">{hospital.name}</h1>
                    <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <tbody>
                            <tr className="border-b">
                                <td className="px-6 py-4 font-semibold text-gray-700 flex items-center">
                                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-500" /> Email
                                </td>
                                <td className="px-6 py-4 text-gray-600">{hospital.email}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-6 py-4 font-semibold text-gray-700 flex items-center">
                                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-500" /> Phone
                                </td>
                                <td className="px-6 py-4 text-gray-600">{hospital.phone}</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-gray-700 flex items-center">
                                    <FontAwesomeIcon icon={faIndianRupee} className="mr-2 text-gray-500" /> Fees
                                </td>
                                <td className="px-6 py-4 text-gray-600">{hospital.fees}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Doctors Section */}
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctors in this Hospital</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map((doctor) => (
                            <div
                                key={doctor.id}
                                className="flex flex-col gap-2 bg-gray-200 p-4 rounded-lg shadow-md transition-all transform hover:scale-105 hover:bg-[#00979D] hover:text-white"
                            >
                                <h3 className="text-xl font-semibold">{"Dr. " + doctor.name}</h3>
                                <p className="flex items-center"><FontAwesomeIcon icon={faPhone} className="mr-2" /> {doctor.phone}</p>
                                <p className="flex items-center"><FontAwesomeIcon icon={faEnvelope} className="mr-2" /> {doctor.email}</p>

                                {/* Book Button (Ensuring it remains visible even on hover) */}
                                <Link
                                    to={`/payment/${doctor.id}`}
                                    className="cursor-pointer bg-white text-[#00979D] text-md text-center font-semibold px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                >
                                    Book an Appointment
                                </Link>
                            </div>


                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDetails;
