import React, { useState, useEffect } from "react";
import { API_URL } from "../../utils/contants";
import { Hospital } from "../../model/user.model";
import axios from "axios";
import { getHighlyAccurateLocation } from "../../utils/location/Location";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faHospital, faLock, faPhone, faUserDoctor } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

const AuthFormHospital = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [isHospital, setIsHospital] = useState<boolean>(true);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", hospital: "" });

    const navigate = useNavigate();

    const auth = useAuth();

    if (!auth) {
        console.error("Auth context not found");
        return;
    }

    const { setUser } = auth;

    useEffect(() => {
        fetchHospitals("");
    }, []);

    const fetchHospitals = async (query: string) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/hospitals?search=${query}`);
            setHospitals(data.slice(0, 10));
        } catch (error) {
            console.error("Error fetching hospitals", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

        if (e.target.name == "hospital") {

            if (disabled) return;

            setDisabled(true);
        }

        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);

        e.preventDefault();

        if (!formData.phone && !formData.email) {
            alert("Either Mobile number or Email is required");
            setLoading(false);
            return;
        }

        if (!formData.name || formData.name === "") {
            alert("Name is required");
            setLoading(false);
            return;
        }

        if (isSignUp && (!formData.phone || formData.phone === "")) {
            alert("Mobile number is required");
            setLoading(false);
            return;
        }

        if (isSignUp && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            setLoading(false);
            return;
        }

        if (!isHospital && !formData.hospital) {
            alert("Please select a hospital");
            setLoading(false);
            return;
        }

        const location = await getHighlyAccurateLocation();

        const updatedFormData = { ...formData, latitude: location.lat, longitude: location.lon };

        const response = isSignUp ? await axios.post(`${API_URL}/hospitals/register`, updatedFormData)
            : await axios.post(`${API_URL}/hospitals/login`, updatedFormData);



        if (!isSignUp && response.status !== 200) {
            alert(response.data.error);
            setLoading(false);
            return;
        }

        if (isSignUp && response.status !== 201) {
            alert(response.data.error);
            setLoading(false);
            return;
        }

        alert(isSignUp ? "Account created successfully" : "Logged in successfully");
        setFormData({ name: "", email: "", phone: "", password: "", confirmPassword: "", hospital: "" });
        setLoading(false);
        console.log(response.data);
        navigate("/");
        setUser(response.data.user);
        localStorage.setItem("eWauthToken", response.data.token);
        window.location.reload();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br to-[#A9E2E3] from-[#00979D] px-4 py-8">
            <div className="bg-white p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md border-t-4 border-[#00979D] animate-fadeIn">

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#00979D]">CareConnect</h1>
                    <p className="text-gray-500 text-sm">Connecting Patients with Healthcare Professionals</p>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 text-center">
                    {isSignUp ? "Create an Account" : "Sign In"}
                </h2>
                <p className="text-gray-500 text-center mb-5">{isSignUp ? "Join us today!" : "Welcome back!"}</p>

                {/* Toggle for Hospital/Clinic */}
                {isSignUp && <div className="flex items-center justify-center mb-4">
                    <label className="text-gray-700 font-medium mr-2">Are you a Hospital / Clinic?</label>
                    <input type="checkbox" checked={isHospital} onChange={() => setIsHospital(!isHospital)} className="w-5 h-5" />
                </div>}

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <h3 style={{ fontFamily: "Raleway, sans-serif" }} className="px-4 text-lg font-semibold text-gray-700 whitespace-nowrap">Doctor / Hospital Form</h3>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Section */}
                    {isSignUp && <div className="relative">
                        <input
                            type="text"
                            name="name"
                            placeholder={isHospital ? "Hospital Name" : "Doctor Name"}
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                        />
                        <FontAwesomeIcon icon={isHospital ? faHospital : faUserDoctor} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                    </div>}

                    {/* Mobile and Email Section */}
                    <div className="border border-gray-300 p-4 rounded-md">

                        <div className="relative">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Mobile Number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            />
                            <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                        </div>
                        <div className="flex items-center justify-center my-2">
                            <div className="w-full border-b border-gray-300"></div>
                            <span className="px-2 text-gray-500 font-semibold">OR</span>
                            <div className="w-full border-b border-gray-300"></div>
                        </div>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            />
                            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Hospital Selection */}
                    {!isHospital && (
                        <div className="border border-gray-300 p-4 rounded-md">
                            <label className="block text-gray-700 font-medium mb-2">Select Associated Hospital</label>
                            <input
                                type="text"
                                placeholder="Search for a hospital..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    fetchHospitals(e.target.value);
                                }}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            />
                            <select
                                name="hospital"
                                value={formData.hospital}
                                onChange={handleChange}
                                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            >
                                <option disabled={disabled} value="">Select a hospital</option>
                                {!loading && hospitals.length > 0 ? (
                                    hospitals.map((hospital) => (
                                        <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                                    ))
                                ) : (
                                    <option disabled>No Hospital found</option>
                                )}
                            </select>
                            {!loading && hospitals.length === 0 && (
                                <p className="text-red-500 text-sm mt-2">
                                    No Hospital found. Please register your hospital first.
                                </p>
                            )}
                            {loading && <LoadingSpinner />}
                        </div>
                    )}

                    {/* Password Fields */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                        />
                        <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
                    </div>
                    {isSignUp && (
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            />
                            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
                        </div>

                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#00979D] hover:bg-[#007D80] text-white font-semibold py-3 rounded-md transition duration-300"
                    >
                        {isSignUp ? "Sign Up" : "Login"}
                    </button>
                </form>

                {/* Toggle Between Signup & Login */}
                <p className="text-center text-sm mt-4 text-gray-600">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        disabled={loading}
                        className="text-[#00979D] font-semibold hover:underline"
                    >
                        {loading ? "Please Wait..." : (isSignUp ? "Login" : "Sign Up")}
                    </button>
                </p>
            </div >
        </div >
    );
};

export default AuthFormHospital;
