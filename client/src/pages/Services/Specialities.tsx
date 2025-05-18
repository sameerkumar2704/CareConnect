import { useEffect, useState } from "react";
import { Specialty } from "../../model/user.model";
import { API_URL } from "../../utils/contants";
import LoadingSpinner from "../../components/LoadingSpinner";
import SpecialtyCard from "../../components/Cards/Speciality";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/auth";


const Specialties = () => {

    const auth = useAuth();

    if (!auth) {
        console.error("Auth context not found");
        return;
    }

    const { severity } = auth;

    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSpecialties();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredSpecialties(specialties);
        } else {
            const filtered = specialties.filter(specialty =>
                specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                specialty.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                specialty.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredSpecialties(filtered);
        }
    }, [searchTerm, specialties]);

    const fetchSpecialties = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/speciality?severity=${severity}`);
            const data = await response.json();
            setSpecialties(data);
            setFilteredSpecialties(data);
        } catch (error) {
            console.log("Error fetching specialties:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecialties();
    }, [severity])

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-500 py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Find the Right Professional for Your Needs
                    </h1>
                    <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto mb-8">
                        Easily book appointments with top-rated professionals in your area.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 bg-white text-gray-800 placeholder-gray-500 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            placeholder="Search for a specialty..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
                                onClick={() => setSearchTerm("")}
                            >
                                <span className="text-sm font-medium">Clear</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Specialties Section */}
            <section className="py-16 px-6">
                <div className="px-6 md:px-12 mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-teal-500 font-semibold text-lg">Services</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Browse by Specialty</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Find the right specialist for your needs by browsing through our specialties
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : filteredSpecialties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredSpecialties.map((specialty) => (
                                <SpecialtyCard
                                    count={specialty.count}
                                    key={specialty.id}
                                    id={specialty.id}
                                    name={specialty.name}
                                    tags={specialty.tags}
                                    description={specialty.description}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No specialties found matching "{searchTerm}"</p>
                            <button
                                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                onClick={() => setSearchTerm("")}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ Section (Optional) */}
            <section className="py-16 px-6 bg-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-600">Find answers to common questions about our specialties and services</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">How do I choose the right specialist?</h3>
                            <p className="text-gray-600">We recommend considering your specific health needs, checking doctor credentials and reviews, and consulting with your primary care physician for recommendations.</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">What should I bring to my first appointment?</h3>
                            <p className="text-gray-600">Bring your ID, insurance information, medical history records, list of current medications, and any questions you have for the specialist.</p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Can I book appointments online?</h3>
                            <p className="text-gray-600">Yes, you can easily book appointments online through our platform by selecting your preferred specialist and choosing an available time slot.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Specialties;