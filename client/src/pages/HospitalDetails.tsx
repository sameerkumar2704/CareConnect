import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "../utils/contants";
import hospitalImage from "../images/hospital.webp"; // Import the image
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "./NotFound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faIndianRupee, faPhone } from "@fortawesome/free-solid-svg-icons";
import { Hospital } from "../model/user.model";

const HospitalDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/hospitals/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setHospital(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching hospital details:", error);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <LoadingSpinner />
    if (!hospital) return <NotFound />

    return (
        <div className="bg-gradient-to-br to-[#A9E2E3] from-[#00979D] flex justify-center items-center p-5 md:p-8">
            <div className="w-full max-w-4xl h-max bg-white p-6 md:p-8 rounded-xl shadow-xl">
                {/* Hospital Image */}
                <img
                    src={hospitalImage}
                    alt="Hospital"
                    className="w-full  md:h-80 object-cover rounded-xl mb-6"
                />
                {/* Hospital Details */}
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800 text-center">{hospital.name}</h1>
                <div className="overflow-x-auto mt-4">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
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

                {/* Book an Appointment Button */}

                <div className="mt-6 flex justify-center">
                    <Link to={"/payment/" + hospital.id} className="cursor-pointer bg-[#00979D] text-white text-lg font-semibold px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:bg-[#007a7e]">
                        Book an Appointment
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HospitalDetails;
