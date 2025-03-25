import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SuccessPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-6xl" />
                <h2 className="text-3xl font-semibold mt-4">Payment Successful!</h2>
                <p className="mt-2 text-gray-600">Thank you for your payment.</p>
                <button className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Go to Home</button>
            </div>
        </div>
    );
};

export default SuccessPage;
