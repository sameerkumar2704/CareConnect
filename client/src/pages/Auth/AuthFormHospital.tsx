import React, { useState, useEffect } from "react";
import { API_URL } from "../../utils/contants";
import { Hospital } from "../../model/user.model";
import axios from "axios";
import { getHighlyAccurateLocation } from "../../utils/location/Location";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faEyeSlash, faHospital, faIndianRupee, faLock, faPhone, faUserDoctor, faCalendarCheck, faAmbulance } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { validateName, validatePassword, validatePhone } from "../../utils/validations";
import { verifyToken } from "../../utils/auth";

const AuthFormHospital = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [isHospital, setIsHospital] = useState<boolean>(true);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        phone: string;
        password: string;
        confirmPassword: string;
        hospital: string;
        fees: string;
        emergency: boolean;
        maxAppointments?: string;
    }>({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        hospital: "",
        fees: "",
        emergency: false,
        maxAppointments: ""
    });
    const [formErrors, setFormErrors] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        hospital: "",
        fees: "",
        maxAppointments: ""
    });

    const navigate = useNavigate();

    const auth = useAuth();

    if (!auth) {
        console.error("Auth context not found");
        return;
    }

    const { setUser, setAdmin } = auth;

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

    useEffect(() => {
        if (errors === "") return;

        document.getElementById("errorWin")?.scrollIntoView({ behavior: "smooth" });
    }, [errors])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target.name == "hospital") {
            if (disabled) return;
            setDisabled(true);
        }

        if (e.target.name == "name") {
            setFormErrors({ ...formErrors, name: validateName(e.target.value) });
        }

        if (e.target.name == 'password') {
            setFormErrors({ ...formErrors, password: validatePassword(e.target.value) });
        }

        if (e.target.name == 'confirmPassword') {
            setFormErrors({ ...formErrors, confirmPassword: validatePassword(e.target.value) });
        }

        if (e.target.name == 'phone') {
            setFormErrors({ ...formErrors, phone: validatePhone(e.target.value) });
        }

        if (e.target.name == 'maxAppointments') {
            const value = e.target.value;
            if (value === "" || parseInt(value) < 1) {
                setFormErrors({ ...formErrors, maxAppointments: "Maximum appointments must be at least 1" });
            } else if (parseInt(value) > 100) {
                setFormErrors({ ...formErrors, maxAppointments: "Maximum appointments cannot exceed 100" });
            } else {
                setFormErrors({ ...formErrors, maxAppointments: "" });
            }
        }

        const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp && (!formData.phone || !formData.email)) {
                setErrors("Both Mobile number and Email is required");
                setLoading(false);
                return;
            }

            if (!isSignUp && (!formData.phone && !formData.email)) {
                setErrors("Mobile number or Email is required");
                setLoading(false);
                return;
            }

            if (isSignUp && (!formData.phone || formData.phone.trim() === "")) {
                setErrors("Mobile number is required");
                setLoading(false);
                return;
            }

            if (isSignUp && formData.password !== formData.confirmPassword) {
                setErrors("Passwords do not match");
                setLoading(false);
                return;
            }

            if (!isHospital && (!formData.hospital || formData.hospital.trim() === "")) {
                setErrors("Please select a hospital");
                setLoading(false);
                return;
            }

            if (validateName(formData.name) !== "") {
                setErrors("Name should not contain special characters");
                setLoading(false);
                return;
            }

            if (validatePhone(formData.phone) !== "") {
                setErrors("Phone number is not valid");
                setLoading(false);
                return;
            }

            if (validatePassword(formData.password) !== "") {
                setErrors("Password should be at least 6 characters");
                setLoading(false);
                return;
            }

            if (isSignUp && validatePassword(formData.confirmPassword) !== "") {
                setErrors("Password should be at least 6 characters");
                setLoading(false);
                return;
            }

            if (validatePhone(formData.phone) !== "") {
                setErrors("Phone number is not valid");
                setLoading(false);
                return;
            }

            if (isSignUp && (formData.fees === "" || isNaN(Number(formData.fees)))) {
                setErrors("Consultation fees is required and should be a number");
                setLoading(false);
                return;
            }

            if (isHospital && isSignUp && (Number(formData.fees) > 10000 || Number(formData.fees) < 0)) {
                setErrors("Consultation fees should be between 0 and 10000");
                setLoading(false);
                return;
            }

            if (!isHospital && isSignUp && (formData.maxAppointments === "" || isNaN(Number(formData.maxAppointments)))) {
                setErrors("Maximum appointments is required and should be a number");
                setLoading(false);
                return;
            }

            if (!isHospital && isSignUp && (Number(formData.maxAppointments) < 1 || Number(formData.maxAppointments) > 100)) {
                setErrors("Maximum appointments should be between 1 and 100");
                setLoading(false);
                return;
            }

            // Fetch user location
            let location;
            try {
                location = await getHighlyAccurateLocation();
            } catch (error) {
                setErrors("Failed to retrieve location. Please enable GPS and Refresh the Tab.");
                setLoading(false);
                return;
            }

            const updatedFormData = {
                ...formData,
                latitude: location.lat,
                longitude: location.lon
            };

            setErrors("");

            if (isSignUp) {
                if (isHospital) {
                    delete formData.maxAppointments;
                }
            }

            let response;

            try {
                response = isSignUp
                    ? await axios.post(`${API_URL}/hospitals/register`, updatedFormData)
                    : await axios.post(`${API_URL}/hospitals/login`, updatedFormData);
            } catch (error) {
                console.error("API Error:", error);

                if (axios.isAxiosError(error)) {
                    let message = error.response?.data?.error || "An unexpected error occurred.";

                    if (message === "Unique constraint failed") {
                        message += " on " + error.response?.data?.field;
                    }

                    setErrors(message);
                } else {
                    setErrors("An error occurred. Please try again.");
                }

                setLoading(false);
                return;
            }



            // Handle API response
            if ((isSignUp && response.status !== 201) || (!isSignUp && response.status !== 200)) {
                setErrors(response.data?.error || "An unexpected error occurred.");
                setLoading(false);
                return;
            }

            setErrors(isSignUp ? "Account created successfully" : "Logged in successfully");
            console.log("User Data:", response.data);

            // Reset form state
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
                hospital: "",
                fees: "",
                emergency: false,
                maxAppointments: ""
            });
            setFormErrors({
                name: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
                hospital: "",
                fees: "",
                maxAppointments: ""
            });
            const details = await verifyToken(response.data.token);

            setUser(details);

            if (details.role === "admin") {
                setAdmin(details);
            }
            localStorage.setItem("eWauthToken", response.data.token);



            alert(isSignUp ? "SignUp Success, Redirecting to Home Page..." : "Login Success, Redirecting to Home Page...");

            navigate("/");
        } catch (error) {
            setErrors("An unexpected error occurred. Please try again.");
            console.error(error);
        }

        setLoading(false);
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br to-[#A9E2E3] from-[#00979D] px-4 py-12">
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
                    {isSignUp && <div className="relative text-center">
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
                        {formErrors.name && <small className="text-center text-red-500">{formErrors.name}</small>}
                    </div>}

                    {/* Mobile and Email Section */}
                    <div className={`border border-gray-300 p-4 rounded-md flex flex-col gap-${isSignUp ? 4 : 0}`}>

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
                        {!isSignUp && <div className="flex items-center justify-center my-2">
                            <div className="w-full border-b border-gray-300"></div>
                            <span className="px-2 text-gray-500 font-semibold">OR</span>
                            <div className="w-full border-b border-gray-300"></div>
                        </div>}
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
                        {isSignUp && <p className="text-sm text-center text-gray-500">Enter a valid email, an OTP verification is required.</p>}
                        {
                            formErrors.phone != "" && <small className="text-center text-red-500">{formErrors.phone}</small>
                        }

                        {
                            formErrors.email != "" && <small className="text-center text-red-500">{formErrors.email}</small>
                        }

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

                    {/* Fees for Hospital */}
                    {isSignUp && <div className="relative">
                        <input
                            type="number"
                            name="fees"
                            placeholder="Consultation Fees"
                            value={formData.fees}
                            onChange={handleChange}
                            required
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                        />
                        <FontAwesomeIcon icon={faIndianRupee} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>}

                    {/* 24/7 Emergency Services for Hospital */}
                    {isHospital && isSignUp && (
                        <div className="flex items-center border border-gray-300 rounded-md p-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="emergency"
                                    name="emergency"
                                    checked={formData.emergency}
                                    onChange={handleChange}
                                    className="w-5 h-5 mr-3"
                                />
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faAmbulance} className="text-gray-400 mr-2" />
                                    <label htmlFor="emergency" className="text-gray-700 font-medium">
                                        24/7 Emergency Services Available
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Max Appointments for Doctor */}
                    {!isHospital && isSignUp && (
                        <div className="relative">
                            <input
                                type="number"
                                name="maxAppointments"
                                placeholder="Maximum Appointments Per Day"
                                value={formData.maxAppointments}
                                onChange={handleChange}
                                required
                                min="1"
                                max="100"
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            />
                            <FontAwesomeIcon icon={faCalendarCheck} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            {formErrors.maxAppointments && (
                                <small className="text-center text-red-500 block mt-1">{formErrors.maxAppointments}</small>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#00979D] hover:bg-[#007D80] text-white font-semibold py-3 rounded-md transition duration-300"
                    >
                        {loading ? "Please Wait..." : (isSignUp ? "Sign Up" : "Login")}
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
                {errors && <div id="errorWin" className="text-red-500 text-center mt-5">{errors}</div>}
            </div >
        </div >
    );
};

export default AuthFormHospital;