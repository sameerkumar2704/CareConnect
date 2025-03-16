import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  return (
    <nav className="bg-blue-600 shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-white">CareConnect</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-gray-200">Home</Link>
          <Link to="/about" className="text-white hover:text-gray-200">About</Link>
          <Link to="/services" className="text-white hover:text-gray-200">Services</Link>
          <Link to="/contact" className="text-white hover:text-gray-200">Contact</Link>
        </div>

        {/* Sign In Button (Desktop) */}
        <div className="hidden md:block">
          <button 
            onClick={() => navigate("/auth")} 
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Sign In
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden flex flex-col bg-blue-500 text-white mt-2 rounded-lg overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 p-4" : "max-h-0 p-0"
        }`}
      >
        <Link to="/" className="py-2 hover:text-gray-200">Home</Link>
        <Link to="/about" className="py-2 hover:text-gray-200">About</Link>
        <Link to="/services" className="py-2 hover:text-gray-200">Services</Link>
        <Link to="/contact" className="py-2 hover:text-gray-200">Contact</Link>
        
        {/* Sign In Button (Mobile) */}
        <button 
          onClick={() => { 
            setIsOpen(false); // Close menu
            navigate("/auth"); // Navigate to AuthForm
          }} 
          className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          Sign In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
