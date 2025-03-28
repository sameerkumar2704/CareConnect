import { Link, useParams } from "react-router-dom";
import { API_URL } from "../utils/contants";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "./NotFound";
import { Hospital } from "../model/user.model";

const PaymentPage = () => {

    const { id } = useParams<{ id: string }>();

    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [parentHospital, setParentHospital] = useState<Hospital | null>(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setLoading(true);

        fetch(`${API_URL}/hospitals/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setHospital(data);
                setParentHospital(data.parent);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching hospital details:", error);
                setLoading(false);
            });
    }, [id]);

    const today = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(today.getDate() + 7);

    const formattedToday = today.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    });

    const formattedExpiration = expirationDate.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    });



    if (loading) return <LoadingSpinner />;

    if (!hospital || hospital === undefined) return <NotFound />;

    if (!parentHospital || parentHospital === undefined) return <NotFound />;

    const originalPrice = parentHospital.fees;
    const siteCompensation = originalPrice * 0.05;
    const totalAmount = originalPrice + siteCompensation;

    return (
        <div className="flex flex-col lg:flex-row justify-center items-start w-full p-10 gap-10">
            {/* Doctor Details */}
            <div className="w-full lg:w-1/2 p-6 bg-white shadow-lg rounded-lg flex flex-col items-center text-center">
                <img
                    src="/Services/Hospital.jpg"
                    alt="Doctor"
                    className="w-32 h-32 mb-4 rounded-full object-cover"
                />
                <h2 className="text-3xl font-bold">{"Dr. " + hospital.name}</h2>
                {/* <p className="text-lg text-gray-600 mb-4">{hospital.}</p> */}
                <div className="w-full flex flex-col gap-3 text-lg text-gray-700">
                    <div className="flex justify-between w-full">
                        <span className="font-semibold">Contact:</span>
                        <span>{hospital.phone}</span>
                    </div>
                    <div className="flex justify-between w-full">
                        <span className="font-semibold">Email:</span>
                        <span>{hospital.email}</span>
                    </div>
                    <div className="flex justify-between w-full">
                        <span className="font-semibold">Associated Hospital :</span>
                        <Link className="text-[#4FADB1] underline" to={"/hospital/" + parentHospital.id} >{parentHospital.name}</Link>
                    </div>
                    <div className="flex justify-between w-full">
                        <span className="font-semibold">Today's Date:</span>
                        <span>{formattedToday}</span>
                    </div>
                    <div className="flex justify-between w-full">
                        <span className="font-semibold">Appointment Expiration:</span>
                        <span>{formattedExpiration}</span>
                    </div>
                </div>
            </div>

            {/* Payment Details */}
            <div className="w-full lg:w-1/2 px-6 py-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl text-[#00ADB5] font-bold text-center mb-6">Payment Details</h2>
                <div className="w-full border rounded-lg p-6">
                    <table className="w-full text-lg">
                        <tbody>
                            <tr className="border-b">
                                <td className="text-[#003A6D] font-semibold py-2">Original Price</td>
                                <td className="text-right">₹{originalPrice.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="text-[#003A6D] font-semibold py-2">Site Compensation (5%)</td>
                                <td className="text-right">₹{siteCompensation.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b font-bold text-xl">
                                <td className="text-[#003A6D] py-3">Total</td>
                                <td className="text-right">₹{totalAmount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between mt-6">
                    <Link to={"/success"} className="text-center cursor-pointer hover:bg-teal-700 font-semibold bg-teal-500 text-white py-3 px-6 rounded-lg text-lg w-1/2 mr-2">Checkout</Link>
                    <Link to={"/cancel"} className="text-center cursor-pointer hover:bg-red-700 font-semibold bg-red-500 text-white py-3 px-6 rounded-lg text-lg w-1/2 ml-2">Cancel</Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;