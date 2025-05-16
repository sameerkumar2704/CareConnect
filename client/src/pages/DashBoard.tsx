import { useEffect, useState } from "react";
import { Hospital, Specialty } from "../model/user.model";
import { API_URL } from "../utils/contants";
import SpecialtyCard from "../components/Cards/Speciality";
import HospitalCard from "../components/Cards/Hospital";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { getHighlyAccurateLocation } from "../utils/location/Location";
import { useAuth } from "../context/auth";

const Dashboard = () => {

  const auth = useAuth();

  if (!auth) {
    console.error("Auth context not found");
    return;
  }

  const { severity, setSeverity } = auth;

  const [doctors, setDoctos] = useState<Hospital[]>([]);
  const [specialists, setSpecialists] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSpecialties = async (severityfromUser: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/speciality/top?severity=${severityfromUser}`);
      const data = await response.json();
      console.log("Specialties", data);
      setSpecialists(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const fetchDoctors = async () => {
      setLoading(true);
      try {

        const coordinates = await getHighlyAccurateLocation();

        console.log("Coordinates", coordinates);

        const response = await fetch(`${API_URL}/hospitals/top?latitude=${coordinates?.lat}&longitude=${coordinates?.lon}`);
        const data = await response.json();
        console.log("Doctors", data);
        setDoctos(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };



    fetchDoctors();
    fetchSpecialties(severity);
  }, []);

  const hanldeSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSeverity = e.target.value;
    setSeverity(selectedSeverity);
    localStorage.setItem("severity", selectedSeverity);
    fetchSpecialties(selectedSeverity);
  };

  if (loading) {
    <LoadingSpinner />;
  }

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
        {/* <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search doctors, specialists, or services..."
            className="w-full md:max-w-2xl text-white px-3 md:px-6 py-3 border-2 border-white rounded-l-full focus:outline-none text-sm md:text-lg"
          />
          <button className="bg-white text-[#4fadb1] px-3 md:px-6 md:py-3 rounded-r-full text-sm md:text-lg hover:bg-gray-100 cursor-pointer transition">
            Search
          </button>
        </div> */}

        {/* Drop Down for Severlity Level Normal Medium High */}
        <div className="flex justify-center">
          <select value={severity} onChange={hanldeSeverityChange} className="w-full md:max-w-2xl text-white px-3 md:px-6 py-3 border-2 border-white rounded-l-full focus:outline-none text-sm md:text-lg">
            <option className={`text-black`} value="" disabled selected>
              Select Severity Level
            </option>
            <option value="Low" className="text-black">Normal</option>
            <option value="Moderate" className="text-black">Medium</option>
            <option value="High" className="text-black">High</option>
          </select>
          <button className="bg-white text-[#4fadb1] px-3 md:px-6 md:py-3 rounded-r-full text-sm md:text-lg hover:bg-gray-100 cursor-pointer transition">
            Set Severity
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center p-6 md:p-12">
        {/* Browse by Specialty */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-5xl font-bold text-center">Browse by Specialty</h1>
          <Link to={"/services/specialties"} className="text-2xl text-[#4fadb1] font-semibold text-center">View All <FontAwesomeIcon icon={faArrowRight} /></Link>
          <h6 className="text-center text-sm md:text-lg text-gray-600">
            Find the right professional for your needs by browsing through our
            specialties.
          </h6>
        </div>
        {loading && <LoadingSpinner />}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 py-8 md:px-12">
          {!loading && specialists !== null && specialists !== undefined && specialists.length != 0 &&
            specialists.map((specialty) => (
              <SpecialtyCard tags={specialty.tags} key={specialty.id} count={specialty._count} id={specialty.id} name={specialty.name} description={specialty.description} />
            ))}
        </div>
        <Link to={"/services/specialties"} className="w-full text-2xl text-[#4fadb1] font-semibold text-center">View All <FontAwesomeIcon icon={faArrowRight} /></Link>
      </div>

      <div className="p-6 md:p-12 bg-gray-100">
        {/* Browse by Hospital */}
        <div className="flex flex-col py-12 gap-2">
          <h1 className="text-2xl md:text-5xl font-bold text-center">Browse by Hospital</h1>
          <Link to={"/services/hospitals"} className="text-2xl text-[#4fadb1] font-semibold text-center">View All <FontAwesomeIcon icon={faArrowRight} /></Link>
          <h6 className="text-center text-sm md:text-lg text-gray-600">
            Find the right medical assurance by browsing through our hospitals.
          </h6>
        </div>
        {loading && <LoadingSpinner />}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8 md:px-12 md:py-8">
          {!loading && doctors && doctors.length != 0 &&
            doctors.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                distance={hospital.distance}
                id={hospital.id} // Pass hospital ID for navigation
                specialities={hospital.specialities}
                parentName={hospital.name}
                hasEmergency={hospital.emergency}
                doctorCount={hospital.doctorCount}
                fees={hospital.fees}
                image={"/Services/Hospital.jpg"}
              />
            ))}

        </div>
      </div>




    </div>
  );
};

export default Dashboard;
