import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const auth = useAuth();
  if (!auth) {
    console.error("Auth context not found");
    return null;
  }

  const { user, setUser, loading, admin, setAdmin } = auth;

  useEffect(() => {
    setUser(user);
  }, [user])

  return (
    <div>
      {/* Top Contact Bar */}
      <div className="bg-[#00ADB5] flex flex-wrap items-center text-white py-4 px-6 justify-center md:justify-between">
        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faPhone} />
            <p className="text-sm md:text-base">+91234567890</p>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faEnvelope} />
            <p className="text-sm md:text-base">careconnent@gmail.com</p>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex gap-4 mt-2 md:mt-0">
          <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faFacebook} />
          <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faTwitter} />
          <FontAwesomeIcon className="bg-[#26B9C0] rounded-full p-2 hover:bg-white cursor-pointer hover:text-[#26B9C0]" icon={faInstagram} />
        </div>
      </div>

      {/* Main Navbar */}
      <div className="shadow-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl flex gap-2 items-center font-bold text-[#00adb5]">
            <img src="/sitelogo.png" className="w-10 h-10" alt="CareConnect" />
            CareConnect
          </Link>

          <div className="hidden md:flex text-lg font-semibold space-x-6">
            <Link to="/" className="hover:text-[#60BDBB]">Home</Link>
            <Link to="/about" className="hover:text-[#60BDBB]">About</Link>
            <Link to="/services" className="hover:text-[#60BDBB]">Services</Link>
            <Link to="/contact" className="hover:text-[#60BDBB]">Contact</Link>
            {!loading && admin && <Link to="/admin" className="hover:text-[#60BDBB]">Admin</Link>}
          </div>

          {/* Sign In/Logout Button */}
          {!loading && (
            <div className="hidden md:block">
              {user ? (
                <button
                  onClick={() => {
                    if (!confirm("Are you sure you want to logout?")) return;
                    setUser(null);
                    localStorage.removeItem("eWauthToken");
                    setAdmin(null);
                    alert("Logged out successfully");
                  }}
                  className="text-white bg-[#4fadb1] px-4 py-2 rounded-lg hover:shadow-lg transition duration-300"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="text-white bg-[#4fadb1] px-4 py-2 rounded-lg hover:shadow-lg transition duration-300"
                >
                  Sign In
                </button>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button className="md:hidden text-2xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "✖" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden flex flex-col gap-4 font-semibold text-md bg-white shadow-lg rounded-lg p-4">
            <Link to="/" className="hover:text-[#60BDBB]" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/about" className="hover:text-[#60BDBB]" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/services" className="hover:text-[#60BDBB]" onClick={() => setIsOpen(false)}>Services</Link>
            <Link to="/contact" className="hover:text-[#60BDBB]" onClick={() => setIsOpen(false)}>Contact</Link>
            {!loading && admin && <Link to="/admin" className="hover:text-[#60BDBB]" onClick={() => setIsOpen(false)}>Admin</Link>}

            {/* Sign In/Logout Button for Mobile */}
            {!loading && (
              <div className="hidden md:block">
                {user ? (
                  <button
                    onClick={() => {
                      if (!confirm("Are you sure you want to logout?")) return;
                      setUser(null);
                      localStorage.removeItem("eWauthToken");
                      setAdmin(null);
                      alert("Logged out successfully");
                    }}
                    className="text-white bg-[#4fadb1] px-4 py-2 rounded-lg hover:shadow-lg transition duration-300"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="text-white bg-[#4fadb1] px-4 py-2 rounded-lg hover:shadow-lg transition duration-300"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}{!loading && (
              <div className="md:hidden block">
                {user ? (
                  <button
                    onClick={() => {
                      if (!confirm("Are you sure you want to logout?")) return;
                      setUser(null);
                      localStorage.removeItem("eWauthToken");
                      setAdmin(null);
                      alert("Logged out successfully");
                      setIsOpen(false);
                    }}
                    className="w-full text-white bg-[#4fadb1] px-4 py-2 rounded-lg hover:shadow-lg transition duration-300"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full text-white bg-[#4fadb1] px-4 py-2 rounded-lg hover:shadow-lg transition duration-300"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
