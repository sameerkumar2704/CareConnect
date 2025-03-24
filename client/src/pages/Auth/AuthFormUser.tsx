import axios from "axios";
import React, { useState } from "react";
import { API_URL } from "../../utils/contants";
import { getHighlyAccurateLocation } from "../../utils/location/Location";

const AuthFormUser = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({ email: "", phone: "", password: "", confirmPassword: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.phone && !formData.email) {
            alert("Either Mobile number or Email is required");
            return;
        }

        if (isSignUp && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const location = await getHighlyAccurateLocation();

        const updatedFormData = { ...formData, latitude: location.lat, longitude: location.lon };

        const response = isSignUp ? await axios.post(`${API_URL}/auth/user/register`, updatedFormData) : await axios.post(`${API_URL}/auth/user/login`, updatedFormData);

        if (!isSignUp && response.status !== 200) {
            alert(response.data.error);
            return;
        }

        if (isSignUp && response.status !== 201) {
            alert(response.data.error);
            return;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br to-[#A9E2E3] from-[#00979D] px-4">
            <div className="bg-white p-8 md:p-10 rounded-lg shadow-lg w-full max-w-md border-t-4 border-[#00979D] animate-fadeIn">

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#00979D]">CareConnect</h1>
                    <p className="text-gray-500 text-sm">Connecting Patients with Healthcare Professionals</p>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 text-center">
                    {isSignUp ? "Create an Account" : "Sign In"}
                </h2>
                <p className="text-gray-500 text-center mb-5">{isSignUp ? "Join us today!" : "Welcome back!"}</p>

                {/* Subheading for User/Patient Form */}
                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <h3 style={{ fontFamily: "Raleway, sans-serif" }} className="px-4 text-lg font-semibold text-gray-700 whitespace-nowrap">User / Patient Form</h3>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Mobile & Email Container */}
                    <div className="border border-gray-300 p-4 rounded-md">
                        {/* Mobile Number Input */}
                        <div className="relative">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Mobile Number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            />
                            <i className="fas fa-phone absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>

                        {/* OR Divider */}
                        <div className="flex items-center justify-center my-2">
                            <div className="w-full border-b border-gray-300"></div>
                            <span className="px-2 text-gray-500 font-semibold">OR</span>
                            <div className="w-full border-b border-gray-300"></div>
                        </div>

                        {/* Email Input (Optional but required if phone is empty) */}
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            />
                            <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                        />
                        <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>

                    {/* Confirm Password (for Signup) */}
                    {isSignUp && (
                        <div className="relative">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00979D]"
                            />
                            <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    )}

                    {/* Forgot Password Link */}
                    {!isSignUp && (
                        <span className="text-[#00979D] text-sm block text-right cursor-pointer hover:underline">
                            Forgot Password?
                        </span>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#00979D] hover:bg-[#007D80] text-white font-semibold py-3 rounded-md transition duration-300"
                    >
                        {isSignUp ? "Sign Up" : "Login"}
                    </button>
                </form>

                {/* Toggle Between Login & Signup */}
                <p className="text-center text-sm mt-4 text-gray-600">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"} {" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[#00979D] font-semibold hover:underline"
                    >
                        {isSignUp ? "Login" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthFormUser;