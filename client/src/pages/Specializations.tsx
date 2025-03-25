import React, { useState, useEffect } from "react";

const SpecializationsPage = () => {
    interface Specialization {
        id: number;
        name: string;
    }

    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [search, setSearch] = useState("");
    const [filteredSpecializations, setFilteredSpecializations] = useState<Specialization[]>([]);

    useEffect(() => {
        // Placeholder API
        fetch("https://jsonplaceholder.typicode.com/users")
            .then(response => response.json())
            .then(data => {
                // Simulating specialization names from API response
                interface ApiResponse {
                    id: number;
                    company: {
                        bs: string;
                    };
                }

                const mockData: Specialization[] = (data as ApiResponse[]).map(user => ({ id: user.id, name: user.company.bs }));
                setSpecializations(mockData);
                setFilteredSpecializations(mockData);
            });
    }, []);

    useEffect(() => {
        setFilteredSpecializations(
            specializations.filter(specialization =>
                specialization.name.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, specializations]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#A9E2E3] to-[#00979D] px-6 py-12">
            <div className="max-w-4xl mx-auto text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Medical Specializations</h1>
                <p className="text-lg">Find specialists based on their expertise.</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mt-6">
                <input
                    type="text"
                    placeholder="Search specialization..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                />
            </div>

            {/* Specialization List */}
            <div className="mt-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpecializations.map((specialization) => (
                    <div key={specialization.id} className="bg-white shadow-lg rounded-lg p-6 text-center border-t-4 border-[#00979D]">
                        <h2 className="text-xl font-semibold text-gray-800">{specialization.name}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpecializationsPage;
