import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';

type ReverseGeocoderProps = {
    latitude: number;
    longitude: number;
};

const ReverseGeocoder: React.FC<ReverseGeocoderProps> = ({ latitude, longitude }) => {
    const [address, setAddress] = useState<string>('');


    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${"AIzaSyBt57R8L_7nNaskobeBU-rxDEYvGcwPquk"}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                console.log('Reverse Geocoding Response:', data);

                if (data.status === 'OK' && data.results.length > 0) {
                    setAddress(data.results[0].formatted_address);
                } else {
                    console.log('No address found for the given coordinates.');
                }
            } catch (err: any) {
                console.log(`Failed to fetch address: ${err.message}`);
            } finally {
                console.log(false);
            }
        };

        fetchAddress();
    }, [latitude, longitude]);

    return (
        <div className="flex items-start p-4 bg-gray-50 rounded-xl md:col-span-2 lg:col-span-3">
            <div className="bg-teal-100 p-3 rounded-full mr-4">
                <FontAwesomeIcon icon={faLocationDot} className="text-teal-600 text-xl" />
            </div>
            <div>
                <p className="text-gray-500 font-medium">Address</p>
                <p className="text-gray-800 font-semibold">{address || "Address not available"}</p>
            </div>
        </div>
    );
};

export default ReverseGeocoder;
