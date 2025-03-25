import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Specialty } from "../../model/user.model";

const HospitalCard = ({ id, parentName, description, specialities }: { id: string, parentName: string; description: string, specialities: Specialty[] }) => {
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
        <div style={{
            boxShadow: "0 0 30px rgba(71, 205, 191, 0.25)"
        }} className="py-12 px-8 flex flex-col justify-between gap-4 bg-white rounded-xl p-6 transition duration-200 cursor-pointer 
                      hover:bg-[#20b2b7] hover:text-white hover:scale-105 relative overflow-hidden group">

            {/* Content Wrapper */}
            <p className="text-xl font-semibold duration-100 group-hover:text-white">
                {parentName.charAt(0).toUpperCase() + parentName.slice(1)}
            </p>
            <div>
                {specialities.map((speciality, index) => (
                    <p key={index} style={{
                        fontFamily: "Raleway",
                        letterSpacing: "0.5px",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }} className="text-gray-400 font-semibold duration-100 group-hover:text-white">
                        {speciality.name}
                    </p>
                ))}
            </div>
            <p style={{
                fontFamily: "Raleway",
                letterSpacing: "0.5px",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: isExpanded ? "unset" : 3,
                overflow: isExpanded ? "visible" : "hidden",
                textOverflow: "ellipsis"
            }} className="text-gray-600 duration-100 group-hover:text-white">
                {description}
            </p>

            {/* Read More Section */}
            <p 
                onClick={handleReadMoreClick} 
                className="text-[#20b2b7] font-semibold flex items-center relative z-10 duration-100 group-hover:text-white cursor-pointer">
                {isExpanded ? "Show Less" : "Read More →"}
            </p>
        </div>
    );
};

export default HospitalCard;
