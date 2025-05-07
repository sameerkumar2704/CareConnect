import React, { useState } from 'react';

const NetbankingForm: React.FC = () => {
    const [selectedBank, setSelectedBank] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const popularBanks = [
        { id: 'sbi', name: 'State Bank of India', logo: 'sbi-logo.png' },
        { id: 'hdfc', name: 'HDFC Bank', logo: 'hdfc-logo.png' },
        { id: 'icici', name: 'ICICI Bank', logo: 'icici-logo.png' },
        { id: 'axis', name: 'Axis Bank', logo: 'axis-logo.png' },
        { id: 'kotak', name: 'Kotak Mahindra Bank', logo: 'kotak-logo.png' },
        { id: 'pnb', name: 'Punjab National Bank', logo: 'pnb-logo.png' }
    ];

    const allBanks = [
        ...popularBanks,
        { id: 'bob', name: 'Bank of Baroda', logo: 'bob-logo.png' },
        { id: 'canara', name: 'Canara Bank', logo: 'canara-logo.png' },
        { id: 'idbi', name: 'IDBI Bank', logo: 'idbi-logo.png' },
        { id: 'union', name: 'Union Bank of India', logo: 'union-logo.png' },
        { id: 'yes', name: 'Yes Bank', logo: 'yes-logo.png' },
        { id: 'federal', name: 'Federal Bank', logo: 'federal-logo.png' }
    ];

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredBanks = searchTerm
        ? allBanks.filter(bank =>
            bank.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : popularBanks;

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-700 font-medium">Pay using Netbanking</h3>
                <div className="flex space-x-2 items-center">
                    <i className="fas fa-university text-purple-500 text-xl"></i>
                </div>
            </div>

            <div>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search for your bank"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredBanks.length > 0 ? (
                        filteredBanks.map((bank) => (
                            <div
                                key={bank.id}
                                className={`border rounded-lg p-3 cursor-pointer transition ${selectedBank === bank.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                onClick={() => setSelectedBank(bank.id)}
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                        {/* We use a placeholder div instead of actual logos */}
                                        <i className="fas fa-university text-gray-500"></i>
                                    </div>
                                    <div className="ml-3 flex-grow">
                                        <h4 className="text-sm font-medium text-gray-800">{bank.name}</h4>
                                    </div>
                                    {selectedBank === bank.id && (
                                        <i className="fas fa-check-circle text-purple-500"></i>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <i className="fas fa-search text-2xl mb-2"></i>
                            <p>No banks found matching your search</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedBank && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-700 mb-2">
                        <i className="fas fa-info-circle mr-2"></i>
                        You will be redirected to {allBanks.find(bank => bank.id === selectedBank)?.name} netbanking portal to complete the payment.
                    </p>
                </div>
            )}

            <button
                type="button"
                disabled={!selectedBank}
                className={`w-full py-3 rounded-lg font-medium ${selectedBank
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                Proceed to Pay
            </button>

            <div className="text-xs text-gray-500 text-center">
                <p>Secured by 128-bit SSL encryption</p>
            </div>
        </div>
    );
};

export default NetbankingForm;