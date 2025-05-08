import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

interface Props {
    latitude: string;
    longitude: string;
    name: string;
}

const UserLocationMap: React.FC<Props> = ({ latitude, longitude }) => {
    const position: [number, number] = [parseFloat(latitude), parseFloat(longitude)];
    const [locationName, setLocationName] = useState<string>('Loading location...');

    useEffect(() => {
        const fetchLocationName = async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                if (data?.display_name) {
                    setLocationName(data.display_name);
                } else {
                    setLocationName("Location not found");
                }
            } catch (error) {
                setLocationName("Error fetching location");
                console.error(error);
            }
        };

        fetchLocationName();
    }, [latitude, longitude]);

    return (
        <>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>{locationName}</h3>
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "400px", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>{locationName}</Popup>
                </Marker>
            </MapContainer>
        </>
    );
};


export default UserLocationMap;
