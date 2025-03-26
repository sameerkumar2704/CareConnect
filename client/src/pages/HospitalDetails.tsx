import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../utils/contants";
import hospitalImage from "../images/hospital.webp"; // Import the image
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "./NotFound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";

interface Hospital {
    id: string;
    name: string;
    email: string;
    phone: string;
    locationId: string;
    createdAt: string;
}

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
                <div className="text-sm md:text-lg text-gray-600 mt-4 space-y-2">
                    <p><span className="font-semibold"><FontAwesomeIcon icon={faEnvelope} /> Email:</span> {hospital.email}</p>
                    <p><span className="font-semibold"><FontAwesomeIcon icon={faPhone} />  Phone:</span> {hospital.phone}</p>
                </div>
                {/* Book an Appointment Button */}
                {/* <div className="mt-6 flex justify-center">
                    <button className="cursor-pointer bg-[#00979D] text-white text-lg font-semibold px-6 py-3 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:bg-[#007a7e]">
                        Book an Appointment
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default HospitalDetails;
