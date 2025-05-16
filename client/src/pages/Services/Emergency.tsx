import { useEffect, useState } from "react";
import { Hospital } from "../../model/user.model";
import { API_URL } from "../../utils/contants";
import LoadingSpinner from "../../components/LoadingSpinner";
import HospitalCard from "../../components/Cards/Hospital";
import { useAuth } from "../../context/auth";

const Emergency = () => {
    const auth = useAuth();

    if (!auth) {
        console.error("Auth context not found");
        return;
    }

    const { severity } = auth;

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/hospitals?emergency=true&severity=${severity}`);
            const data = await response.json();
            setHospitals(data);
        } catch (error) {
            console.log("Error fetching hospitals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim() === "") {
            setFilteredHospitals(hospitals);
        } else {
            const filtered = hospitals.filter((hospital) =>
                hospital.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredHospitals(filtered);
        }
    };

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
                            onChange={handleSearch}
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
                        Emergency Hospitals
                    </h1>
                    <h2 className="text-2xl md:text-5xl font-bold text-center">
                        Browse Critical Care Facilities
                    </h2>
                    <h6 className="text-center text-sm md:text-lg text-gray-600">
                        Explore hospitals equipped for emergency and life-saving medical services.
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
                        {filteredHospitals.map((hospital) => (
                            <HospitalCard
                                key={hospital.id}
                                id={hospital.id} // Pass hospital ID for navigation
                                specialities={hospital.specialities}
                                parentName={hospital.name}
                                distance={hospital.distance}
                                doctorCount={hospital.doctorCount}
                                hasEmergency={hospital.emergency}
                                fees={hospital.fees}
                                image={"/Services/Hospital.jpg"}
                            />
                        ))}
                    </div>
                ))}


            </div>
        </div>
    );
};

export default Emergency;