import React, { useState } from "react";

const Contact = () => {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Your message has been sent!");
        setFormData({ name: "", email: "", message: "" }); // Reset form after submission
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#A9E2E3] to-[#00979D] px-6 py-12 flex flex-col items-center">
            {/* Page Header */}
            <div className="text-center text-white max-w-3xl">
                <h1 className="text-4xl font-bold">Get in Touch</h1>
                <p className="text-lg mt-2">
                    Have questions or need assistance? Reach out to us, and we'll be happy to help!
                </p>
            </div>

            <div className="mt-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Contact Form */}
                <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-[#00979D]">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00979D]"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00979D]"
                        />
                        <textarea
                            name="message"
                            placeholder="Your Message"
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00979D]"
                        />
                        <button
                            type="submit"
                            className="w-full bg-[#00979D] hover:bg-[#007b86] text-white font-semibold py-3 rounded-md transition duration-300"
                        >
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Contact Information */}
                <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-[#00979D] flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center">Contact Information</h2>
                    <div className="mt-6 space-y-4">
                        <p className="flex items-center space-x-2 text-gray-600">
                            <i className="fas fa-map-marker-alt text-[#00979D]"></i>
                            <span>123 Healthcare Street, City, Country</span>
                        </p>
                        <p className="flex items-center space-x-2 text-gray-600">
                            <i className="fas fa-envelope text-[#00979D]"></i>
                            <span>support@careconnect.com</span>
                        </p>
                        <p className="flex items-center space-x-2 text-gray-600">
                            <i className="fas fa-phone-alt text-[#00979D]"></i>
                            <span>+123 456 7890</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
