import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const CancelPage = () => {
    return (
        <div className="p-12 flex items-center justify-center bg-red-50">
            <div className="flex flex-col gap-2 bg-white p-8 rounded-lg shadow-lg text-center">
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-6xl" />
                <h2 className="text-3xl font-semibold mt-4">Payment Cancelled</h2>
                <p className="mt-2 text-gray-600">We regret the inconvenience.</p>
                <Link to={"/"} className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Go to Home</Link>
            </div>
        </div>
    );
};

export default CancelPage;
