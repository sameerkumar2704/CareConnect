import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div>
      {/* Primary Navbar  */}
      <div className="bg-[#00ADB5] md:flex items-center text-white py-4">
        <div className="flex gap-4 w-full px-12">
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faPhone} />
            <p>+91234567890</p>
          </div>
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faEnvelope} />
            <p>careconnent@gmail.com</p>
          </div>
        </div>
        <div className="flex gap-8 w-full justify-end px-12">
          <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faFacebook} />
          <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faTwitter} />
          <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faInstagram} />
        </div>
      </div>

      {/* =========================================================================================================== */}

      {/* Secondary Navbar */}
      <div className="shadow-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to={"/"} className="text-2xl flex gap-2 items-center font-bold text-[#00adb5]">
            <img src="/sitelogo.png" className="w-10 h-10" alt="CareConnect" />

            CareConnect
          </Link>
          <div style={{
            fontFamily: "RaleWay, sans-serif"
          }} className="hidden md:flex text-lg font-semibold space-x-6">
            <Link to="/" className={`cursor-pointer hover:text-[#60BDBB]`}>Home</Link>
            <Link to={"/about"} className={`cursor-pointer hover:text-[#60BDBB]`}>About</Link>
            <Link to={"/services"} className={`cursor-pointer hover:text-[#60BDBB]`}>Services</Link>
            <Link to={"/contact"} className={`cursor-pointer hover:text-[#60BDBB]`}>Contact</Link>
          </div>

          {/* Sign In Button (Desktop) */}
          <div className="hidden md:block">
            <button
              onClick={() => navigate("/auth")}
              className="text-white bg-[#4fadb1] px-4 py-2 rounded-lg hover:shadow-lg cursor-pointer transition duration-300"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✖" : "☰"}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden flex flex-col gap-4 text-xl rounded-lg overflow-hidden ${isOpen ? "max-h-96 p-4" : "max-h-0 p-0"
            }`}
        >
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>

          {/* Sign In Button (Mobile) */}
          <button
            onClick={() => {
              setIsOpen(false); // Close menu
              navigate("/auth"); // Navigate to AuthForm
            }}
            className="bg-[#00ADB5] text-white px-4 py-2 rounded-lg  hover:shadow-lg cursor-pointer transition duration-300"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
