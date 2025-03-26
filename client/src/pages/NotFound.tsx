import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const NotFound = () => {
    return (
        <div className="flex items-center justify-center px-6 md:px-0 py-6 md:py-16 bg-gray-100">
            <div className="text-center bg-white p-10 rounded-2xl shadow-xl">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-6xl mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">404 - Page Not Found</h1>
                <p className="text-gray-600 mb-6">The page you are looking for doesn't exist or is under maintenance.</p>
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-[#4FADB1] text-white rounded-xl hover:bg-blue-700 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default NotFound;
