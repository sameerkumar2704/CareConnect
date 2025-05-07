import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCreditCard,
    faQuestionCircle,
    faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import {
    faCcVisa,
    faCcMastercard
} from '@fortawesome/free-brands-svg-icons';

const DebitCardForm: React.FC = () => {
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvv: '',
        saveCard: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setCardDetails({
            ...cardDetails,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const formatCardNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        // Add space after every 4 digits
        const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
        return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setCardDetails({
            ...cardDetails,
            cardNumber: formatted
        });
    };

    const formatExpiryDate = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        // Format as MM/YY
        if (digits.length <= 2) {
            return digits;
        }
        return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value);
        setCardDetails({
            ...cardDetails,
            expiryDate: formatted
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-700 font-medium">Enter Debit Card Details</h3>
                <div className="flex space-x-2">
                    <FontAwesomeIcon icon={faCcVisa} className="text-blue-700 text-2xl" />
                    <FontAwesomeIcon icon={faCcMastercard} className="text-red-600 text-2xl" />
                    {/* For RuPay, we don't have a direct FontAwesome icon, so we can use text or an image */}
                    <span className="text-orange-500 text-2xl font-bold">RuPay</span>
                </div>
            </div>

            <div>
                <label className="block text-gray-600 text-sm mb-1" htmlFor="dcardNumber">
                    Card Number
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="dcardNumber"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={19}
                    />
                    <FontAwesomeIcon
                        icon={faCreditCard}
                        className="absolute right-3 top-3 text-gray-400"
                    />
                </div>
            </div>

            <div>
                <label className="block text-gray-600 text-sm mb-1" htmlFor="dcardholderName">
                    Cardholder Name
                </label>
                <input
                    type="text"
                    id="dcardholderName"
                    name="cardholderName"
                    value={cardDetails.cardholderName}
                    onChange={handleChange}
                    placeholder="John Smith"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="block text-gray-600 text-sm mb-1" htmlFor="dexpiryDate">
                        Expiry Date
                    </label>
                    <input
                        type="text"
                        id="dexpiryDate"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleExpiryDateChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={5}
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-gray-600 text-sm mb-1" htmlFor="dcvv">
                        CVV
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            id="dcvv"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            maxLength={3}
                        />
                        <FontAwesomeIcon
                            icon={faQuestionCircle}
                            className="absolute right-3 top-3 text-gray-400 cursor-help"
                            title="3 digit security code on the back of your card"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mr-2" />
                    <p className="text-sm text-blue-700">
                        Your debit card must be enabled for online transactions. Contact your bank if needed.
                    </p>
                </div>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="dsaveCard"
                    name="saveCard"
                    checked={cardDetails.saveCard}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="dsaveCard" className="ml-2 block text-sm text-gray-700">
                    Save card for future payments
                </label>
            </div>
        </div>
    );
};

export default DebitCardForm;