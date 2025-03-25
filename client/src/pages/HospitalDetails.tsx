import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../utils/contants";
import hospitalImage from "../images/hospital.webp"; // Import the image

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

    if (loading) return <p className="text-center text-white">Loading...</p>;
    if (!hospital) return <p className="text-center text-white">Hospital not found.</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#A9E2E3] to-[#00979D] flex justify-center items-center p-8">
            <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-xl">
                {/* Hospital Image */}
                <img 
                    src={hospitalImage} 
                    alt="Hospital" 
                    className="w-full h-80 object-cover rounded-xl mb-6" 
                />
                {/* Hospital Details */}
                <h1 className="text-4xl font-bold text-gray-800 text-center">{hospital.name}</h1>
                <div className="text-lg text-gray-600 mt-4 space-y-2">
                    <p><span className="font-semibold">📧 Email:</span> {hospital.email}</p>
                    <p><span className="font-semibold">📞 Phone:</span> {hospital.phone}</p>
                </div>
            </div>
        </div>
    );
};

export default HospitalDetails;
