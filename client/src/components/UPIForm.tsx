import React, { useState } from 'react';
// Import FontAwesome components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAt,
    faQrcode,
    faCheckCircle,
    faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';

const UPIForm: React.FC = () => {
    const [upiMethod, setUpiMethod] = useState<string>('id');
    const [upiId, setUpiId] = useState<string>('');
    const [qrScanned, setQrScanned] = useState<boolean>(false);


    const handleUpiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpiId(e.target.value);
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-700 font-medium">Pay using UPI</h3>
                <div className="flex space-x-2 items-center">
                    <img src="/upi-logo.png" alt="UPI" className="h-6" />
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-3">
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            className={`flex-1 py-2 px-4 rounded-lg border ${upiMethod === 'id'
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'border-gray-300 hover:bg-gray-100'
                                }`}
                            onClick={() => setUpiMethod('id')}
                        >
                            <div className="flex items-center justify-center">
                                <FontAwesomeIcon icon={faAt} className="mr-2" />
                                <span>UPI ID</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`flex-1 py-2 px-4 rounded-lg border ${upiMethod === 'qr'
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'border-gray-300 hover:bg-gray-100'
                                }`}
                            onClick={() => setUpiMethod('qr')}
                        >
                            <div className="flex items-center justify-center">
                                <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                                <span>QR Code</span>
                            </div>
                        </button>
                    </div>

                    {upiMethod === 'id' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-600 text-sm mb-1" htmlFor="upiId">
                                    Enter UPI ID
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="upiId"
                                        name="upiId"
                                        value={upiId}
                                        onChange={handleUpiIdChange}
                                        placeholder="name@upi"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                    {upiId && upiId.includes('@') && (
                                        <FontAwesomeIcon
                                            icon={faCheckCircle}
                                            className="absolute right-3 top-3 text-green-500"
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Example: yourname@okaxis, mobile@paytm
                                </p>
                            </div>

                            <button
                                type="button"
                                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium"
                            >
                                Verify & Pay
                            </button>
                        </div>
                    )}

                    {upiMethod === 'qr' && (
                        <div className="text-center space-y-4">
                            <div className="bg-white p-3 rounded-lg border border-gray-300 inline-block mx-auto">
                                <div className="w-48 h-48 relative flex items-center justify-center">
                                    <img src="/qr-code.png" alt="QR Code" className="w-full" />
                                    {qrScanned && (
                                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                                            <div className="text-center">
                                                <FontAwesomeIcon
                                                    icon={faCheckCircle}
                                                    className="text-green-500 text-4xl mb-2"
                                                />
                                                <p className="text-green-700 font-medium">QR Scanned</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-gray-700">Scan this QR code with any UPI app</p>
                                <p className="text-sm text-gray-500">Amount: ₹1,150</p>
                            </div>

                            <button
                                type="button"
                                className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50"
                                onClick={() => setQrScanned(!qrScanned)}
                            >
                                {qrScanned ? 'Reset' : 'Simulate QR Scan'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-700">
                        UPI payments are secure and instant. You will receive a notification on your UPI app to complete the payment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UPIForm;