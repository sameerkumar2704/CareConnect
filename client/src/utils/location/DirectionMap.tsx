import React, { useEffect, useState } from 'react';
import {
    GoogleMap,
    useJsApiLoader,
    DirectionsRenderer,
} from '@react-google-maps/api';

interface Coordinates {
    lat: number;
    lng: number;
}

interface MapWithCoordinatesProps {
    startCoords: Coordinates;
    endCoords: Coordinates;
}

const containerStyle = {
    width: '100%',
    height: '200px',
};

const MapWithCoordinates: React.FC<MapWithCoordinatesProps> = ({
    startCoords,
    endCoords,
}) => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyBt57R8L_7nNaskobeBU-rxDEYvGcwPquk",
        libraries: ['places'],
    });

    const openInGoogleMaps = () => {
        const origin = `${startCoords.lat},${startCoords.lng}`;
        const destination = `${endCoords.lat},${endCoords.lng}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        window.open(url, '_blank');
    };

    const [directions, setDirections] =
        useState<google.maps.DirectionsResult | null>(null);

    useEffect(() => {
        if (!isLoaded || !window.google) return;

        const directionsService = new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: startCoords,
                destination: endCoords,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                } else {
                    console.error('Error fetching directions:', result);
                }
            }
        );
    }, [isLoaded, startCoords, endCoords]);

    if (!isLoaded) return <div>Loading Map...</div>;

    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="w-full max-w-5xl rounded-xl overflow-hidden shadow-lg">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={startCoords}
                    zoom={13}
                >
                    {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
            </div>

            <button
                onClick={openInGoogleMaps}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 shadow-md"
            >
                Open in Google Maps
            </button>
        </div>
    );
};

export default MapWithCoordinates;
