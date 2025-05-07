import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

interface HospitalMapProps {
    position: LatLngExpression;
    name: string;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({ position, name }) => {

    console.log("HospitalMap", position, name);

    return (
        <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-40 w-full rounded-lg z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>{name}</Popup>
            </Marker>
        </MapContainer>
    );
};
