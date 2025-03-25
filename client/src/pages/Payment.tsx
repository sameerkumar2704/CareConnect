const PaymentPage = () => {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 bg-gray-100">
            {/* Left Side: Appointment Details */}
            <div className="w-full lg:w-1/2 bg-white p-6 shadow-lg rounded-lg">
                <h2 className="text-2xl font-semibold">Appointment Details</h2>
                <p className="mt-2 text-gray-600">Doctor Name: Dr. John Doe</p>
                <p className="mt-2 text-gray-600">Specialization: Cardiologist</p>
                <p className="mt-2 text-gray-600">Date: 12th April 2025</p>
                <p className="mt-2 text-gray-600">Time: 10:00 AM</p>
            </div>

            {/* Right Side: Price Composition & Checkout */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 mt-6 lg:mt-0">
                <div className="bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-2xl font-semibold">Price Breakdown</h2>
                    <p className="mt-2 text-gray-600">Original Price: $100</p>
                    <p className="mt-2 text-gray-600">Site Compensation: $5</p>
                    <p className="mt-2 font-bold">Total: $105</p>
                </div>
                <div className="flex gap-4">
                    <button className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">Checkout</button>
                    <button className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;