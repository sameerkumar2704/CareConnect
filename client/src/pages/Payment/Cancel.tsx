import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CancelPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-6xl" />
                <h2 className="text-3xl font-semibold mt-4">Payment Cancelled</h2>
                <p className="mt-2 text-gray-600">We regret the inconvenience.</p>
                <button className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Go to Home</button>
            </div>
        </div>
    );
};

export default CancelPage;
