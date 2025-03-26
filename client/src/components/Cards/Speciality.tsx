import { useState } from "react";
import { Link } from "react-router-dom";

const SpecialtyCard = ({ name, description, id }: { name: string; description: string; id: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            style={{ boxShadow: "0 0 30px rgba(71, 205, 191, 0.25)" }}
            className="md:py-12 md:px-8 py-4 px-3 flex flex-col justify-between gap-2 md:gap-4 bg-white rounded-xl p-6 transition duration-200 cursor-pointer 
                      hover:bg-[#20b2b7] hover:text-white hover:scale-105 relative overflow-hidden group">
            {/* Content Wrapper */}
            <p className="text-[0.9rem] md:text-xl font-semibold duration-100 group-hover:text-white">
                {name.charAt(0).toUpperCase() + name.slice(1)}
            </p>
            <p
                style={{
                    fontFamily: "Raleway",
                    letterSpacing: "0.5px",
                    display: isExpanded ? "block" : "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: isExpanded ? "unset" : 3,
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}
                className="text-gray-600 text-[0.7rem] md:text-base duration-100 group-hover:text-white">
                {description}
            </p>
            {/* Read More Section */}
            <div className="flex flex-col md:flex-row gap-2 justify-between">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent parent div click event
                        setIsExpanded(!isExpanded);
                    }}
                    className="text-[#20b2b7] text-[0.75rem] md:text-base font-semibold flex items-center relative z-10 duration-100 group-hover:text-white focus:outline-none">
                    {isExpanded ? "Read Less ↑" : "Read More →"}
                </button>
                <Link
                    to={`/specializations/${id}`}
                    className="text-[#20b2b7] text-[0.75rem] md:text-base font-semibold flex items-center relative z-10 duration-100 group-hover:text-white focus:outline-none">
                    {"Go to Page →"}
                </Link>
            </div>
        </div>
    );
};

export default SpecialtyCard;