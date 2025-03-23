import { useEffect, useState } from "react";
import { Hospital, Specialty } from "../model/user.model";
import axios from "axios";
import { API_URL } from "../utils/contants";
import SpecialtyCard from "./Cards/Speciality";
import HospitalCard from "./Cards/Hospital";

const Dashboard = () => {

  const [doctors, setDoctos] = useState<Hospital[]>([]);
  const [specialists, setSpecialists] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch doctors
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/hospitals/top`);

        if (response.status !== 200) {
          throw new Error("An error occurred while fetching doctors");
        }

        setDoctos(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    // Fetch specialties
    const fetchSpecialties = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/speciality/top`);

        if (response.status !== 200) {
          throw new Error("An error occurred while fetching specialties");
        }

        setSpecialists(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
    fetchSpecialties();
  }, [])

  return (
    <div className="bg-gray-50">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-cyan-700 via-teal-500 to-blue-300 text-center py-16 px-6 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Find the Right Professional for Your Needs
          </h1>
          <p className="text-lg text-gray-200">
            Easily book appointments with top-rated professionals in your area.
          </p>
        </div>
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search doctors, specialists, or services..."
            className="w-full max-w-2xl text-white px-6 py-3 border-2 border-white rounded-l-full focus:outline-none text-lg"
          />
          <button className="bg-white text-[#4fadb1] px-6 py-3 rounded-r-full text-lg hover:bg-gray-100 cursor-pointer transition">
            Search
          </button>
        </div>
      </div>

      <div className="p-8 md:p-12">
        {/* Browse by Specialty */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl text-[#4fadb1] font-semibold text-center">Services</h1>
          <h2 className="text-5xl font-bold text-center">Browse by Specialty</h2>
          <h6 className="text-center text-lg text-gray-600 mt-4">
            Find the right professional for your needs by browsing through our
            specialties.
          </h6>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 md:px-12 py-8">
          {!loading && specialists && specialists.map((specialty) => (
            <SpecialtyCard key={specialty.id} name={specialty.name} description={specialty.description} />
          ))}
        </div>
      </div>
      <div className="bg-gray-100">
        {/* Browse by Specialty */}
        <div className="flex flex-col py-12 gap-2">
          <h1 className="text-2xl text-[#4fadb1] font-semibold text-center">Hospitals</h1>
          <h2 className="text-5xl font-bold text-center">Browse by Hospital</h2>
          <h6 className="text-center text-lg text-gray-600 mt-4">
            Find the right medical assurance by browsing through our
            hospitals.
          </h6>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 md:px-12 py-8">
          {!loading && doctors && doctors.map((doctor) => (
            <HospitalCard key={doctor.id} specialities={doctor.specialities} parentName={doctor.parentName} description={doctor.phone} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
