import { faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Specialty } from "../../model/user.model";

const HospitalCard = ({
    id,
    parentName,
    description,
    // specialities,
    email,
    image, // Added image prop
    fees
}: {
    id: string;
    parentName: string;
    description: string;
    // specialities: Specialty[];
    email: string;
    image: string; // Image URL
    fees: number
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleReadMoreClick = () => {
        if (isExpanded) {
            setIsExpanded(false); // Collapse if already expanded
        } else {
            navigate(`/hospital/${id}`); // Navigate to hospital details page
        }
    };

    return (
        <div
            style={{
                boxShadow: "0 0 30px rgba(71, 205, 191, 0.25)",
            }}
            className="shadow-2xl shadow-teal-400 w-full py-4 px-3 flex flex-col justify-between gap-2 md:gap-4 bg-white rounded-xl p-6 transition duration-200 cursor-pointer 
                      hover:bg-[#20b2b7] hover:text-white hover:scale-105 relative overflow-hidden group"
        >
            {/* Image Section */}
            <img
                src={image}
                alt={parentName}
                className="w-full h-20 md:h-40 object-cover rounded-lg"
            />

            {/* Hospital Name */}
            <p className="text-[0.9rem] md:text-xl font-semibold duration-100 group-hover:text-white">
                {parentName.charAt(0).toUpperCase() + parentName.slice(1)}
            </p>

            {/* Specialties */}
            {/* <div>
                {specialities.map((speciality, index) => (
                    <p
                        key={index}
                        style={{
                            fontFamily: "Raleway",
                            letterSpacing: "0.5px",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        className="text-gray-400 font-semibold duration-100 group-hover:text-white"
                    >
                        {speciality.name}
                    </p>
                ))}
            </div> */}

            {/* Description */}
            <p
                style={{
                    fontFamily: "Raleway",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: isExpanded ? "unset" : 3,
                    overflow: isExpanded ? "visible" : "hidden",
                    textOverflow: "ellipsis",
                }}
                className="text-gray-600 text-[0.7rem] md:text-base duration-100 group-hover:text-white"
            >
                {description}
            </p>

            {/* Description */}
            <p
                style={{
                    fontFamily: "Raleway",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: isExpanded ? "unset" : 3,
                    overflow: isExpanded ? "visible" : "hidden",
                    textOverflow: "ellipsis",
                }}
                className="text-gray-600 text-[0.7rem] md:text-base duration-100 group-hover:text-white"
            >
                {email}
            </p>

            <p
                style={{
                    fontFamily: "Raleway",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: isExpanded ? "unset" : 3,
                    overflow: isExpanded ? "visible" : "hidden",
                    textOverflow: "ellipsis",
                }}
                className="text-gray-600 text-[0.7rem] md:text-base duration-100 group-hover:text-white"
            >
                <span className="font-semibold">Fees :- </span><FontAwesomeIcon icon={faIndianRupeeSign} className="mr-1"></FontAwesomeIcon>{fees}
            </p>

            {/* Read More Section */}
            <p
                onClick={handleReadMoreClick}
                className="text-[#20b2b7] text-[0.75rem] md:text-base font-semibold flex items-center relative z-10 duration-100 group-hover:text-white cursor-pointer"
            >
                {isExpanded ? "Show Less" : "Read More →"}
            </p>
        </div>
    );
};

export default HospitalCard;
