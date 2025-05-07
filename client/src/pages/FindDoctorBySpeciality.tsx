import { useState } from 'react';
import {
    faMagnifyingGlass,
    faUserDoctor,
    faHeart,
    faBrain,
    faBone,
    faStethoscope,
    faChildReaching,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Specialty data
const specialties = [
    {
        id: 1,
        title: "General Medicine",
        icon: faStethoscope,
        description: "Doctors who provide basic health care, diagnose common illnesses, and offer preventive care.",
        doctorsCount: 24,
        color: "bg-teal-500"
    },
    {
        id: 2,
        title: "Family Medicine",
        icon: faChildReaching,
        description: "Doctors who treat people of all ages, managing overall health and minor illnesses.",
        doctorsCount: 18,
        color: "bg-blue-500"
    },
    {
        id: 3,
        title: "Internal Medicine",
        icon: faStethoscope,
        description: "Doctors who specialize in treating adults with complex medical conditions.",
        doctorsCount: 15,
        color: "bg-indigo-500"
    },
    {
        id: 4,
        title: "General Surgery",
        icon: faHeart,
        description: "Surgeons who perform common operations like appendectomies and hernia repairs.",
        doctorsCount: 12,
        color: "bg-purple-500"
    },
    {
        id: 5,
        title: "Cardiothoracic Surgery",
        icon: faHeart,
        description: "Surgeons who operate on the heart, lungs, and chest.",
        doctorsCount: 8,
        color: "bg-pink-500"
    },
    {
        id: 6,
        title: "Neurosurgery",
        icon: faBrain,
        description: "Doctors who perform surgeries on the brain, spine, and nerves.",
        doctorsCount: 6,
        color: "bg-yellow-500"
    },
    {
        id: 7,
        title: "Orthopedic Surgery",
        icon: faBone,
        description: "Doctors who treat bone, joint, and muscle problems, including fractures and arthritis.",
        doctorsCount: 14,
        color: "bg-green-500"
    },
    {
        id: 8,
        title: "Plastic & Reconstructive Surgery",
        icon: faHeart,
        description: "Doctors who perform cosmetic and reconstructive surgeries to improve appearance or function.",
        doctorsCount: 9,
        color: "bg-red-500"
    },
];

const FindDoctorsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSpecialties = specialties.filter(specialty =>
        specialty.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-500 to-blue-500">


            {/* Hero Section */}
            <section className="py-16 px-6 text-center text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Find the Right Doctor for Your Needs</h1>
                <p className="text-xl mb-8 max-w-3xl mx-auto">
                    Browse through our network of highly qualified specialists to get the care you deserve.
                </p>

                {/* Search Box */}
                <div className="max-w-md mx-auto relative">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search specialties..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>

            {/* Specialties Section */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto ">
                    <div className="text-center mb-12 ">
                        <h2 className="text-4xl font-bold mb-2">Browse by Specialty</h2>
                        <p className="text-opacity-90">
                            Find the right specialist for your needs by browsing through our specialties
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredSpecialties.map((specialty) => (
                            <div
                                key={specialty.id}
                                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-teal-500 bg-opacity-10 p-3 rounded-full mr-4">
                                            <FontAwesomeIcon
                                                icon={specialty.icon}
                                                className="text-teal-500 text-xl"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">{specialty.title}</h3>
                                    </div>

                                    <p className="text-gray-600 mb-6 text-sm">{specialty.description}</p>

                                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <FontAwesomeIcon icon={faUserDoctor} className="mr-2 text-teal-500" />
                                            <span>{specialty.doctorsCount} Doctors Available</span>
                                        </div>

                                        <button className="text-teal-500 hover:text-teal-700 font-medium flex items-center transition-colors duration-200">
                                            <span>View Doctors</span>
                                            <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-teal-600 to-blue-600 py-12 px-6 text-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Need Help Finding the Right Specialist?</h2>
                    <p className="text-xl mb-6">Our team is ready to assist you in finding the perfect healthcare professional for your needs.</p>
                    <div className="flex justify-center space-x-4">
                        <button className="bg-white text-teal-600 px-6 py-3 rounded-lg font-medium hover:bg-teal-50 transition">
                            Contact Us
                        </button>
                        <button className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-teal-600 transition">
                            Learn More
                        </button>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default FindDoctorsPage;