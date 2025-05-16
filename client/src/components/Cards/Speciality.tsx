import { useState } from "react";
import { Link } from "react-router-dom";

const SpecialtyCard = ({
    name,
    description,
    id,
    count,
    tags
}: {
    name: string;
    tags: [{ name: string, severity: string }];
    description: string;
    id: string;
    count: { parent: number, children: number };
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-white to-gray-50 
                p-4 transition-all duration-300 hover:scale-105 overflow-hidden group
                border border-gray-100 shadow hover:shadow-md hover:shadow-teal-200
                hover:border-teal-200 h-full relative">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-50 rounded-full opacity-0 
                    group-hover:opacity-70 transition-all duration-500"></div>
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-teal-50 rounded-full opacity-0 
                    group-hover:opacity-60 transition-all duration-500 delay-75"></div>

            {/* Header with icon and title */}
            <div className="flex items-start space-x-3 mb-2">
                {/* Specialty Icon */}
                <div className="bg-teal-100 text-teal-600 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center
                      group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>

                {/* Title with animated underline */}
                <div className="relative">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300 pr-2">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                    </h3>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 
                        group-hover:w-2/3 transition-all duration-300 ease-out"></div>
                </div>
            </div>

            {/* Availability stats in a more compact layout */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center text-gray-600 text-xs group-hover:text-gray-700 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">{count.parent}</span>{" "}Hospitals
                </div>
                <div className="flex items-center text-gray-600 text-xs group-hover:text-gray-700 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{count.children}</span>{" "}Doctors
                </div>
            </div>

            {/* Tags with better wrapping for mobile */}
            <div className="flex flex-wrap gap-1 mb-3">
                {tags.slice(0, 2).map((tag, index) => (
                    <div key={index} className="bg-teal-100 text-teal-600 text-xs px-2 py-0.5 rounded-full 
                                   transition-all duration-300 group-hover:bg-teal-500 group-hover:text-white">
                        {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
                    </div>
                ))}
                {tags.length > 2 && (
                    <span className="bg-teal-100 text-teal-600 text-xs px-2 py-0.5 rounded-full 
                         transition-all duration-300 group-hover:bg-teal-500 group-hover:text-white">
                        {`+ ${tags.length - 2} more`}
                    </span>
                )}
            </div>

            {/* Description with better mobile sizing */}
            <div className="relative mb-4">
                <p
                    style={{
                        display: isExpanded ? "block" : "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: isExpanded ? "unset" : 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}
                    className="text-gray-600 text-xs leading-relaxed 
                   group-hover:text-gray-700 transition-colors duration-300">
                    {description}
                </p>

                {/* Gradient fade effect for collapsed text */}
                {!isExpanded && description.length > 80 && (
                    <div className="absolute bottom-0 left-0 h-6 w-full bg-gradient-to-t from-gray-50 to-transparent
                       group-hover:from-gray-50/80 transition-all duration-300"></div>
                )}
            </div>

            {/* Actions with better mobile layout */}
            <div className="flex justify-between items-center w-full mt-auto pt-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="flex items-center text-teal-600 hover:text-teal-700 text-xs font-medium 
                   transition-all duration-200 focus:outline-none group-hover:translate-x-1">
                    {isExpanded ? (
                        <>
                            <span>Read Less</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </>
                    ) : (
                        <>
                            <span>Read More</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </>
                    )}
                </button>

                <Link
                    to={`/specializations/${id}`}
                    className="flex items-center text-white bg-teal-500 hover:bg-teal-600 
                   px-3 py-1.5 rounded text-xs font-medium transition-all 
                   duration-200 focus:outline-none focus:ring-1 focus:ring-teal-400 
                   focus:ring-offset-1 group-hover:shadow-sm">
                    <span>View</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default SpecialtyCard;