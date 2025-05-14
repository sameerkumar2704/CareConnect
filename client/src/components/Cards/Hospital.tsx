import { faIndianRupeeSign, faStethoscope, faMedkit, faUserMd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { Specialty } from "../../model/user.model";

const HospitalCard = ({
    id,
    parentName,
    distance,
    specialities,
    image,
    fees,
    hasEmergency,
    doctorCount
}: {
    id: string;
    distance: number;
    parentName: string;
    specialities: Specialty[];
    image: string;
    fees: number;
    hasEmergency: boolean;
    doctorCount: number;
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-between w-full bg-white rounded-xl overflow-hidden transition duration-300 hover:transform hover:scale-102 
                      shadow-lg hover:shadow-2xl border border-gray-100 group">
            {/* Banner at top to show emergency status */}
            {hasEmergency && (
                <div className="bg-red-600 text-white text-center py-1 text-xs md:text-sm font-medium">
                    <FontAwesomeIcon icon={faMedkit} className="mr-2" />
                    24/7 Emergency Services Available
                </div>
            )}

            {/* Image with overlay gradient */}
            <div className="relative">
                <img
                    src={image}
                    alt={parentName}
                    className="w-full h-32 md:h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                {/* Hospital name positioned over image */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className="text-lg md:text-2xl font-bold text-white">
                        {parentName.charAt(0).toUpperCase() + parentName.slice(1)}
                    </h3>
                </div>
            </div>

            {/* Content area */}
            <div className="p-4 md:p-5 flex flex-col justify-between">
                {/* Key information in badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs md:text-sm px-2 py-1 rounded-full flex items-center">
                        <FontAwesomeIcon icon={faUserMd} className="mr-1" />
                        {doctorCount} Doctors
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs md:text-sm px-2 py-1 rounded-full flex items-center">
                        <FontAwesomeIcon icon={faIndianRupeeSign} className="mr-1" />
                        {fees} Fees
                    </span>
                    {distance && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs md:text-sm px-2 py-1 rounded-full flex items-center">
                            <FontAwesomeIcon icon={faStethoscope} className="mr-1" />
                            Almost {(distance / 1000).toFixed(3)} km away
                        </span>
                    )}
                </div>

                {/* Specialities */}
                {specialities && <div className="mb-3">
                    <h4 className="text-sm md:text-base font-semibold text-gray-700 mb-1 flex items-center">
                        <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-teal-600" />
                        Specialities
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {specialities.slice(0, 3).map((specialty, index) => (
                            <span key={index} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded">
                                {specialty.name.charAt(0).toUpperCase() + specialty.name.slice(1)}
                            </span>
                        ))}
                        {specialities.length > 3 && (
                            <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded">
                                +{specialities.length - 3} more
                            </span>
                        )}
                    </div>
                </div>}

                {/* Action buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(`/hospital/${id}`)}
                        className="bg-teal-500 w-full hover:bg-teal-600 text-white text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HospitalCard;