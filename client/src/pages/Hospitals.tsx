import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../utils/contants";
import { getHighlyAccurateLocation } from "../utils/location/Location";

const Hospitals = () => {
    interface Hospital {
        id: string;
        name: string;
        location: string;
        specialization: string;
        availability: string;
        rating: number;
        phone: string;
    }

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [specializationFilter, setSpecializationFilter] = useState("");

    useEffect(() => {

        const fetchHospitals = async () => {

            const coordinates = await getHighlyAccurateLocation();

            console.log("Coordinates", coordinates);

            fetch(`${API_URL}/hospitals/top?latitude=${coordinates?.lat}&longitude=${coordinates?.lon}`)
                .then((response) => response.json())
                .then((data) => {
                    // Map API response to expected structure
                    const formattedHospitals = data.map((hospital: any) => ({
                        id: hospital.id,
                        name: hospital.name,
                        location: hospital.locationId || "Unknown Location", // Assuming a default value
                        specialization: hospital.specialities.length > 0 ? hospital.specialities.join(", ") : "General",
                        availability: "Open", // Default value
                        rating: 4.5, // Default rating since API does not provide one
                        phone: hospital.phone,
                    }));

                    setHospitals(formattedHospitals);
                })
                .catch((error) => console.error("Error fetching hospitals:", error));
        }

        fetchHospitals();
    }, []);

    // Filter hospitals based on search, location, and specialization
    const filteredHospitals = hospitals.filter((hospital) =>
        hospital.name.toLowerCase().includes(search.toLowerCase()) &&
        (locationFilter ? hospital.location.toLowerCase().includes(locationFilter.toLowerCase()) : true) &&
        (specializationFilter ? hospital.specialization.toLowerCase().includes(specializationFilter.toLowerCase()) : true)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#A9E2E3] to-[#00979D] px-6 py-12">
            <h1 className="text-3xl font-bold text-center text-white mb-6">Hospitals</h1>

            {/* Search & Filter Section */}
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                />
                <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                />
                <input
                    type="text"
                    placeholder="Filter by specialization..."
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                />
            </div>

            {/* Hospital List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filteredHospitals.length > 0 ? (
                    filteredHospitals.map((hospital) => (
                        <div key={hospital.id} className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-[#00979D]">
                            <h2 className="text-xl font-semibold text-gray-800">{hospital.name}</h2>
                            <p className="text-gray-500">📍 {hospital.location}</p>
                            <p className="text-gray-600">🩺 Specialization: {hospital.specialization}</p>
                            <p className="text-gray-600">📞 Contact: {hospital.phone}</p>
                            <p className={`text-sm font-semibold ${hospital.availability === "Open" ? "text-green-600" : "text-red-600"}`}>
                                🏥 Availability: {hospital.availability}
                            </p>
                            <p className="text-yellow-500">⭐ {hospital.rating.toFixed(1)}</p>
                            <Link
                                to={`/hospital/${hospital.id}`}
                                className="mt-4 inline-block bg-[#00979D] text-white px-4 py-2 rounded-md hover:bg-[#00777D] transition"
                            >
                                View Details
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-white text-center w-full">No hospitals found.</p>
                )}
            </div>
        </div>
    );
};

export default Hospitals;
