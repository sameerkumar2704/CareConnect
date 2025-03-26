import { useEffect, useState } from "react";
import { Hospital, Specialty } from "../model/user.model";
import { API_URL } from "../utils/contants";
import SpecialtyCard from "../components/Cards/Speciality";
import HospitalCard from "../components/Cards/Hospital";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const [doctors, setDoctos] = useState<Hospital[]>([]);
  const [specialists, setSpecialists] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/hospitals/top`);
        const data = await response.json();
        setDoctos(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSpecialties = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/speciality/top`);
        const data = await response.json();
        setSpecialists(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
    fetchSpecialties();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-cyan-700 via-teal-500 to-blue-300 text-center py-8 px-3 md:py-16 md:px-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-5xl font-black text-white">
            Find the Right Professional for Your Needs
          </h1>
          <p className="md:text-lg text-sm text-gray-200">
            Easily book appointments with top-rated professionals in your area.
          </p>
        </div>
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search doctors, specialists, or services..."
            className="w-full md:max-w-2xl text-white px-3 md:px-6 py-3 border-2 border-white rounded-l-full focus:outline-none text-sm md:text-lg"
          />
          <button className="bg-white text-[#4fadb1] px-3 md:px-6 md:py-3 rounded-r-full text-sm md:text-lg hover:bg-gray-100 cursor-pointer transition">
            Search
          </button>
        </div>
      </div>

      <div className="p-6 md:p-12">
        {/* Browse by Specialty */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl text-[#4fadb1] font-semibold text-center">Services</h1>
          <h2 className="text-2xl md:text-5xl font-bold text-center">Browse by Specialty</h2>
          <h6 className="text-center text-sm md:text-lg text-gray-600">
            Find the right professional for your needs by browsing through our
            specialties.
          </h6>
        </div>
        {loading && <LoadingSpinner />}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8 py-8 md:px-12">
          {!loading && specialists &&
            specialists.map((specialty) => (
              <SpecialtyCard key={specialty.id} id={specialty.id} name={specialty.name} description={specialty.description} />
            ))}

        </div>
      </div>

      <div className="p-6 md:p-12 bg-gray-100">
        {/* Browse by Hospital */}
        <div className="flex flex-col py-12 gap-2">
          <h1 className="text-2xl text-[#4fadb1] font-semibold text-center">Hospitals</h1>
          <h2 className="text-2xl md:text-5xl font-bold text-center">Browse by Hospital</h2>
          <h6 className="text-center text-sm md:text-lg text-gray-600">
            Find the right medical assurance by browsing through our hospitals.
          </h6>
        </div>
        {loading && <LoadingSpinner />}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8 md:px-12 md:py-8">
          {!loading && doctors &&
            doctors.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                id={hospital.id} // Pass hospital ID for navigation
                // specialities={hospital.specialities}
                parentName={hospital.name}
                description={hospital.phone}
                email={hospital.email}
                image={"/Services/Hospital.jpg"}
              />
            ))}

        </div>
      </div>




    </div>
  );
};

export default Dashboard;
